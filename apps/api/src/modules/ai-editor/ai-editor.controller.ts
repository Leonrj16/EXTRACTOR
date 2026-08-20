import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AiEditorService } from './ai-editor.service';
import { ApplyOperationsDto } from './dto/apply-operations.dto';
import { PlanCommandDto } from './dto/plan-command.dto';

@Roles(Role.ADMIN)
@Controller('admin/ai-editor')
export class AiEditorController {
  constructor(private readonly aiEditorService: AiEditorService) {}

  // Calls the Anthropic API — throttled tighter than the general default
  // both for cost and because a runaway client shouldn't be able to hammer it.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('plan')
  plan(@CurrentUser() user: AuthenticatedUser, @Body() dto: PlanCommandDto) {
    return this.aiEditorService.plan(user.id, dto.instruction);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('apply')
  apply(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ApplyOperationsDto,
  ) {
    return this.aiEditorService.apply(user.id, dto.operations);
  }
}
