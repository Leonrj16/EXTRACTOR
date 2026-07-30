import { BadRequestException, Controller, Get, Headers, Ip, Param, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { TrackEventDto } from '../analytics/dto/track-event.dto';
import { SubmitContactDto } from './dto/submit-contact.dto';
import { UnlockProfileDto } from './dto/unlock-profile.dto';
import { PublicService } from './public.service';

@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly analyticsService: AnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.publicService.getPublicProfile(username);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post(':username/track')
  async track(
    @Param('username') username: string,
    @Body() dto: TrackEventDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ip: string,
  ) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!profile) {
      throw new BadRequestException('Perfil no encontrado');
    }

    if (dto.linkId) {
      const link = await this.prisma.link.findUnique({ where: { id: dto.linkId } });
      if (!link || link.profileId !== profile.id) {
        throw new BadRequestException('Enlace inválido para este perfil');
      }
    }

    await this.analyticsService.recordEvent({
      profileId: profile.id,
      type: dto.type,
      linkId: dto.linkId,
      referrer: dto.referrer,
      userAgent,
      ip,
    });

    return { ok: true };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post(':username/contact')
  submitContact(@Param('username') username: string, @Body() dto: SubmitContactDto) {
    return this.publicService.submitContact(username, dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post(':username/unlock')
  unlock(@Param('username') username: string, @Body() dto: UnlockProfileDto) {
    return this.publicService.unlockProfile(username, dto.password);
  }
}
