import type { ReactNode } from "react";
import Link from "next/link";
import { Info, AlertTriangle } from "lucide-react";

/**
 * LNK 공통 UI — Figma "LNK" 디자인 체계(구성·간격·타이포)를 LNK 틸로 옮긴 것.
 * 공개 페이지와 마이페이지가 같은 카드·버튼·안내 박스를 쓰도록 여기 모은다.
 */
export const ui = {
  card: "bg-white dark:bg-night-card border border-brand-line dark:border-hairline-dark rounded-[24px]",
  cardHover:
    "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-brand hover:shadow-[0_24px_48px_-30px_rgba(17,26,25,.45)] motion-reduce:transform-none motion-reduce:transition-none dark:hover:border-teal-dark",
  btnPrimary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[15px] font-bold text-white transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-[0_14px_28px_-16px_rgba(20,86,76,.8)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none dark:bg-teal-dark dark:text-night dark:hover:bg-primary-400",
  btnSun:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-sun px-6 text-[15px] font-extrabold text-brand-ink transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#ffd95e] hover:shadow-[0_14px_28px_-16px_rgba(242,189,29,.95)] active:translate-y-0 disabled:opacity-60 motion-reduce:transform-none",
  btnOutline:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-brand-ink bg-white px-6 text-[15px] font-bold text-brand-ink transition-colors duration-300 hover:bg-brand-ink hover:text-white disabled:opacity-60 dark:border-hairline-dark dark:bg-night-card dark:text-snow dark:hover:border-teal-dark",
  btnGhost:
    "inline-flex items-center gap-1 text-sm font-bold text-brand underline-offset-4 hover:underline dark:text-teal-dark",
  pillTeal: "rounded-full bg-[#e1f3ee] px-2.5 py-1 text-xs font-bold text-brand-deep dark:bg-night-pill dark:text-primary-300",
  pillSand: "rounded-full bg-[#fff3c7] px-2.5 py-1 text-xs font-bold text-[#6b5208] dark:bg-[#2a2418] dark:text-[#e2c48f]",
  pillMuted: "rounded-full bg-brand-mist px-2.5 py-1 text-xs font-semibold text-brand-soft dark:bg-night dark:text-snow-muted",
  eyebrow: "text-xs font-bold uppercase tracking-wide text-brand dark:text-teal-dark",
  h1: "text-[32px] font-extrabold leading-[1.12] tracking-[-0.03em] text-brand-ink dark:text-snow sm:text-[46px]",
  h2: "text-xl font-extrabold tracking-[-0.02em] text-brand-ink dark:text-snow sm:text-2xl",
  lead: "text-base leading-[1.6] text-brand-soft dark:text-snow-muted",
  muted: "text-brand-soft dark:text-snow-muted",
  text: "text-brand-ink dark:text-snow",
  input:
    "h-12 w-full rounded-xl border border-brand-line bg-white px-3.5 text-[15px] text-brand-ink placeholder:text-brand-soft/80 transition-shadow focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-mint/50 dark:border-hairline-dark dark:bg-night-card dark:text-snow dark:placeholder:text-snow-muted dark:focus:border-teal-dark",
} as const;

/** 공개 페이지 바깥 틀 (Figma: 1440 기준, 좌우 80px) */
export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      <div className={`mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-10 sm:px-8 lg:px-20 lg:py-14 ${className}`}>
        {children}
      </div>
    </div>
  );
}

/** 페이지 소개: 상태 배지 · eyebrow · 제목 · 설명 · 오른쪽 액션 */
export function PageIntro({
  eyebrow,
  status,
  title,
  subtitle,
  actions,
  size = "lg",
}: {
  eyebrow?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  size?: "lg" | "md";
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-3">
        {status ? <span className={`w-fit ${ui.pillTeal}`}>{status}</span> : null}
        {eyebrow ? <p className={ui.eyebrow}>{eyebrow}</p> : null}
        <h1
          className={
            size === "lg"
              ? ui.h1
              : "text-2xl font-extrabold leading-[1.2] tracking-[-0.025em] text-brand-ink dark:text-snow sm:text-[34px]"
          }
        >
          {title}
        </h1>
        {subtitle ? <p className={ui.lead}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

/** 안내 박스: info(틸) / caution(모래색) */
export function Notice({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: "info" | "caution";
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const box =
    tone === "info" ? "bg-[#e9f5f1] dark:bg-night-pill" : "bg-[#fff6d6] dark:bg-[#2a2418]";
  const icon =
    tone === "info" ? "text-teal dark:text-teal-dark" : "text-[#75582b] dark:text-[#e2c48f]";
  const Icon = tone === "info" ? Info : AlertTriangle;
  return (
    <div className={`flex items-start gap-3.5 rounded-2xl p-5 ${box} ${className}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-1 leading-[1.55]">
        {title ? <p className="text-sm font-semibold text-ink dark:text-snow">{title}</p> : null}
        {children ? <div className="text-[13px] text-ink-muted dark:text-snow-muted">{children}</div> : null}
      </div>
    </div>
  );
}

/** 섹션 제목 + 오른쪽 링크 */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: { label: ReactNode; href: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className={ui.h2}>{title}</h2>
        {description ? <p className={`text-sm ${ui.muted}`}>{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className={`shrink-0 ${ui.btnGhost}`}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** 빈 상태 카드 (Figma "Your learning starts here.") */
export function EmptyCard({
  icon,
  title,
  body,
  action,
  footnote,
}: {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <div className={`${ui.card} flex flex-col items-center gap-4 px-6 py-12 text-center`}>
      {icon ? (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint/50 text-brand-deep dark:bg-night-pill dark:text-teal-dark">
          {icon}
        </span>
      ) : null}
      <p className="text-[22px] font-extrabold tracking-[-0.02em] text-brand-ink dark:text-snow">{title}</p>
      {body ? <p className={`max-w-md text-sm leading-[1.6] ${ui.muted}`}>{body}</p> : null}
      {action}
      {footnote ? <p className={`self-start text-xs ${ui.muted}`}>{footnote}</p> : null}
    </div>
  );
}

/** 숫자 타일 */
export function StatTile({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: "default" | "alert";
}) {
  const inner = (
    <>
      <p className={`text-xs font-medium ${ui.muted}`}>{label}</p>
      <p
        className={`mt-2 text-[28px] font-extrabold leading-none tracking-[-0.02em] ${
          tone === "alert" ? "text-[#b4541a] dark:text-[#f0a46b]" : "text-ink dark:text-snow"
        }`}
      >
        {value}
      </p>
      {hint ? <p className={`mt-2 text-xs ${ui.muted}`}>{hint}</p> : null}
    </>
  );
  const cls = `${ui.card} block p-5`;
  return href ? (
    <Link href={href} className={`${cls} ${ui.cardHover}`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
