import { Inject, Injectable, Logger } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { MEILI_CLIENT } from './meilisearch.module';

@Injectable()
export class MeiliService {
  private readonly logger = new Logger(MeiliService.name);

  constructor(@Inject(MEILI_CLIENT) private readonly client: MeiliSearch) {}

  /**
   * Add documents to the given index in a safe manner.
   * If Meili is unavailable this will log a warning and return a safe fallback.
   */
  async index(indexName: string, docs: any[]): Promise<any> {
    if (!this.client) {
      this.logger.warn(`Meili client not initialized — skipping indexing for index=${indexName}`);
      return null;
    }

    try {
      const index = this.client.index(indexName);
      return await index.addDocuments(docs);
    } catch (err) {
      this.logger.warn({ err }, `Meili indexing failed for index=${indexName}`);
      return null;
    }
  }
}
