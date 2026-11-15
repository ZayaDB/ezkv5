import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { refundPayment, PaymentConfigError } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/** Free cancellation window for mentees (hours before the session). */
const MENTEE_FREE_CANCEL_HOURS = 24;
/** Courses: buyers may refund within this many days if they haven't started watching. */
const COURSE_REFUND_DAYS = 7;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : "";
  if (!paymentId.startsWith("lnk-")) return NextResponse.json({ error: "invalid_payment" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  // RLS returns the row only to the buyer, the mentor, or an admin.
  const { data: payment } = await supabase
    .from("payments")
    .select("payment_id, user_id, status, paid_at, lecture_id, mentor_profile_id, mentor_sessions(scheduled_at), mentor_profiles(user_id), lectures(instructor_id)")
    .eq("payment_id", paymentId)
    .maybeSingle();
  if (!payment) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (payment.status !== "paid") return NextResponse.json({ error: "not_refundable" }, { status: 409 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";
  const mentorUserId =
    (payment.mentor_profiles as { user_id?: string } | null)?.user_id ||
    (payment.lectures as { instructor_id?: string } | null)?.instructor_id;
  const isMentor = mentorUserId === user.id;
  const isBuyer = payment.user_id === user.id;

  if (!isAdmin && !isMentor) {
    if (!isBuyer) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if (payment.lecture_id) {
      const daysSince = payment.paid_at ? (Date.now() - new Date(payment.paid_at).getTime()) / 86_400_000 : 999;
      const { data: lessons } = await supabase.from("lecture_lessons").select("id").eq("lecture_id", payment.lecture_id);
      const ids = (lessons || []).map((l) => l.id as string);
      const { count } = ids.length
        ? await supabase.from("lesson_progress").select("lesson_id", { count: "exact", head: true }).eq("user_id", user.id).in("lesson_id", ids)
        : { count: 0 };
      if (daysSince > COURSE_REFUND_DAYS || (count ?? 0) > 0) {
        return NextResponse.json({ error: "course_not_refundable", days: COURSE_REFUND_DAYS }, { status: 409 });
      }
    } else {
      const at = (payment.mentor_sessions as { scheduled_at?: string } | null)?.scheduled_at;
      const hoursLeft = at ? (new Date(at).getTime() - Date.now()) / 3_600_000 : -1;
      if (hoursLeft < MENTEE_FREE_CANCEL_HOURS) {
        return NextResponse.json({ error: "too_late", hours: MENTEE_FREE_CANCEL_HOURS }, { status: 409 });
      }
    }
  }

  const reason = isAdmin ? "Cancelled by admin" : isMentor ? "Cancelled by instructor" : "Cancelled by buyer";
  try {
    const result = await refundPayment(paymentId, reason);
    return NextResponse.json(result);
  } catch (e) {
    console.error("payments/cancel", e);
    const code = e instanceof PaymentConfigError ? "not_configured" : "refund_failed";
    return NextResponse.json({ error: code }, { status: 500 });
  }
}
