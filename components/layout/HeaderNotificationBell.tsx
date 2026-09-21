"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useUnreadNotifications } from "@/lib/hooks/useUnreadNotifications";
import { markAlertsRead } from "@/lib/supabase/alerts";
import { createClient } from "@/lib/supabase/client";

export default function HeaderNotificationBell({ enabled }: { enabled: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common.notificationsBell");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, unread, loading } = useUnreadNotifications(enabled && mounted);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) await markAlertsRead(user.id);
    })();
  }, [open]);

  if (!enabled || !mounted) return null;

  const goTo = (path: string) => {
    setOpen(false);
    router.push(`/${locale}${path}`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={unread > 0 ? t("ariaWithCount", { count: unread }) : t("aria")}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{t("title")}</p>
              {unread > 0 && (
                <span className="text-[11px] font-medium text-primary-600 dark:text-primary-400">
                  {t("unreadCount", { count: unread })}
                </span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {loading && items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500 dark:text-slate-400 text-center">{t("loading")}</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500 dark:text-slate-400 text-center">{t("empty")}</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => goTo(item.actionUrl || "/my/notifications")}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 line-clamp-1">
                          {item.title}
                        </p>
                        {item.body && (
                          <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 line-clamp-2">{item.body}</p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-2.5">
              <Link
                href={`/${locale}/my/notifications`}
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
