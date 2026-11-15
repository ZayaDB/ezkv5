export const revalidate = 300;

import { setRequestLocale } from 'next-intl/server';
import { queryMentorsSupabase } from '@/lib/supabase/public-queries';
import MentorsPageClient from './MentorsPageClient';
import type { Mentor } from '@/types';

export default async function MentorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  let mentors: Mentor[] = [];
  try {
    const r = await queryMentorsSupabase({ limit: 120 });
    mentors = r.mentors;
  } catch {
    mentors = [];
  }
  // ?category= is read on the client so this page stays cacheable.
  return <MentorsPageClient initialMentors={mentors} locale={locale} />;
}
