"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Users, HeartHandshake } from "lucide-react";
import { ui } from "@/components/lnk/ui";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  /** Small line above the title, e.g. step indicator. */
  kicker?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Figma-style split layout for login / signup:
 * dark brand panel (LNK = Learn · Network · Keep) + form card.
 */
export function AuthShell({ title, subtitle, kicker, children, footer }: AuthShellProps) {
  const t = useTranslations("auth.shell");
  const pillars = [
    { icon: BookOpen, title: t("learnTitle"), desc: t("learnDesc") },
    { icon: Users, title: t("networkTitle"), desc: t("networkDesc") },
    { icon: HeartHandshake, title: t("keepTitle"), desc: t("keepDesc") },
  ];

  return (
    <div className="bg-surface dark:bg-night">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1440px] items-center px-4 py-10 sm:px-8 lg:px-20 lg:py-16">
        <div className="grid w-full overflow-hidden rounded-2xl border border-hairline bg-white dark:border-hairline-dark dark:bg-night-card lg:grid-cols-[1fr_1.05fr]">
          {/* Brand panel */}
          <aside className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-[#0b1513] p-12 text-snow lg:flex">
            <svg
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.12]"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle cx="40" cy="60" r="6" fill="#3fa393" />
              <circle cx="120" cy="40" r="6" fill="#3fa393" />
              <circle cx="160" cy="120" r="6" fill="#3fa393" />
              <circle cx="80" cy="150" r="6" fill="#3fa393" />
              <path d="M40 60 L120 40 L160 120 L80 150 Z M40 60 L160 120" stroke="#3fa393" strokeWidth="1.5" />
            </svg>

            <div className="relative space-y-5">
              <img src="/brand/lnk-logo-dark.svg" alt="LNK" className="h-8 w-auto" />
              <p className="pt-6 text-xs font-bold uppercase tracking-wide text-teal-dark">{t("eyebrow")}</p>
              <h2 className="max-w-md text-3xl font-semibold leading-[1.2]">{t("title")}</h2>
              <p className="max-w-md text-sm leading-relaxed text-snow-muted">{t("body")}</p>
            </div>

            <ul className="relative space-y-3">
              {pillars.map(({ icon: Icon, title: pt, desc }) => (
                <li key={pt} className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/20 text-teal-dark">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{pt}</p>
                    <p className="mt-0.5 text-sm text-snow-muted">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="relative text-xs text-snow-muted/80">{t("note")}</p>
          </aside>

          {/* Form */}
          <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-[420px]">
              {kicker ? <div className="mb-3">{kicker}</div> : null}
              <h1 className="text-2xl font-semibold text-ink dark:text-snow sm:text-[32px] sm:leading-[1.2]">{title}</h1>
              {subtitle ? <p className={`mt-2 ${ui.muted}`}>{subtitle}</p> : null}
              <div className="mt-8">{children}</div>
              {footer ? (
                <div className="mt-8 border-t border-hairline pt-6 text-center text-sm text-ink-muted dark:border-hairline-dark dark:text-snow-muted">
                  {footer}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink dark:text-snow">{label}</span>
      <span className="relative block">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted dark:text-snow-muted" />
        ) : null}
        {children}
      </span>
    </label>
  );
}

export const authInput = `${ui.input} pl-9`;
export const authInputPlain = ui.input;

export function AuthAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const cls =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
      : "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900 dark:bg-primary-950/40 dark:text-primary-200";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}
