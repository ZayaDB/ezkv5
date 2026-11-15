import { trError } from "@/lib/i18n/runtime";
import { createClient } from "@/lib/supabase/client";
import { requireUserId } from "@/lib/supabase/requireUser";
import { fetchPublicProfiles } from "@/lib/supabase/publicProfiles";

export type ConversationSummary = {
  id: string;
  otherId: string;
  otherName: string;
  otherAvatar: string | null;
  otherIsMentor: boolean;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unread: number;
};

export type DirectMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type PairSession = {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  iAmMentor: boolean;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export const toMessage = (r: MessageRow): DirectMessage => ({
  id: r.id,
  conversationId: r.conversation_id,
  senderId: r.sender_id,
  body: r.body,
  createdAt: r.created_at,
  readAt: r.read_at,
});

export async function startConversation(otherUserId: string): Promise<string> {
  const { supabase } = await requireUserId();
  const { data, error } = await supabase.rpc("start_conversation", { p_other: otherUserId });
  if (error || !data) throw new Error(trError("requestFailed"));
  return data as string;
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const { supabase } = await requireUserId();
  const { data, error } = await supabase.rpc("list_my_conversations");
  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) || []).map((r) => ({
    id: String(r.id),
    otherId: String(r.other_id),
    otherName: String(r.other_name || ""),
    otherAvatar: (r.other_avatar as string) || null,
    otherIsMentor: Boolean(r.other_is_mentor),
    lastMessageAt: (r.last_message_at as string) || null,
    lastMessagePreview: (r.last_message_preview as string) || null,
    unread: Number(r.unread || 0),
  }));
}

export async function getConversation(id: string) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase.from("conversations").select("id, user_a, user_b").eq("id", id).maybeSingle();
  if (error || !data) return null;
  const otherId = data.user_a === userId ? data.user_b : data.user_a;
  const profiles = await fetchPublicProfiles(supabase, [otherId]);
  const p = profiles.get(otherId);
  return { id: data.id as string, userId, otherId: otherId as string, otherName: p?.name || "", otherAvatar: p?.avatarUrl || null };
}

export async function listMessages(conversationId: string, before?: string, limit = 50): Promise<DirectMessage[]> {
  const { supabase } = await requireUserId();
  let q = supabase
    .from("direct_messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as MessageRow[]) || []).map(toMessage).reverse();
}

export async function sendMessage(conversationId: string, body: string): Promise<DirectMessage> {
  const { supabase, userId } = await requireUserId();
  const text = body.trim().slice(0, 4000);
  if (!text) throw new Error(trError("messageRequired"));
  const { data, error } = await supabase
    .from("direct_messages")
    .insert({ conversation_id: conversationId, sender_id: userId, body: text })
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .single();
  if (error || !data) throw new Error(trError("submitFailed"));
  return toMessage(data as MessageRow);
}

export async function markConversationRead(conversationId: string) {
  const supabase = createClient();
  await supabase.rpc("mark_conversation_read", { p_conversation: conversationId });
}

export async function unreadMessageCount(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("my_unread_dm_count");
  if (error) return 0;
  return Number(data || 0);
}

/** Paid sessions between me and the other person (either side as mentor), soonest first */
export async function listPairSessions(otherUserId: string): Promise<PairSession[]> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("mentor_sessions")
    .select("id, scheduled_at, duration, status, mentee_id, mentor_profiles!inner(user_id)")
    .in("status", ["upcoming", "completed"])
    .or(`mentee_id.eq.${userId},mentee_id.eq.${otherUserId}`)
    .order("scheduled_at", { ascending: true });
  if (error) return [];
  return (data || [])
    .filter((r) => {
      const mentorId = (r.mentor_profiles as unknown as { user_id?: string } | null)?.user_id;
      return (
        (r.mentee_id === userId && mentorId === otherUserId) || (r.mentee_id === otherUserId && mentorId === userId)
      );
    })
    .map((r) => ({
      id: r.id as string,
      scheduledAt: r.scheduled_at as string,
      duration: Number(r.duration || 60),
      status: r.status as string,
      iAmMentor: r.mentee_id !== userId,
    }));
}

/** Supabase returns the same channel object for the same name, and a subscribed channel
 * can't take new listeners — so every subscription gets its own name. */
const channelName = (base: string) => `${base}:${Math.random().toString(36).slice(2, 10)}`;

/** Live delivery of new messages in one conversation. Returns an unsubscribe function. */
export function subscribeToConversation(conversationId: string, onMessage: (m: DirectMessage) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(channelName(`dm:${conversationId}`))
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessage(toMessage(payload.new as MessageRow))
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/** Any new message addressed to me (for the unread badge). */
export function subscribeToMyMessages(onAny: () => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(channelName("dm:inbox"))
    .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => onAny())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
