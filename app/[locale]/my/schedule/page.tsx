"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  lifePlanApi,
  type LifeBudgetKind,
  type LifeBudgetLine,
  type LifeBudgetOccurrence,
  type LifeEvent,
  type LifeEventCategory,
  type LifeEventStatus,
  type LifeRecurrence,
} from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import { getCachedEnrollments, getCachedSessions } from "@/lib/hooks/useMyDataCache";
import ViewModeToggle from "@/components/my/schedule/ViewModeToggle";
import BudgetSummaryCard from "@/components/my/schedule/BudgetSummaryCard";
import ScheduleLearningPanel from "@/components/my/schedule/ScheduleLearningPanel";

type ViewMode = "month" | "week" | "day";

type SessionRow = {
  id: string;
  date?: string;
  mentorName?: string;
  menteeName?: string;
};

type Enr = {
  id: string;
  enrolledAt: string;
  lecture: { title?: string } | null;
};

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

function formatYmdDisplay(ymd: string) {
  const [yy, mm, dd] = ymd.split("-");
  if (!yy || !mm || !dd) return "-";
  return `${yy.slice(2)}. ${Number(mm)}. ${Number(dd)}.`;
}

function parseSafeDate(value: string | Date | undefined | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
  const [budgetLines, setBudgetLines] = useState<LifeBudgetLine[]>([]);
  const [budgetOccurrences, setBudgetOccurrences] = useState<LifeBudgetOccurrence[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [dayModal, setDayModal] = useState<Date | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(() => toYMD(new Date()));
  const [eventTime, setEventTime] = useState("09:00");
  const [eventNotes, setEventNotes] = useState("");
  const [eventCategory, setEventCategory] = useState<LifeEventCategory>("other");
  const [eventStatus, setEventStatus] = useState<LifeEventStatus>("planned");
  const [eventRecurrence, setEventRecurrence] = useState<LifeRecurrence["type"]>("none");
  const [editingEventSourceId, setEditingEventSourceId] = useState<string | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  const [budgetKind, setBudgetKind] = useState<LifeBudgetKind>("expense");
  const [budgetLabel, setBudgetLabel] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetDate, setBudgetDate] = useState(() => toYMD(new Date()));
  const [budgetRecurrence, setBudgetRecurrence] = useState<LifeRecurrence["type"]>("none");
  const [budgetWeekday, setBudgetWeekday] = useState(String(new Date().getDay()));
  const [budgetMonthday, setBudgetMonthday] = useState(String(new Date().getDate()));
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [savingBudget, setSavingBudget] = useState(false);

  const y = anchor.getFullYear();
  const m = anchor.getMonth();

  const range = useMemo(() => {
    const from = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const to = new Date(y, m + 2, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [y, m]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [sessionsRows, enrollmentRows, budgetRes, eventsRes] = await Promise.all([
      getCachedSessions(),
      getCachedEnrollments(),
      lifePlanApi.getBudgetLines({ fromIso: range.from, toIso: range.to }),
      lifePlanApi.getLifeEvents(range.from, range.to),
    ]);
    setSessions((sessionsRows as SessionRow[]) || []);
    setEnrollments((enrollmentRows as Enr[]) || []);
    setBudgetLines(budgetRes.data?.lines || []);
    setBudgetOccurrences(budgetRes.data?.occurrences || []);
    setLifeEvents(eventsRes.data?.events || []);
    setLoading(false);
  }, [range.from, range.to]);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void loadAll();
  }, [user, loadAll]);

  const sessionsOnDay = (day: Date) => sessions.filter((s) => s.date && sameDay(new Date(s.date), day));
  const enrollmentsOnDay = (day: Date) =>
    enrollments.filter((e) => e.enrolledAt && sameDay(startOfDay(new Date(e.enrolledAt)), day));
  const lifeOnDay = (day: Date) => lifeEvents.filter((ev) => sameDay(new Date(ev.startsAt), day));
  const budgetOnDay = (day: Date) => budgetOccurrences.filter((b) => sameDay(new Date(b.date), day));

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

  const monthBudget = useMemo(
    () => budgetOccurrences.filter((b) => inMonth(new Date(b.date), y, m)),
    [budgetOccurrences, y, m]
  );
  const outSum = monthBudget.filter((b) => b.kind === "expense").reduce((acc, b) => acc + b.amount, 0);
  const inSum = monthBudget.filter((b) => b.kind === "income").reduce((acc, b) => acc + b.amount, 0);

  const recurrenceLabel = (type: LifeRecurrence["type"] | undefined) => {
    if (type === "weekly") return "매주";
    if (type === "biweekly") return "격주";
    if (type === "monthly") return "매월";
    return "반복 없음";
  };

  const weekdayLabel = (day: number) => ["일", "월", "화", "수", "목", "금", "토"][day] || "-";

  const buildBudgetIsoDate = () => {
    const base = parseSafeDate(`${budgetDate}T09:00:00`) || new Date();
    if (budgetRecurrence === "none") {
      // 날짜만 선택한 비반복 항목은 타임존 오차를 피하기 위해 UTC 정오로 고정 저장
      return new Date(`${budgetDate}T12:00:00.000Z`).toISOString();
    }
    // 반복 일정도 "사용자가 직접 선택한 날짜"를 시작 기준으로 저장한다.
    if (budgetRecurrence === "monthly") {
      const target = new Date(
        base.getFullYear(),
        base.getMonth(),
        Number(budgetMonthday),
        base.getHours(),
        base.getMinutes(),
        0,
        0
      );
      return target.toISOString();
    }
    const targetWeekday = Number(budgetWeekday);
    const diff = targetWeekday - base.getDay();
    const target = new Date(base);
    target.setDate(base.getDate() + diff);
    target.setHours(base.getHours(), base.getMinutes(), 0, 0);
    return target.toISOString();
  };

  const budgetDateDisplay = (line: LifeBudgetLine) => {
    const d = parseSafeDate(line.date);
    const recType = line.recurrence?.type;
    if (recType === "weekly") {
      const wd = line.recurrence?.dayOfWeek ?? (d ? d.getDay() : null);
      return `매주 ${wd != null ? weekdayLabel(wd) : "-"}`;
    }
    if (recType === "biweekly") {
      const wd = line.recurrence?.dayOfWeek ?? (d ? d.getDay() : null);
      return `격주 ${wd != null ? weekdayLabel(wd) : "-"}`;
    }
    if (recType === "monthly") {
      const md = line.recurrence?.dayOfMonth ?? (d ? d.getDate() : null);
      return `매월 ${md ?? "-"}일`;
    }
    if (!d) return "-";
    const ymd = d.toISOString().slice(0, 10);
    return formatYmdDisplay(ymd);
  };

  const addOrUpdateEvent = async () => {
    const title = eventTitle.trim();
    if (!title) return;
    const startsAt = new Date(`${eventDate}T${eventTime || "09:00"}:00`);
    if (Number.isNaN(startsAt.getTime())) return;
    setSavingEvent(true);
    const payload = {
      title,
      startsAt: startsAt.toISOString(),
      notes: eventNotes.trim() || undefined,
      category: eventCategory,
      status: eventStatus,
      recurrence: { type: eventRecurrence },
    };
    const res = editingEventSourceId
      ? await lifePlanApi.updateLifeEvent(editingEventSourceId, payload)
      : await lifePlanApi.addLifeEvent(payload);
    setSavingEvent(false);
    if (!res.error) {
      setEventTitle("");
      setEventNotes("");
      setEventCategory("other");
      setEventStatus("planned");
      setEventRecurrence("none");
      setEditingEventSourceId(null);
      setDayModal(null);
      await loadAll();
    }
  };

  const startEditEvent = (ev: LifeEvent) => {
    const d = new Date(ev.startsAt);
    setEditingEventSourceId(ev.sourceId || ev.id);
    setEventTitle(ev.title);
    setEventDate(toYMD(d));
    setEventTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setEventNotes(ev.notes || "");
    setEventCategory(ev.category || "other");
    setEventStatus(ev.status || "planned");
    setEventRecurrence(ev.recurrence?.type || "none");
  };

  const removeEvent = async (id: string) => {
    await lifePlanApi.deleteLifeEvent(id);
    await loadAll();
  };

  const addBudget = async () => {
    const label = budgetLabel.trim();
    const amount = Number(String(budgetAmount).replace(/,/g, ""));
    if (!label || !Number.isFinite(amount) || amount < 0) return;
    setSavingBudget(true);
    const payload = {
      kind: budgetKind,
      label,
      amount,
      date: buildBudgetIsoDate(),
      recurrence: {
        type: budgetRecurrence,
        dayOfWeek:
          budgetRecurrence === "weekly" || budgetRecurrence === "biweekly"
            ? Number(budgetWeekday)
            : null,
        dayOfMonth: budgetRecurrence === "monthly" ? Number(budgetMonthday) : null,
      },
    };
    const res = editingBudgetId
      ? await lifePlanApi.updateBudgetLine(editingBudgetId, payload)
      : await lifePlanApi.addBudgetLine(payload);
    setSavingBudget(false);
    if (!res.error) {
      setBudgetLabel("");
      setBudgetAmount("");
      setBudgetDate(toYMD(new Date()));
      setBudgetRecurrence("none");
      setBudgetWeekday(String(new Date().getDay()));
      setBudgetMonthday(String(new Date().getDate()));
      setEditingBudgetId(null);
      await loadAll();
    }
  };

  const removeBudget = async (id: string) => {
    await lifePlanApi.deleteBudgetLine(id);
    await loadAll();
  };

  const startEditBudget = (line: LifeBudgetLine) => {
    const d = parseSafeDate(line.date) || new Date();
    setEditingBudgetId(line.id);
    setBudgetKind(line.kind);
    setBudgetLabel(line.label);
    setBudgetAmount(String(line.amount));
    setBudgetDate(toYMD(d));
    setBudgetRecurrence(line.recurrence?.type || "none");
    setBudgetWeekday(String(line.recurrence?.dayOfWeek ?? d.getDay()));
    setBudgetMonthday(String(line.recurrence?.dayOfMonth ?? d.getDate()));
  };

  if (authLoading || !user || loading) return <LoadingState />;

  const grid = monthGrid(anchor);
  const week = weekDays(anchor);
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

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
          <p className="text-base text-zinc-600 mt-1">{t("subtitle")}</p>
        </div>
        <ViewModeToggle view={view} onChange={setView} labels={{ month: t("viewMonth"), week: t("viewWeek"), day: t("viewDay") }} />
      </div>

      <PlatformCard padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">{titleRange}</h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={goPrev} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">{t("prev")}</button>
            <button type="button" onClick={() => setAnchor(startOfDay(new Date()))} className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700">{t("today")}</button>
            <button type="button" onClick={goNext} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">{t("next")}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScheduleLearningPanel
            view={view}
            labels={{
              title: "",
              legendLife: t("legendLife"),
              legendSession: t("legendSession"),
              legendEnrollment: t("legendEnrollment"),
              legendBudget: t("lifeBudgetTitle"),
              dayLifeTitle: t("dayLifeTitle"),
              sessionsTitle: t("sessionsTitle"),
              enrollTitle: t("enrollTitle"),
              budgetTitle: t("lifeBudgetTitle"),
              deleteBtn: t("deleteBtn"),
              sessionWith: (name) => t("sessionWith", { name }),
              budgetLine: (kind, label, amount) =>
                `${kind === "income" ? "수입" : "지출"} · ${label} (${fmt.number(amount, {
                  style: "currency",
                  currency: "KRW",
                  maximumFractionDigits: 0,
                })})`,
            }}
            grid={grid}
            week={week}
            anchor={anchor}
            formatDayLabel={(day) => fmt.dateTime(day, { weekday: "short", day: "numeric", month: "short" })}
            isTodayDate={(day) => sameDay(day, startOfDay(new Date()))}
            sessionsOnDay={sessionsOnDay}
            enrollmentsOnDay={enrollmentsOnDay}
            lifeOnDay={lifeOnDay}
            budgetOnDay={budgetOnDay}
            onOpenDay={setDayModal}
            onRemoveEvent={(id) => void removeEvent(id)}
          />

          <div className="space-y-4">
            <BudgetSummaryCard
              labels={{ out: t("lifeOutTotal"), in: t("lifeInTotal"), net: t("lifeNet") }}
              outSum={outSum}
              inSum={inSum}
              netSum={inSum - outSum}
              formatCurrency={(value) => fmt.number(value, { style: "currency", currency: "KRW", maximumFractionDigits: 0 })}
            />

            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-zinc-200">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-zinc-100 text-left text-sm font-semibold text-zinc-600">
                  <tr>
                    <th className="px-3 py-2 border-b border-zinc-200">{t("budgetTableKind")}</th>
                    <th className="px-3 py-2 border-b border-zinc-200">{t("budgetTableLabel")}</th>
                    <th className="px-3 py-2 border-b border-zinc-200">{t("eventDateLabel")}</th>
                    <th className="px-3 py-2 border-b border-zinc-200 text-right">{t("budgetTableAmount")}</th>
                    <th className="px-3 py-2 border-b border-zinc-200 text-right">{t("budgetTableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetLines.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-zinc-500 text-xs">—</td></tr>
                  ) : (
                    budgetLines.map((line) => (
                      <tr key={line.id} className="border-b border-zinc-100 last:border-0 bg-white">
                        <td className="px-3 py-2">
                          <span className={line.kind === "income" ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>
                            {line.kind === "income" ? t("budgetKindIncome") : t("budgetKindExpense")}
                          </span>
                        </td>
                        <td className="px-3 py-2">{line.label}</td>
                        <td className="px-3 py-2 text-sm text-zinc-600">{budgetDateDisplay(line)}<br />{recurrenceLabel(line.recurrence?.type)}</td>
                        <td className="px-3 py-2 text-right">{fmt.number(line.amount, { style: "currency", currency: "KRW", maximumFractionDigits: 0 })}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditBudget(line)}
                              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-primary-700"
                              aria-label="수정"
                              title="수정"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void removeBudget(line.id)}
                              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-red-600"
                              aria-label="삭제"
                              title="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-dashed border-zinc-300 p-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setBudgetKind("expense")} className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold ${budgetKind === "expense" ? "bg-rose-600 text-white" : "bg-zinc-100 text-zinc-700"}`}>{t("budgetKindExpense")}</button>
                <button type="button" onClick={() => setBudgetKind("income")} className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold ${budgetKind === "income" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700"}`}>{t("budgetKindIncome")}</button>
              </div>
              <input value={budgetLabel} onChange={(e) => setBudgetLabel(e.target.value)} placeholder={t("budgetLabelPh")} className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm" />
              <input value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder={t("budgetAmountPh")} inputMode="numeric" className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm" />
              <input
                type="date"
                value={budgetDate}
                onChange={(e) => {
                  const next = e.target.value;
                  setBudgetDate(next);
                  const d = parseSafeDate(`${next}T09:00:00`);
                  if (!d) return;
                  if (budgetRecurrence === "monthly") setBudgetMonthday(String(d.getDate()));
                  if (budgetRecurrence === "weekly" || budgetRecurrence === "biweekly") {
                    setBudgetWeekday(String(d.getDay()));
                  }
                }}
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
              />
              {budgetRecurrence === "monthly" ? (
                <select value={budgetMonthday} onChange={(e) => setBudgetMonthday(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={String(day)}>{`매월 ${day}일`}</option>
                  ))}
                </select>
              ) : null}
              {budgetRecurrence === "weekly" || budgetRecurrence === "biweekly" ? (
                <select value={budgetWeekday} onChange={(e) => setBudgetWeekday(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <option key={day} value={String(day)}>{`${budgetRecurrence === "weekly" ? "매주" : "격주"} ${weekdayLabel(day)}`}</option>
                  ))}
                </select>
              ) : null}
              <select
                value={budgetRecurrence}
                onChange={(e) => {
                  const next = e.target.value as LifeRecurrence["type"];
                  setBudgetRecurrence(next);
                  const d = parseSafeDate(`${budgetDate}T09:00:00`) || new Date();
                  if (next === "monthly") setBudgetMonthday(String(d.getDate()));
                  if (next === "weekly" || next === "biweekly") setBudgetWeekday(String(d.getDay()));
                }}
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
              >
                <option value="none">반복 없음</option><option value="weekly">매주</option><option value="biweekly">격주</option><option value="monthly">매월</option>
              </select>
              <button type="button" disabled={savingBudget} onClick={() => void addBudget()} className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60">{savingBudget ? "…" : editingBudgetId ? "수정 저장" : t("addBudgetBtn")}</button>
            </div>

            <Link href={`/${locale}/my/receipts`} className="inline-block text-sm font-semibold text-primary-600 hover:underline">{t("goReceiptsLink")} →</Link>
          </div>
        </div>
      </PlatformCard>

      {sessions.length === 0 && enrollments.length === 0 && lifeEvents.length === 0 && budgetOccurrences.length === 0 ? (
        <PlatformCard>
          <p className="text-sm text-zinc-600">{t("empty")}</p>
          <Link href={`/${locale}/mentors`} className="inline-block mt-4 text-sm font-semibold text-primary-600 hover:underline">{tDash("mentee.quick2Title")}</Link>
        </PlatformCard>
      ) : null}

      {dayModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setDayModal(null)} role="presentation">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-zinc-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-zinc-900">{fmt.dateTime(dayModal, { dateStyle: "full" })}</h3>
              <button type="button" onClick={() => setDayModal(null)} className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">{t("dayModalClose")}</button>
            </div>

            <div className="space-y-2 text-sm">
              {lifeOnDay(dayModal).map((ev) => (
                <div key={ev.id} className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2">
                  <p className="font-medium text-zinc-900">{ev.title}</p>
                  <p className="text-sm text-zinc-500">{fmt.dateTime(new Date(ev.startsAt), { timeStyle: "short" })} · {ev.category} · {ev.status}</p>
                  <div className="mt-1 flex gap-3 text-sm">
                    <button type="button" className="font-semibold text-primary-700 hover:underline" onClick={() => startEditEvent(ev)}>수정</button>
                    <button type="button" className="font-semibold text-red-600 hover:underline" onClick={() => void removeEvent(ev.sourceId || ev.id)}>{t("deleteBtn")}</button>
                  </div>
                </div>
              ))}
              {budgetOnDay(dayModal).map((b) => (
                <div key={b.id} className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2">
                  <p className="font-medium text-zinc-900">{b.kind === "income" ? "수입" : "지출"} · {b.label}</p>
                  <p className="text-sm text-zinc-500">{fmt.number(b.amount, { style: "currency", currency: "KRW", maximumFractionDigits: 0 })} · {recurrenceLabel(b.recurrence?.type)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-4 space-y-2">
              <h4 className="text-sm font-bold text-zinc-900">일정 직접 입력</h4>
              <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder={t("eventTitlePh")} className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm" />
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select value={eventCategory} onChange={(e) => setEventCategory(e.target.value as LifeEventCategory)} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm">
                  <option value="personal">개인</option><option value="work">회의</option><option value="health">병원</option><option value="parttime">아르바이트</option><option value="other">기타</option>
                </select>
                <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value as LifeEventStatus)} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm">
                  <option value="planned">예정</option><option value="completed">완료</option><option value="cancelled">취소</option>
                </select>
                <select value={eventRecurrence} onChange={(e) => setEventRecurrence(e.target.value as LifeRecurrence["type"])} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm">
                  <option value="none">반복 없음</option><option value="weekly">매주</option><option value="biweekly">격주</option><option value="monthly">매월</option>
                </select>
              </div>
              <textarea value={eventNotes} onChange={(e) => setEventNotes(e.target.value)} placeholder={t("eventNotesPh")} rows={2} className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm" />
              <button type="button" disabled={savingEvent} onClick={() => void addOrUpdateEvent()} className="w-full rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60">
                {savingEvent ? "…" : editingEventSourceId ? "일정 수정" : t("addEventBtn")}
              </button>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}

