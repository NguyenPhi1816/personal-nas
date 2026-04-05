import { IsNotEmpty, IsString } from "class-validator";

export class RenameFileDto {
  @IsString()
  @IsNotEmpty()
  oldPath!: string;

  @IsString()
  @IsNotEmpty()
  newName!: string;
}
