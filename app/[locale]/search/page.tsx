import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  queryCommunityGroups,
  queryFreelancerGroups,
  queryLectures,
  queryMentors,
  queryStudyInfos,
} from "@/lib/data/queries";

function containsText(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("searchPage");
  const q = (sp.q || "").trim();

  if (!q) {
    return (
      <div className="ds-page">
        <div className="ds-container py-10">
          <h1 className="ds-section-title">{t("title")}</h1>
          <p className="ds-section-desc mt-2">{t("enterKeyword")}</p>
        </div>
      </div>
    );
  }

  const [mentorsR, lecturesR, communitiesR, freelancersR, studyInfosR] =
    await Promise.all([
      queryMentors({ limit: 120 }),
      queryLectures({ limit: 120 }),
      queryCommunityGroups({ limit: 120 }),
      queryFreelancerGroups({ limit: 120 }),
      queryStudyInfos(),
    ]);

  const mentors = mentorsR.mentors.filter((m) =>
    containsText(
      [m.name, m.title, m.bio, m.location, ...(m.specialties || []), ...(m.languages || [])].join(" "),
      q
    )
  );
  const lectures = lecturesR.lectures.filter((l) =>
    containsText([l.title, l.description, l.instructor, l.category].join(" "), q)
  );
  const communities = communitiesR.filter((c) =>
    containsText([c.name, c.description, c.category, ...(c.tags || [])].join(" "), q)
  );
  const freelancers = freelancersR.filter((f) =>
    containsText([f.name, f.description, f.category].join(" "), q)
  );
  const studyInfos = studyInfosR.filter((s) =>
    containsText([s.title, s.content, s.category, ...(s.tags || [])].join(" "), q)
  );

  const total =
    mentors.length +
    lectures.length +
    communities.length +
    freelancers.length +
    studyInfos.length;

  return (
    <div className="ds-page">
      <div className="ds-container py-10 space-y-8">
        <div>
          <h1 className="ds-section-title">{t("title")}</h1>
          <p className="ds-section-desc mt-2">
            {t("resultCount", { query: q, count: total })}
          </p>
        </div>

        {total === 0 && (
          <div className="ds-panel p-6 text-sm text-slate-600 dark:text-slate-400">
            {t("noResults")}
          </div>
        )}

        {mentors.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("mentors")} ({mentors.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mentors.slice(0, 8).map((m) => (
                <Link key={m.id} href={`/${locale}/mentors/${m.id}`} className="ds-panel p-4 hover:ring-primary-300 transition-colors">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{m.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {lectures.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("lectures")} ({lectures.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lectures.slice(0, 8).map((l) => (
                <Link key={l.id} href={`/${locale}/lectures/${l.id}`} className="ds-panel p-4 hover:ring-primary-300 transition-colors">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{l.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{l.instructor}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {communities.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("community")} ({communities.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {communities.slice(0, 8).map((c) => (
                <Link key={c.id} href={`/${locale}/community/${c.id}`} className="ds-panel p-4 hover:ring-primary-300 transition-colors">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{c.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {freelancers.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("freelancers")} ({freelancers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {freelancers.slice(0, 8).map((f) => (
                <Link key={f.id} href={`/${locale}/freelancers/${f.id}`} className="ds-panel p-4 hover:ring-primary-300 transition-colors">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{f.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{f.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {studyInfos.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("studyInfo")} ({studyInfos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {studyInfos.slice(0, 8).map((s) => (
                <Link key={s.id} href={`/${locale}/study-in-korea#article-${s.id}`} className="ds-panel p-4 hover:ring-primary-300 transition-colors">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{s.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{s.category}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
