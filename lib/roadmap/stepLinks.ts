export type MentorHelpCategory =
  | "visa"
  | "housing"
  | "healthcare"
  | "academic"
  | "career"
  | "dailyLife";

type StepHelp = {
  mentor: MentorHelpCategory;
  learn: "courses" | "lectures";
};

const BY_TEMPLATE: Record<string, StepHelp[]> = {
  visa_extension: [
    { mentor: "visa", learn: "lectures" },
    { mentor: "academic", learn: "courses" },
    { mentor: "visa", learn: "lectures" },
    { mentor: "visa", learn: "lectures" },
    { mentor: "visa", learn: "lectures" },
  ],
  settling_korea: [
    { mentor: "visa", learn: "lectures" },
    { mentor: "dailyLife", learn: "lectures" },
    { mentor: "dailyLife", learn: "lectures" },
    { mentor: "healthcare", learn: "lectures" },
  ],
  moving: [
    { mentor: "housing", learn: "lectures" },
    { mentor: "housing", learn: "lectures" },
    { mentor: "housing", learn: "courses" },
    { mentor: "visa", learn: "lectures" },
  ],
  job_prep: [
    { mentor: "visa", learn: "lectures" },
    { mentor: "career", learn: "courses" },
    { mentor: "career", learn: "courses" },
    { mentor: "career", learn: "courses" },
  ],
  d10_prep: [
    { mentor: "visa", learn: "lectures" },
    { mentor: "academic", learn: "courses" },
    { mentor: "career", learn: "courses" },
    { mentor: "visa", learn: "lectures" },
  ],
};

const FALLBACK: StepHelp = { mentor: "dailyLife", learn: "courses" };

export function stepHelp(templateKey: string | null | undefined, index: number): StepHelp {
  const row = templateKey ? BY_TEMPLATE[templateKey]?.[index] : undefined;
  return row ?? FALLBACK;
}

export function helpHref(
  locale: string,
  kind: "mentor" | "learn",
  help: StepHelp
): string {
  if (kind === "mentor") return `/${locale}/mentors?category=${help.mentor}`;
  if (help.learn === "courses") return `/${locale}/my/courses?tab=learn`;
  return `/${locale}/lectures`;
}
