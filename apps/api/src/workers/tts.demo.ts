import { Queue } from 'bullmq';
import { join } from 'path';

async function main(){
  const course = process.env.COURSE || 'sample_course';
  const lang = process.env.LANG || 'hi';
  const root = process.cwd();
  const base = join(root, 'datasets', 'ncsa_pool', course);
  const alignmentPath = join(base, 'alignment.jsonl');
  const translationPath = join(base, `translated_${lang}.jsonl`);
  // If alignment placeholder missing, derive simple fake alignment from source segments
  if (!require('fs').existsSync(alignmentPath)) {
    const srcPath = join(base, 'source_segments.jsonl');
    const src = require('fs').readFileSync(srcPath, 'utf8').trim().split(/\n/).filter(Boolean).map((l:string)=>JSON.parse(l));
    let t0 = 0;
    const lines = src.map((s:any)=>{ const dur=3; const line = { t0, t1: t0+dur, text: s.text }; t0+=dur; return JSON.stringify(line); }).join('\n')+'\n';
    require('fs').writeFileSync(alignmentPath, lines);
  }
  const q = new Queue('tts-audio', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } });
  await q.add('synthesize-tts', { course, lang, alignmentPath, translationPath });
  console.log('Enqueued TTS job for', course, lang);
  process.exit(0);
}

main();
