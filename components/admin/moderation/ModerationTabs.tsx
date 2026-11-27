"use client";

export type ModerationTab = "all" | "community" | "freelancer" | "mentor" | "lecture" | "posts";

export default function ModerationTabs({
  tabs,
  tab,
  onChange,
}: {
  tabs: { id: ModerationTab; label: string }[];
  tab: ModerationTab;
  onChange: (tab: ModerationTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((x) => (
        <button
          key={x.id}
          type="button"
          onClick={() => onChange(x.id)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
            tab === x.id
              ? "bg-brand-ink text-white"
              : "bg-white text-brand-soft ring-1 ring-brand-line hover:bg-brand-mist"
          }`}
        >
          {x.label}
        </button>
      ))}
    </div>
  );
}

