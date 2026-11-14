"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RouteRedirect({
  to,
  message,
}: {
  to: string;
  message?: string;
}) {
  const router = useRouter();
  const t = useTranslations("common");

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-zinc-500">
      {message ?? t("redirecting")}
    </div>
  );
}

