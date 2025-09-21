import { describe, it, expect } from 'vitest';
import { CourseSchema } from '../src/course';

describe('CourseSchema', () => {
  it('accepts minimal valid course', () => {
    const c = CourseSchema.parse({ orgId: 'o1', title: 'Algebra 101', slug: 'algebra-101' });
    expect(c.title).toBe('Algebra 101');
  });
  it('rejects invalid slug chars', () => {
    expect(() => CourseSchema.parse({ orgId: 'o1', title: 'X', slug: 'Bad Slug' })).toThrow();
  });
});
