import { TranslateService } from './translate.service';
import { join } from 'path';

async function main() {
  const course = process.env.COURSE || 'sample_course';
  const lang = process.argv[2] || '--lang=hi';
  const langCode = lang.replace('--lang=', '') || 'hi';
  const root = process.cwd();
  const base = join(root, 'datasets', 'ncsa_pool', course);
  const glossaryPath = join(base, 'glossary.csv');
  const sourcePath = join(base, 'source_segments.jsonl');
  const outDir = join(base, 'reports');
  const outJsonl = join(base, `translated_${langCode}.jsonl`);
  const svc = new TranslateService();
  const glossary = svc.loadGlossary(glossaryPath);
  const segments = svc.loadSourceSegments(sourcePath);
  const translated = svc.translateBatch(segments, glossary, langCode);
  svc.writeTranslatedJsonl(outJsonl, translated);
  const report = svc.generateReport({ course, lang: langCode, glossary, segments, translated, outDir });
  console.log('Coverage %', report.coveragePct);
  if (report.coveragePct < 95) {
    console.error('Coverage below target (95%).');
    process.exitCode = 1;
  }
}

main();
