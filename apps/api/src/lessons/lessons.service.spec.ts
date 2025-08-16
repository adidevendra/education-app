import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockPrismaService } from '../prisma/mock-prisma.service';
import { SearchService } from '../search/search.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

const SearchMock = { indexCourse: jest.fn().mockResolvedValue(null), indexLesson: jest.fn().mockResolvedValue(null), searchLessons: jest.fn().mockResolvedValue([]) } as any;
const NotificationsMock = { notify: jest.fn().mockResolvedValue(null) } as any;

describe('LessonsService', () => {
  let service: LessonsService;

  beforeAll(async () => {
    const useInMem = process.env.USE_IN_MEMORY_DB === '1';
  const providers: any[] = [
    LessonsService,
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
    service = module.get<LessonsService>(LessonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates lesson and logs audit', async () => {
    const prisma = (service as any).prisma as MockPrismaService;
    const course = await prisma.course.create({ data: { title: 'L C', slug: 'lc' } } as any);
    const created = await service.create({ title: 'L1', content: 'x', courseId: course.id });
    expect(created).toBeDefined();
    const audit = (service as any).auditService as any;
    expect(audit.log).toHaveBeenCalledWith(null, 'CREATE_LESSON', `Lesson:${created.id}`);
  });
});
