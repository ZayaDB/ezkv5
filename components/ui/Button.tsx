import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: Props) {
  const v =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-deep hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_rgba(20,86,76,.8)]"
      : variant === "secondary"
        ? "bg-white dark:bg-night text-brand-ink dark:text-snow ring-2 ring-brand-ink/90 dark:ring-slate-700 hover:bg-brand-ink hover:text-white dark:hover:bg-night-pill"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-700 shadow-sm"
          : "bg-transparent text-brand-ink dark:text-snow hover:bg-brand-mist dark:hover:bg-night-pill";
  const s =
    size === "sm" ? "px-3.5 py-2 text-xs" : size === "lg" ? "px-6 py-3.5 text-base" : "px-5 py-2.5 text-sm";
  return (
    <button
      {...props}
      className={`${v} ${s} ${fullWidth ? "w-full" : ""} rounded-full font-bold transition-all duration-300 active:translate-y-0 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-sun/70 dark:focus-visible:ring-primary-400/40 disabled:opacity-60 disabled:cursor-not-allowed ${className}`.trim()}
    />
  );
}
