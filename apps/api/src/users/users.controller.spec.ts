import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersController me endpoint', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;

  beforeEach(() => {
    usersService = {
      findAll: async () => [],
      create: async (data: any) => ({ id: 'u1', ...data }),
      update: async (id: string, data: any) => ({ id, ...data }),
    };

    controller = new UsersController(usersService as UsersService);
  });

  it('returns 401 when unauthenticated (guard would throw)', () => {
    const guard = new JwtAuthGuard(['/api/health', '/api/auth/login']);
    const ctx: any = { switchToHttp: () => ({ getRequest: () => ({ url: '/api/users/me', user: null }) }) };
    expect(() => guard.handleRequest(null, null, null, ctx)).toThrow(UnauthorizedException);
  });

  it('returns profile when authenticated', async () => {
    const guard = new JwtAuthGuard(['/api/health', '/api/auth/login']);
    const request = { url: '/api/users/me', user: { id: 'u1', email: 'a@b.com', name: 'A', createdAt: new Date() } } as any;
    const ctx: any = { switchToHttp: () => ({ getRequest: () => request }) };

    // simulate guard populating user
    const ret = guard.handleRequest(null, request.user, null, ctx);
    expect(ret).toBeDefined();

    const res = await controller.me(request as any);
    expect(res).toMatchObject({ id: 'u1', email: 'a@b.com', name: 'A' });
    expect(res.createdAt).toBeDefined();
  });
});
