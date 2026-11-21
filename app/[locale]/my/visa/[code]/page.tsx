import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Notice, PageIntro, ui } from "@/components/lnk/ui";
import { visaContent, VISA_SOURCE_DATE } from "@/lib/visa/content";
import { visaFromSlug } from "@/lib/visa/types";
import { createServerSupabase } from "@/lib/supabase/server";

// 회원 전용: 미리 만들어 두지 않고 요청 때마다 로그인 확인
export const dynamic = "force-dynamic";

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className={`${ui.card} flex flex-col gap-3 p-5 sm:p-6`}>
      <h2 className="text-lg font-semibold text-ink dark:text-snow">{title}</h2>
      <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-[1.6] text-ink-muted dark:text-snow-muted">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function VisaDetailPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code: slug } = await params;
  setRequestLocale(locale);
  const code = visaFromSlug(slug);
  if (!code) notFound();
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/my/visa/${slug}`)}`);
  const t = await getTranslations("visa");
  const g = visaContent(locale).guides[code];

  return (
    <div className="flex flex-col gap-7">
      <Link href={`/${locale}/my/dashboard#roadmaps`} className={`w-fit ${ui.btnGhost}`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("back")}
      </Link>
      <PageIntro
        size="md"
        status={code}
        title={g.name}
        subtitle={g.short}
      />
      <Notice tone="caution">{t("sourceNote", { date: VISA_SOURCE_DATE })}</Notice>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block title={t("who")} items={g.who} />
        <section className={`${ui.card} flex flex-col gap-3 p-5 sm:p-6`}>
          <h2 className="text-lg font-semibold text-ink dark:text-snow">{t("stay")}</h2>
          <p className="text-sm text-ink-muted dark:text-snow-muted">{g.stay}</p>
          <h2 className="mt-2 text-lg font-semibold text-ink dark:text-snow">{t("section")}</h2>
          <p className="text-sm text-ink-muted dark:text-snow-muted">{g.section}</p>
        </section>
      </div>
      <Block title={t("rules")} items={g.rules} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Block title={t("docsChange")} items={g.docsChange} />
        <Block title={t("docsExtend")} items={g.docsExtend} />
      </div>
      <Block title={t("cautions")} items={g.cautions} />

      <Notice tone="info" title={t("consult")}>
        <p>{t("consultBody")}</p>
        <Link href={`/${locale}/mentors?category=visa`} className={`mt-2 ${ui.btnGhost}`}>
          {t("consult")} →
        </Link>
      </Notice>
    </div>
  );
}
