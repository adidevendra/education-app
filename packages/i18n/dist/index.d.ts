import i18next, { InitOptions } from 'i18next';

type Locale = 'en' | 'hi' | 'mr';
declare const defaultResources: {
    en: {
        translation: {
            greeting: string;
            items_one: string;
            items_other: string;
        };
    };
    hi: {
        translation: {
            greeting: string;
            items_one: string;
            items_other: string;
        };
    };
    mr: {
        translation: {
            greeting: string;
            items_one: string;
            items_other: string;
        };
    };
};
declare const i18n: ReturnType<typeof i18next.createInstance>;
declare function initI18n(options?: Partial<InitOptions> & {
    lng?: Locale;
}): Promise<ReturnType<typeof i18next.createInstance>>;
declare function t(key: string, params?: Record<string, any>): string;

export { type Locale, defaultResources, i18n, initI18n, t };
