"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { startConversation } from "@/lib/supabase/messages";
import { ui } from "@/components/lnk/ui";

/** 상대에게 1:1 메시지 보내기 (대화방이 없으면 만들고 이동) */
export default function MessageButton({
  userId,
  variant = "outline",
  className = "",
}: {
  userId: string;
  variant?: "outline" | "primary";
  className?: string;
}) {
  const t = useTranslations("messages");
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (user?.id === userId) return null;

  const go = async () => {
    if (!isAuthenticated) {
      const back = typeof window !== "undefined" ? window.location.pathname : `/${locale}`;
      router.push(`/${locale}/login?redirect=${encodeURIComponent(back)}`);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      const id = await startConversation(userId);
      router.push(`/${locale}/my/messages?c=${id}`);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className={`${variant === "primary" ? ui.btnPrimary : ui.btnOutline} w-full`}
      >
        <MessageCircle className="h-4 w-4" />
        {t("sendMessage")}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{t("startFailed")}</p>}
    </div>
  );
}
