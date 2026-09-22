"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { openAssistant } from "@/components/chatbot/Chatbot";

export default function AssistantRedirectPage() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    openAssistant();
    router.replace(`/${locale}/my/dashboard`);
  }, [locale, router]);

  return null;
}
