import { IsIn, IsOptional } from 'class-validator';

export class SummaryQueryDto {
  @IsOptional()
  @IsIn(['1d', '7d', '30d', '90d'])
  range?: '1d' | '7d' | '30d' | '90d';
}
