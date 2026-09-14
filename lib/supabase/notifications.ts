import { createClient } from "@/lib/supabase/client";

export async function createUserAlert(payload: {
  userId: string;
  kind: string;
  title: string;
  message: string;
  severity?: "info" | "warning" | "urgent";
  actionUrl?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("user_alerts").insert({
    user_id: payload.userId,
    kind: payload.kind,
    title: payload.title,
    message: payload.message,
    severity: payload.severity ?? "info",
    action_url: payload.actionUrl ?? null,
  });
  if (error) throw new Error(error.message);
}
