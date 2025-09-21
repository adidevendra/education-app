import { describe, it, expect } from '@jest/globals';
import { CertsService } from './certs.service';

describe('CertsService', () => {
  it('issues a certificate', async () => {
    const svc = new CertsService();
    const cert = await svc.issue({ enrollmentId: 'enr1' } as any);
    expect(cert.url).toContain('s3.example.com/certs/');
  });
});
