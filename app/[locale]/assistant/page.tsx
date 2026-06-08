"use client";

import { useTranslations, useLocale } from "next-intl";
import AssistantChat from "@/components/assistant/AssistantChat";

export default function AssistantPage() {
  const t = useTranslations("assistant");
  const locale = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("pageTitle")}</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{t("pageSubtitle")}</p>
      <AssistantChat embedded />
    </div>
  );
}
