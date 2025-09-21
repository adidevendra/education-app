import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

// Derive orgId from x-org-id header or subdomain (org.example.com)
function deriveOrgId(req: Request): string | null {
  const header = (req.headers['x-org-id'] as string | undefined)?.trim();
  if (header) return header;
  const host = String(req.headers.host || '').toLowerCase();
  // ignore localhost and ports
  const hostname = host.split(':')[0] || '';
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (subdomain && subdomain !== 'www') return subdomain;
  }
  return null;
}

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  use(req: Request & { orgId?: string }, _res: Response, next: NextFunction) {
    try {
      const orgId = deriveOrgId(req);
      if (orgId) req.orgId = orgId;
    } catch {
      // noop: avoid blocking request on tenancy derivation errors
    }
    next();
  }
}
