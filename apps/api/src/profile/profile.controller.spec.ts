import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ProfileController', () => {
  let controller: ProfileController;
  const mockUser = { id: 'u-1', email: 'a@b.com' } as any;
  const mockGuard = { canActivate: jest.fn((ctx) => { const req = ctx.switchToHttp().getRequest(); req.user = mockUser; return true; }) } as any;
  const ProfileServiceMock = { getByUserId: jest.fn(), createForUser: jest.fn(), updateForUser: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ controllers: [ProfileController], providers: [{ provide: ProfileService, useValue: ProfileServiceMock }] })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<ProfileController>(ProfileController);
    jest.clearAllMocks();
  });

  it('GET /profile/me returns profile', async () => {
    ProfileServiceMock.getByUserId.mockResolvedValueOnce({ userId: mockUser.id, bio: 'hi' });
    const res = await controller.me({ user: mockUser } as any);
    expect(res).toMatchObject({ userId: mockUser.id, bio: 'hi' });
  });

  it('POST /profile creates profile', async () => {
    ProfileServiceMock.createForUser.mockResolvedValueOnce({ userId: mockUser.id, bio: 'hi' });
    const res = await controller.create({ user: mockUser } as any, { bio: 'hi' } as any);
    expect(res).toMatchObject({ userId: mockUser.id, bio: 'hi' });
  });

  it('PATCH /profile/me updates profile', async () => {
    ProfileServiceMock.updateForUser.mockResolvedValueOnce({ userId: mockUser.id, bio: 'ok' });
    const res = await controller.update({ user: mockUser } as any, { bio: 'ok' } as any);
    expect(res).toMatchObject({ userId: mockUser.id, bio: 'ok' });
  });
});
