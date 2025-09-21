import { Injectable } from '@nestjs/common';
import { z } from 'zod';

export type Provider = 'mux' | 'cloudflare_stream';

const AssetSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  title: z.string(),
  provider: z.union([z.literal('mux'), z.literal('cloudflare_stream')]),
  providerAssetId: z.string(),
  status: z.enum(['pending', 'ready', 'failed']).default('pending'),
  duration: z.number().nullable().optional(),
  captions: z.array(z.object({ lang: z.string(), label: z.string(), url: z.string().url() })).default([]),
  transcript: z.array(z.object({ start: z.number(), end: z.number(), text: z.string() })).default([]),
});

export type Asset = z.infer<typeof AssetSchema>;

@Injectable()
export class MediaService {
  private assetsByOrg = new Map<string, Map<string, Asset>>();

  private id(prefix = '') {
    return `${prefix}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }

  private getStore(orgId: string) {
    let m = this.assetsByOrg.get(orgId);
    if (!m) {
      m = new Map();
      this.assetsByOrg.set(orgId, m);
    }
    return m;
  }

  create(orgId: string, input: { title: string; provider: Provider; providerAssetId: string }): Asset {
    const asset: Asset = AssetSchema.parse({
      id: this.id('v_'),
      orgId,
      title: input.title,
      provider: input.provider,
      providerAssetId: input.providerAssetId,
      status: 'pending',
      captions: [],
      transcript: [],
    });
    this.getStore(orgId).set(asset.id, asset);
    return asset;
  }

  markReadyByProvider(provider: Provider, providerAssetId: string, meta?: Partial<Pick<Asset, 'duration'>>) {
    for (const [, store] of this.assetsByOrg) {
      for (const [id, a] of store) {
        if (a.provider === provider && a.providerAssetId === providerAssetId) {
          const updated: Asset = { ...a, status: 'ready', duration: meta?.duration ?? a.duration };
          store.set(id, updated);
          return updated;
        }
      }
    }
    return null;
  }

  getSignedPlaybackUrl(asset: Asset): string {
    // Stub: In production, sign via provider SDK.
    if (asset.provider === 'mux') {
      return `https://stream.mux.com/${asset.providerAssetId}.m3u8`;
    }
    return `https://videodelivery.net/${asset.providerAssetId}/manifest/video.m3u8`;
  }

  addCaption(orgId: string, assetId: string, c: { lang: string; label: string; url: string }) {
    const store = this.getStore(orgId);
    const asset = store.get(assetId);
    if (!asset) return null;
    const updated: Asset = { ...asset, captions: [...asset.captions, c] };
    store.set(assetId, updated);
    return updated;
  }

  setTranscript(orgId: string, assetId: string, items: { start: number; end: number; text: string }[]) {
    const store = this.getStore(orgId);
    const asset = store.get(assetId);
    if (!asset) return null;
    const updated: Asset = { ...asset, transcript: items };
    store.set(assetId, updated);
    return updated;
  }

  get(orgId: string, id: string) {
    return this.getStore(orgId).get(id) || null;
  }
}
