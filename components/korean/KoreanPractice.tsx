"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react";
import { Notice, PageIntro, StatTile, ui } from "@/components/lnk/ui";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  KOREAN_QUESTIONS,
  LEVEL_TEST_IDS,
  levelFromScore,
  questionById,
  type KoreanCategory,
  type KoreanQuestion,
  type Tri,
} from "@/lib/korean/questions";

/* ───────── 저장 (지금은 이 기기에 저장, 나중에 DB로 옮김) ───────── */

type Progress = { level: 1 | 2 | 3 | 4 | null; points: number; wrong: string[]; testScore: number | null };
const EMPTY: Progress = { level: null, points: 0, wrong: [], testScore: null };
const storeKey = (uid: string) => `lnk-korean:${uid}`;

function readProgress(uid: string): Progress {
  try {
    const raw = localStorage.getItem(storeKey(uid));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
function writeProgress(uid: string, p: Progress) {
  try {
    localStorage.setItem(storeKey(uid), JSON.stringify(p));
  } catch {
    /* 저장 못 해도 화면은 계속 */
  }
}

const POINTS_PRACTICE = 10;
const POINTS_REVIEW = 5;
const ROUND_SIZE = 5;
const POINTS_PER_LV = 100;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const tri = (v: Tri, locale: string) => (locale === "en" ? v.en : locale === "mn" ? v.mn : v.kr);

/* ───────── 문제 풀기 ───────── */

type Mode = "test" | "practice" | "review";
type Answer = { id: string; correct: boolean };

function QuizRunner({
  mode,
  questions,
  onFinish,
  onQuit,
}: {
  mode: Mode;
  questions: KoreanQuestion[];
  onFinish: (answers: Answer[]) => void;
  onQuit: () => void;
}) {
  const t = useTranslations("korean");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // 보기 순서는 매번 섞음 (원래 보기 번호를 기억)
  const orders = useMemo(() => questions.map((q) => shuffle(q.choices.map((_, i) => i))), [questions]);
  const q = questions[index];
  const order = orders[index];
  const showFeedback = mode !== "test" && picked !== null;
  const last = index === questions.length - 1;

  function pick(choice: number) {
    if (picked !== null) return;
    setPicked(choice);
    const next = [...answers, { id: q.id, correct: choice === q.answer }];
    setAnswers(next);
    // 레벨 테스트는 해설 없이 바로 다음 문제
    if (mode === "test") {
      window.setTimeout(() => {
        if (last) onFinish(next);
        else {
          setIndex((i) => i + 1);
          setPicked(null);
        }
      }, 250);
    }
  }

  function next() {
    if (last) onFinish(answers);
    else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  const catLabel: Record<KoreanCategory, string> = { vocab: t("catVocab"), grammar: t("catGrammar"), reading: t("catReading") };

  return (
    <section className={`${ui.card} flex flex-col gap-5 p-5 sm:p-7`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={ui.pillTeal}>{mode === "test" ? t("levelTest") : mode === "review" ? t("review") : t("practice")}</span>
          <span className={ui.pillMuted}>{catLabel[q.cat]}</span>
          <span className={ui.pillMuted}>{t(`level${q.level}`)}</span>
        </div>
        <span className={`text-sm font-semibold ${ui.muted}`}>
          {index + 1} / {questions.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface dark:bg-night">
        <div
          className="h-full rounded-full bg-teal transition-all dark:bg-teal-dark"
          style={{ width: `${((index + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {q.passage ? (
        <div className="whitespace-pre-line rounded-xl bg-surface p-4 text-[15px] leading-[1.7] text-ink dark:bg-night dark:text-snow">
          {q.passage}
        </div>
      ) : null}
      <p className="text-lg font-semibold leading-[1.5] text-ink dark:text-snow" lang="ko">
        {q.prompt}
      </p>

      <ol className="grid gap-2 sm:grid-cols-2">
        {order.map((ci, n) => {
          const isPicked = picked === ci;
          const isAnswer = ci === q.answer;
          let tone = "border-hairline hover:border-teal dark:border-hairline-dark dark:hover:border-teal-dark";
          if (showFeedback && isAnswer) tone = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40";
          else if (showFeedback && isPicked) tone = "border-rose-500 bg-rose-50 dark:bg-rose-950/40";
          else if (mode === "test" && isPicked) tone = "border-teal bg-teal/5 dark:border-teal-dark";
          return (
            <li key={ci}>
              <button
                type="button"
                disabled={picked !== null}
                onClick={() => pick(ci)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] text-ink transition-colors disabled:cursor-default dark:text-snow ${tone}`}
                lang="ko"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink-muted dark:bg-night dark:text-snow-muted">
                  {n + 1}
                </span>
                <span className="flex-1">{q.choices[ci]}</span>
                {showFeedback && isAnswer ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> : null}
                {showFeedback && isPicked && !isAnswer ? <XCircle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" /> : null}
              </button>
            </li>
          );
        })}
      </ol>

      {showFeedback ? (
        <div className="flex flex-col gap-3 rounded-xl border border-hairline p-4 dark:border-hairline-dark">
          <p className={`font-bold ${picked === q.answer ? "text-emerald-600" : "text-rose-600"}`}>
            {picked === q.answer
              ? t("correct", { points: String(mode === "review" ? POINTS_REVIEW : POINTS_PRACTICE) })
              : t("wrong")}
          </p>
          <p className="text-sm leading-[1.65] text-ink dark:text-snow">{tri(q.explain, locale)}</p>
          {locale !== "mn" ? (
            <div className="rounded-lg bg-surface p-3 dark:bg-night">
              <p className="mb-1 text-xs font-bold text-teal dark:text-teal-dark">{t("mnExplain")}</p>
              <p className="text-sm leading-[1.65] text-ink-muted dark:text-snow-muted" lang="mn">
                {q.explain.mn}
              </p>
            </div>
          ) : null}
          {q.example ? (
            <div>
              <p className="mb-1 text-xs font-bold text-ink dark:text-snow">{t("example")}</p>
              <p className="text-[15px] text-ink dark:text-snow" lang="ko">
                {q.example.ko}
              </p>
              <p className={`text-sm ${ui.muted}`}>{locale === "en" ? q.example.en : q.example.mn}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onQuit} className={ui.btnGhost}>
          {t("quit")}
        </button>
        {showFeedback ? (
          <button type="button" onClick={next} className={ui.btnPrimary}>
            {last ? t("seeResult") : t("next")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ───────── 화면 ───────── */

type View =
  | { kind: "home" }
  | { kind: "quiz"; mode: Mode; questions: KoreanQuestion[] }
  | { kind: "result"; mode: Mode; answers: Answer[]; earned: number; level?: 1 | 2 | 3 | 4 };

export default function KoreanPractice() {
  const t = useTranslations("korean");
  const { user } = useAuth();
  const uid = user?.id ?? "guest";
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [view, setView] = useState<View>({ kind: "home" });
  const [cat, setCat] = useState<KoreanCategory | "all">("all");

  useEffect(() => setProgress(readProgress(uid)), [uid]);

  const save = (p: Progress) => {
    setProgress(p);
    writeProgress(uid, p);
  };

  const lv = Math.floor(progress.points / POINTS_PER_LV) + 1;
  const lvPct = Math.round(((progress.points % POINTS_PER_LV) / POINTS_PER_LV) * 100);

  function startTest() {
    const qs = LEVEL_TEST_IDS.map(questionById).filter(Boolean) as KoreanQuestion[];
    setView({ kind: "quiz", mode: "test", questions: qs });
  }

  function startPractice() {
    const level = progress.level ?? 1;
    // 내 수준과 한 단계 아래·위 문제에서 고름 (내 수준 문제를 먼저)
    const pool = KOREAN_QUESTIONS.filter((q) => (cat === "all" || q.cat === cat) && Math.abs(q.level - level) <= 1);
    const mine = shuffle(pool.filter((q) => q.level === level));
    const near = shuffle(pool.filter((q) => q.level !== level));
    let picked = [...mine, ...near].slice(0, ROUND_SIZE);
    // 고른 분야 문제가 모자라면 같은 분야의 다른 수준 문제로 채움
    if (picked.length < ROUND_SIZE) {
      const rest = shuffle(KOREAN_QUESTIONS.filter((q) => (cat === "all" || q.cat === cat) && !picked.includes(q)));
      picked = [...picked, ...rest].slice(0, ROUND_SIZE);
    }
    setView({ kind: "quiz", mode: "practice", questions: picked });
  }

  function startReview() {
    const qs = progress.wrong.map(questionById).filter(Boolean) as KoreanQuestion[];
    if (qs.length) setView({ kind: "quiz", mode: "review", questions: shuffle(qs).slice(0, ROUND_SIZE) });
  }

  function finish(mode: Mode, answers: Answer[]) {
    const wrongIds = answers.filter((a) => !a.correct).map((a) => a.id);
    const rightIds = answers.filter((a) => a.correct).map((a) => a.id);
    let wrong = progress.wrong;
    let earned = 0;
    if (mode === "test") {
      const score = rightIds.length;
      const level = levelFromScore(score);
      save({ ...progress, level, testScore: score });
      setView({ kind: "result", mode, answers, earned: 0, level });
      return;
    }
    if (mode === "practice") {
      earned = rightIds.length * POINTS_PRACTICE;
      wrong = Array.from(new Set([...wrong, ...wrongIds]));
    } else {
      earned = rightIds.length * POINTS_REVIEW;
      wrong = wrong.filter((id) => !rightIds.includes(id));
    }
    save({ ...progress, points: progress.points + earned, wrong });
    setView({ kind: "result", mode, answers, earned });
  }

  const cats: Array<{ id: KoreanCategory | "all"; label: string }> = [
    { id: "all", label: t("catAll") },
    { id: "vocab", label: t("catVocab") },
    { id: "grammar", label: t("catGrammar") },
    { id: "reading", label: t("catReading") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageIntro size="md" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t("statLevel")} value={progress.level ? t(`level${progress.level}`) : t("notTested")} />
        <StatTile label={t("statPoints")} value={`${progress.points}P`} />
        <StatTile label={t("statLv")} value={`Lv.${lv}`} />
        <StatTile label={t("statWrong")} value={String(progress.wrong.length)} />
      </div>

      {view.kind === "quiz" ? (
        <QuizRunner
          key={`${view.mode}-${view.questions.map((q) => q.id).join()}`}
          mode={view.mode}
          questions={view.questions}
          onFinish={(a) => finish(view.mode, a)}
          onQuit={() => setView({ kind: "home" })}
        />
      ) : view.kind === "result" ? (
        <section className={`${ui.card} flex flex-col items-start gap-4 p-6 sm:p-8`}>
          <Trophy className="h-10 w-10 text-teal dark:text-teal-dark" aria-hidden="true" />
          {view.mode === "test" && view.level ? (
            <>
              <h2 className={ui.h2}>{t("testResultTitle", { level: t(`level${view.level}`) })}</h2>
              <p className={ui.lead}>
                {t("testResultBody", { score: String(view.answers.filter((a) => a.correct).length), total: String(view.answers.length) })}
              </p>
              <p className={`text-sm ${ui.muted}`}>{t(`levelDesc${view.level}`)}</p>
            </>
          ) : (
            <>
              <h2 className={ui.h2}>
                {t("roundResult", { score: String(view.answers.filter((a) => a.correct).length), total: String(view.answers.length) })}
              </h2>
              <p className={ui.lead}>{t("earned", { points: String(view.earned) })}</p>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={ui.btnPrimary} onClick={startPractice}>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {view.mode === "test" ? t("startPracticeAtLevel") : t("again")}
            </button>
            <button type="button" className={ui.btnOutline} onClick={() => setView({ kind: "home" })}>
              {t("backHome")}
            </button>
          </div>
        </section>
      ) : (
        <>
          {!progress.level ? (
            <section className={`${ui.card} flex flex-col items-start gap-4 border-2 border-teal p-6 dark:border-teal-dark sm:p-8`}>
              <ClipboardCheck className="h-9 w-9 text-teal dark:text-teal-dark" aria-hidden="true" />
              <h2 className={ui.h2}>{t("testTitle")}</h2>
              <p className={ui.lead}>{t("testBody")}</p>
              <button type="button" className={ui.btnPrimary} onClick={startTest}>
                {t("startTest")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </section>
          ) : null}

          <section className={`${ui.card} flex flex-col gap-5 p-6 sm:p-8`}>
            <div className="flex flex-col gap-1">
              <h2 className={ui.h2}>{t("practiceTitle")}</h2>
              <p className={`text-sm ${ui.muted}`}>
                {t("practiceBody", { level: progress.level ? t(`level${progress.level}`) : t("level1"), n: String(ROUND_SIZE) })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("practiceTitle")}>
              {cats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={cat === c.id}
                  onClick={() => setCat(c.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                    cat === c.id
                      ? "border-teal bg-teal text-white dark:border-teal-dark dark:bg-teal-dark dark:text-night"
                      : "border-hairline text-ink hover:border-teal dark:border-hairline-dark dark:text-snow"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={ui.btnPrimary} onClick={startPractice}>
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {t("startPractice")}
              </button>
              <button type="button" className={ui.btnOutline} onClick={startReview} disabled={!progress.wrong.length}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t("startReview", { n: String(progress.wrong.length) })}
              </button>
              {progress.level ? (
                <button type="button" className={ui.btnOutline} onClick={startTest}>
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  {t("retest")}
                </button>
              ) : null}
            </div>
          </section>

          <section className={`${ui.card} flex flex-col gap-3 p-6 sm:p-8`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal dark:text-teal-dark" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink dark:text-snow">{t("pointsTitle", { lv: String(lv) })}</h2>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface dark:bg-night">
              <div className="h-full rounded-full bg-teal dark:bg-teal-dark" style={{ width: `${lvPct}%` }} />
            </div>
            <p className={`text-sm ${ui.muted}`}>
              {t("pointsNext", { left: String(POINTS_PER_LV - (progress.points % POINTS_PER_LV)), next: String(lv + 1) })}
            </p>
            <p className={`text-sm ${ui.muted}`}>{t("pointsRule", { p: String(POINTS_PRACTICE), r: String(POINTS_REVIEW) })}</p>
            <Notice tone="info">{t("pointsSoon")}</Notice>
          </section>
        </>
      )}
    </div>
  );
}
