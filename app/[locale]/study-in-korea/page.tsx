export const revalidate = 300;

import { queryStudyInfos } from '@/lib/data/queries';
import type { StudyInfo } from '@/types';
import GuidesBrowserClient from './GuidesBrowserClient';

export default async function StudyInKoreaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let items: StudyInfo[] = [];
  try {
    items = await queryStudyInfos();
  } catch {
    items = [];
  }
  return <GuidesBrowserClient guides={items} locale={locale} />;
}
