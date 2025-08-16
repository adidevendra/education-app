import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConflictException } from '@nestjs/common';
import { SearchService } from '../search/search.service';

describe('CoursesController - enroll', () => {
  let controller: CoursesController;
  const mockCourseId = 'c-1';
  const mockUser = { id: 'u-1', email: 'a@b.com' } as any;

  const mockGuard = {
    canActivate: jest.fn((ctx) => {
      const req = ctx.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    }),
  } as any;

  const CoursesServiceMock = {
    enroll: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: CoursesServiceMock },
        { provide: SearchService, useValue: { searchCourses: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<CoursesController>(CoursesController);
    jest.clearAllMocks();
  });

  it('happy path: enrolls and returns enrollmentId', async () => {
    const fakeEnrollment = { id: 'en-1', userId: mockUser.id, courseId: mockCourseId };
    CoursesServiceMock.enroll.mockResolvedValueOnce(fakeEnrollment);

    const res = await controller.enroll(mockCourseId, { user: mockUser } as any);
    expect(CoursesServiceMock.enroll).toHaveBeenCalledWith(mockUser.id, mockCourseId);
    expect(res).toEqual({ success: true, enrollmentId: fakeEnrollment.id });
  });

  it('duplicate enroll returns ConflictException from service', async () => {
    CoursesServiceMock.enroll.mockRejectedValueOnce(new ConflictException('already enrolled'));

    await expect(controller.enroll(mockCourseId, { user: mockUser } as any)).rejects.toThrow(ConflictException);
    expect(CoursesServiceMock.enroll).toHaveBeenCalledWith(mockUser.id, mockCourseId);
  });
});
