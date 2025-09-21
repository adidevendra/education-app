import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { LtiService } from './lti.service';

@Controller('lti')
export class LtiController {
  constructor(private readonly lti: LtiService) {}

  @Get('login')
  login() {
    return this.lti.createState();
  }

  @Get('jwks')
  jwks() {
    return this.lti.getJwks();
  }

  @Post('launch')
  launch(@Body() body: { state: string; nonce: string; id_token: string }) {
    this.lti.validateState(body.state, body.nonce);
    return this.lti.handleLaunch(body.id_token);
  }

  @Post('grade')
  grade(@Body() body: { lineItem: string; userId: string; score: number }) {
    return this.lti.returnGrade(body.lineItem, body.userId, body.score);
  }
}
