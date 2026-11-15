import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "@portone/server-sdk";
import { syncPayment } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/**
 * PortOne V2 webhook (콘솔 → 웹훅 → URL: https://<site>/api/payments/webhook).
 * Covers buyers who closed the browser before the confirm call ran.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const raw = await request.text();
  let webhook: Awaited<ReturnType<typeof Webhook.verify>>;
  try {
    webhook = await Webhook.verify(secret, raw, Object.fromEntries(request.headers.entries()));
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const data = (webhook as { data?: { paymentId?: string } }).data;
  const paymentId = data?.paymentId;
  if (paymentId && paymentId.startsWith("lnk-")) {
    try {
      await syncPayment(paymentId);
    } catch (e) {
      console.error("payments/webhook", e);
      // non-2xx → PortOne retries
      return NextResponse.json({ error: "sync_failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
