import { IsString, MaxLength, MinLength } from 'class-validator';

export class SuggestThemeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  prompt!: string;
}
