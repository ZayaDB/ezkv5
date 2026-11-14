import { Briefcase, GraduationCap, HeartPulse, Home, Plane, Smartphone, Stamp, type LucideIcon } from "lucide-react";
import type { GuideTopic } from "@/types";

export const GUIDE_ICONS: Record<GuideTopic, LucideIcon> = {
  arrival: Plane,
  study: GraduationCap,
  housing: Home,
  hospital: HeartPulse,
  lifeTips: Smartphone,
  work: Briefcase,
  visa: Stamp,
};

export function GuideTopicIcon({ topic, className = "h-4 w-4" }: { topic: GuideTopic; className?: string }) {
  const Icon = GUIDE_ICONS[topic] ?? Plane;
  return <Icon className={className} aria-hidden="true" />;
}
