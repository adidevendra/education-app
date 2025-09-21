import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface GlossaryEntry {
  term: string; // source term (lowercase)
  preferred: string; // required translation form
  synonyms: string[]; // acceptable alternates (still count toward coverage)
}

export interface TranslationSegmentInput {
  id: string;
  text: string;
}

export interface TranslatedSegment extends TranslationSegmentInput {
  translated: string;
  backTranslated?: string;
  glossaryHits: string[]; // which glossary terms covered
  confidence: number; // stubbed confidence 0..1
}

export interface TranslationReport {
  course: string;
  lang: string;
  totalSegments: number;
  totalTerms: number;
  coveredTerms: number;
  coveragePct: number;
  rejectedSegments: string[]; // ids rejected due to low confidence
  generatedAt: string;
  hash: string; // hash of source glossary + inputs
}

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);

  loadGlossary(glossaryPath: string): GlossaryEntry[] {
    const csv = fs.readFileSync(glossaryPath, 'utf8');
    const lines = csv.trim().split(/\r?\n/).slice(1); // skip header
    return lines.map(l => {
      const [termRaw, preferredRaw, synonyms] = l.split(',');
      const term = (termRaw || '').trim().toLowerCase();
      const preferred = (preferredRaw || '').trim();
      return {
        term,
        preferred,
        synonyms: synonyms ? synonyms.split('|').map(s => s.trim()).filter(Boolean) : [],
      } as GlossaryEntry;
    });
  }

  loadSourceSegments(jsonlPath: string): TranslationSegmentInput[] {
    return fs
      .readFileSync(jsonlPath, 'utf8')
      .trim()
      .split(/\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line));
  }

  // Placeholder translation: simply wraps text and injects preferred glossary terms if source contains the term.
  translateBatch(segments: TranslationSegmentInput[], glossary: GlossaryEntry[], lang: string): TranslatedSegment[] {
    return segments.map(seg => {
      const lower = seg.text.toLowerCase();
      const hits: string[] = [];
      let translated = seg.text; // naive: identity translation
      for (const g of glossary) {
        if (lower.includes(g.term)) {
          hits.push(g.term);
          // enforce preferred term by appending (for demo). In real scenario, replace token appropriately.
          translated = translated.replace(new RegExp(g.term, 'ig'), g.preferred);
        }
      }
      // back-translation stub (identity)
      const backTranslated = translated; // with real system call IndicTrans2 -> English
      const confidence = 0.98; // pretend high confidence
      return { ...seg, translated, backTranslated, glossaryHits: hits, confidence };
    });
  }

  computeCoverage(translated: TranslatedSegment[], glossary: GlossaryEntry[]): { covered: Set<string>; pct: number } {
    const covered = new Set<string>();
    for (const seg of translated) seg.glossaryHits.forEach(h => covered.add(h));
    const pct = glossary.length ? (covered.size / glossary.length) * 100 : 100;
    return { covered, pct };
  }

  generateReport(opts: {
    course: string;
    lang: string;
    glossary: GlossaryEntry[];
    segments: TranslationSegmentInput[];
    translated: TranslatedSegment[];
    outDir: string;
  }): TranslationReport {
    const { course, lang, glossary, segments, translated, outDir } = opts;
    const { covered, pct } = this.computeCoverage(translated, glossary);
    const rejectedSegments = translated.filter(s => s.confidence < 0.5).map(s => s.id);
    const hash = createHash('sha256')
      .update(JSON.stringify(glossary))
      .update(JSON.stringify(segments.map(s => s.id)))
      .digest('hex')
      .slice(0, 16);
    const report: TranslationReport = {
      course,
      lang,
      totalSegments: segments.length,
      totalTerms: glossary.length,
      coveredTerms: covered.size,
      coveragePct: Number(pct.toFixed(2)),
      rejectedSegments,
      generatedAt: new Date().toISOString(),
      hash,
    };
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'translation.json'), JSON.stringify(report, null, 2));
    return report;
  }

  writeTranslatedJsonl(filePath: string, segments: TranslatedSegment[]) {
    const lines = segments.map(s => JSON.stringify(s)).join('\n') + '\n';
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, lines, 'utf8');
  }
}
