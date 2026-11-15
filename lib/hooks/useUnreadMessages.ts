"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeToMyMessages, unreadMessageCount } from "@/lib/supabase/messages";

export const MESSAGES_CHANGED_EVENT = "lnk:messages-changed";

/** 안 읽은 1:1 메시지 수 (실시간 + 포커스 시 갱신) */
export function useUnreadMessages(enabled: boolean) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUnread(0);
      return;
    }
    setUnread(await unreadMessageCount());
  }, [enabled]);

  useEffect(() => {
    void refresh();
    if (!enabled) return;
    const off = subscribeToMyMessages(() => void refresh());
    const onChange = () => void refresh();
    window.addEventListener("focus", onChange);
    window.addEventListener(MESSAGES_CHANGED_EVENT, onChange);
    return () => {
      off();
      window.removeEventListener("focus", onChange);
      window.removeEventListener(MESSAGES_CHANGED_EVENT, onChange);
    };
  }, [enabled, refresh]);

  return { unread, refresh };
}
