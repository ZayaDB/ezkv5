"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { PendingLectureApplication } from "@/lib/supabase/moderation";

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

function Lines({ items }: { items: string[] }) {
  if (!items.length) return <>{"—"}</>;
  return (
    <ul className="list-disc pl-4 space-y-0.5">
      {items.map((line, i) => (
        <li key={`${i}-${line}`}>{line}</li>
      ))}
    </ul>
  );
}

export default function LectureApplicationDetails({
  item,
  framed = true,
}: {
  item: PendingLectureApplication;
  framed?: boolean;
}) {
  const tl = useTranslations("profilePage.lectureNew");

  const typeLabel =
    item.type === "online" ? tl("online") : item.type === "offline" ? tl("offline") : dash(item.type);

  const difficultyLabel =
    item.difficulty === "beginner"
      ? tl("beginner")
      : item.difficulty === "intermediate"
        ? tl("intermediate")
        : item.difficulty === "advanced"
          ? tl("advanced")
          : dash(item.difficulty);

  return (
    <div
      className={
        framed
          ? "mt-3 space-y-2 rounded-lg bg-white ring-1 ring-slate-200 p-3"
          : "space-y-2"
      }
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.title}
          className="h-36 w-full rounded-lg object-cover ring-1 ring-slate-200"
        />
      ) : null}
      <Field label={tl("courseTitle")}>{dash(item.title)}</Field>
      <Field label={tl("type")}>{typeLabel}</Field>
      <Field label={tl("category")}>{dash(item.category)}</Field>
      <Field label={tl("price")}>{item.price.toLocaleString()}</Field>
      <Field label={tl("duration")}>{dash(item.duration)}</Field>
      <Field label={tl("shortDescription")}>{dash(item.shortDescription)}</Field>
      <Field label={tl("description")}>{dash(item.description)}</Field>
      <Field label={tl("targetAudience")}>{dash(item.targetAudience)}</Field>
      <Field label={tl("prerequisites")}>{dash(item.prerequisites)}</Field>
      <Field label={tl("whatYouWillLearn")}>
        <Lines items={item.whatYouWillLearn} />
      </Field>
      <Field label={tl("curriculum")}>
        <Lines items={item.curriculum} />
      </Field>
      <Field label={tl("totalLessons")}>{item.totalLessons || "—"}</Field>
      <Field label={tl("totalHours")}>{item.totalHours || "—"}</Field>
      <Field label={tl("difficulty")}>{difficultyLabel}</Field>
      <Field label={tl("maxStudents")}>{item.maxStudents || "—"}</Field>
      <Field label={tl("language")}>{dash(item.language)}</Field>
      <Field label={tl("previewVideoUrl")}>
        {item.previewVideoUrl ? (
          <a
            href={item.previewVideoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 underline break-all"
          >
            {item.previewVideoUrl}
          </a>
        ) : (
          "—"
        )}
      </Field>
      <Field label={tl("materialsIncluded")}>
        <Lines items={item.materialsIncluded} />
      </Field>
      <Field label={tl("faq")}>
        <Lines items={item.faq} />
      </Field>
    </div>
  );
}
