import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AnalyticsEventType } from '@prisma/client';

export class TrackEventDto {
  @IsEnum(AnalyticsEventType)
  type!: AnalyticsEventType;

  @IsOptional()
  @IsString()
  linkId?: string;

  @IsOptional()
  @IsString()
  referrer?: string;
}
