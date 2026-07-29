import { IsHexColor, IsIn, IsOptional, IsString } from 'class-validator';

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
  @IsIn(['none', 'subtle', 'solid', 'thick'])
  borderStyle?: string;

  @IsOptional()
  @IsIn(['none', 'soft', 'glow'])
  shadowStyle?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsIn(['fade', 'slide', 'bounce', 'none'])
  animation?: string;

  @IsOptional()
  @IsIn(['list', 'grid'])
  layout?: string;
}
