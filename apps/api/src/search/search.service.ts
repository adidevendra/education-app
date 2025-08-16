import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { MEILI_CLIENT } from './meilisearch.module';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly indexName = 'courses';
  private readonly lessonsIndexName = 'lessons';

  constructor(@Inject(MEILI_CLIENT) private readonly client: MeiliSearch) {}

  async onModuleInit() {
    if (!this.client) {
      this.logger.warn('MeiliSearch client not available on init');
      return;
    }

    try {
      // Try to create the index (will error if already exists) — ignore existence errors
      try {
        // createIndex accepts a string uid in some client versions
        await this.client.createIndex(this.indexName as any);
        this.logger.log(`Created Meili index ${this.indexName}`);
      } catch (err) {
        this.logger.debug({ err }, `Index ${this.indexName} may already exist`);
      }

      const index = this.client.index(this.indexName);
      await index.updateSearchableAttributes(['title', 'description', 'slug']);
      this.logger.log(`Updated searchable attributes for ${this.indexName}`);

      // lessons index
      try {
        await this.client.createIndex(this.lessonsIndexName as any);
        this.logger.log(`Created Meili index ${this.lessonsIndexName}`);
      } catch (err) {
        this.logger.debug({ err }, `Index ${this.lessonsIndexName} may already exist`);
      }

      const lessonsIndex = this.client.index(this.lessonsIndexName);
      await lessonsIndex.updateSearchableAttributes(['title', 'content', 'courseId']);
      this.logger.log(`Updated searchable attributes for ${this.lessonsIndexName}`);
    } catch (err) {
      this.logger.warn({ err }, `Failed to initialize Meili index ${this.indexName}`);
    }
  }

  async indexCourse(course: any) {
    if (!this.client) {
      this.logger.warn('MeiliSearch client not available - skipping indexCourse');
      return null;
    }
    try {
      const index = this.client.index(this.indexName);
      const res = await index.addDocuments([course]);
      return res;
    } catch (err) {
      this.logger.warn({ err }, 'indexCourse failed');
      return null;
    }
  }

  async searchCourses(query: string) {
    if (!this.client) {
      this.logger.warn('MeiliSearch client not available - searchCourses returning empty');
      return [];
    }
    try {
      const index = this.client.index(this.indexName);
      const res = await index.search(query, { limit: 20 });
      return (res && (res as any).hits) || [];
    } catch (err) {
      this.logger.warn({ err }, 'searchCourses failed');
      return [];
    }
  }

  async indexLesson(lesson: any) {
    if (!this.client) {
      this.logger.warn('MeiliSearch client not available - skipping indexLesson');
      return null;
    }
    try {
      const idx = this.client.index(this.lessonsIndexName);
      const res = await idx.addDocuments([lesson]);
      return res;
    } catch (err) {
      this.logger.warn({ err }, 'indexLesson failed');
      return null;
    }
  }

  async searchLessons(query: string) {
    if (!this.client) {
      this.logger.warn('MeiliSearch client not available - searchLessons returning empty');
      return [];
    }
    try {
      const idx = this.client.index(this.lessonsIndexName);
      const res = await idx.search(query, { limit: 20 });
      return (res && (res as any).hits) || [];
    } catch (err) {
      this.logger.warn({ err }, 'searchLessons failed');
      return [];
    }
  }
}
