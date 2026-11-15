import "server-only";
import { createHmac } from "crypto";
import Cloudflare from "cloudflare";
import { createPublicSupabase } from "@/lib/supabase/public";

/**
 * Live classes on Cloudflare RealtimeKit; recordings copied to Cloudflare Stream
 * (RealtimeKit keeps recordings for 7 days only).
 *
 * Env:
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN   — permissions: Realtime Admin + Stream Edit
 *   REALTIMEKIT_APP_ID
 *   PAYMENT_HOOK_SECRET    — shared server secret (also guards lesson media RPCs)
 */

export class LiveConfigError extends Error {}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new LiveConfigError(`${name} is not configured`);
  return v;
}

export function liveConfigured() {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN && process.env.REALTIMEKIT_APP_ID);
}

let cf: Cloudflare | null = null;
function client() {
  if (!cf) cf = new Cloudflare({ apiToken: env("CLOUDFLARE_API_TOKEN") });
  return cf;
}
const account = () => env("CLOUDFLARE_ACCOUNT_ID");
const app = () => env("REALTIMEKIT_APP_ID");

export const PRESET_HOST = "lnk_host";
export const PRESET_STUDENT = "lnk_student";

/** Key appended to the webhook URL so random callers can't trigger syncs. */
export function webhookKey() {
  return createHmac("sha256", env("PAYMENT_HOOK_SECRET")).update("live-webhook").digest("hex").slice(0, 32);
}

// ---------------------------------------------------------------------------
// DB helpers (secret-guarded RPCs)

type Media = {
  lesson_id: string;
  meeting_id: string | null;
  recording_id: string | null;
  recording_status: string | null;
  stream_uid: string | null;
};

export async function getMedia(lessonId: string): Promise<Media | null> {
  const { data, error } = await createPublicSupabase().rpc("lesson_media_get", {
    p_secret: env("PAYMENT_HOOK_SECRET"),
    p_lesson_id: lessonId,
  });
  if (error) throw new Error(`lesson_media_get: ${error.message}`);
  return (data as Media | null) ?? null;
}

export async function getMediaByMeeting(meetingId: string): Promise<Media | null> {
  const { data, error } = await createPublicSupabase().rpc("lesson_media_get", {
    p_secret: env("PAYMENT_HOOK_SECRET"),
    p_meeting_id: meetingId,
  });
  if (error) throw new Error(`lesson_media_get: ${error.message}`);
  return (data as Media | null) ?? null;
}

export async function updateMedia(
  lessonId: string,
  media: Partial<Omit<Media, "lesson_id">>,
  lesson: { status?: string; started_at?: string; ended_at?: string; replay_seconds?: number } = {}
) {
  const { error } = await createPublicSupabase().rpc("lesson_media_update", {
    p_secret: env("PAYMENT_HOOK_SECRET"),
    p_lesson_id: lessonId,
    p_media: media,
    p_lesson: lesson,
  });
  if (error) throw new Error(`lesson_media_update: ${error.message}`);
}

// ---------------------------------------------------------------------------
// RealtimeKit

const LNK_THEME = {
  border_radius: "rounded" as const,
  border_width: "thin" as const,
  spacing_base: 4,
  theme: "dark" as const,
  colors: {
    background: { "1000": "#0b1513", "900": "#0e1a18", "800": "#152320", "700": "#1c2d29", "600": "#263a35" },
    brand: { "300": "#7fc3b7", "400": "#5db0a2", "500": "#3fa393", "600": "#2f8a7b", "700": "#256e62" },
    danger: "#e5484d",
    success: "#3fa393",
    warning: "#e2c48f",
    text: "#f3f7f5",
    text_on_brand: "#0b1513",
    video_bg: "#152320",
  },
};

function presetBody(name: string, host: boolean) {
  const can = (v: boolean) => (v ? ("ALLOWED" as const) : ("CAN_REQUEST" as const));
  return {
    account_id: account(),
    name,
    config: {
      view_type: "GROUP_CALL" as const,
      max_screenshare_count: 1,
      max_video_streams: { desktop: 9, mobile: 4 },
      media: {
        video: { quality: "hd" as const, frame_rate: 24, simulcast: true },
        screenshare: { quality: "fhd" as const, frame_rate: 10 },
      },
    },
    permissions: {
      accept_waiting_requests: host,
      can_accept_production_requests: host,
      can_change_participant_permissions: host,
      can_edit_display_name: false,
      can_livestream: false,
      can_record: host,
      can_spotlight: host,
      chat: {
        public: { can_send: true, text: true, files: host },
        private: { can_send: host, can_receive: true, text: true, files: false },
      },
      connected_meetings: {
        can_alter_connected_meetings: host,
        can_switch_connected_meetings: host,
        can_switch_to_parent_meeting: true,
      },
      disable_participant_audio: host,
      disable_participant_screensharing: host,
      disable_participant_video: host,
      hidden_participant: false,
      kick_participant: host,
      media: {
        audio: { can_produce: can(host) },
        video: { can_produce: can(host) },
        screenshare: { can_produce: host ? ("ALLOWED" as const) : ("NOT_ALLOWED" as const) },
      },
      pin_participant: host,
      plugins: { can_close: host, can_edit_config: host, can_start: host, config: {} },
      polls: { can_create: host, can_view: true, can_vote: true },
      recorder_type: "NONE" as const,
      show_participant_list: true,
      waiting_room_type: "SKIP" as const,
    },
    ui: { design_tokens: LNK_THEME },
  };
}

