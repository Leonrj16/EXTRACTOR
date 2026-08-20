import { Module } from '@nestjs/common';
import { AnalyticsInsightsService } from './analytics-insights.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsInsightsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
