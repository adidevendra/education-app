import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { MeiliSearch } from 'meilisearch';
import * as fs from 'fs';

interface IndexJobData {
  index: string; // e.g. course id
  jsonlPath: string; // alignment or notes JSONL with {t0?,t1?,text,id?}
  kind: 'transcript' | 'notes';
  course?: string;
  lang?: string;
}

@Injectable()
export class IndexWorker implements OnModuleInit {
  private readonly logger = new Logger(IndexWorker.name);
  private worker?: Worker;

  onModuleInit() {
    const connection = { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } } as any;
  const meiliHost = process.env.MEILI_HOST || process.env.MEILI_URL || 'http://127.0.0.1:7700';
  const apiKey = process.env.MEILI_API_KEY as string | undefined;
  const client = new MeiliSearch(apiKey ? { host: meiliHost, apiKey } : { host: meiliHost });
    this.worker = new Worker(
      'rag-index',
      async job => {
        if (job.name !== 'index-segments') return;
        const data = job.data as IndexJobData;
        try {
          const lines = fs
            .readFileSync(data.jsonlPath, 'utf8')
            .trim()
            .split(/\n/)
            .filter(Boolean)
            .map(l => JSON.parse(l));
          const docs = lines.map((l: any, i: number) => ({
            id: l.id || `${data.index}_${i}`,
            text: l.text,
            t0: l.t0 ?? null,
            t1: l.t1 ?? null,
            kind: data.kind,
            course: data.course || data.index,
            lang: data.lang || 'en',
          }));
          const indexName = `course_${data.index}`;
          let index;
          try {
            index = await client.getIndex(indexName);
          } catch {
            await client.createIndex(indexName, { primaryKey: 'id' });
            index = await client.getIndex(indexName);
          }
          await index.addDocuments(docs as any);
        } catch (e) {
          this.logger.error('Index job failed', e as any);
          throw e;
        }
      },
      connection,
    );
  }
}
