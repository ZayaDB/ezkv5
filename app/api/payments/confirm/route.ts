import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { syncPayment, PaymentConfigError } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/** Called by the browser after the PortOne window closes (or from the redirect page). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : "";
  if (!paymentId.startsWith("lnk-")) {
    return NextResponse.json({ error: "invalid_payment" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  // RLS: buyers can only read their own payments.
  const { data: own } = await supabase.from("payments").select("id").eq("payment_id", paymentId).maybeSingle();
  if (!own) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const result = await syncPayment(paymentId);
    return NextResponse.json(result);
  } catch (e) {
    console.error("payments/confirm", e);
    const code = e instanceof PaymentConfigError ? "not_configured" : "confirm_failed";
    return NextResponse.json({ error: code }, { status: 500 });
  }
}
