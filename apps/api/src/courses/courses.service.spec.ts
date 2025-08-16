import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockPrismaService } from '../prisma/mock-prisma.service';
import { SearchService } from '../search/search.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

const SearchMock = { indexCourse: jest.fn().mockResolvedValue(null), indexLesson: jest.fn().mockResolvedValue(null), searchCourses: jest.fn().mockResolvedValue([]) } as any;
const NotificationsMock = { notify: jest.fn().mockResolvedValue(null) } as any;

describe('CoursesService', () => {
  let service: CoursesService;

  beforeAll(async () => {
    const useInMem = process.env.USE_IN_MEMORY_DB === '1';
  const providers: any[] = [
    CoursesService,
    { provide: SearchService, useValue: SearchMock },
    { provide: NotificationsService, useValue: NotificationsMock },
    { provide: AuditService, useValue: { log: jest.fn() } },
  ];
    if (useInMem) {
      providers.push({ provide: PrismaService, useClass: MockPrismaService });
    } else {
      providers.push({ provide: PrismaService, useClass: PrismaService });
    }

    const module: TestingModule = await Test.createTestingModule({ providers }).compile();
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('enrolling twice should fail with ConflictException', async () => {
    // create user and course via in-memory prisma
    const prisma = (service as any).prisma as MockPrismaService;
    const user = await prisma.user.create({ data: { email: 'enroll@example.com', name: 'Enroll' } } as any);
    const course = await prisma.course.create({ data: { title: 'Enroll Course', slug: 'enroll-course' } } as any);

    // first enrollment should succeed
    const first = await service.enroll(user.id, course.id);
    expect(first).toBeDefined();

  // audit should have been called
  const audit = (service as any).auditService as any;
  expect(audit.log).toHaveBeenCalledWith(user.id, 'ENROLL_COURSE', `Course:${course.id}`);

    // second enrollment should throw ConflictException
    await expect(service.enroll(user.id, course.id)).rejects.toThrow();
  });
});
