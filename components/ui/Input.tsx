import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export default function Input({ hasError = false, className = "", ...props }: Props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
        hasError
          ? "border-red-300 dark:border-red-400/60 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/20"
          : "border-slate-200 dark:border-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-500/20"
      } ${className}`.trim()}
    />
  );
}
