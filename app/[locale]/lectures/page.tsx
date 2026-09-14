import { queryLecturesSupabase } from '@/lib/supabase/public-queries';
import LecturesPageClient from './LecturesPageClient';
import type { Lecture } from '@/types';

export default async function LecturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let lectures: Lecture[] = [];
  try {
    const r = await queryLecturesSupabase({ limit: 120 });
    lectures = r.lectures;
  } catch {
    lectures = [];
  }
  return <LecturesPageClient initialLectures={lectures} locale={locale} />;
}
