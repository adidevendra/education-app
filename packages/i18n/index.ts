import i18next, { InitOptions } from 'i18next';
import ICU from 'i18next-icu';

export type Locale = 'en' | 'hi' | 'mr';

const fallbackLng: Record<Locale, Locale[]> = {
  en: ['hi', 'mr'],
  hi: ['mr', 'en'],
  mr: ['en', 'hi'],
};

export const defaultResources = {
  en: { translation: { greeting: 'Hello, {{name}}!', items_one: '{{count}} item', items_other: '{{count}} items' } },
  hi: { translation: { greeting: 'नमस्ते, {{name}}!', items_one: '{{count}} आइटम', items_other: '{{count}} आइटम' } },
  mr: { translation: { greeting: 'नमस्कार, {{name}}!', items_one: '{{count}} वस्तू', items_other: '{{count}} वस्तू' } },
};

export const i18n: ReturnType<typeof i18next.createInstance> = i18next.createInstance();
export async function initI18n(options?: Partial<InitOptions> & { lng?: Locale }): Promise<ReturnType<typeof i18next.createInstance>> {
  await i18n.use(ICU).init({
    lng: options?.lng || 'en',
    fallbackLng: (code: string) => fallbackLng[(code as Locale)] || ['en'],
    compatibilityJSON: 'v4',
    interpolation: { escapeValue: false },
    returnObjects: true,
    resources: { ...(options?.resources || defaultResources) },
    ...options,
  });
  return i18n;
}

export function t(key: string, params?: Record<string, any>): string {
  return i18n.t(key, params as any) as string;
}
