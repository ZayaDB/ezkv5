import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./lib/i18n/config";
import en from "./lib/i18n/messages/en.json";
import kr from "./lib/i18n/messages/kr.json";
import mn from "./lib/i18n/messages/mn.json";

/** 동적 import 대신 고정 로드 — Windows에서 .next 캐시 불일치 시 ENOENT 완화 */
const messagesByLocale = { kr, en, mn } as unknown as Record<Locale, typeof kr>;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  const safe: Locale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  return {
    locale: safe,
    messages: messagesByLocale[safe],
  };
});



