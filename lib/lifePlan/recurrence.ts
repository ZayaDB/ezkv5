export type RecurrenceType = "none" | "weekly" | "biweekly" | "monthly";

export type RecurrenceInput = {
  type?: unknown;
  interval?: unknown;
  until?: unknown;
  dayOfWeek?: unknown;
  dayOfMonth?: unknown;
};

export type NormalizedRecurrence = {
  type: RecurrenceType;
  interval: number;
  until: Date | null;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
};

export function parseDate(value: unknown): Date | null {
  const d = new Date(String(value ?? ""));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function normalizeRecurrence(input: RecurrenceInput): NormalizedRecurrence {
  const source: any = input;
  const typeRaw = String(typeof source === "string" ? source : source?.type ?? "none");
  const type: RecurrenceType =
    typeRaw === "weekly" || typeRaw === "biweekly" || typeRaw === "monthly" ? typeRaw : "none";
  const intervalRaw = Number(source?.interval ?? 1);
  const interval = Number.isFinite(intervalRaw) && intervalRaw > 0 ? Math.floor(intervalRaw) : 1;
  const until = parseDate(source?.until);
  const dayOfWeekRaw = Number(source?.dayOfWeek);
  const dayOfMonthRaw = Number(source?.dayOfMonth);
  const dayOfWeek =
    Number.isFinite(dayOfWeekRaw) && dayOfWeekRaw >= 0 && dayOfWeekRaw <= 6
      ? Math.floor(dayOfWeekRaw)
      : null;
  const dayOfMonth =
    Number.isFinite(dayOfMonthRaw) && dayOfMonthRaw >= 1 && dayOfMonthRaw <= 31
      ? Math.floor(dayOfMonthRaw)
      : null;
  return { type, interval, until, dayOfWeek, dayOfMonth };
}

function addInterval(date: Date, recurrence: NormalizedRecurrence): Date {
  const out = new Date(date);
  if (recurrence.type === "weekly") {
    out.setDate(out.getDate() + 7 * recurrence.interval);
    return out;
  }
  if (recurrence.type === "biweekly") {
    out.setDate(out.getDate() + 14 * recurrence.interval);
    return out;
  }
  if (recurrence.type === "monthly") {
    out.setMonth(out.getMonth() + recurrence.interval);
    return out;
  }
  return out;
}

export function expandRecurringDates(params: {
  startsAt: Date;
  from: Date;
  to: Date;
  recurrence: NormalizedRecurrence;
  maxIterations?: number;
}): Date[] {
  const { startsAt, from, to, recurrence, maxIterations = 1000 } = params;
  if (recurrence.type === "none") {
    return startsAt >= from && startsAt <= to ? [startsAt] : [];
  }
  const until = recurrence.until && recurrence.until < to ? recurrence.until : to;
  if (startsAt > until) return [];

  const out: Date[] = [];
  let cursor = new Date(startsAt);
  let iterations = 0;
  while (cursor <= until && iterations < maxIterations) {
    if (cursor >= from) out.push(new Date(cursor));
    cursor = addInterval(cursor, recurrence);
    iterations += 1;
  }
  return out;
}
