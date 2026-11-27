import type { SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export default function Select({ hasError = false, className = "", ...props }: Props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border bg-white dark:bg-night-card text-brand-ink dark:text-snow px-3 py-2 text-sm outline-none transition-colors ${
        hasError
          ? "border-red-300 dark:border-red-400/60 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/20"
          : "border-brand-line dark:border-hairline-dark focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-500/20"
      } ${className}`.trim()}
    />
  );
}
