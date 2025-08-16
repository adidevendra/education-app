import { Global, Module } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

export const MEILI_CLIENT = 'MEILI_CLIENT';

export function createMeiliClient() {
  const host = process.env.MEILI_URL || process.env.MEILI_HOST || 'http://127.0.0.1:7700';
  const apiKey = process.env.MEILI_MASTER_KEY || process.env.MEILI_KEY || '';
  return new MeiliSearch({ host, apiKey });
}

@Global()
@Module({
  providers: [
    {
      provide: MEILI_CLIENT,
      useFactory: createMeiliClient,
    },
  ],
  exports: [MEILI_CLIENT],
})
export class MeilisearchModule {}
