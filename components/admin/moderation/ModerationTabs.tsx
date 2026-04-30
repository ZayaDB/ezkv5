"use client";

export type ModerationTab = "all" | "community" | "freelancer" | "mentor" | "posts";

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
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          {x.label}
        </button>
      ))}
    </div>
  );
}

