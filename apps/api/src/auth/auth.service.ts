import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async login(email: string, password: string) {
    if (!email || !password) throw new BadRequestException('email and password required');

    const users = await this.prisma.user.findMany();
    const found = (users || []).find((u: any) => u.email === String(email));
    if (!found) throw new BadRequestException('invalid credentials');

    if ((found as any).password && (found as any).password !== password) {
      throw new BadRequestException('invalid credentials');
    }

  const token = this.jwtService.sign({ sub: found.id, email: found.email });
  return { access_token: token };
  }
}
