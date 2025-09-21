import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { CoursesService } from './courses.service';

const mockPrisma = {
  course: {
    create: jest.fn<(...args: any[]) => Promise<any>>(),
    update: jest.fn<(...args: any[]) => Promise<any>>(),
  },
  enrollment: {
    findMany: jest.fn<(...args: any[]) => Promise<any>>(),
    create: jest.fn<(...args: any[]) => Promise<any>>(),
  },
};
const SearchMock = { indexCourse: jest.fn(async () => null) } as any;
const NotificationsMock = { notify: jest.fn(async () => null) } as any;
const AuditMock = { log: jest.fn() } as any;

describe('CoursesService extra tests', () => {
  let svc: CoursesService;

  beforeEach(() => {
    mockPrisma.course.create.mockReset();
    mockPrisma.course.update.mockReset();
    mockPrisma.enrollment.findMany.mockReset();
    mockPrisma.enrollment.create.mockReset();
    mockPrisma.enrollment.findMany.mockResolvedValue([]);
    mockPrisma.enrollment.create.mockResolvedValue({ id: 'enroll' });
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
    await expect(svc.enroll('u1', 'c1')).rejects.toThrow(ConflictException);
  });
});
describe('CoursesService duplicate enroll', () => {
  it('throws ConflictException if user already enrolled', async () => {
    const prismaMock = {
      enrollment: {
        findMany: jest.fn(async () => [{ id: 1, courseId: 1, userId: 1 }]),
        create: jest.fn(),
      },
      course: { create: jest.fn(), update: jest.fn() },
    };
    const searchStub = { indexCourse: jest.fn(), indexLesson: jest.fn() } as any;
    const notificationsStub = { notify: jest.fn() } as any;
    const auditStub = { log: jest.fn() } as any;

    const service = new CoursesService(prismaMock as any, searchStub, notificationsStub, auditStub);

    await expect(service.enroll('1', '1')).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.enrollment.create).not.toHaveBeenCalled();
    expect(auditStub.log).not.toHaveBeenCalled();
  });
});
