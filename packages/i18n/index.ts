import i18next from 'i18next';
import ICU from 'i18next-icu';

export const i18n = i18next.createInstance();
i18n.use(ICU).init({
  lng: 'en',
  resources: {},
});
