import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { MediaService, Provider } from './media.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

const CreateAssetDto = z.object({
  title: z.string().min(1),
  provider: z.union([z.literal('mux'), z.literal('cloudflare_stream')]),
  providerAssetId: z.string().min(1),
});

@ApiTags('media')
@Controller('v1/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('assets')
  create(@Req() req: any, @Body(new ZodValidationPipe(CreateAssetDto)) body: z.infer<typeof CreateAssetDto>) {
    return this.media.create(req.orgId, body);
  }

  @Get('assets/:id')
  get(@Req() req: any, @Param('id') id: string) {
    const asset = this.media.get(req.orgId, id);
    if (!asset) return null;
    return { ...asset, playbackUrl: this.media.getSignedPlaybackUrl(asset) };
  }

  // Provider webhooks (public; rely on shared secret at ingress ideally)
  @Post('webhooks/mux')
  muxWebhook(@Body() body: any) {
    // Simplified: when Mux signals asset ready
    const type = body?.type;
    const assetId: string | undefined = body?.data?.id || body?.data?.asset_id;
    if (type && type.includes('asset.ready') && assetId) {
      this.media.markReadyByProvider('mux', assetId, { duration: body?.data?.duration });
    }
    return { ok: true };
  }

  @Post('webhooks/cloudflare')
  cloudflareWebhook(@Body() body: any) {
    const status = body?.status?.state;
    const uid: string | undefined = body?.uid;
    if (uid && status === 'ready') {
      this.media.markReadyByProvider('cloudflare_stream', uid);
    }
    return { ok: true };
  }

  // Captions
  @Post('assets/:id/captions')
  addCaption(
    @Req() req: any,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(z.object({ lang: z.string(), label: z.string(), url: z.string().url() })))
    body: { lang: string; label: string; url: string },
  ) {
    return this.media.addCaption(req.orgId, id, body);
  }

  // Transcript association
  @Post('assets/:id/transcript')
  setTranscript(
    @Req() req: any,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(z.array(z.object({ start: z.number(), end: z.number(), text: z.string() }))))
    items: { start: number; end: number; text: string }[],
  ) {
    return this.media.setTranscript(req.orgId, id, items);
  }
}
