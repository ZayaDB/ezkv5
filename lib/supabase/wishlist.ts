import { requireUserId } from "@/lib/supabase/requireUser";
import { mapLectureRow } from "@/lib/supabase/lectures";

export async function listWishlist() {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("lecture_wishlist")
    .select("id, lecture_id, created_at, lectures(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const out: { id: string; lectureId: string; lecture: ReturnType<typeof mapLectureRow> }[] = [];
  for (const row of data || []) {
    const rawLec = row.lectures as Record<string, unknown> | Record<string, unknown>[] | null;
    const lec = Array.isArray(rawLec) ? rawLec[0] : rawLec;
    if (!lec) continue;
    out.push({
      id: String(row.id),
      lectureId: String(row.lecture_id),
      lecture: mapLectureRow(lec as Parameters<typeof mapLectureRow>[0]),
    });
  }
  return out;
}

export async function addToWishlist(lectureId: string) {
  const { supabase, userId } = await requireUserId();

  const { data: lecture } = await supabase.from("lectures").select("id").eq("id", lectureId).maybeSingle();
  if (!lecture) throw new Error("강의를 찾을 수 없습니다.");

  const { error } = await supabase.from("lecture_wishlist").upsert(
    { user_id: userId, lecture_id: lectureId },
    { onConflict: "user_id,lecture_id", ignoreDuplicates: true }
  );

  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function removeFromWishlist(lectureId: string) {
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("lecture_wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("lecture_id", lectureId);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}
