// index.ts
import i18next from "i18next";
import ICU from "i18next-icu";
var fallbackLng = {
  en: ["hi", "mr"],
  hi: ["mr", "en"],
  mr: ["en", "hi"]
};
var defaultResources = {
  en: { translation: { greeting: "Hello, {{name}}!", items_one: "{{count}} item", items_other: "{{count}} items" } },
  hi: { translation: { greeting: "\u0928\u092E\u0938\u094D\u0924\u0947, {{name}}!", items_one: "{{count}} \u0906\u0907\u091F\u092E", items_other: "{{count}} \u0906\u0907\u091F\u092E" } },
  mr: { translation: { greeting: "\u0928\u092E\u0938\u094D\u0915\u093E\u0930, {{name}}!", items_one: "{{count}} \u0935\u0938\u094D\u0924\u0942", items_other: "{{count}} \u0935\u0938\u094D\u0924\u0942" } }
};
var i18n = i18next.createInstance();
async function initI18n(options) {
  await i18n.use(ICU).init({
    lng: options?.lng || "en",
    fallbackLng: (code) => fallbackLng[code] || ["en"],
    compatibilityJSON: "v4",
    interpolation: { escapeValue: false },
    returnObjects: true,
    resources: { ...options?.resources || defaultResources },
    ...options
  });
  return i18n;
}
function t(key, params) {
  return i18n.t(key, params);
}
export {
  defaultResources,
  i18n,
  initI18n,
  t
};
//# sourceMappingURL=index.js.map