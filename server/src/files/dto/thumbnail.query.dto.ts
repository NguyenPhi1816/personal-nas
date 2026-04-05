import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class ThumbnailQueryDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(64)
  @Max(4000)
  width?: number;
}
