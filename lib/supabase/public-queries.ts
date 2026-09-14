import { createServerSupabase } from "@/lib/supabase/server";
import { listApprovedLectures } from "@/lib/supabase/lectures";
import { listApprovedMentors } from "@/lib/supabase/mentors";
import type { Lecture, Mentor } from "@/types";

export async function queryMentorsSupabase(options?: {
  limit?: number;
  page?: number;
}): Promise<{ mentors: Mentor[]; total: number }> {
  try {
    const supabase = await createServerSupabase();
    const r = await listApprovedMentors(supabase, options);
    return { mentors: r.mentors, total: r.total };
  } catch {
    return { mentors: [], total: 0 };
  }
}

export async function queryLecturesSupabase(options?: {
  limit?: number;
  page?: number;
  type?: "online" | "offline" | null;
  category?: string;
}): Promise<{ lectures: Lecture[]; total: number }> {
  try {
    const supabase = await createServerSupabase();
    const r = await listApprovedLectures(supabase, options);
    return { lectures: r.lectures, total: r.total };
  } catch {
    return { lectures: [], total: 0 };
  }
}
