import { IsOptional, IsString } from "class-validator";

export class ListFilesQueryDto {
  @IsOptional()
  @IsString()
  path?: string;
}
