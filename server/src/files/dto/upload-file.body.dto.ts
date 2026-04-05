import { IsOptional, IsString } from "class-validator";

export class UploadFileBodyDto {
  @IsOptional()
  @IsString()
  path?: string;
}
