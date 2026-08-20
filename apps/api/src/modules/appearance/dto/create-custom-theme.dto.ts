import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Un tema custom se crea a partir de una definición ya resuelta que el
// frontend calcula (clon de un tema del catálogo, o la personalización
// activa del usuario) — el backend solo la persiste, ver
// design-system/architecture/theme-engine.md.
export class CreateCustomThemeDto {
  @IsString()
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsIn(['list', 'grid'])
  layout?: string;

  @IsObject()
  baseConfig!: Record<string, unknown>;
}
