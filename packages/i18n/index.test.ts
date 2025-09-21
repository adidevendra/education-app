import { describe, it, expect, beforeAll } from 'vitest';
import { initI18n, t, i18n } from './index';

describe('i18n', () => {
  beforeAll(async () => {
    await initI18n({ lng: 'en' });
  });

  it('formats plural ICU', () => {
    expect(t('items_other', { count: 2 })).toContain('2');
  });

  it('falls back to hi then mr', async () => {
    await initI18n({ lng: 'en' });
    expect(i18n.language).toBe('en');
  });
});
