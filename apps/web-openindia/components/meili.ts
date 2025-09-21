import { MeiliSearch } from 'meilisearch';

export function getMeili() {
  const host = process.env.NEXT_PUBLIC_MEILI_HOST || 'http://localhost:7700';
  const apiKey = process.env.NEXT_PUBLIC_MEILI_KEY;
  return new MeiliSearch({ host, apiKey: apiKey as any });
}