let presetsReady = false;
async function ensurePresets() {
  if (presetsReady) return;
  const existing = await client().realtimeKit.presets.get(app(), { account_id: account() });
  const names = new Set((existing.data || []).map((p) => (p as { name?: string }).name));
  if (!names.has(PRESET_HOST)) await client().realtimeKit.presets.create(app(), presetBody(PRESET_HOST, true));
  if (!names.has(PRESET_STUDENT)) await client().realtimeKit.presets.create(app(), presetBody(PRESET_STUDENT, false));
  presetsReady = true;
}

let webhookReady = false;
/** Registers the recording webhook for the production site (previews rely on polling). */
async function ensureWebhook() {
  if (webhookReady || process.env.CONTEXT !== "production" || !process.env.URL) return;
  const url = `${process.env.URL.replace(/\/$/, "")}/api/live/webhook?key=${webhookKey()}`;
  const list = await client().realtimeKit.webhooks.getWebhooks(app(), { account_id: account() });
  const found = (list.data || []).some((w) => (w as { url?: string }).url === url);
  if (!found) {
    await client().realtimeKit.webhooks.createWebhook(app(), {
      account_id: account(),
      name: "LNK recordings",
      url,
      events: ["recording.statusUpdate"],
      enabled: true,
    });
  }
  webhookReady = true;
}

/** Creates (once) the RealtimeKit meeting for a lesson. Recording starts with the session. */
export async function ensureMeeting(lessonId: string, title: string): Promise<string> {
  const media = await getMedia(lessonId);
  if (media?.meeting_id) return media.meeting_id;
  await ensurePresets();
  await ensureWebhook().catch((e) => console.error("ensureWebhook", e));
  const created = await client().realtimeKit.meetings.create(app(), {
    account_id: account(),
    title: title.slice(0, 250),
    record_on_start: true,
    persist_chat: true,
  });
  const meetingId = created.data?.id;
  if (!meetingId) throw new Error("RealtimeKit did not return a meeting id");
  await updateMedia(lessonId, { meeting_id: meetingId });
  return meetingId;
}

export async function participantToken(meetingId: string, user: { id: string; name: string }, preset: string) {
  await ensurePresets();
  const res = await client().realtimeKit.meetings.addParticipant(meetingId, {
    account_id: account(),
    app_id: app(),
    custom_participant_id: user.id,
    preset_name: preset,
    name: user.name.slice(0, 100) || "LNK",
  });
  const token = res.data?.token;
  if (!token) throw new Error("RealtimeKit did not return a participant token");
  return token;
}

export async function endMeeting(meetingId: string) {
  try {
    await client().realtimeKit.activeSession.kickAllParticipants(meetingId, { account_id: account(), app_id: app() });
  } catch (e) {
    // no active session is fine
    console.warn("kickAllParticipants", e);
  }
}

// ---------------------------------------------------------------------------
// Recording → Stream

export type ReplayState = "none" | "recording" | "processing" | "ready" | "failed";

/**
 * Moves a lesson's recording forward: RealtimeKit (UPLOADED) → Stream copy → ready.
 * Idempotent; safe to call from webhook, end button, dashboard and replay requests.
 */
export async function syncRecording(lessonId: string): Promise<ReplayState> {
  const media = await getMedia(lessonId);
  if (!media?.meeting_id) return "none";

  if (media.stream_uid) {
    const video = await client().stream.get(media.stream_uid, { account_id: account() });
    if (video.readyToStream) {
      await updateMedia(lessonId, {}, { status: "ready", replay_seconds: Math.round(video.duration || 0) });
      return "ready";
    }
    if (video.status?.state === "error") {
      await updateMedia(lessonId, {}, { status: "failed" });
      return "failed";
    }
    return "processing";
  }

  const recs = await client().realtimeKit.recordings.getRecordings(app(), {
    account_id: account(),
    meeting_id: media.meeting_id,
    sort_by: "invokedTime",
    sort_order: "DESC",
    per_page: 5,
  });
  const latest = (recs.data || [])[0];
  if (!latest) return "none";

  if (latest.status !== media.recording_status || latest.id !== media.recording_id) {
    await updateMedia(lessonId, { recording_id: latest.id, recording_status: latest.status });
  }
  if (latest.status === "ERRORED") {
    await updateMedia(lessonId, {}, { status: "failed" });
    return "failed";
  }
  if (latest.status !== "UPLOADED" || !latest.download_url) {
    return latest.status === "UPLOADING" ? "processing" : "recording";
  }

  const copied = await client().stream.copy.create({
    account_id: account(),
    url: latest.download_url,
    requireSignedURLs: true,
    meta: { name: `lesson-${lessonId}`, lessonId },
  });
  if (!copied.uid) throw new Error("Stream copy returned no uid");
  await updateMedia(lessonId, { stream_uid: copied.uid }, { status: "processing" });
  return "processing";
}

/** Short-lived signed player URL for a ready replay. */
export async function replayUrl(lessonId: string): Promise<string | null> {
  const media = await getMedia(lessonId);
  if (!media?.stream_uid) return null;
  const res = await client().stream.token.create(media.stream_uid, {
    account_id: account(),
    exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
  });
  if (!res.token) return null;
  return `https://iframe.videodelivery.net/${res.token}`;
}
