import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { CreatePageVersionDto } from './dto/create-page-version.dto';
import { PageVersionsService } from './page-versions.service';

@Roles(Role.ADMIN)
@Controller('admin/page-versions')
export class PageVersionsController {
  constructor(private readonly pageVersionsService: PageVersionsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.pageVersionsService.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePageVersionDto,
  ) {
    return this.pageVersionsService.create(user.id, dto);
  }

  @Post(':id/restore')
  restore(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pageVersionsService.restore(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pageVersionsService.remove(user.id, id);
  }
}
