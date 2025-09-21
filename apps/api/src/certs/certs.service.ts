import { Injectable } from '@nestjs/common';
import { IssueCertDto } from './dto';

type Cert = { id: string; enrollmentId: string; issuedAt: string; url: string };

@Injectable()
export class CertsService {
  private store = new Map<string, Cert>();

  async issue(dto: IssueCertDto){
    const id = `cert_${Math.random().toString(36).slice(2,10)}`;
    const url = `https://s3.example.com/certs/${id}.pdf`;
    const cert: Cert = { id, enrollmentId: dto.enrollmentId, issuedAt: new Date().toISOString(), url };
    this.store.set(id, cert);
    return cert;
  }

  async get(id: string){ return this.store.get(id) || null; }
}
