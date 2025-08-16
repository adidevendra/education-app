import { CoursesController } from './courses.controller';

describe('CoursesController search', () => {
  it('returns [] when q is empty', () => {
    const ctrl = new CoursesController({} as any, { searchCourses: jest.fn() } as any);
    const res = (ctrl as any).search('');
    expect(res).toEqual([]);
  });

  it('calls searchService when q present', () => {
    const mockSearch = { searchCourses: jest.fn().mockReturnValue(['a']) };
    const ctrl = new CoursesController({} as any, mockSearch as any);
    const res = (ctrl as any).search('term');
    expect(mockSearch.searchCourses).toHaveBeenCalledWith('term');
    expect(res).toEqual(['a']);
  });
});
