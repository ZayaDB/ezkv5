"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * 회원 전용 서비스로 가는 버튼: 로그인했으면 바로, 아니면 로그인 후 돌아오게.
 * (가입이 처음이면 로그인 화면에서 회원가입으로 이어짐)
 */
export default function ServiceLink({
  path,
  guestPath,
  label,
  variant = "primary",
}: {
  /** 로그인 안 했을 때 보낼 곳 (없으면 로그인 후 돌아오기) */
  guestPath?: string;
  /** 로케일 뒤 경로, 예: /my/korean */
  path: string;
  label: string;
  variant?: "primary" | "quiet";
}) {
  const locale = useLocale();
  const { user } = useAuth();
  const target = `/${locale}${path}`;
  const href = user ? target : guestPath ? `/${locale}${guestPath}` : `/${locale}/login?redirect=${encodeURIComponent(target)}`;
  return (
    <Link href={href} className={variant === "primary" ? "lnk-btn-primary" : "lnk-btn-quiet"}>
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
