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
      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
      : variant === "secondary"
        ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-700 shadow-sm"
          : "bg-transparent text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800";
  const s =
    size === "sm" ? "px-3 py-2 text-xs" : size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2 text-sm";
  return (
    <button
      {...props}
      className={`${v} ${s} ${fullWidth ? "w-full" : ""} rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-400/40 disabled:opacity-60 disabled:cursor-not-allowed ${className}`.trim()}
    />
  );
}
