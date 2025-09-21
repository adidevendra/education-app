import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { MeilisearchModule } from './meilisearch.module';
import { SearchWorker } from './search.worker';
import { SearchReindexController } from './search.reindex.controller';

@Module({
  imports: [MeilisearchModule.forRoot()],
  // MeiliService implementation was removed in favor of direct MEILI_CLIENT usage by higher-level services.
  providers: [SearchService, SearchWorker],
  controllers: [SearchReindexController],
  exports: [SearchService],
})
export class SearchModule {}
