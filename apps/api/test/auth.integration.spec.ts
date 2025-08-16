import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard (unit)', () => {
  it('allows whitelist path /api/health without auth', () => {
    const guard = new JwtAuthGuard(['/api/health', '/api/auth/login']);
    const ctx = ({
      switchToHttp: () => ({ getRequest: () => ({ url: '/api/health' }) }),
    } as unknown) as ExecutionContext;

    // For whitelist, handleRequest should return true
    const res = guard.handleRequest(null, null, null, ctx);
    expect(res).toBe(true);
  });

  it('/api/users should throw UnauthorizedException when no token/user', () => {
    const guard = new JwtAuthGuard(['/api/health', '/api/auth/login']);
    const ctx = ({
      switchToHttp: () => ({ getRequest: () => ({ url: '/api/users' }) }),
    } as unknown) as ExecutionContext;

    expect(() => guard.handleRequest(null, null, null, ctx)).toThrow(UnauthorizedException);
  });
});
