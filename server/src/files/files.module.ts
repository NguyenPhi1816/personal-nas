import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { ImagesController } from "./images.controller";
import { FileService } from "./file.service";
import { ImageService } from "./image.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [FilesController, ImagesController],
  providers: [FileService, ImageService],
})
export class FilesModule {}
