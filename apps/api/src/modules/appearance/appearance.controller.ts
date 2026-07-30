import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AppearanceService } from './appearance.service';
import { ThemeAiService } from './theme-ai.service';
import { CreateCustomThemeDto } from './dto/create-custom-theme.dto';
import { SuggestThemeDto } from './dto/suggest-theme.dto';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';

@Roles(Role.ADMIN)
@Controller('admin')
export class AppearanceController {
  constructor(
    private readonly appearanceService: AppearanceService,
    private readonly themeAiService: ThemeAiService,
  ) {}

  @Get('themes')
  listThemes(@CurrentUser() user: AuthenticatedUser) {
    return this.appearanceService.listThemes(user.id);
  }

  @Post('themes')
  createCustomTheme(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCustomThemeDto,
  ) {
    return this.appearanceService.createCustomTheme(user.id, dto);
  }

  @Delete('themes/:id')
  deleteCustomTheme(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.appearanceService.deleteCustomTheme(user.id, id);
  }

  @Post('themes/:key/favorite')
  toggleFavoriteTheme(@CurrentUser() user: AuthenticatedUser, @Param('key') key: string) {
    return this.appearanceService.toggleFavoriteTheme(user.id, key);
  }

  @Post('themes/suggest')
  suggestTheme(@Body() dto: SuggestThemeDto) {
    return this.themeAiService.suggest(dto.prompt);
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
