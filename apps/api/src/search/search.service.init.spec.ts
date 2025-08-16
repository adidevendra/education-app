import { SearchService } from './search.service';

describe('SearchService.onModuleInit', () => {
  it('creates index and sets searchable attributes', async () => {
    const mockIndex = {
      updateSearchableAttributes: jest.fn().mockResolvedValue({}),
    };
    const mockClient = {
      createIndex: jest.fn().mockResolvedValue({}),
      index: jest.fn().mockReturnValue(mockIndex),
    } as any;

  const service = new SearchService(undefined as any);
    // @ts-ignore override the private client
    service['client'] = mockClient;

    await service.onModuleInit();

  expect(mockClient.createIndex).toHaveBeenCalledWith('courses');
  expect(mockIndex.updateSearchableAttributes).toHaveBeenCalledWith(['title', 'description', 'slug']);
  });
});
