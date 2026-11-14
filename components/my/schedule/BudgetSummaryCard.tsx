"use client";

export default function BudgetSummaryCard({
  labels,
  outSum,
  inSum,
  netSum,
  formatCurrency,
}: {
  labels: { out: string; in: string; net: string };
  outSum: number;
  inSum: number;
  netSum: number;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3 text-sm dark:bg-night-card dark:border-hairline-dark">
      <div className="flex justify-between gap-2">
        <span className="text-zinc-600 dark:text-snow-muted">{labels.out}</span>
        <span className="font-semibold text-rose-700 tabular-nums">{formatCurrency(outSum)}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-zinc-600 dark:text-snow-muted">{labels.in}</span>
        <span className="font-semibold text-emerald-700 tabular-nums">{formatCurrency(inSum)}</span>
      </div>
      <div className="flex justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-hairline-dark">
        <span className="text-zinc-600 dark:text-snow-muted">{labels.net}</span>
        <span className={`font-semibold tabular-nums ${netSum >= 0 ? "text-emerald-800" : "text-rose-800"}`}>
          {formatCurrency(netSum)}
        </span>
      </div>
    </div>
  );
}

