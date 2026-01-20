export const locales = ['kr', 'en', 'mn'] as const;
export const defaultLocale = 'kr' as const;

export type Locale = (typeof locales)[number];



