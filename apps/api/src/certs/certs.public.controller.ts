import { Controller, Get, Param } from '@nestjs/common';
import { CertsService } from './certs.service';

@Controller('certs')
export class CertsPublicController {
  constructor(private svc: CertsService) {}

  @Get(':id')
  async get(@Param('id') id: string){
    const cert = await this.svc.get(id);
    if (!cert) return { ok: false };
    return { ok: true, id: cert.id, issuedAt: cert.issuedAt, url: cert.url };
  }
}
