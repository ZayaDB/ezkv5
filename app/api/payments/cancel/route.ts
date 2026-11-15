import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { refundPayment, PaymentConfigError } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/** Free cancellation window for mentees (hours before the session). */
const MENTEE_FREE_CANCEL_HOURS = 24;

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
    .select("payment_id, user_id, status, mentor_profile_id, mentor_sessions(scheduled_at), mentor_profiles(user_id)")
    .eq("payment_id", paymentId)
    .maybeSingle();
  if (!payment) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (payment.status !== "paid") return NextResponse.json({ error: "not_refundable" }, { status: 409 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";
  const mentorUserId = (payment.mentor_profiles as { user_id?: string } | null)?.user_id;
  const isMentor = mentorUserId === user.id;
  const isBuyer = payment.user_id === user.id;

  if (!isAdmin && !isMentor) {
    if (!isBuyer) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const at = (payment.mentor_sessions as { scheduled_at?: string } | null)?.scheduled_at;
    const hoursLeft = at ? (new Date(at).getTime() - Date.now()) / 3_600_000 : -1;
    if (hoursLeft < MENTEE_FREE_CANCEL_HOURS) {
      return NextResponse.json({ error: "too_late", hours: MENTEE_FREE_CANCEL_HOURS }, { status: 409 });
    }
  }

  const reason = isAdmin ? "Cancelled by admin" : isMentor ? "Cancelled by mentor" : "Cancelled by mentee";
  try {
    const result = await refundPayment(paymentId, reason);
    return NextResponse.json(result);
  } catch (e) {
    console.error("payments/cancel", e);
    const code = e instanceof PaymentConfigError ? "not_configured" : "refund_failed";
    return NextResponse.json({ error: code }, { status: 500 });
  }
}
