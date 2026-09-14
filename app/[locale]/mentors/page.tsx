import { queryMentorsSupabase } from '@/lib/supabase/public-queries';
import MentorsPageClient from './MentorsPageClient';
import type { Mentor } from '@/types';

export default async function MentorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let mentors: Mentor[] = [];
  try {
    const r = await queryMentorsSupabase({ limit: 120 });
    mentors = r.mentors;
  } catch {
    mentors = [];
  }
  return <MentorsPageClient initialMentors={mentors} locale={locale} />;
}
