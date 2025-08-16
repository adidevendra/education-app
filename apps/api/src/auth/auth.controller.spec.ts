import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController (integration-like)', () => {
  let controller: AuthController;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = '1';
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [AuthController],
      providers: [JwtService, /* provide AuthService for controller */ AuthService],
    }).compile();

    controller = module.get(AuthController);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
  });

  it('issues token for valid user', async () => {
    // create a user in in-memory prisma
    const created = await prisma.user.create({ data: { email: 'login-test@example.com', name: 'Login Test' } } as any);
    const res = await controller.login({ email: 'login-test@example.com', password: 'ignored' });
    expect(res).toBeDefined();
    expect(res.access_token).toBeDefined();

    const payload: any = jwt.verify(res.access_token as string) as any;
  expect(payload.email).toBe('login-test@example.com');
  expect(payload.sub).toBeDefined();
  });
});
