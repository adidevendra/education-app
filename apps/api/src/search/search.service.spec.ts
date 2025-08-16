import { describe, it, expect, beforeEach } from '@jest/globals';
import { SearchService } from './search.service';

describe('SearchService (unit)', () => {
  it('indexCourse/indexLesson happy path uses client.addDocuments', async () => {
    const addDocuments = jest.fn().mockResolvedValue({ updateId: 1 });
    const mockIndex = { addDocuments } as any;
    const client: any = { index: jest.fn().mockReturnValue(mockIndex) };
    const svc = new SearchService(client as any);

    const r1 = await svc.indexCourse({ id: 'c1', title: 'c' });
    expect(addDocuments).toHaveBeenCalled();
    expect(r1).toEqual({ updateId: 1 });

    const r2 = await svc.indexLesson({ id: 'l1', title: 'l' });
    expect(addDocuments).toHaveBeenCalledTimes(2);
    expect(r2).toEqual({ updateId: 1 });
  });

  it('searchCourses/searchLessons return hits from client.search', async () => {
    const hits = [{ id: 'c1', title: 'Found' }];
    const search = jest.fn().mockResolvedValue({ hits });
    const idx = { search } as any;
    const client: any = { index: jest.fn().mockReturnValue(idx) };
    const svc = new SearchService(client as any);

    const sc = await svc.searchCourses('x');
    expect(search).toHaveBeenCalledWith('x', { limit: 20 });
    expect(sc).toEqual(hits);

    const sl = await svc.searchLessons('y');
    expect(search).toHaveBeenCalledWith('y', { limit: 20 });
    expect(sl).toEqual(hits);
  });
});
import { Test } from '@nestjs/testing';
import { SearchService } from './search.service';
import { MEILI_CLIENT } from './meilisearch.module';

describe('SearchService resilience', () => {
  let service: SearchService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        // Provide an invalid/absent Meili client to simulate failure
        {
          provide: MEILI_CLIENT,
          useValue: null,
        },
      ],
    }).compile();

    service = moduleRef.get(SearchService);
  });

  it('returns empty array for searchCourses when Meili client unavailable', async () => {
    const res = await service.searchCourses('test');
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(0);
  });

  it('returns empty array for searchLessons when Meili client unavailable', async () => {
    const res = await service.searchLessons('test');
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(0);
  });

  it('indexCourse does not throw when Meili client unavailable', async () => {
    let error: any = null;
    try {
      const r = await service.indexCourse({ id: 'c1', title: 't' } as any);
      // allowed to return null or an object
      expect(r === null || typeof r === 'object').toBe(true);
    } catch (err) {
      error = err;
    }
    expect(error).toBeNull();
  });

  it('indexLesson does not throw when Meili client unavailable', async () => {
    let error: any = null;
    try {
      const r = await service.indexLesson({ id: 'l1', title: 't' } as any);
      expect(r === null || typeof r === 'object').toBe(true);
    } catch (err) {
      error = err;
    }
    expect(error).toBeNull();
  });
});
