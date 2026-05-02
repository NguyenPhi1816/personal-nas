import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ImageService } from "./image.service";
import type { Response, Request } from "express";
import { RequireAuthGuard } from "../auth/require-auth.guard";
import { ThumbnailQueryDto } from "./dto/thumbnail.query.dto";

@Controller("images")
@UseGuards(RequireAuthGuard)
export class ImagesController {
  constructor(private readonly imageService: ImageService) {}

  @Get("thumbnail")
  async getThumbnail(
    @Query() query: ThumbnailQueryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const thumbnailWidth = query.width ?? 200;
    const stream = await this.imageService.generateThumbnail(
      this.getRequesterFolder(req),
      query.path,
      thumbnailWidth,
    );
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    stream.pipe(res);
  }

  private getRequesterFolder(req: Request): string {
    const authUser = (
      req as Request & { user?: { username?: string; sub?: string } }
    ).user;
    const username = authUser?.username ?? authUser?.sub;

    if (!username || typeof username !== "string") {
      throw new BadRequestException("Invalid authenticated user payload");
    }

    return username;
  }
}
