export const locales = ['kr', 'en', 'mn'] as const;
export const defaultLocale = 'kr' as const;

export type Locale = (typeof locales)[number];




/** Intl/Date 포맷용 BCP-47 태그 */
export function intlLocale(locale: string): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'mn') return 'mn-MN';
  return 'ko-KR';
}
