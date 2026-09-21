"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ALERTS_CHANGED_EVENT, listAlerts, type UserAlert } from "@/lib/supabase/alerts";

export function useUnreadNotifications(enabled: boolean) {
  const [items, setItems] = useState<UserAlert[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setUnread(0);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        setUnread(0);
        return;
      }
      const alerts = await listAlerts(user.id);
      setItems(alerts.slice(0, 5));
      setUnread(alerts.filter((a) => !a.read).length);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => void refresh();
    const onChanged = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener(ALERTS_CHANGED_EVENT, onChanged);
    const timer = window.setInterval(() => void refresh(), 60000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(ALERTS_CHANGED_EVENT, onChanged);
      window.clearInterval(timer);
    };
  }, [enabled, refresh]);

  return { items, unread, loading, refresh };
}
