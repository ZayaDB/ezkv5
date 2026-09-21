"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ModerationReviewModal({
  title,
  subtitle,
  children,
  onClose,
  onApprove,
  onReject,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const t = useTranslations("adminModeration");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              {subtitle ? <p className="text-xs text-slate-500 mt-1 break-words">{subtitle}</p> : null}
            </div>
            <StatusBadge label={tStatus("moderation.pending")} tone="purple" />
          </div>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {tCommon("close")}
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {t("approve")}
          </button>
        </div>
      </div>
    </div>
  );
}
