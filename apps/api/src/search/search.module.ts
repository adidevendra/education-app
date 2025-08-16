import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { MeilisearchModule } from './meilisearch.module';

@Module({
  imports: [MeilisearchModule],
  // MeiliService implementation was removed in favor of direct MEILI_CLIENT usage by higher-level services.
  providers: [SearchService],
  controllers: [],
  exports: [SearchService],
})
export class SearchModule {}
