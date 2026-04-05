import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { ImageService } from "./image.service";
import { Response } from "express";
import { RequireAuthGuard } from "../auth/require-auth.guard";
import { ThumbnailQueryDto } from "./dto/thumbnail.query.dto";

@Controller("images")
@UseGuards(RequireAuthGuard)
export class ImagesController {
  constructor(private readonly imageService: ImageService) {}

  @Get("thumbnail")
  async getThumbnail(@Query() query: ThumbnailQueryDto, @Res() res: Response) {
    const thumbnailWidth = query.width ?? 200;
    const stream = await this.imageService.generateThumbnail(
      query.path,
      thumbnailWidth,
    );
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    stream.pipe(res);
  }
}
