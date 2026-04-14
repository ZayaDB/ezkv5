"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function MyIndexPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/my/lectures`);
  }, [router, locale]);

  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-zinc-500">
      이동 중…
    </div>
  );
}
