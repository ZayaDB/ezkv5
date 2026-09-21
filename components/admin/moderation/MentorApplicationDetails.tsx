"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

export type MentorProfileView = {
  title: string;
  location: string;
  photo?: string | null;
  bio: string;
  languages: string[];
  specialties: string[];
  price: number;
  availability: string;
  yearsOfExperience: number;
  education: string;
  careerSummary: string;
  sessionDuration: number;
  sessionFormat: string;
  timezone: string;
  responseTime: string;
  introVideoUrl: string;
  portfolioLinks: string[];
  mentoringStyle: string;
  recommendedFor: string;
  notRecommendedFor: string;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[8.5rem_1fr] gap-x-3 gap-y-0.5 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <div className="min-w-0 text-slate-800 whitespace-pre-wrap break-words">{children}</div>
    </div>
  );
}

function dash(v: string | number | null | undefined) {
  if (v === undefined || v === null || v === "") return "—";
  return String(v);
}

export default function MentorApplicationDetails({
  item,
  framed = true,
}: {
  item: MentorProfileView;
  framed?: boolean;
}) {
  const tm = useTranslations("profilePage.mentor");

  const availLabel =
    item.availability === "available"
      ? tm("availAvailable")
      : item.availability === "limited"
        ? tm("availLimited")
        : item.availability === "unavailable"
          ? tm("availUnavailable")
          : dash(item.availability);

  const formatLabel =
    item.sessionFormat === "online"
      ? tm("formatOnline")
      : item.sessionFormat === "offline"
        ? tm("formatOffline")
        : item.sessionFormat === "both"
          ? tm("formatBoth")
          : dash(item.sessionFormat);

  return (
    <div
      className={
        framed
          ? "mt-3 space-y-2 rounded-lg bg-white ring-1 ring-slate-200 p-3"
          : "space-y-2"
      }
    >
      {item.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photo} alt={item.title} className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
      ) : null}
      <Field label={tm("mentorTitleLabel")}>{dash(item.title)}</Field>
      <Field label={tm("locationLabel")}>{dash(item.location)}</Field>
      <Field label={tm("bioLabel")}>{dash(item.bio)}</Field>
      <Field label={tm("languagesLabel")}>
        {item.languages.length ? item.languages.join(", ") : "—"}
      </Field>
      <Field label={tm("specialtiesLabel")}>
        {item.specialties.length ? item.specialties.join(", ") : "—"}
      </Field>
      <Field label={tm("priceLabel")}>{item.price.toLocaleString()}</Field>
      <Field label={tm("sessionDurationLabel")}>{item.sessionDuration || "—"}</Field>
      <Field label={tm("sessionFormatLabel")}>{formatLabel}</Field>
      <Field label={tm("yearsLabel")}>{item.yearsOfExperience}</Field>
      <Field label={tm("educationLabel")}>{dash(item.education)}</Field>
      <Field label={tm("careerSummaryLabel")}>{dash(item.careerSummary)}</Field>
      <Field label={tm("responseTimeLabel")}>{dash(item.responseTime)}</Field>
      <Field label={tm("timezoneLabel")}>{dash(item.timezone)}</Field>
      <Field label={tm("introVideoLabel")}>
        {item.introVideoUrl ? (
          <a
            href={item.introVideoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 underline break-all"
          >
            {item.introVideoUrl}
          </a>
        ) : (
          "—"
        )}
      </Field>
      <Field label={tm("portfolioLabel")}>
        {item.portfolioLinks.length ? (
          <ul className="space-y-1">
            {item.portfolioLinks.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          "—"
        )}
      </Field>
      <Field label={tm("mentoringStyleLabel")}>{dash(item.mentoringStyle)}</Field>
      <Field label={tm("recommendedForLabel")}>{dash(item.recommendedFor)}</Field>
      <Field label={tm("notRecommendedForLabel")}>{dash(item.notRecommendedFor)}</Field>
      <Field label={tm("avail")}>{availLabel}</Field>
    </div>
  );
}
