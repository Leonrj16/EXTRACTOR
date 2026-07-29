import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { CreateLinkDto } from './dto/create-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinksService } from './links.service';

@Roles(Role.ADMIN)
@Controller('admin/links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.linksService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateLinkDto) {
    return this.linksService.create(user.id, dto);
  }

  @Patch('reorder')
  reorder(@CurrentUser() user: AuthenticatedUser, @Body() dto: ReorderLinksDto) {
    return this.linksService.reorder(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateLinkDto,
  ) {
    return this.linksService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.linksService.remove(user.id, id);
  }

  @Get(':id/submissions')
  listSubmissions(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.linksService.listSubmissions(user.id, id);
  }
}
