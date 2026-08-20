import { Module } from '@nestjs/common';
import { LinksModule } from '../links/links.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { AiEditorController } from './ai-editor.controller';
import { AiEditorService } from './ai-editor.service';

@Module({
  imports: [LinksModule, ProfilesModule],
  controllers: [AiEditorController],
  providers: [AiEditorService],
})
export class AiEditorModule {}
