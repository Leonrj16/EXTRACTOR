import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AnalyticsInsightsService } from './analytics-insights.service';
import { AnalyticsService } from './analytics.service';
import { SummaryQueryDto } from './dto/summary-query.dto';

@Roles(Role.ADMIN)
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsInsightsService: AnalyticsInsightsService,
  ) {}

  @Get('summary')
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SummaryQueryDto,
  ) {
    return this.analyticsService.getSummary(user.id, query.range);
  }

  // Llama a Claude cuando hay API key — throttled tighter que el default.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('insights')
  getInsights(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SummaryQueryDto,
  ) {
    return this.analyticsInsightsService.getInsights(user.id, query.range);
  }
}
