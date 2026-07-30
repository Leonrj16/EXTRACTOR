import { IsHexColor, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

const ANIMATION_PRESETS = [
  'fade',
  'slide',
  'bounce',
  'zoom',
  'glow',
  'float',
  'parallax',
  'ripple',
  'pulse',
  'scale',
  'none',
];

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
  @IsIn(ANIMATION_PRESETS)
  animation?: string;

  @IsOptional()
  @IsIn(['list', 'grid'])
  layout?: string;

  // Personalización profunda del Theme Engine (color secundario/acento,
  // fondo, tipografía avanzada, tratamiento de botón, glow) — ver
  // design-system/architecture/theme-engine.md.
  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, unknown>;
}
