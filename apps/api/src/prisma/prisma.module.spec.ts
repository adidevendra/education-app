import { describe, it, expect, beforeEach } from '@jest/globals';
import { MockPrismaService } from './mock-prisma.service';

describe('MockPrismaService (unit)', () => {
  let mock: MockPrismaService;

  beforeEach(() => {
    mock = new MockPrismaService();
  });

  it('creates and finds a user', async () => {
    const u = await mock.user.create({ data: { email: 't@t.com', name: 'T' } } as any);
    const all = await mock.user.findMany();
    expect(all.find((x) => x.id === u.id)).toBeDefined();
  });

  it('creates course and lesson and can enroll', async () => {
    const c = await mock.course.create({ data: { title: 'C' } } as any);
    const l = await mock.lesson.create({ data: { title: 'L', courseId: c.id } } as any);
    const e = await mock.enrollment.create({ data: { userId: 'u-1', courseId: c.id } } as any);
    const found = await mock.enrollment.findMany({ where: { courseId: c.id } } as any);
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it('creates and queries profile and auditLog', async () => {
    const p = await mock.profile.create({ data: { userId: 'u-x', bio: 'b' } } as any);
    const q = await mock.profile.findMany({ where: { userId: 'u-x' } } as any);
    expect(q.length).toBe(1);
    const a = await mock.auditLog.create({ data: { userId: 'u-x', action: 'A', resource: 'R' } } as any);
    const aq = await mock.auditLog.findMany({ where: { userId: 'u-x' } } as any);
    expect(aq.length).toBe(1);
  });
});
