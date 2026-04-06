import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Res,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import { FileService } from "./file.service";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response, Request } from "express";
import * as multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { RequireAuthGuard } from "../auth/require-auth.guard";
import { getMimeType } from "../utils/mime-types";
import { ensureDirExists } from "../utils/path-utils";
import { getUploadTmpDir } from "../common/config/app-config";
import { ListFilesQueryDto } from "./dto/list-files.query.dto";
import { UploadFileBodyDto } from "./dto/upload-file.body.dto";
import { DownloadFileQueryDto } from "./dto/download-file.query.dto";
import { DeleteFileDto } from "./dto/delete-file.dto";
import { RenameFileDto } from "./dto/rename-file.dto";
import { CreateFolderDto } from "./dto/create-folder.dto";

const uploadTmpDir = getUploadTmpDir();
ensureDirExists(uploadTmpDir);

@Controller("files")
export class FilesController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  async list(@Query() query: ListFilesQueryDto) {
    return this.fileService.list(query.path ?? "/");
  }

  @Post("upload")
  @UseGuards(RequireAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, uploadTmpDir);
        },
        filename: (_req, file, callback) => {
          const extension = path.extname(file.originalname || "");
          callback(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileBodyDto,
  ) {
    return this.fileService.saveUploadedFile(file, body.path ?? "/");
  }

  @Get("download")
  @UseGuards(RequireAuthGuard)
  async download(
    @Query() query: DownloadFileQueryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const requestedPath = query.path;

    if (!requestedPath) {
      throw new BadRequestException("path is required");
    }

    const meta = await this.fileService.stat(requestedPath);
    const mimeType = getMimeType(meta.name);

    const range = req.headers.range;
    const isStreamable =
      mimeType.startsWith("video/") || mimeType.startsWith("image/");

    if (range && isStreamable) {
      const filePath = await this.fileService.getAbsolutePath(requestedPath);
      const fileSize = meta.size;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start > end ||
        end >= fileSize
      ) {
        throw new BadRequestException("Invalid range header");
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunksize);
      res.setHeader("Content-Type", mimeType);
      fileStream.pipe(res);
    } else if (mimeType.startsWith("image/")) {
      const stream = await this.fileService.createReadStream(requestedPath);
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", String(meta.size));
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Disposition", `inline; filename="${meta.name}"`);
      stream.pipe(res);
    } else {
      const stream = await this.fileService.createReadStream(requestedPath);
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", String(meta.size));
      res.setHeader("Content-Disposition", `inline; filename="${meta.name}"`);
      stream.pipe(res);
    }
  }

  @Delete()
  @UseGuards(RequireAuthGuard)
  async delete(@Body() body: DeleteFileDto) {
    return this.fileService.delete(body.path);
  }

  @Post("rename")
  @UseGuards(RequireAuthGuard)
  async rename(@Body() body: RenameFileDto) {
    return this.fileService.rename(body.oldPath, body.newName);
  }

  @Post("folder")
  @UseGuards(RequireAuthGuard)
  async createFolder(@Body() body: CreateFolderDto) {
    return this.fileService.mkdir(body.path, body.folderName);
  }
}
