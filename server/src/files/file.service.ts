import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import {
  ensureDirExists,
  getOwnerRoot,
  isInsideRoot,
  resolveInsideOwnerRoot,
} from "../utils/path-utils";

@Injectable()
export class FileService {
  async list(ownerFolder: string, relPath = "/") {
    const abs = resolveInsideOwnerRoot(ownerFolder, relPath);
    ensureDirExists(abs);
    const entries = await fs.promises.readdir(abs, { withFileTypes: true });

    return Promise.all(
      entries.map(async (entry) => {
        const full = path.join(abs, entry.name);
        const stats = await fs.promises.stat(full);
        const relativePath = path
          .join(relPath === "/" ? "" : relPath, entry.name)
          .replace(/\\/g, "/");

        return {
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
          size: stats.size,
          createdAt: stats.birthtime,
          path: relativePath,
        };
      }),
    );
  }

  async saveUploadedFile(
    ownerFolder: string,
    file: Express.Multer.File,
    relDir = "/",
  ) {
    if (!file) throw new BadRequestException("No file");

    const targetDir = resolveInsideOwnerRoot(ownerFolder, relDir);
    ensureDirExists(targetDir);

    const filename = file.originalname || file.filename;
    if (!filename) {
      throw new BadRequestException("Invalid uploaded file name");
    }

    const destinationPath = path.join(targetDir, filename);
    await this.persistUploadedFile(file, destinationPath);

    return {
      path: path
        .relative(getOwnerRoot(ownerFolder), destinationPath)
        .replace(/\\/g, "/"),
    };
  }

  async createReadStream(ownerFolder: string, relPath: string) {
    const abs = resolveInsideOwnerRoot(ownerFolder, relPath);
    if (!fs.existsSync(abs)) throw new NotFoundException("Not found");
    return fs.createReadStream(abs);
  }

  async getAbsolutePath(ownerFolder: string, relPath: string): Promise<string> {
    const abs = resolveInsideOwnerRoot(ownerFolder, relPath);
    if (!fs.existsSync(abs)) throw new NotFoundException("Not found");
    return abs;
  }

  async stat(ownerFolder: string, relPath: string) {
    const abs = resolveInsideOwnerRoot(ownerFolder, relPath);
    const stats = await fs.promises.stat(abs);
    return { name: path.basename(abs), size: stats.size, mtime: stats.mtime };
  }

  async delete(ownerFolder: string, relPath: string) {
    const abs = resolveInsideOwnerRoot(ownerFolder, relPath);
    await fs.promises.rm(abs, { recursive: true, force: true });
    return { success: true };
  }

  async rename(ownerFolder: string, oldRel: string, newName: string) {
    const safeName = this.assertValidLeafName(newName, "newName");

    const absOld = resolveInsideOwnerRoot(ownerFolder, oldRel);
    if (!fs.existsSync(absOld)) throw new NotFoundException("Source not found");

    const dir = path.dirname(absOld);
    const absNew = path.join(dir, safeName);

    if (!isInsideRoot(absNew)) {
      throw new ForbiddenException("Invalid target");
    }

    if (fs.existsSync(absNew)) throw new BadRequestException("Target exists");

    await fs.promises.rename(absOld, absNew);

    return {
      oldPath: oldRel,
      newPath: path
        .relative(getOwnerRoot(ownerFolder), absNew)
        .replace(/\\/g, "/"),
    };
  }

  async mkdir(ownerFolder: string, relPath: string, folderName: string) {
    const safeName = this.assertValidLeafName(folderName, "folderName");

    const targetDir = resolveInsideOwnerRoot(ownerFolder, relPath);
    const newDir = path.join(targetDir, safeName);
    ensureDirExists(newDir);

    return {
      path: path
        .relative(getOwnerRoot(ownerFolder), newDir)
        .replace(/\\/g, "/"),
    };
  }

  private async persistUploadedFile(
    file: Express.Multer.File,
    destinationPath: string,
  ): Promise<void> {
    const diskFile = file as Express.Multer.File & { path?: string };

    if (diskFile.path) {
      try {
        await fs.promises.rename(diskFile.path, destinationPath);
        return;
      } catch (error) {
        const isCrossDeviceError =
          error &&
          typeof error === "object" &&
          "code" in error &&
          (error as { code?: string }).code === "EXDEV";

        if (!isCrossDeviceError) {
          throw error;
        }

        await fs.promises.copyFile(diskFile.path, destinationPath);
        await fs.promises.unlink(diskFile.path);
        return;
      }
    }

    if (file.buffer) {
      await fs.promises.writeFile(destinationPath, file.buffer);
      return;
    }

    throw new BadRequestException("Unsupported file upload payload");
  }

  private assertValidLeafName(value: string, field: string): string {
    if (!value || typeof value !== "string") {
      throw new BadRequestException(`Invalid ${field}`);
    }

    const candidate = value.trim();
    if (!candidate) {
      throw new BadRequestException(`Invalid ${field}`);
    }

    if (
      candidate.includes("..") ||
      candidate.includes("/") ||
      candidate.includes("\\")
    ) {
      throw new BadRequestException(`Invalid ${field}`);
    }

    if (path.basename(candidate) !== candidate) {
      throw new BadRequestException(`Invalid ${field}`);
    }

    return candidate;
  }
}
