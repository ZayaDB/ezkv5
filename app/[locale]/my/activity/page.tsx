"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import { ChevronRight, MessageSquare, Users, Wallet } from "lucide-react";

export default function MyActivityPage() {
  const t = useTranslations("myPages.activity");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  if (authLoading || !user) {
    return <LoadingState />;
  }

  const links = [
    {
      href: `/${locale}/my/enrollments`,
      title: t("enrollments"),
      desc: t("subtitle"),
      icon: Users,
    },
    {
      href: `/${locale}/my/community`,
      title: t("community"),
      desc: t("subtitle"),
      icon: MessageSquare,
    },
    {
      href: `/${locale}/my/freelancers`,
      title: t("freelancers"),
      desc: t("subtitle"),
      icon: Wallet,
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
        <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
      </div>
      <div className="space-y-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <PlatformCard className="flex items-center justify-between gap-3 hover:border-primary-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">{item.title}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </PlatformCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
