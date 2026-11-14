import { defaultLocale, locales, type Locale } from "./config";
import kr from "./messages/runtime/kr.json";
import en from "./messages/runtime/en.json";
import mn from "./messages/runtime/mn.json";

/**
 * React 밖(lib, API route)에서 쓰는 번역.
 * 에러·알림·로드맵 템플릿처럼 컴포넌트가 아닌 곳의 문구는 여기서 가져온다.
 */
export type RuntimeMessages = typeof kr;
const runtimeMessages: Record<Locale, RuntimeMessages> = { kr, en, mn } as Record<Locale, RuntimeMessages>;

export function normalizeLocale(value: unknown): Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value)
    ? (value as Locale)
    : defaultLocale;
}

/** 브라우저에서는 <html lang>, 서버에서는 기본 로케일 */
export function currentLocale(): Locale {
  if (typeof document !== "undefined") return normalizeLocale(document.documentElement.lang);
  return defaultLocale;
}

/** API route: body.locale → Referer 경로(/en/...) → 기본값 */
export function localeFromRequest(req: Request, bodyLocale?: unknown): Locale {
  if (bodyLocale) return normalizeLocale(bodyLocale);
  try {
    const ref = req.headers.get("referer");
    if (ref) return normalizeLocale(new URL(ref).pathname.split("/")[1]);
  } catch {
    /* ignore */
  }
  return defaultLocale;
}

function lookup(messages: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined),
    messages
  );
}

export function rtMessages(locale: Locale = currentLocale()): RuntimeMessages {
  return runtimeMessages[locale] ?? runtimeMessages[defaultLocale];
}

export function tr(key: string, vars?: Record<string, string | number>, locale: Locale = currentLocale()): string {
  let value = lookup(rtMessages(locale), key);
  if (typeof value !== "string") value = lookup(runtimeMessages[defaultLocale], key);
  let text = typeof value === "string" ? value : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
  }
  return text;
}

/** errors.* 단축 */
export function trError(key: keyof RuntimeMessages["errors"], locale?: Locale): string {
  return tr(`errors.${key}`, undefined, locale);
}
