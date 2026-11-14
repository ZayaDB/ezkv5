import type { GuideTopic } from "@/types";
import { GUIDE_ICONS } from "./GuideTopicIcon";

/** 가이드 커버: 이미지가 있으면 이미지, 없으면 주제 아이콘 + LNK 점·선·원 모티프 */
export default function GuideCover({
  image,
  topic,
  alt,
  className = "",
}: {
  image?: string;
  topic: GuideTopic;
  alt: string;
  className?: string;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }
  const Icon = GUIDE_ICONS[topic] ?? GUIDE_ICONS.arrival;
  return (
    <div className={`relative h-full w-full overflow-hidden bg-primary-50 dark:bg-night-pill ${className}`} role="img" aria-label={alt}>
      <svg
        className="absolute inset-0 h-full w-full text-primary-200 dark:text-primary-900"
        viewBox="0 0 480 320"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M-20 250 L110 170 L230 205 L360 95 L500 120" />
          <path d="M-20 90 L90 60 L170 105" opacity="0.6" />
        </g>
        <g fill="currentColor">
          <circle cx="110" cy="170" r="8" />
          <circle cx="230" cy="205" r="8" />
          <circle cx="90" cy="60" r="5" opacity="0.6" />
        </g>
        <circle cx="360" cy="95" r="14" fill="none" stroke="currentColor" strokeWidth="5" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-teal shadow-sm ring-1 ring-hairline dark:bg-night-card dark:text-teal-dark dark:ring-hairline-dark">
          <Icon width={36} height={36} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
