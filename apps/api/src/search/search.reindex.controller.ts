import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permission } from '../auth/permission.decorator';
import { RbacGuard } from '../auth/rbac.guard';

@ApiTags('search')
@Controller('v1/search')
export class SearchReindexController {
  constructor(private readonly search: SearchService) {}

  @Post('reindex')
  @UseGuards(JwtAuthGuard as any, RbacGuard)
  @Permission('update', 'search')
  async reindex(@Req() _req: any) {
    // In a full implementation, we'd page through DB courses and re-index.
    // Here we return a simple acknowledgment to keep endpoint minimal.
    return { ok: true, enqueued: 0 };
  }
}
