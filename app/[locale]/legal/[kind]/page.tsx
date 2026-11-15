import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLegalDoc, type LegalKind } from "@/lib/legal/content";
import { business, LEGAL_EFFECTIVE_DATE } from "@/lib/legal/business";

const KINDS: LegalKind[] = ["terms", "privacy", "refund"];

export const dynamicParams = false;

export function generateStaticParams() {
  return KINDS.map((kind) => ({ kind }));
}

type Props = { params: Promise<{ locale: string; kind: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, kind } = await params;
  if (!KINDS.includes(kind as LegalKind)) return {};
  return { title: getLegalDoc(locale, kind as LegalKind).title };
}

export default async function LegalPage({ params }: Props) {
  const { locale, kind } = await params;
  if (!KINDS.includes(kind as LegalKind)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  const doc = getLegalDoc(locale, kind as LegalKind);

  const dateLabel = new Intl.DateTimeFormat(locale === "kr" ? "ko-KR" : locale === "mn" ? "mn-MN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(`${LEGAL_EFFECTIVE_DATE}T00:00:00+09:00`));

  /** 본문의 자리표시 줄({contact}, {officer})을 실제 내용으로 바꾼다 */
  const expand = (line: string): string[] => {
    if (line === "{contact}") {
      const out = [t("contactInquiry")];
      if (business.email) out.push(t("contactEmail", { email: business.email }));
      return out;
    }
    if (line === "{officer}") {
      return [business.privacyOfficer ? t("officer", { name: business.privacyOfficer }) : t("officerPending")];
    }
    return [line];
  };

  return (
    <div className="bg-surface dark:bg-night">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
        <nav className="mb-8 flex flex-wrap gap-2" aria-label={t("onThisPage")}>
          {KINDS.map((k) => (
            <Link
              key={k}
              href={`/${locale}/legal/${k}`}
              aria-current={k === kind ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                k === kind
                  ? "border-teal bg-teal text-white dark:border-teal-dark dark:bg-teal-dark dark:text-night"
                  : "border-hairline text-ink-muted hover:border-teal hover:text-teal dark:border-hairline-dark dark:text-snow-muted dark:hover:border-teal-dark dark:hover:text-teal-dark"
              }`}
            >
              {t(k)}
            </Link>
          ))}
        </nav>

        <h1 className="text-3xl font-bold text-ink dark:text-snow sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-ink-muted dark:text-snow-muted">{t("effective", { date: dateLabel })}</p>
        <p className="mt-6 break-keep text-base leading-[1.7] text-ink dark:text-snow">{doc.intro}</p>

        <details className="mt-6 rounded-xl border border-hairline bg-surface-card p-4 text-sm dark:border-hairline-dark dark:bg-night-card" open>
          <summary className="cursor-pointer font-semibold text-ink dark:text-snow">{t("onThisPage")}</summary>
          <ol className="mt-3 space-y-1.5 text-ink-muted dark:text-snow-muted">
            {doc.sections.map((s, i) => (
              <li key={s.h}>
                <a href={`#s${i + 1}`} className="hover:text-teal dark:hover:text-teal-dark">
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </details>

        <div className="mt-10 space-y-9">
          {doc.sections.map((s, i) => {
            const lines = s.body.flatMap(expand);
            return (
              <section key={s.h} id={`s${i + 1}`} className="scroll-mt-24">
                <h2 className="mb-3 text-lg font-bold text-ink dark:text-snow">{s.h}</h2>
                <div className="space-y-2.5 break-keep text-[15px] leading-[1.75] text-ink-muted dark:text-snow-muted">
                  {groupLines(lines).map((g, j) =>
                    g.type === "list" ? (
                      <ul key={j} className="list-disc space-y-1.5 pl-5">
                        {g.items.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p key={j}>{g.text}</p>
                    )
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type Group = { type: "list"; items: string[] } | { type: "p"; text: string };

function groupLines(lines: string[]): Group[] {
  const out: Group[] = [];
  for (const line of lines) {
    if (line.startsWith("- ")) {
      const last = out[out.length - 1];
      if (last?.type === "list") last.items.push(line.slice(2));
      else out.push({ type: "list", items: [line.slice(2)] });
    } else {
      out.push({ type: "p", text: line });
    }
  }
  return out;
}
