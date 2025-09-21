import { describe, it, expect } from 'vitest';
import { selectCaptionCue } from './PlayerShell';

const cues = [
  { start: 0, end: 5, text: 'Hello' },
  { start: 5, end: 10, text: 'World' },
];

describe('selectCaptionCue', () => {
  it('picks direct match', () => {
    expect(selectCaptionCue(cues, 1, 120)?.text).toBe('Hello');
  });
  it('returns null when outside and not within drift threshold', () => {
    expect(selectCaptionCue(cues, 10.2, 50)).toBeNull();
  });
  it('drift does not snap when outside threshold', () => {
    expect(selectCaptionCue(cues, 4.98, 10)?.text).toBe('Hello');
  });
});
