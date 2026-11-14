import type { ReactNode } from "react";

interface PlatformCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const pad: Record<NonNullable<PlatformCardProps["padding"]>, string> = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-7",
};

/** Figma 카드: 흰 배경 + 가는 테두리, 그림자 없음 */
export default function PlatformCard({ children, className = "", padding = "md" }: PlatformCardProps) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-white text-ink dark:border-hairline-dark dark:bg-night-card dark:text-snow ${pad[padding]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
