import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import { spawn } from "child_process";
import sharp from "sharp";
import { getMimeType } from "../utils/mime-types";
import { resolveInsideRoot, ensureDirExists } from "../utils/path-utils";
import { getThumbCacheDir } from "../common/config/app-config";

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly cacheDir = getThumbCacheDir();

  constructor() {
    ensureDirExists(this.cacheDir);
  }

  private isRawFormat(filename: string): boolean {
    const ext = filename.toLowerCase().split(".").pop();
    return ["arw", "cr2", "nef", "dng", "raf", "orf", "rw2"].includes(
      ext || "",
    );
  }

  private async generateVideoThumbnail(
    inputPath: string,
    outputPath: string,
    width: number,
  ): Promise<void> {
    const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";

    await new Promise<void>((resolve, reject) => {
      const child = spawn(ffmpegPath, [
        "-y",
        "-ss",
        "00:00:00.500",
        "-i",
        inputPath,
        "-frames:v",
        "1",
        "-vf",
        `scale=min(${width},iw):-1`,
        outputPath,
      ]);

      let stderr = "";

      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        reject(error);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(stderr.trim() || `ffmpeg exited with code ${code}`));
      });
    });
  }

  private isVideoFormat(filename: string): boolean {
    const mimeType = getMimeType(filename);
    return mimeType.startsWith("video/");
  }

  private async extractRawPreview(filePath: string): Promise<Buffer | null> {
    try {
      const buffer = await fs.promises.readFile(filePath);

      let startIndex = -1;
      let endIndex = -1;

      for (let i = 0; i < buffer.length - 3; i++) {
        if (
          buffer[i] === 0xff &&
          buffer[i + 1] === 0xd8 &&
          buffer[i + 2] === 0xff
        ) {
          const possibleStart = i;

          for (let j = possibleStart + 3; j < buffer.length - 1; j++) {
            if (buffer[j] === 0xff && buffer[j + 1] === 0xd9) {
              const size = j - possibleStart + 2;

              if (
                size > 50000 &&
                (startIndex === -1 || size > endIndex - startIndex)
              ) {
                startIndex = possibleStart;
                endIndex = j + 2;
              }
              break;
            }
          }
        }
      }

      if (startIndex !== -1 && endIndex !== -1) {
        return buffer.slice(startIndex, endIndex);
      }

      return null;
    } catch (err) {
      this.logger.warn(
        `RAW preview extraction failed for ${path.basename(filePath)}`,
      );
      return null;
    }
  }

  async generateThumbnail(relPath: string, width = 200) {
    const abs = resolveInsideRoot(relPath);
    if (!fs.existsSync(abs)) throw new BadRequestException("Image not found");

    const safeWidth = Number.isFinite(width)
      ? Math.max(64, Math.min(4000, Math.floor(width)))
      : 200;

    const s = await fs.promises.stat(abs);
    const hash = crypto
      .createHash("md5")
      .update(abs + "|" + s.mtimeMs + "|" + s.size + "|" + safeWidth)
      .digest("hex");
    const ext = ".png";
    const cachePath = path.join(this.cacheDir, `${hash}${ext}`);

    if (fs.existsSync(cachePath)) {
      return fs.createReadStream(cachePath);
    }

    try {
      if (this.isVideoFormat(abs)) {
        await this.generateVideoThumbnail(abs, cachePath, safeWidth);
      } else if (this.isRawFormat(abs)) {
        const jpegPreview = await this.extractRawPreview(abs);

        if (jpegPreview) {
          await sharp(jpegPreview)
            .resize({
              width: safeWidth,
              fit: "inside",
              withoutEnlargement: true,
            })
            .png()
            .toFile(cachePath);
        } else {
          throw new Error("No embedded preview found in RAW file");
        }
      } else {
        await sharp(abs)
          .resize({ width: safeWidth, fit: "inside", withoutEnlargement: true })
          .png()
          .toFile(cachePath);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      this.logger.warn(`Thumbnail generation failed: ${errorMsg}`);
      throw new BadRequestException(
        `Could not generate thumbnail: ${errorMsg}`,
      );
    }

    return fs.createReadStream(cachePath);
  }
}
