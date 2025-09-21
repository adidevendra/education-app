import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Queue } from 'bullmq';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import * as path from 'path';

// Job & segment types
export interface AlignmentJobData {
  assetId: string;        // internal media asset id
  orgId: string;          // tenancy scoping
  wavPath: string;        // path to 16kHz mono wav file
  transcript: string;     // raw transcript text (unsegmented)
  language?: string;      // optional language code
}

export interface AlignedSegment {
  t0: number; // start seconds
  t1: number; // end seconds
  text: string;
  speaker?: string;
}

// Simple heuristic alignment stub (placeholder for real MFA / aeneas / gentle integration)
export function naiveAlign(transcript: string): AlignedSegment[] {
  // Split by sentence terminators; assign uniform durations (2s each) just for demo.
  const sentences = transcript
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const segments: AlignedSegment[] = [];
  let cursor = 0;
  for (const s of sentences) {
    const dur = Math.min(5, Math.max(2, Math.round(s.length / 15))); // 2-5s heuristic
    segments.push({ t0: cursor, t1: cursor + dur, text: s });
    cursor += dur;
  }
  return segments;
}

// Filtering per AC (2–30s duration, 2–300 chars)
export function filterSegments(segments: AlignedSegment[]): AlignedSegment[] {
  return segments.filter(s => {
    const dur = s.t1 - s.t0;
    const len = s.text.length;
    return dur >= 2 && dur <= 30 && len >= 2 && len <= 300;
  });
}

// JSONL shard writer (size-based rotation by max lines for now)
class JsonlShardWriter {
  private stream?: ReturnType<typeof createWriteStream>;
  private linesInShard = 0;
  private shardIndex = 0;
  constructor(private baseDir: string, private baseName: string, private maxLines = 200) {
    if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });
  }
  private openNew() {
    if (this.stream) this.stream.end();
    const filename = path.join(this.baseDir, `${this.baseName}.${this.shardIndex}.jsonl`);
    this.stream = createWriteStream(filename, { encoding: 'utf8' });
    this.linesInShard = 0;
    this.shardIndex++;
  }
  write(obj: any) {
    if (!this.stream || this.linesInShard >= this.maxLines) this.openNew();
    this.stream!.write(JSON.stringify(obj) + '\n');
    this.linesInShard++;
  }
  close() {
    if (this.stream) this.stream.end();
  }
}

@Injectable()
export class AlignmentWorker implements OnModuleInit {
  private readonly logger = new Logger(AlignmentWorker.name);
  private worker?: Worker;

  onModuleInit() {
    const connection = { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } } as any;
    this.worker = new Worker(
      'align-audio',
      async job => {
        if (job.name !== 'force-align') return;
        const data = job.data as AlignmentJobData;
        this.logger.log(`Starting alignment job asset=${data.assetId}`);
        // Placeholder alignment
        const rawSegments = naiveAlign(data.transcript);
        const segments = filterSegments(rawSegments);
        // Emit shard(s)
        const outDir = process.env.ALIGN_OUT_DIR || path.join(process.cwd(), 'alignment-output');
        const writer = new JsonlShardWriter(outDir, `${data.assetId}-${randomUUID()}`);
        for (const seg of segments) writer.write(seg);
        writer.close();
        this.logger.log(`Alignment completed: ${segments.length} segments.`);
        return { segments: segments.length };
      },
      connection,
    );
  }
}

export const ALIGNMENT_QUEUE = 'ALIGNMENT_QUEUE';

@Injectable()
export class AlignmentQueueProvider implements OnModuleInit {
  queue?: Queue;
  onModuleInit() {
    const connection = { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } } as any;
    this.queue = new Queue('align-audio', connection);
  }
}
