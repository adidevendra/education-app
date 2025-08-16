import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeiliSearch } from 'meilisearch';
import { MEILI_CLIENT } from '../search/meilisearch.module';
import { readFileSync } from 'fs';

@Controller('health')
export class HealthController {
  private start = Date.now();

  constructor(private prisma: PrismaService, @Inject(MEILI_CLIENT) private meiliClient: MeiliSearch) {}

  @Get()
  async get() {
    // uptime in seconds
    const uptime = Math.floor((Date.now() - this.start) / 1000);

    // read package.json for version
    let version = 'unknown';
    try {
      const pkg = JSON.parse(readFileSync(__dirname + '/../../package.json', 'utf8'));
      version = pkg.version || version;
    } catch (err) {
      // ignore
    }

    // determine DB mode
    const dbMode = process.env.USE_IN_MEMORY_DB === '1' ? 'in-memory' : process.env.DATABASE_URL ? 'real' : 'unknown';

    // meili status probe: call injected client.health() if available
    let meili = { status: 'unknown' };
    try {
      if (!this.meiliClient) {
        meili = { status: 'unavailable' };
      } else {
        try {
          const health = await this.meiliClient.health();
          meili = { status: (health && (health as any).status) || 'unknown' };
        } catch (err) {
          meili = { status: 'unhealthy' };
        }
      }
    } catch (err) {
      meili = { status: 'error' };
    }

    return {
      uptime,
      version,
      database: dbMode,
      meili,
    };
  }
}
