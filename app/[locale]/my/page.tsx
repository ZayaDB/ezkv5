"use client";

import { useLocale } from "next-intl";
import RouteRedirect from "@/components/ui/RouteRedirect";

export default function MyIndexPage() {
  const locale = useLocale();
  return <RouteRedirect to={`/${locale}/my/profile`} message="이동 중…" />;
}
