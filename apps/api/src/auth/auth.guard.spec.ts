import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  function makeCtx(user: any): ExecutionContext {
    const request = { user } as any;
    return ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown) as ExecutionContext;
  }

  it('throws UnauthorizedException when user is missing', () => {
    const ctx = makeCtx(null);
    expect(() => guard.handleRequest(null, null, null, ctx)).toThrow(UnauthorizedException);
  });

  it('populates request.user with safe shape when token is valid', () => {
    const rawUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN', extra: 'x' } as any;
    const ctx = makeCtx(rawUser);

    const result = guard.handleRequest(null, rawUser, null, ctx);
    expect(result).toEqual({ id: 'u1', email: 'a@b.com', role: 'ADMIN' });
    const req = ctx.switchToHttp().getRequest();
    expect(req.user).toEqual({ id: 'u1', email: 'a@b.com', role: 'ADMIN' });
  });
});
