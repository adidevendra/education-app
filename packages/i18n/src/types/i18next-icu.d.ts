// Minimal ambient typing so DTS builds don't fail.
declare module 'i18next-icu' {
  import type { i18n } from 'i18next';
  const plugin: (api?: any) => { type: '3rdParty'; init: (i18n: i18n) => void };
  export default plugin;
}
