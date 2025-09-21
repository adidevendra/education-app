import { DynamicModule, Global, Module } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

export const MEILI_CLIENT = 'MEILI_CLIENT';

export function createMeiliClient() {
  const host = process.env.MEILI_URL ?? 'http://127.0.0.1:7700';
  return new MeiliSearch({ host });
}

@Global()
@Module({})
export class MeilisearchModule {
  static forRoot(): DynamicModule {
    return {
      module: MeilisearchModule,
      providers: [
        {
          provide: MEILI_CLIENT,
          useFactory: createMeiliClient,
        },
      ],
      exports: [MEILI_CLIENT],
    };
  }
}
