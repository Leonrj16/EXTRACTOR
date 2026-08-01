import { Module } from '@nestjs/common';
import { PageVersionsController } from './page-versions.controller';
import { PageVersionsService } from './page-versions.service';

@Module({
  controllers: [PageVersionsController],
  providers: [PageVersionsService],
})
export class PageVersionsModule {}
