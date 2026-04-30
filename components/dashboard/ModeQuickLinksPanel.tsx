"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  BookOpen,
  Calendar,
  CircleDollarSign,
  Compass,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PenLine,
  Users,
  Wallet,
} from "lucide-react";
import PlatformCard from "@/components/ui/PlatformCard";

type DashboardMode = "mentee" | "mentor";

function QuickLink({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/15 group-hover:text-primary-700 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
    </Link>
  );
}

export default function ModeQuickLinksPanel({
  mode,
  locale,
  userRole,
  t,
}: {
  mode: DashboardMode;
  locale: string;
  userRole: string;
  t: (key: string, values?: Record<string, any>) => string;
}) {
  return (
    <PlatformCard padding="lg" className="lg:col-span-2">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-primary-600" />
        {mode === "mentee" ? t("panelMentee") : t("panelMentor")}
      </h2>

      {mode === "mentee" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink href={`/${locale}/lectures`} icon={BookOpen} title={t("mentee.quick1Title")} desc={t("mentee.quick1Desc")} />
            <QuickLink href={`/${locale}/mentors`} icon={Users} title={t("mentee.quick2Title")} desc={t("mentee.quick2Desc")} />
            <QuickLink href={`/${locale}/community`} icon={MessageSquare} title={t("mentee.quick3Title")} desc={t("mentee.quick3Desc")} />
            <QuickLink href={`/${locale}/freelancers`} icon={CircleDollarSign} title={t("mentee.quick4Title")} desc={t("mentee.quick4Desc")} />
          </div>
          {userRole === "mentee" && (
            <p className="mt-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("mentorApplyHint")}{" "}
              <Link href={`/${locale}/my/profile?tab=mentor`} className="font-semibold text-primary-600 hover:underline">
                {t("mentorApplyLink")}
              </Link>
            </p>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickLink href={`/${locale}/my/profile`} icon={Calendar} title={t("mentor.quick1Title")} desc={t("mentor.quick1Desc")} />
          <QuickLink href={`/${locale}/my/lectures`} icon={GraduationCap} title={t("mentor.quick2Title")} desc={t("mentor.quick2Desc")} />
          <QuickLink href={`/${locale}/mentor/lectures/new`} icon={PenLine} title={t("mentor.quick5Title")} desc={t("mentor.quick5Desc")} />
          <QuickLink
            href={`/${locale}/my/lectures`}
            icon={BookOpen}
            title={locale === "kr" ? "내 강의 관리" : locale === "mn" ? "Миний хичээл" : "Manage lectures"}
            desc={
              locale === "kr"
                ? "개설한 강의를 확인하고 바로 수정하세요."
                : locale === "mn"
                  ? "Нээсэн хичээлээ шалгаж засварлана."
                  : "Review and edit your published lectures."
            }
          />
          <QuickLink href={`/${locale}/community`} icon={Compass} title={t("mentor.quick3Title")} desc={t("mentor.quick3Desc")} />
          <QuickLink href={`/${locale}/my/profile`} icon={Wallet} title={t("mentor.quick4Title")} desc={t("mentor.quick4Desc")} />
        </div>
      )}
    </PlatformCard>
  );
}

