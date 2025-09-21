import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockPrismaService } from '../prisma/mock-prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService, { provide: PrismaService, useClass: MockPrismaService }],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService) as unknown as MockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('login issues token for existing user', async () => {
    await prisma.user.create({ data: { email: 'a@b.com', name: 'A' } } as any);

    const res = await service.login('a@b.com', 'pw');
    expect(res.access_token).toBeDefined();
  });
});
