import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('v1/auth')
export class AuthV1Controller {
  constructor(private jwtService: JwtService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Req() req: any) {
    const user = { id: 'u_demo', email: body?.email ?? 'demo@example.com', orgId: req.orgId ?? null, roles: ['owner'] };
    const token = this.jwtService.sign({ sub: user.id, email: user.email, orgId: user.orgId, roles: user.roles });
    return { access_token: token, user };
  }

  @UseGuards(JwtAuthGuard as any)
  @Get('me')
  me(@CurrentUser() user: any) {
    return user || null;
  }

  @Post('logout')
  logout() {
    // For JWT, client discards token. With sessions, invalidate server-side.
    return { ok: true };
  }
}
