"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "mentee" | "mentor" | "admin";

export function useRouteGuard(params: {
  loading: boolean;
  userRole?: Role;
  locale: string;
  requireAuth?: boolean;
  requireRole?: Role;
}) {
  const { loading, userRole, locale, requireAuth = true, requireRole } = params;
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (requireAuth && !userRole) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (requireRole && userRole !== requireRole) {
      router.replace(`/${locale}/login`);
    }
  }, [loading, userRole, locale, requireAuth, requireRole, router]);
}

