import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { LinkType } from '@prisma/client';

export class CreateLinkDto {
  @IsOptional()
  @IsEnum(LinkType)
  type?: LinkType;

  @IsString()
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  styleOverrides?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  order?: number;
}
