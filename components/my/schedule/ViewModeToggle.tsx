"use client";

export default function ViewModeToggle({
  view,
  onChange,
  labels,
}: {
  view: "month" | "week" | "day";
  onChange: (v: "month" | "week" | "day") => void;
  labels: { month: string; week: string; day: string };
}) {
  return (
    <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 ring-1 ring-zinc-200 dark:bg-night">
      {(["month", "week", "day"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
            view === v ? "bg-white text-zinc-900 shadow-sm dark:text-snow dark:bg-night-card" : "text-zinc-600 dark:text-snow-muted"
          }`}
        >
          {v === "month" ? labels.month : v === "week" ? labels.week : labels.day}
        </button>
      ))}
    </div>
  );
}

