import { Test } from '@nestjs/testing';
import { SearchService } from './search.service';
import { MEILI_CLIENT } from './meilisearch.module';

describe('SearchService', () => {
  let svc: SearchService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: MEILI_CLIENT,
          useValue: {
            index: () => ({
              addDocuments: async () => ({ taskUid: 1 }),
              search: async () => ({ hits: [] }),
              updateSearchableAttributes: async () => ({ taskUid: 2 }),
            }),
            getIndex: async () => ({}),
            createIndex: async () => ({ uid: 'courses' }),
          },
        },
      ],
    }).compile();

    svc = moduleRef.get(SearchService);
  });

  it('searchCourses returns an array (no throw)', async () => {
    const sc = await svc.searchCourses('x');
    expect(Array.isArray(sc)).toBe(true);
  });

  it('searchLessons returns an array (no throw)', async () => {
    const sl = await svc.searchLessons('y');
    expect(Array.isArray(sl)).toBe(true);
  });

  it('indexCourse does not throw when Meili client available', async () => {
    await expect(svc.indexCourse({ id: 'c1', title: 'T', description: '', slug: 't' } as any)).resolves.toMatchObject({ taskUid: expect.any(Number) });
  });

  it('indexLesson does not throw when Meili client available', async () => {
    await expect(svc.indexLesson({ id: 'l1', courseId: 'c1', title: 'L' } as any)).resolves.toMatchObject({ taskUid: expect.any(Number) });
  });
});
