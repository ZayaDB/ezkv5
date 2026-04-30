"use client";

import { useLocale } from "next-intl";
import RouteRedirect from "@/components/ui/RouteRedirect";

export default function MyIndexPage() {
  const locale = useLocale();
  return <RouteRedirect to={`/${locale}/my/dashboard`} message="이동 중…" />;
}
