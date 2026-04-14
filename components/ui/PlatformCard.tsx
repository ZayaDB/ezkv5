import type { ReactNode } from "react";

interface PlatformCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const pad: Record<NonNullable<PlatformCardProps["padding"]>, string> = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function PlatformCard({
  children,
  className = "",
  padding = "md",
}: PlatformCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 ${pad[padding]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
