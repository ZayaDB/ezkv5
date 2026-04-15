"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import LoadingState from "@/components/ui/LoadingState";

/** 예전 URL 호환: 수강 목록은 `내 강의·학습` → 신청·진행 상태 탭으로 통합 */
export default function MyEnrollmentsRedirectPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/my/courses?tab=status`);
  }, [router, locale]);

  return <LoadingState />;
}
