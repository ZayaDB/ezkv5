import "server-only";
import { PaymentClient, PortOneError } from "@portone/server-sdk";
import { createPublicSupabase } from "@/lib/supabase/public";

/**
 * Server-side payment helpers (PortOne V2).
 *
 * Env:
 *   PORTONE_API_SECRET     — PortOne console → 연동 정보 → API Secret (V2)
 *   PORTONE_WEBHOOK_SECRET — PortOne console → 웹훅 → 시크릿 (optional until webhooks are set up)
 *   PAYMENT_HOOK_SECRET    — matches private.app_config('payment_hook_secret') in Supabase
 */

export class PaymentConfigError extends Error {}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new PaymentConfigError(`${name} is not configured`);
  return v;
}

let client: PaymentClient | null = null;
function portone(): PaymentClient {
  if (!client) client = PaymentClient({ secret: env("PORTONE_API_SECRET") });
  return client;
}

export type SyncResult =
  | { status: "paid"; sessionId: string | null; refundedForConflict?: boolean }
  | { status: "failed" | "cancelled"; sessionId: string | null }
  | { status: "pending" };

async function rpc<T = Record<string, unknown>>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await createPublicSupabase().rpc(fn, { p_secret: env("PAYMENT_HOOK_SECRET"), ...args });
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data as T;
}

/**
 * Re-reads the payment from PortOne (never trusts the browser) and mirrors its
 * state into our DB. Safe to call repeatedly (confirm endpoint, redirect page, webhook).
 */
export async function syncPayment(paymentId: string): Promise<SyncResult> {
  let payment;
  try {
    payment = await portone().getPayment({ paymentId });
  } catch (e) {
    if (e instanceof PortOneError) {
      // not created on PortOne yet (window closed before paying)
      return { status: "pending" };
    }
    throw e;
  }

  if (!("status" in payment)) return { status: "pending" };

  if (payment.status === "PAID") {
    if (payment.currency !== "KRW") {
      // We only ever request KRW; anything else is suspicious → refund.
      await portone().cancelPayment({ paymentId, reason: "Unexpected currency" });
      const r = await rpc<{ session_id: string | null }>("payment_mark_cancelled", {
        p_payment_id: paymentId, p_status: "cancelled", p_reason: "currency mismatch", p_refunded_amount: payment.amount.total,
      });
      return { status: "cancelled", sessionId: r.session_id };
    }

    const method = payment.method && "type" in payment.method ? String(payment.method.type) : null;
    const pgProvider = payment.channel?.pgProvider ? String(payment.channel.pgProvider) : null;

    let r: { session_id: string | null; conflict?: boolean };
    try {
      r = await rpc("payment_mark_paid", {
        p_payment_id: paymentId,
        p_amount: payment.amount.total,
        p_method: method,
        p_pg_provider: pgProvider,
        p_pg_tx_id: payment.transactionId ?? null,
      });
    } catch (e) {
      // Amount tampering (paid amount ≠ our price) → refund in full.
      if (String(e).includes("amount mismatch")) {
        await portone().cancelPayment({ paymentId, reason: "Amount mismatch" });
        const c = await rpc<{ session_id: string | null }>("payment_mark_cancelled", {
          p_payment_id: paymentId, p_status: "cancelled", p_reason: "amount mismatch", p_refunded_amount: payment.amount.total,
        });
        return { status: "cancelled", sessionId: c.session_id };
      }
      throw e;
    }

    if (r.conflict) {
      // Slot was taken while this checkout sat abandoned → refund automatically.
      await portone().cancelPayment({ paymentId, reason: "Time slot no longer available" });
      await rpc("payment_mark_cancelled", {
        p_payment_id: paymentId, p_status: "cancelled", p_reason: "slot conflict", p_refunded_amount: payment.amount.total,
      });
      return { status: "paid", sessionId: r.session_id, refundedForConflict: true };
    }
    return { status: "paid", sessionId: r.session_id };
  }

  if (payment.status === "CANCELLED" || payment.status === "PARTIAL_CANCELLED") {
    const refunded = payment.amount.cancelled ?? payment.amount.total;
    const r = await rpc<{ session_id: string | null }>("payment_mark_cancelled", {
      p_payment_id: paymentId, p_status: "cancelled", p_reason: null, p_refunded_amount: refunded,
    });
    return { status: "cancelled", sessionId: r.session_id };
  }

  if (payment.status === "FAILED") {
    const r = await rpc<{ session_id: string | null }>("payment_mark_cancelled", {
      p_payment_id: paymentId, p_status: "failed", p_reason: null,
    });
    return { status: "failed", sessionId: r.session_id };
  }

  return { status: "pending" };
}

/** Full refund through PortOne, then mirror into our DB. */
export async function refundPayment(paymentId: string, reason: string) {
  await portone().cancelPayment({ paymentId, reason });
  return syncPayment(paymentId);
}
