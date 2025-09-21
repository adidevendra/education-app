import { describe, it, expect } from '@jest/globals';
import { writeSilenceWav, computeDurationError, concatenateWavs } from './tts.worker';
import * as fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('TTS Worker utilities', () => {
  it('writes a silence wav of approximate duration', () => {
    const p = join(tmpdir(), `silence_${Date.now()}.wav`);
    const dur = writeSilenceWav(p, 1.234);
    expect(Math.abs(dur - 1.234)).toBeLessThan(0.05);
    expect(fs.existsSync(p)).toBe(true);
  });

  it('computes duration error within acceptable tolerance', () => {
    const err = computeDurationError(2.0, 2.05);
    expect(err).toBeGreaterThan(0);
    expect(err).toBeLessThan(3);
  });

  it('concatenates wav segments correctly', () => {
    const dir = join(tmpdir(), `concat_${Date.now()}`);
    fs.mkdirSync(dir, { recursive: true });
    const a = join(dir, 'a.wav');
    const b = join(dir, 'b.wav');
    writeSilenceWav(a, 0.5);
    writeSilenceWav(b, 0.75);
    const out = join(dir, 'out.wav');
    concatenateWavs([a, b], out);
    const size = fs.statSync(out).size;
    expect(size).toBeGreaterThan(44); // header + data
  });
});
