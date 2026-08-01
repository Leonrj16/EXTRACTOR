import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { SetCustomDomainDto } from './dto/set-custom-domain.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Roles(Role.ADMIN)
@Controller('admin/profile')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.getByUserId(user.id);
  }

  @Patch()
  updateMyProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(user.id, dto);
  }

  @Post('custom-domain')
  setCustomDomain(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetCustomDomainDto) {
    return this.profilesService.setCustomDomain(user.id, dto.domain);
  }

  @Delete('custom-domain')
  removeCustomDomain(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.removeCustomDomain(user.id);
  }

  @Post('custom-domain/verify')
  verifyCustomDomain(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.verifyCustomDomain(user.id);
  }
}
