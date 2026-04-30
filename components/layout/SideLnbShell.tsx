"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

export type SideLnbItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: (pathname: string) => boolean;
  badge?: number;
};

export default function SideLnbShell({
  title,
  pathname,
  mainNav,
  supportTitle,
  supportNav = [],
  children,
}: {
  title: string;
  pathname: string;
  mainNav: SideLnbItem[];
  supportTitle?: string;
  supportNav?: SideLnbItem[];
  children: ReactNode;
}) {
  const renderLink = (item: SideLnbItem) => {
    const Icon = item.icon;
    const on = item.active(pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          on
            ? "bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 ring-1 ring-primary-100 dark:ring-primary-500/30"
            : "text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-slate-100"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0 opacity-80" />
        <span className="flex-1 min-w-0 truncate">{item.label}</span>
        {item.badge != null && item.badge > 0 ? (
          <span className="shrink-0 min-w-[1.125rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <aside className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 md:min-h-screen">
        <div className="p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400 mb-3">
            {title}
          </p>
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 md:space-y-0.5">
            {mainNav.map(renderLink)}
            {supportNav.length > 0 && (
              <>
                <div className="hidden md:block my-3 border-t border-zinc-200 dark:border-slate-700" />
                <div className="flex md:flex-col gap-1 md:pt-1">
                  {supportTitle ? (
                    <p className="hidden md:block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-slate-500 px-1 mb-1">
                      {supportTitle}
                    </p>
                  ) : null}
                  {supportNav.map(renderLink)}
                </div>
              </>
            )}
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0 px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}

