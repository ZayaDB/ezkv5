"use client";

import { useLocale } from "next-intl";
import RouteRedirect from "@/components/ui/RouteRedirect";

export default function AdminIndexPage() {
  const locale = useLocale();
  return <RouteRedirect to={`/${locale}/admin/dashboard`} message="이동 중..." />;
}

