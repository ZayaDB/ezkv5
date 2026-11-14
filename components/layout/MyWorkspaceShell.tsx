"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type WorkspaceItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: (pathname: string) => boolean;
  badge?: number;
};

export type WorkspaceGroup = { label: string; items: WorkspaceItem[] };

/**
 * 마이페이지 틀 — Figma "My learning"의 YOUR WORKSPACE 사이드바.
 * 데스크톱: 왼쪽 고정 메뉴(그룹별), 모바일: 위쪽 가로 스크롤 탭.
 */
export default function MyWorkspaceShell({
  pathname,
  groups,
  header,
  footer,
  children,
}: {
  pathname: string;
  groups: WorkspaceGroup[];
  header?: ReactNode;
  footer?: { title: string; body: string; href: string; cta: string } | null;
  children: ReactNode;
}) {
  const all = groups.flatMap((g) => g.items);

  const link = (item: WorkspaceItem, mobile = false) => {
    const Icon = item.icon;
    const on = item.active(pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={on ? "page" : undefined}
        className={
          mobile
            ? `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium ${
                on
                  ? "bg-primary-50 text-primary-700 dark:bg-night-pill dark:text-primary-300"
                  : "text-ink-muted dark:text-snow-muted"
              }`
            : `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                on
                  ? "bg-primary-50 font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300"
                  : "text-ink-muted hover:bg-white hover:text-ink dark:text-snow-muted dark:hover:bg-night-card dark:hover:text-snow"
              }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.badge ? (
          <span className="min-w-[1.25rem] rounded-full bg-teal px-1.5 py-0.5 text-center text-[10px] font-bold text-white dark:bg-teal-dark dark:text-night">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      {/* Mobile tabs */}
      <nav
        className="sticky top-20 z-20 flex gap-1 overflow-x-auto border-b border-hairline bg-surface/95 px-4 py-2 backdrop-blur lg:hidden dark:border-hairline-dark dark:bg-night/95"
        aria-label="My"
      >
        {all.map((i) => link(i, true))}
      </nav>

      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[232px_minmax(0,1fr)] lg:px-20 lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-28 flex flex-col gap-6">
            {header}
            {groups.map((g) => (
              <nav key={g.label} className="flex flex-col gap-1" aria-label={g.label}>
                <p className="mb-1 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted dark:text-snow-muted">
                  {g.label}
                </p>
                {g.items.map((i) => link(i))}
              </nav>
            ))}
            {footer ? (
              <Link
                href={footer.href}
                className="group flex flex-col gap-1.5 rounded-2xl border border-hairline bg-white p-4 transition-colors hover:border-teal dark:border-hairline-dark dark:bg-night-card dark:hover:border-teal-dark"
              >
                <p className="text-[13px] font-semibold text-ink dark:text-snow">{footer.title}</p>
                <p className="text-xs leading-[1.5] text-ink-muted dark:text-snow-muted">{footer.body}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-teal dark:text-teal-dark">
                  {footer.cta}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            ) : null}
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
