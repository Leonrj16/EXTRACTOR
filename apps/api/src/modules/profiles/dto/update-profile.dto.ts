import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_-]{3,30}$/, {
    message:
      'username solo puede contener minúsculas, números, guiones y guion bajo (3-30 caracteres)',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  locationUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isPasswordProtected?: boolean;

  /** Plaintext, in-memory only for the length of this request — the
   * service hashes it before it ever reaches Prisma. Leave unset (not an
   * empty string) to keep the current password when only toggling
   * isPasswordProtected. */
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  pagePassword?: string;
}
