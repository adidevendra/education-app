import { describe, it, expect } from '@jest/globals';
import { TranslateService } from './translate.service';
import { tmpdir } from 'os';
import { join } from 'path';
import * as fs from 'fs';

describe('TranslateService', () => {
  const svc = new TranslateService();

  it('enforces preferred glossary term in translation', () => {
    const glossary = [{ term: 'algorithm', preferred: 'एल्गोरिदम', synonyms: [] }];
    const segs = [{ id: '1', text: 'An algorithm works.' }];
    const translated = svc.translateBatch(segs, glossary as any, 'hi');
  if (translated[0]) expect(translated[0].translated).toContain('एल्गोरिदम');
    const report = svc.generateReport({
      course: 'demo',
      lang: 'hi',
      glossary: glossary as any,
      segments: segs,
      translated,
      outDir: join(tmpdir(), 'translate-report'),
    });
    expect(report.coveragePct).toBeGreaterThanOrEqual(100);
  });

  it('computes partial coverage', () => {
    const glossary = [
      { term: 'algorithm', preferred: 'एल्गोरिदम', synonyms: [] },
      { term: 'matrix', preferred: 'मैट्रिक्स', synonyms: [] },
    ];
    const segs = [{ id: '1', text: 'An algorithm works.' }];
    const translated = svc.translateBatch(segs, glossary as any, 'hi');
    const { covered, pct } = svc.computeCoverage(translated as any, glossary as any);
    expect(covered.size).toBe(1);
    expect(pct).toBeCloseTo(50, 5);
  });
});
