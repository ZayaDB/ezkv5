export const revalidate = 300;
import { setRequestLocale } from 'next-intl/server';

import { queryStudyInfos } from '@/lib/data/queries';
import type { StudyInfo } from '@/types';
import GuidesBrowserClient from './GuidesBrowserClient';

export default async function StudyInKoreaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  let items: StudyInfo[] = [];
  try {
    items = await queryStudyInfos({ locale });
  } catch {
    items = [];
  }
  return <GuidesBrowserClient guides={items} locale={locale} />;
}
