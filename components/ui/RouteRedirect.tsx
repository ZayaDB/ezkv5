"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RouteRedirect({
  to,
  message = "이동 중...",
}: {
  to: string;
  message?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-zinc-500">
      {message}
    </div>
  );
}

