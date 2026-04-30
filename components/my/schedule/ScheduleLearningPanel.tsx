"use client";

export default function ScheduleLearningPanel({
  view,
  labels,
  grid,
  week,
  anchor,
  formatDayLabel,
  isTodayDate,
  sessionsOnDay,
  enrollmentsOnDay,
  lifeOnDay,
  budgetOnDay,
  onOpenDay,
  onRemoveEvent,
}: {
  view: "month" | "week" | "day";
  labels: {
    title: string;
    legendLife: string;
    legendSession: string;
    legendEnrollment: string;
    legendBudget: string;
    dayLifeTitle: string;
    sessionsTitle: string;
    enrollTitle: string;
    budgetTitle: string;
    deleteBtn: string;
    sessionWith: (name: string) => string;
    budgetLine: (kind: "expense" | "income", label: string, amount: number) => string;
  };
  grid: { date: Date; inMonth: boolean }[];
  week: Date[];
  anchor: Date;
  formatDayLabel: (day: Date) => string;
  isTodayDate: (day: Date) => boolean;
  sessionsOnDay: (day: Date) => any[];
  enrollmentsOnDay: (day: Date) => any[];
  lifeOnDay: (day: Date) => any[];
  budgetOnDay: (day: Date) => any[];
  onOpenDay: (day: Date) => void;
  onRemoveEvent: (id: string) => void;
}) {
  return (
    <div className="lg:col-span-2 space-y-2">
      {labels.title ? <h3 className="text-sm font-semibold text-zinc-800">{labels.title}</h3> : null}
      {view === "month" && (
        <div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-zinc-500 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map(({ date, inMonth }) => {
              const key = date.toISOString().slice(0, 10);
              const ss = sessionsOnDay(date);
              const ee = enrollmentsOnDay(date);
              const ll = lifeOnDay(date);
              const bb = budgetOnDay(date);
              const bars = [
                ...ll.map((ev: any) => ({
                  id: `life-${ev.id}`,
                  text: `${new Date(ev.startsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} ${ev.title}`,
                  cls: "bg-violet-600 text-white",
                })),
                ...ss.map((s: any) => ({
                  id: `session-${s.id}`,
                  text: `${s.date ? new Date(s.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : ""} ${s.mentorName || s.menteeName || "세션"}`.trim(),
                  cls: "bg-blue-600 text-white",
                })),
                ...ee.map((e: any) => ({
                  id: `enroll-${e.id}`,
                  text: e.lecture?.title || "강의 일정",
                  cls: "bg-emerald-600 text-white",
                })),
                ...bb.map((b: any) => ({
                  id: `budget-${b.id}`,
                  text: `${b.kind === "income" ? "수입" : "지출"} · ${b.label}`,
                  cls: b.kind === "income" ? "bg-cyan-600 text-white" : "bg-rose-600 text-white",
                })),
              ];
              const visibleBars = bars.slice(0, 3);
              const hiddenCount = Math.max(0, bars.length - visibleBars.length);
              const hasAny = bars.length > 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onOpenDay(date)}
                  className={`min-h-[108px] rounded-lg border p-1.5 text-left transition hover:bg-zinc-50/80 ${
                    inMonth ? "bg-white border-zinc-200" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                  } ${isTodayDate(date) ? "ring-2 ring-primary-400" : ""}`}
                >
                  <div className="text-sm font-semibold text-zinc-800">{date.getDate()}</div>
                  <div className="mt-1 space-y-1 min-h-[3.5rem]">
                    {visibleBars.map((bar) => (
                      <p
                        key={bar.id}
                        className={`text-[11px] leading-tight truncate rounded px-1.5 py-0.5 ${bar.cls}`}
                        title={bar.text}
                      >
                        {bar.text}
                      </p>
                    ))}
                    {hiddenCount > 0 && <p className="text-[11px] text-zinc-500 font-medium">+{hiddenCount}</p>}
                    {!hasAny && <p className="text-xs text-zinc-400"> </p>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {ll.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-violet-600" title={labels.legendLife} />}
                    {ss.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-primary-600" title={labels.legendSession} />}
                    {ee.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title={labels.legendEnrollment} />}
                    {bb.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title={labels.legendBudget} />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-violet-600" /> {labels.legendLife}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary-600" /> {labels.legendSession}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> {labels.legendEnrollment}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> {labels.legendBudget}
            </span>
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {week.map((day) => {
            const ss = sessionsOnDay(day);
            const ee = enrollmentsOnDay(day);
            const ll = lifeOnDay(day);
            const bb = budgetOnDay(day);
            return (
              <div key={day.toISOString()} className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 min-h-[140px]">
                <button
                  type="button"
                  onClick={() => onOpenDay(day)}
                  className="text-sm font-semibold text-zinc-700 mb-2 w-full text-left hover:text-primary-700"
                >
                  {formatDayLabel(day)}
                </button>
                {ll.map((ev) => (
                  <p key={ev.id} className="text-xs text-violet-900 font-medium truncate">
                    · {ev.title}
                  </p>
                ))}
                {ss.map((s) => (
                  <p key={s.id} className="text-xs text-primary-800 font-medium truncate">
                    · {s.mentorName || s.menteeName || "—"}
                  </p>
                ))}
                {ee.map((e) => (
                  <p key={e.id} className="text-xs text-amber-800 truncate">
                    · {e.lecture?.title || "—"}
                  </p>
                ))}
                {bb.map((b) => (
                  <p key={b.id} className="text-xs text-rose-800 truncate">
                    · {labels.budgetLine(b.kind, b.label, b.amount)}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {view === "day" && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 mb-2">{labels.dayLifeTitle}</h4>
            {lifeOnDay(anchor).length === 0 ? (
              <p className="text-sm text-zinc-500">—</p>
            ) : (
              <ul className="space-y-2">
                {lifeOnDay(anchor).map((ev) => (
                  <li
                    key={ev.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-sm"
                  >
                    <span className="text-violet-950 font-medium">{ev.title}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveEvent(ev.id)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      {labels.deleteBtn}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 mb-2">{labels.sessionsTitle}</h4>
            {sessionsOnDay(anchor).length === 0 ? (
              <p className="text-sm text-zinc-500">—</p>
            ) : (
              <ul className="space-y-2">
                {sessionsOnDay(anchor).map((s) => (
                  <li key={s.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm">
                    {s.date ? new Date(s.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "—"} ·{" "}
                    {labels.sessionWith(s.mentorName || s.menteeName || "—")}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 mb-2">{labels.enrollTitle}</h4>
            {enrollmentsOnDay(anchor).length === 0 ? (
              <p className="text-sm text-zinc-500">—</p>
            ) : (
              <ul className="space-y-2">
                {enrollmentsOnDay(anchor).map((e) => (
                  <li key={e.id} className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm">
                    {e.lecture?.title || "—"}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 mb-2">{labels.budgetTitle}</h4>
            {budgetOnDay(anchor).length === 0 ? (
              <p className="text-sm text-zinc-500">—</p>
            ) : (
              <ul className="space-y-2">
                {budgetOnDay(anchor).map((b) => (
                  <li key={b.id} className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-sm">
                    {labels.budgetLine(b.kind, b.label, b.amount)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

