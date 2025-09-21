import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class SearchWorker implements OnModuleInit {
  private readonly logger = new Logger(SearchWorker.name);
  private worker?: Worker;

  onModuleInit() {
    const meiliHost = process.env.MEILI_HOST || 'http://localhost:7700';
    const meiliKey = process.env.MEILI_API_KEY || undefined;
    const client = new MeiliSearch({ host: meiliHost, apiKey: meiliKey });
    const connection = { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } } as any;

    this.worker = new Worker(
      'index-course',
      async (job) => {
        try {
          if (job.name !== 'index-course') return;
          const payload = job.data as any;
          const doc = {
            id: payload.id,
            orgId: payload.orgId,
            title: payload.title,
            description: payload.description ?? null,
            tags: payload.tags ?? [],
            lang: payload.language ?? payload.lang ?? null,
            price: payload.price ?? null,
          };
          const index = client.index('courses');
          await index.addDocuments([doc]);
        } catch (err) {
          this.logger.warn({ err }, 'Failed to index course');
        }
      },
      connection,
    );
  }
}
