"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { enrollmentApi, lifePlanApi, sessionApi, type LifeBudgetKind } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";

type ViewMode = "month" | "week" | "day";

type SessionRow = {
  id: string;
  date?: string;
  status?: string;
  mentorName?: string;
  menteeName?: string;
};

type Enr = {
  id: string;
  enrolledAt: string;
  paymentStatus: string;
  lecture: { title?: string; price?: number } | null;
};

type BudgetLine = { id: string; kind: LifeBudgetKind; label: string; amount: number };
type LifeEvent = { id: string; title: string; notes: string; startsAt: string };

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toYMD(d: Date) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inMonth(d: Date, y: number, m: number) {
  return d.getFullYear() === y && d.getMonth() === m;
}

function monthGrid(anchor: Date) {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const first = new Date(y, m, 1);
  const dow = first.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const start = new Date(first);
  start.setDate(first.getDate() + mondayOffset);
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    cells.push({ date: cell, inMonth: cell.getMonth() === m });
  }
  return cells;
}

function weekDays(anchor: Date) {
  const d = startOfDay(anchor);
  const dow = d.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const start = new Date(d);
  start.setDate(d.getDate() + mondayOffset);
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    out.push(x);
  }
  return out;
}

export default function MySchedulePage() {
  const t = useTranslations("myPages.schedule");
  const tDash = useTranslations("dashboardV2");
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [enrollments, setEnrollments] = useState<Enr[]>([]);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));

  const [budgetKind, setBudgetKind] = useState<LifeBudgetKind>("expense");
  const [budgetLabel, setBudgetLabel] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(() => toYMD(new Date()));
  const [eventTime, setEventTime] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [dayModal, setDayModal] = useState<Date | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editBudgetKind, setEditBudgetKind] = useState<LifeBudgetKind>("expense");
  const [editBudgetLabel, setEditBudgetLabel] = useState("");
  const [editBudgetAmount, setEditBudgetAmount] = useState("");
  const [savingBudgetEdit, setSavingBudgetEdit] = useState(false);

  const y = anchor.getFullYear();
  const m = anchor.getMonth();

  const eventRange = useMemo(() => {
    const from = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const to = new Date(y, m + 2, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [y, m]);

  const loadLearning = useCallback(async () => {
    const [sres, eres] = await Promise.all([
      sessionApi.getMine(),
      enrollmentApi.getMine(),
    ]);
    setSessions((sres.data?.sessions as SessionRow[]) || []);
    setEnrollments((eres.data?.enrollments as Enr[]) || []);
  }, []);

  const loadBudget = useCallback(async () => {
    const res = await lifePlanApi.getBudgetLines();
    setBudgetLines((res.data?.lines as BudgetLine[]) || []);
  }, []);

  const loadLifeEvents = useCallback(async () => {
    const res = await lifePlanApi.getLifeEvents(eventRange.from, eventRange.to);
    setLifeEvents((res.data?.events as LifeEvent[]) || []);
  }, [eventRange.from, eventRange.to]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadLearning(), loadBudget(), loadLifeEvents()]);
    setLoading(false);
  }, [loadLearning, loadBudget, loadLifeEvents]);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void loadAll();
  }, [user, loadAll]);

  useEffect(() => {
    if (view === "day") setEventDate(toYMD(anchor));
  }, [anchor, view]);

  const outSum = useMemo(
    () => budgetLines.filter((l) => l.kind === "expense").reduce((a, l) => a + l.amount, 0),
    [budgetLines]
  );
  const inSum = useMemo(
    () => budgetLines.filter((l) => l.kind === "income").reduce((a, l) => a + l.amount, 0),
    [budgetLines]
  );
  const netSum = inSum - outSum;

  const sessionsOnDay = (day: Date) =>
    sessions.filter((s) => {
      if (!s.date) return false;
      return sameDay(new Date(s.date), day);
    });

  const enrollmentsOnDay = (day: Date) =>
    enrollments.filter((e) => {
      if (!e.enrolledAt) return false;
      return sameDay(startOfDay(new Date(e.enrolledAt)), day);
    });

  const lifeOnDay = (day: Date) =>
    lifeEvents.filter((ev) => sameDay(new Date(ev.startsAt), day));

  const goPrev = () => {
    const d = new Date(anchor);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setAnchor(startOfDay(d));
  };

  const goNext = () => {
    const d = new Date(anchor);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setAnchor(startOfDay(d));
  };

  const goToday = () => setAnchor(startOfDay(new Date()));

  const grid = useMemo(() => monthGrid(anchor), [anchor]);
  const week = useMemo(() => weekDays(anchor), [anchor]);

  const titleRange =
    view === "month"
      ? fmt.dateTime(anchor, { month: "long", year: "numeric" })
      : view === "week"
        ? `${fmt.dateTime(week[0], { month: "short", day: "numeric" })} – ${fmt.dateTime(week[6], {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`
        : fmt.dateTime(anchor, { dateStyle: "full" });

  const addBudget = async () => {
    const label = budgetLabel.trim();
    const amount = Number(String(budgetAmount).replace(/,/g, ""));
    if (!label || !Number.isFinite(amount) || amount < 0) return;
    setSavingBudget(true);
    const res = await lifePlanApi.addBudgetLine({ kind: budgetKind, label, amount });
    setSavingBudget(false);
    if (!res.error) {
      setBudgetLabel("");
      setBudgetAmount("");
      await loadBudget();
    }
  };

  const removeBudget = async (id: string) => {
    await lifePlanApi.deleteBudgetLine(id);
    await loadBudget();
  };

  const startEditBudget = (line: BudgetLine) => {
    setEditingBudgetId(line.id);
    setEditBudgetKind(line.kind);
    setEditBudgetLabel(line.label);
    setEditBudgetAmount(String(line.amount));
  };

  const cancelEditBudget = () => {
    setEditingBudgetId(null);
  };

  const saveBudgetEdit = async () => {
    if (!editingBudgetId) return;
    const label = editBudgetLabel.trim();
    const amount = Number(String(editBudgetAmount).replace(/,/g, ""));
    if (!label || !Number.isFinite(amount) || amount < 0) return;
    setSavingBudgetEdit(true);
    const res = await lifePlanApi.updateBudgetLine(editingBudgetId, {
      kind: editBudgetKind,
      label,
      amount,
    });
    setSavingBudgetEdit(false);
    if (!res.error) {
      setEditingBudgetId(null);
      await loadBudget();
    }
  };

  const dayPreviewLines = (day: Date) => {
    const ll = lifeOnDay(day);
    const ss = sessionsOnDay(day);
    const ee = enrollmentsOnDay(day);
    const out: string[] = [];
    for (const ev of ll) {
      if (out.length >= 2) break;
      out.push(ev.title);
    }
    for (const s of ss) {
      if (out.length >= 2) break;
      out.push(t("sessionWith", { name: s.mentorName || s.menteeName || "—" }));
    }
    for (const e of ee) {
      if (out.length >= 2) break;
      out.push(e.lecture?.title || "—");
    }
    return out;
  };

  const addEvent = async () => {
    const title = eventTitle.trim();
    if (!title) return;
    const [yy, mo, dd] = eventDate.split("-").map((x) => parseInt(x, 10));
    const timeRaw = eventTime.trim() || "09:00";
    const [th, tm] = timeRaw.split(":").map((x) => parseInt(x, 10));
    const startsAt = new Date(yy, mo - 1, dd, Number.isFinite(th) ? th : 9, Number.isFinite(tm) ? tm : 0, 0, 0);
    if (Number.isNaN(startsAt.getTime())) return;
    setSavingEvent(true);
    const res = await lifePlanApi.addLifeEvent({
      title,
      startsAt: startsAt.toISOString(),
      notes: eventNotes.trim() || undefined,
    });
    setSavingEvent(false);
    if (!res.error) {
      setEventTitle("");
      setEventNotes("");
      await loadLifeEvents();
    }
  };

  const removeEvent = async (id: string) => {
    await lifePlanApi.deleteLifeEvent(id);
    await loadLifeEvents();
  };

  if (authLoading || !user) {
    return <LoadingState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  const eventsThisMonth = lifeEvents.filter((ev) => inMonth(new Date(ev.startsAt), y, m));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm text-zinc-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 ring-1 ring-zinc-200">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                view === v ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600"
              }`}
            >
              {v === "month" ? t("viewMonth") : v === "week" ? t("viewWeek") : t("viewDay")}
            </button>
          ))}
        </div>
      </div>

      <PlatformCard padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">{titleRange}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {t("prev")}
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {t("today")}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {t("next")}
            </button>
          </div>
        </div>

        <div className="text-xs text-zinc-500 mb-4 space-y-1">
          <p>{t("learningSectionHelp")}</p>
          {view === "month" ? <p>{t("dayModalHint")}</p> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-sm font-semibold text-zinc-800">{t("learningSectionTitle")}</h3>
            {view === "month" && (
              <div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-zinc-500 mb-2">
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
                    const isToday = sameDay(date, startOfDay(new Date()));
                    const previews = dayPreviewLines(date);
                    const hasAny = ll.length + ss.length + ee.length > 0;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDayModal(date)}
                        className={`min-h-[80px] rounded-lg border p-1.5 text-left transition hover:bg-zinc-50/80 ${
                          inMonth ? "bg-white border-zinc-200" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                        } ${isToday ? "ring-2 ring-primary-400" : ""}`}
                      >
                        <div className="text-xs font-semibold text-zinc-800">{date.getDate()}</div>
                        <div className="mt-1 space-y-0.5 min-h-[2.25rem]">
                          {previews.map((line, idx) => (
                            <p key={idx} className="text-[10px] leading-tight text-zinc-700 truncate" title={line}>
                              {line}
                            </p>
                          ))}
                          {hasAny && previews.length === 0 && (
                            <p className="text-[10px] text-zinc-500">·</p>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {ll.length > 0 && (
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" title={t("legendLife")} />
                          )}
                          {ss.length > 0 && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-600" title={t("legendSession")} />
                          )}
                          {ee.length > 0 && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title={t("legendEnrollment")} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-600" /> {t("legendLife")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary-600" /> {t("legendSession")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> {t("legendEnrollment")}
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
                  return (
                    <div
                      key={day.toISOString()}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 min-h-[140px]"
                    >
                      <button
                        type="button"
                        onClick={() => setDayModal(day)}
                        className="text-xs font-semibold text-zinc-700 mb-2 w-full text-left hover:text-primary-700"
                      >
                        {fmt.dateTime(day, { weekday: "short", day: "numeric", month: "short" })}
                      </button>
                      {ll.map((ev) => (
                        <p key={ev.id} className="text-[11px] text-violet-900 font-medium truncate">
                          · {ev.title}
                        </p>
                      ))}
                      {ss.map((s) => (
                        <p key={s.id} className="text-[11px] text-primary-800 font-medium truncate">
                          · {s.mentorName || s.menteeName || "—"}
                        </p>
                      ))}
                      {ee.map((e) => (
                        <p key={e.id} className="text-[11px] text-amber-800 truncate">
                          · {e.lecture?.title || "—"}
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
                  <h4 className="text-sm font-semibold text-zinc-800 mb-2">{t("dayLifeTitle")}</h4>
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
                            onClick={() => void removeEvent(ev.id)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            {t("deleteBtn")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-800 mb-2">{t("sessionsTitle")}</h4>
                  {sessionsOnDay(anchor).length === 0 ? (
                    <p className="text-sm text-zinc-500">—</p>
                  ) : (
                    <ul className="space-y-2">
                      {sessionsOnDay(anchor).map((s) => (
                        <li
                          key={s.id}
                          className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm"
                        >
                          {s.date
                            ? fmt.dateTime(new Date(s.date), { timeStyle: "short" })
                            : "—"}{" "}
                          · {t("sessionWith", { name: s.mentorName || s.menteeName || "—" })}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-800 mb-2">{t("enrollTitle")}</h4>
                  {enrollmentsOnDay(anchor).length === 0 ? (
                    <p className="text-sm text-zinc-500">—</p>
                  ) : (
                    <ul className="space-y-2">
                      {enrollmentsOnDay(anchor).map((e) => (
                        <li
                          key={e.id}
                          className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm"
                        >
                          {e.lecture?.title || "—"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">{t("lifeBudgetTitle")}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{t("paymentsSeparateNote")}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-600">{t("lifeOutTotal")}</span>
                <span className="font-semibold text-rose-700 tabular-nums">
                  {fmt.number(outSum, {
                    style: "currency",
                    currency: "KRW",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-600">{t("lifeInTotal")}</span>
                <span className="font-semibold text-emerald-700 tabular-nums">
                  {fmt.number(inSum, {
                    style: "currency",
                    currency: "KRW",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between gap-2 border-t border-zinc-100 pt-3">
                <span className="text-zinc-600">{t("lifeNet")}</span>
                <span
                  className={`font-semibold tabular-nums ${netSum >= 0 ? "text-emerald-800" : "text-rose-800"}`}
                >
                  {fmt.number(netSum, {
                    style: "currency",
                    currency: "KRW",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-zinc-200">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-zinc-100 text-left text-xs font-semibold text-zinc-600">
                  <tr>
                    <th className="px-3 py-2 border-b border-zinc-200">{t("budgetTableKind")}</th>
                    <th className="px-3 py-2 border-b border-zinc-200">{t("budgetTableLabel")}</th>
                    <th className="px-3 py-2 border-b border-zinc-200 text-right">{t("budgetTableAmount")}</th>
                    <th className="px-3 py-2 border-b border-zinc-200 text-right w-[1%] whitespace-nowrap">
                      {t("budgetTableActions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetLines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-zinc-500 text-xs">
                        —
                      </td>
                    </tr>
                  ) : (
                    budgetLines.map((line) => (
                      <tr key={line.id} className="border-b border-zinc-100 last:border-0 bg-white">
                        <td className="px-3 py-2 align-top">
                          {editingBudgetId === line.id ? (
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => setEditBudgetKind("expense")}
                                className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                  editBudgetKind === "expense"
                                    ? "bg-rose-600 text-white"
                                    : "bg-zinc-100 text-zinc-600"
                                }`}
                              >
                                {t("budgetKindExpense")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditBudgetKind("income")}
                                className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                  editBudgetKind === "income"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-zinc-100 text-zinc-600"
                                }`}
                              >
                                {t("budgetKindIncome")}
                              </button>
                            </div>
                          ) : (
                            <span className={line.kind === "income" ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>
                              {line.kind === "income" ? t("budgetKindIncome") : t("budgetKindExpense")}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {editingBudgetId === line.id ? (
                            <input
                              value={editBudgetLabel}
                              onChange={(e) => setEditBudgetLabel(e.target.value)}
                              className="w-full min-w-[120px] rounded border border-zinc-200 px-2 py-1 text-sm"
                            />
                          ) : (
                            <span className="text-zinc-900">{line.label}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top text-right tabular-nums">
                          {editingBudgetId === line.id ? (
                            <input
                              value={editBudgetAmount}
                              onChange={(e) => setEditBudgetAmount(e.target.value)}
                              inputMode="numeric"
                              className="w-full max-w-[140px] ml-auto rounded border border-zinc-200 px-2 py-1 text-sm text-right"
                            />
                          ) : (
                            <span className="font-semibold text-zinc-900">
                              {fmt.number(line.amount, {
                                style: "currency",
                                currency: "KRW",
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top text-right whitespace-nowrap">
                          {editingBudgetId === line.id ? (
                            <div className="flex flex-col gap-1 items-end">
                              <button
                                type="button"
                                disabled={savingBudgetEdit}
                                onClick={() => void saveBudgetEdit()}
                                className="text-xs font-semibold text-primary-600 hover:underline disabled:opacity-50"
                              >
                                {savingBudgetEdit ? "…" : t("budgetSaveBtn")}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditBudget}
                                className="text-xs font-semibold text-zinc-500 hover:underline"
                              >
                                {t("budgetCancelBtn")}
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1 items-end">
                              <button
                                type="button"
                                onClick={() => startEditBudget(line)}
                                className="text-xs font-semibold text-primary-600 hover:underline"
                              >
                                {t("budgetEditBtn")}
                              </button>
                              <button
                                type="button"
                                onClick={() => void removeBudget(line.id)}
                                className="text-xs font-semibold text-red-600 hover:underline"
                              >
                                {t("deleteBtn")}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-dashed border-zinc-300 p-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setBudgetKind("expense")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    budgetKind === "expense" ? "bg-rose-600 text-white" : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {t("budgetKindExpense")}
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetKind("income")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    budgetKind === "income" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {t("budgetKindIncome")}
                </button>
              </div>
              <input
                value={budgetLabel}
                onChange={(e) => setBudgetLabel(e.target.value)}
                placeholder={t("budgetLabelPh")}
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
              />
              <input
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder={t("budgetAmountPh")}
                inputMode="numeric"
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={savingBudget}
                onClick={() => void addBudget()}
                className="w-full rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {savingBudget ? "…" : t("addBudgetBtn")}
              </button>
            </div>

            <Link
              href={`/${locale}/my/receipts`}
              className="inline-block text-sm font-semibold text-primary-600 hover:underline"
            >
              {t("goReceiptsLink")} →
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">{t("lifeEventsTitle")}</h3>
            <p className="text-xs text-zinc-500 mt-1">{t("lifeEventsHelp")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 space-y-2">
              <input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder={t("eventTitlePh")}
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-semibold uppercase text-zinc-500">
                    {t("eventDateLabel")}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-semibold uppercase text-zinc-500">
                    {t("eventTimeLabel")}
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder={t("eventNotesPh")}
                rows={2}
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={savingEvent}
                onClick={() => void addEvent()}
                className="rounded-lg bg-violet-700 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
              >
                {savingEvent ? "…" : t("addEventBtn")}
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-2">
                {fmt.dateTime(anchor, { month: "long", year: "numeric" })} — {t("legendLife")}
              </p>
              <ul className="space-y-2 max-h-56 overflow-y-auto">
                {eventsThisMonth.length === 0 ? (
                  <p className="text-sm text-zinc-500">—</p>
                ) : (
                  eventsThisMonth.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-zinc-900">{ev.title}</p>
                        <p className="text-xs text-zinc-500">
                          {fmt.dateTime(new Date(ev.startsAt), {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeEvent(ev.id)}
                        className="text-xs font-semibold text-red-600 hover:underline shrink-0"
                      >
                        {t("deleteBtn")}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </PlatformCard>

      {sessions.length === 0 && enrollments.length === 0 && lifeEvents.length === 0 ? (
        <PlatformCard>
          <p className="text-sm text-zinc-600">{t("empty")}</p>
          <Link
            href={`/${locale}/mentors`}
            className="inline-block mt-4 text-sm font-semibold text-primary-600 hover:underline"
          >
            {tDash("mentee.quick2Title")}
          </Link>
        </PlatformCard>
      ) : null}

      {dayModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="presentation"
          onClick={() => setDayModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-zinc-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-zinc-900">{t("dayModalTitle")}</h3>
              <button
                type="button"
                onClick={() => setDayModal(null)}
                className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                {t("dayModalClose")}
              </button>
            </div>
            <p className="text-sm text-zinc-600">
              {fmt.dateTime(dayModal, { dateStyle: "full" })}
            </p>
            {lifeOnDay(dayModal).length === 0 &&
            sessionsOnDay(dayModal).length === 0 &&
            enrollmentsOnDay(dayModal).length === 0 ? (
              <p className="text-sm text-zinc-500">{t("dayModalEmpty")}</p>
            ) : (
              <div className="space-y-5 text-sm">
                {lifeOnDay(dayModal).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-violet-700 mb-2">{t("dayLifeTitle")}</h4>
                    <ul className="space-y-2">
                      {lifeOnDay(dayModal).map((ev) => (
                        <li key={ev.id} className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2">
                          <p className="font-medium text-zinc-900">{ev.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {fmt.dateTime(new Date(ev.startsAt), { timeStyle: "short" })}
                          </p>
                          {ev.notes ? (
                            <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">{ev.notes}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {sessionsOnDay(dayModal).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-primary-700 mb-2">{t("sessionsTitle")}</h4>
                    <ul className="space-y-2">
                      {sessionsOnDay(dayModal).map((s) => (
                        <li key={s.id} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                          {s.date
                            ? fmt.dateTime(new Date(s.date), { timeStyle: "short" })
                            : "—"}{" "}
                          · {t("sessionWith", { name: s.mentorName || s.menteeName || "—" })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {enrollmentsOnDay(dayModal).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-amber-800 mb-2">{t("enrollTitle")}</h4>
                    <ul className="space-y-2">
                      {enrollmentsOnDay(dayModal).map((e) => (
                        <li key={e.id} className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
                          {e.lecture?.title || "—"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
