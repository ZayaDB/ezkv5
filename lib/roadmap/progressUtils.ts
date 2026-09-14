export function getNextStepTitle(
  steps: Array<{ title: string; completed: boolean; active: boolean }>
): string | null {
  const active = steps.find((s) => s.active && !s.completed);
  if (active) return active.title;
  const next = steps.find((s) => !s.completed);
  return next?.title ?? null;
}

export function calcProgress(steps: Array<{ completed: boolean }>): number {
  if (steps.length === 0) return 0;
  const completed = steps.filter((s) => s.completed).length;
  return Math.round((completed / steps.length) * 100);
}
