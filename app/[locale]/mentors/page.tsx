import { queryMentorsSupabase } from '@/lib/supabase/public-queries';
import MentorsPageClient from './MentorsPageClient';
import type { Mentor } from '@/types';
import { parseMentorCategory } from '@/lib/mentors/categoryFilter';

export default async function MentorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  let mentors: Mentor[] = [];
  try {
    const r = await queryMentorsSupabase({ limit: 120 });
    mentors = r.mentors;
  } catch {
    mentors = [];
  }
  return (
    <MentorsPageClient
      initialMentors={mentors}
      locale={locale}
      initialCategory={parseMentorCategory(sp.category)}
    />
  );
}
