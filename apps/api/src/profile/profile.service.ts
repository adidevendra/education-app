import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getByUserId(userId: string) {
    return (this.prisma as any).profile.findMany({ where: { userId } }).then((r: any[]) => r[0] || null);
  }

  async createForUser(userId: string, data: any) {
    const existing = await this.getByUserId(userId);
    if (existing) return existing;
    return (this.prisma as any).profile.create({ data: { userId, ...data } });
  }

  async updateForUser(userId: string, data: any) {
    const existing = await this.getByUserId(userId);
    if (!existing) throw new NotFoundException('profile not found');
    return (this.prisma as any).profile.update({ where: { id: existing.id }, data });
  }
}
