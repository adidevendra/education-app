import { describe, it, expect } from 'vitest';
import { QuizItemSchema } from '../src/quiz';

describe('QuizItemSchema', () => {
  it('requires 2 options for single_choice', () => {
    expect(() => QuizItemSchema.parse({ lectureId: 'l1', kind: 'single_choice', prompt: 'Q1', options: ['only'] })).toThrow();
  });
  it('passes multi_choice with 2 options', () => {
    const q = QuizItemSchema.parse({ lectureId: 'l1', kind: 'multi_choice', prompt: 'Pick', options: ['a','b'] });
    expect(q.options?.length).toBe(2);
  });
  it('allows true_false without options', () => {
    const q = QuizItemSchema.parse({ lectureId: 'l1', kind: 'true_false', prompt: 'Sky blue?' });
    expect(q.kind).toBe('true_false');
  });
});
