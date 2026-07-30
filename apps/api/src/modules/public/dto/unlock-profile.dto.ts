import { IsString, MinLength } from 'class-validator';

export class UnlockProfileDto {
  @IsString()
  @MinLength(1)
  password!: string;
}
