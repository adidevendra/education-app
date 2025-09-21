import { describe, it, expect } from 'vitest';
import { MediaSegmentSchema } from '../src/segment';

describe('MediaSegmentSchema', () => {
  it('allows empty captions array', () => {
    const seg = MediaSegmentSchema.parse({
      lectureId: 'l1',
      kind: 'video',
      src: 'https://cdn.example.com/v1.mp4',
      mime: 'video/mp4',
      durationSeconds: 120,
      captions: []
    });
    expect(seg.durationSeconds).toBe(120);
  });
  it('rejects caption with end <= start', () => {
    expect(() => MediaSegmentSchema.parse({
      lectureId: 'l1', kind: 'audio', src: 'https://cdn.example.com/a1.mp3', mime: 'audio/mpeg', durationSeconds: 10,
      captions: [{ startMs: 1000, endMs: 900, text: 'oops' }]
    })).toThrow();
  });
});
