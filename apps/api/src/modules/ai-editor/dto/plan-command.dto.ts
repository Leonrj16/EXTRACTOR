import { IsString, MaxLength, MinLength } from 'class-validator';

export class PlanCommandDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  instruction!: string;
}
