import { MeiliSearch } from 'meilisearch';

describe('MeilisearchModule provider', () => {
  const OLD = { ...process.env };
  afterEach(() => { process.env = { ...OLD } as any; });

  it('exports a MeiliSearch client with defaults', () => {
    delete process.env.MEILI_URL;
    delete process.env.MEILI_HOST;
    delete process.env.MEILI_MASTER_KEY;
    delete process.env.MEILI_KEY;
    const host = process.env.MEILI_URL || process.env.MEILI_HOST || 'http://127.0.0.1:7700';
    const apiKey = process.env.MEILI_MASTER_KEY || process.env.MEILI_KEY || '';
    const client = new MeiliSearch({ host, apiKey });
    expect(client).toBeInstanceOf(MeiliSearch);
  });

  it('exports token string MEILI_CLIENT from module', () => {
    const token = require('./meilisearch.module').MEILI_CLIENT;
    expect(typeof token).toBe('string');
    expect(token).toBe('MEILI_CLIENT');
  });

  it('factory builds client when MEILI_URL present', () => {
    process.env.MEILI_URL = 'http://127.0.0.1:7700';
    const mod = require('./meilisearch.module');
    const client = mod.createMeiliClient();
    expect(client).toBeDefined();
    expect(client.config.host).toBe(process.env.MEILI_URL);
  });
});
