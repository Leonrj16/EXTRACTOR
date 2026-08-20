import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

export class ApplyOperationsDto {
  // Each item's real shape is validated by AiEditorService against the
  // same DTOs the human-driven endpoints use (CreateLinkDto, UpdateLinkDto,
  // UpdateProfileDto) — see validateOperations(). Kept loose here because
  // class-validator has no clean way to express a discriminated union.
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  operations!: Record<string, unknown>[];
}
