import { Module } from '@nestjs/common';
import { AppearanceController } from './appearance.controller';
import { AppearanceService } from './appearance.service';
import { ThemeAiService } from './theme-ai.service';

@Module({
  controllers: [AppearanceController],
  providers: [AppearanceService, ThemeAiService],
})
export class AppearanceModule {}
