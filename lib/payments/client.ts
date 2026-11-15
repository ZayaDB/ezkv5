"use client";

import * as PortOne from "@portone/browser-sdk/v2";
import { createClient } from "@/lib/supabase/client";

/**
 * Browser-side payment helpers.
 *
 * Env (public):
 *   NEXT_PUBLIC_PORTONE_STORE_ID           — PortOne store id
 *   NEXT_PUBLIC_PORTONE_CHANNEL_KEY        — domestic channel (토스페이먼츠: 국내 카드·간편결제)
 *   NEXT_PUBLIC_PORTONE_CHANNEL_KEY_GLOBAL — optional, overseas-issued cards (토스페이먼츠 해외결제)
 */
export type PayOption = "card" | "easyPay" | "globalCard";

export function availablePayOptions(): PayOption[] {
  if (!process.env.NEXT_PUBLIC_PORTONE_STORE_ID || !process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY) return [];
  const opts: PayOption[] = ["card", "easyPay"];
  if (process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_GLOBAL) opts.push("globalCard");
  return opts;
}

/** What the PortOne window needs — shared by session bookings and course purchases. */
export type PaymentCheckout = { free: false; payment_id: string; amount: number; currency: "KRW"; order_name: string };

export type Checkout =
  | { free: true; session_id: string; amount: 0 }
  | (PaymentCheckout & { session_id: string });

export type LectureCheckout = { free: true; lecture_id: string; amount: 0 } | (PaymentCheckout & { lecture_id: string });

export type CheckoutErrorCode =
  | "auth"
  | "enrolled"
  | "tooSoon"
  | "tooFar"
  | "taken"
  | "self"
  | "notFound"
  | "unknown";

export class CheckoutError extends Error {
  constructor(public code: CheckoutErrorCode, message?: string) {
    super(message || code);
  }
}

export async function createCheckout(input: {
  mentorId: string;
  scheduledAt: Date;
  duration: number;
  type: "online" | "offline";
  notes?: string;
}): Promise<Checkout> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_session_checkout", {
    p_mentor_id: input.mentorId,
    p_scheduled_at: input.scheduledAt.toISOString(),
    p_duration: input.duration,
    p_type: input.type,
    p_notes: input.notes?.trim() || null,
  });
  if (error) {
    const m = error.message || "";
    const code: CheckoutErrorCode = /login/.test(m)
      ? "auth"
      : /1 hour/.test(m)
        ? "tooSoon"
        : /90 days/.test(m)
          ? "tooFar"
          : /already booked/.test(m)
            ? "taken"
            : /yourself/.test(m)
              ? "self"
              : /not found/.test(m)
                ? "notFound"
                : "unknown";
    throw new CheckoutError(code, m);
  }
  return data as Checkout;
}

export async function createLectureCheckout(lectureId: string): Promise<LectureCheckout> {
  const { data, error } = await createClient().rpc("create_lecture_checkout", { p_lecture_id: lectureId });
  if (error) {
    const m = error.message || "";
    const code: CheckoutErrorCode = /login/.test(m)
      ? "auth"
      : /already enrolled/.test(m)
        ? "enrolled"
        : /own lecture/.test(m)
          ? "self"
          : /not found/.test(m)
            ? "notFound"
            : "unknown";
    throw new CheckoutError(code, m);
  }
  return data as LectureCheckout;
}

export async function getBusySlots(mentorId: string, from: Date, to: Date) {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_mentor_busy_slots", {
    p_mentor_id: mentorId,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  return ((data as { starts_at: string; ends_at: string }[] | null) || []).map((r) => ({
    start: new Date(r.starts_at).getTime(),
    end: new Date(r.ends_at).getTime(),
  }));
}

const PORTONE_LOCALE: Record<string, "KO_KR" | "EN_US"> = { kr: "KO_KR", en: "EN_US", mn: "EN_US" };

export type PayResult = { ok: true; paymentId: string } | { ok: false; code?: string; message?: string };

/** Opens the PortOne payment window. On mobile it redirects to `redirectUrl` instead of resolving. */
export async function requestPortOnePayment(input: {
  checkout: PaymentCheckout;
  option: PayOption;
  locale: string;
  customer: { fullName?: string; email?: string };
}): Promise<PayResult> {
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID!;
  const channelKey =
    input.option === "globalCard"
      ? process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_GLOBAL!
      : process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!;

  const redirectUrl = `${window.location.origin}/${input.locale}/payments/complete`;

  let response: Awaited<ReturnType<typeof PortOne.requestPayment>>;
  try {
    response = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId: input.checkout.payment_id,
    orderName: input.checkout.order_name,
    totalAmount: input.checkout.amount,
    currency: "KRW",
    payMethod: input.option === "easyPay" ? "EASY_PAY" : "CARD",
    locale: input.option === "globalCard" ? "EN_US" : PORTONE_LOCALE[input.locale] ?? "KO_KR",
    redirectUrl,
    customer: {
      fullName: input.customer.fullName || undefined,
      email: input.customer.email || undefined,
    },
    });
  } catch (e) {
    // The payment window could not open (channel/config problem) — never a booking problem.
    console.error("PortOne.requestPayment failed", e);
    return { ok: false, code: "WINDOW_FAILED", message: e instanceof Error ? e.message : String(e) };
  }

  if (!response) return { ok: false };
  if (response.code) return { ok: false, code: response.code, message: response.message };
  return { ok: true, paymentId: response.paymentId };
}

export async function confirmPayment(paymentId: string) {
  const res = await fetch("/api/payments/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  });
  const json = await res.json().catch(() => ({}));
  return json as
    | { status: "paid"; sessionId: string | null; lectureId?: string | null; refundedForConflict?: boolean }
    | { status: "failed" | "cancelled" | "pending"; sessionId?: string | null }
    | { error: string };
}

export async function cancelPayment(paymentId: string) {
  const res = await fetch("/api/payments/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  });
  return (await res.json().catch(() => ({}))) as { status?: string; error?: string; hours?: number };
}

/** Frees the time slot right away when the buyer did not finish paying. */
export async function releaseCheckout(sessionId: string) {
  const supabase = createClient();
  await supabase.from("mentor_sessions").update({ status: "cancelled" }).eq("id", sessionId).eq("status", "pending_payment");
}
