import { Controller, Get, Post, Patch, Req, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const u = req.user || {};
    return this.profileService.getByUserId(u.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: any) {
    const u = req.user || {};
    return this.profileService.createForUser(u.id, body || {});
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: any, @Body() body: any) {
    const u = req.user || {};
    return this.profileService.updateForUser(u.id, body || {});
  }
}
