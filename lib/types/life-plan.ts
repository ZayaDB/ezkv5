export type LifeBudgetKind = "expense" | "income";
export type LifeRecurrenceType = "none" | "weekly" | "biweekly" | "monthly";
export type LifeEventCategory =
  | "class"
  | "parttime"
  | "rent"
  | "insurance"
  | "visa"
  | "roadmap"
  | "general"
  | "personal"
  | "work"
  | "health"
  | "other";
export type LifeEventStatus = "planned" | "completed" | "cancelled";

export type LifeRecurrence = {
  type: LifeRecurrenceType;
  interval?: number;
  until?: string | null;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
};

export type LifeBudgetLine = {
  id: string;
  kind: LifeBudgetKind;
  label: string;
  amount: number;
  date: string;
  recurrence: LifeRecurrence;
};

export type LifeBudgetOccurrence = {
  id: string;
  sourceId: string;
  kind: LifeBudgetKind;
  label: string;
  amount: number;
  date: string;
  recurrence: LifeRecurrence;
};

export type LifeEvent = {
  id: string;
  sourceId?: string;
  title: string;
  notes: string;
  startsAt: string;
  endsAt?: string | null;
  category: LifeEventCategory;
  status: LifeEventStatus;
  recurrence: LifeRecurrence;
};
