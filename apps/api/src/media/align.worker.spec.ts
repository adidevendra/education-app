import { describe, it, expect } from '@jest/globals';
import { naiveAlign, filterSegments } from './align.worker';

describe('Alignment heuristics', () => {
  it('splits transcript into multiple segments', () => {
    const segs = naiveAlign('Hello world. This is a test. Another sentence!');
    expect(segs.length).toBeGreaterThanOrEqual(3);
  });
  it('filters out segments that are too short or long', () => {
    const raw = [
      { t0: 0, t1: 1, text: 'x' }, // too short duration + too short text
      { t0: 1, t1: 10, text: 'valid segment text' },
      { t0: 10, t1: 50, text: 'this one is too long in duration' },
    ];
    const filtered = filterSegments(raw as any);
  expect(filtered.length).toBe(1);
  if (filtered[0]) expect(filtered[0].text).toContain('valid');
  });
});
