import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: any) {
    return (this.prisma as any).user.update({ where: { id }, data });
  }
}
