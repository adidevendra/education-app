import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CoursesService } from './courses.service';

const mockPrisma: any = {
  course: { create: jest.fn(), update: jest.fn() },
  enrollment: { findMany: jest.fn(), create: jest.fn() },
};
const SearchMock = { indexCourse: jest.fn().mockResolvedValue(null) } as any;
const NotificationsMock = { notify: jest.fn().mockResolvedValue(null) } as any;
const AuditMock = { log: jest.fn() } as any;

describe('CoursesService extra tests', () => {
  let svc: CoursesService;

  beforeEach(() => {
    mockPrisma.course.create.mockReset();
    mockPrisma.course.update.mockReset();
    mockPrisma.enrollment.findMany.mockReset();
    mockPrisma.enrollment.create.mockReset();
    svc = new CoursesService(mockPrisma as any, SearchMock, NotificationsMock, AuditMock);
  });

  it('create should call prisma.create and return created', async () => {
    const created = { id: 'c1', title: 'T' };
    mockPrisma.course.create.mockResolvedValue(created);
    const res = await svc.create({ title: 'T' } as any);
    expect(mockPrisma.course.create).toHaveBeenCalled();
    expect(res).toEqual(created);
  });

  it('update should call prisma.update and return updated', async () => {
    const updated = { id: 'c2', title: 'U' };
    mockPrisma.course.update.mockResolvedValue(updated);
    const res = await svc.update('c2', { title: 'U' } as any);
    expect(mockPrisma.course.update).toHaveBeenCalledWith({ where: { id: 'c2' }, data: { title: 'U' } });
    expect(res).toEqual(updated);
  });

  it('enroll duplicate should throw ConflictException', async () => {
    mockPrisma.enrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
    await expect(svc.enroll('u1', 'c1')).rejects.toThrow();
  });
});

import { CoursesService } from './courses.service';
import { ConflictException } from '@nestjs/common';

describe('CoursesService duplicate enroll', () => {
  it('throws ConflictException if user already enrolled', async () => {
    const mockPrisma: any = {
      enrollment: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, courseId: 1, userId: 1 }]),
        create: jest.fn(),
      },
    };
    const service = new CoursesService(mockPrisma, {} as any); // second param = AuditService mock

    await expect(service.enroll(1, 1)).rejects.toBeInstanceOf(ConflictException);
    expect(mockPrisma.enrollment.create).not.toHaveBeenCalled();
  });
});
