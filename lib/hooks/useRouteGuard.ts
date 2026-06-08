"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { AppUserRole } from "@/lib/auth/userRole";

type Role = AppUserRole | "mentee";

export function useRouteGuard(params: {
  loading?: boolean;
  userRole?: Role;
  locale?: string;
  requireAuth?: boolean;
  requireRole?: Role;
}) {
  const { loading: loadingProp, userRole: userRoleProp, locale: localeProp, requireAuth = true, requireRole } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const loading = loadingProp ?? authLoading;
  const userRole = userRoleProp ?? (user?.role as Role | undefined);
  const locale = localeProp ?? (typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "kr");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) {
      setAllowed(false);
      return;
    }
    if (requireAuth && !userRole) {
      setAllowed(false);
      router.replace(`/${locale}/login`);
      return;
    }
    if (requireRole && userRole !== requireRole) {
      setAllowed(false);
      if (requireRole === "admin") {
        router.replace(`/${locale}/login`);
      }
      return;
    }
    setAllowed(true);
  }, [loading, userRole, locale, requireAuth, requireRole, router]);

  return { allowed: !loading && allowed, loading };
}
