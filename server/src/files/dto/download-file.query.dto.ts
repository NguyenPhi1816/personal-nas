import { IsNotEmpty, IsString } from "class-validator";

export class DownloadFileQueryDto {
  @IsString()
  @IsNotEmpty()
  path!: string;
}
