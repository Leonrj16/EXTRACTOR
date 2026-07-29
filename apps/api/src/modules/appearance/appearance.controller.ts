import { Body, Controller, Get, Put } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AppearanceService } from './appearance.service';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';

@Roles(Role.ADMIN)
@Controller('admin')
export class AppearanceController {
  constructor(private readonly appearanceService: AppearanceService) {}

  @Get('themes')
  listThemes() {
    return this.appearanceService.listThemes();
  }

  @Get('appearance')
  getMyAppearance(@CurrentUser() user: AuthenticatedUser) {
    return this.appearanceService.getByUserId(user.id);
  }

  @Put('appearance')
  updateMyAppearance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAppearanceDto,
  ) {
    return this.appearanceService.update(user.id, dto);
  }
}
