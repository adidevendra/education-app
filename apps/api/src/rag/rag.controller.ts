import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('qa')
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Get('check')
  async check(@Query('index') index: string, @Query('q') q: string) {
    if (!index || !q) throw new BadRequestException('index and q are required');
    const res = await this.rag.answer(index, q);
    if (res.rejected) {
      return { ok: false, reason: res.reason, citations: res.citations };
    }
    return { ok: true, answer: res.answer, citations: res.citations };
  }
}
