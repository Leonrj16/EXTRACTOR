import { IsHexColor, IsOptional, IsString } from 'class-validator';

export class UpdateAppearanceDto {
  @IsOptional()
  @IsString()
  themeId?: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  buttonStyle?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;
}
