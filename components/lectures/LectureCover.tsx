import {
  BookOpen,
  Briefcase,
  Code2,
  GraduationCap,
  HeartPulse,
  Home,
  Languages,
  MapPin,
  Plane,
  type LucideIcon,
} from "lucide-react";
import { normalizeLectureCategory, type LectureCategory } from "@/lib/lectures/categories";

const ICONS: Record<LectureCategory, LucideIcon> = {
  visa: Plane,
  housing: Home,
  health: HeartPulse,
  academic: GraduationCap,
  language: Languages,
  career: Briefcase,
  tech: Code2,
  life: MapPin,
  other: BookOpen,
};

/**
 * 강의 커버. 이미지가 있으면 이미지, 없으면 카테고리 아이콘과
 * LNK 로고의 점·선·원 모티프로 만든 브랜드 커버를 보여준다.
 */
export default function LectureCover({
  image,
  category,
  alt,
  className = "",
  iconSize = 28,
}: {
  image?: string;
  category?: string;
  alt: string;
  className?: string;
  iconSize?: number;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={alt} className={`w-full h-full object-cover ${className}`} />
    );
  }
  const Icon = ICONS[normalizeLectureCategory(category) ?? "other"];
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-primary-50 dark:bg-night-pill ${className}`}
      role="img"
      aria-label={alt}
    >
      <svg
        className="absolute inset-0 w-full h-full text-primary-200 dark:text-primary-900"
        viewBox="0 0 320 184"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M-10 150 L70 96 L150 120 L240 52 L330 70" />
          <path d="M-10 60 L60 40 L120 70" opacity="0.6" />
        </g>
        <g fill="currentColor">
          <circle cx="70" cy="96" r="6" />
          <circle cx="150" cy="120" r="6" />
          <circle cx="60" cy="40" r="4" opacity="0.6" />
        </g>
        <circle cx="240" cy="52" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-night-card shadow-sm ring-1 ring-hairline dark:ring-hairline-dark text-teal dark:text-teal-dark">
          <Icon width={iconSize} height={iconSize} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
