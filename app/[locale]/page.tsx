import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import type { Mentor } from "@/types";
import { queryMentorsSupabase } from "@/lib/supabase/public-queries";
import { CURRENT_VISAS } from "@/lib/visa/types";
import RevealRoot from "@/components/home/b3/RevealRoot";
import HowSplit from "@/components/home/b3/HowSplit";
import ServiceGrid from "@/components/home/b3/ServiceGrid";
import AskList, { AskButton } from "@/components/home/b3/AskList";
import { HeroStart, TourButton } from "@/components/home/b3/HeroStart";
import FirstVisitGuide from "@/components/home/b3/FirstVisitGuide";
import VisaChip from "@/components/visa/VisaChip";
import "./home.css";

export const revalidate = 3600;

/**
 * 홈 — B3 시안 (캔버스 "LNK 홈 시안 3종"에서 확정).
 * 청록 면 · 노랑 강조 · 큰 L·N·K, Skola식 분할 스크롤, HUR식 첫 방문 안내.
 * 보여주는 건 실제로 있는 것만: 비자 규칙, 한국어 문제, 실제 서비스 6개, 검증된 실제 전문가.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "homeB" });

  let expert: { name: string; photo: string | null; href: string } | null = null;
  try {
    const { mentors } = await queryMentorsSupabase({ limit: 30 });
    const m: Mentor | undefined = mentors.find((x) => x.verified && x.photo);
    if (m) expert = { name: m.name, photo: m.photo ?? null, href: `/${locale}/mentors/${m.id}` };
  } catch {
    expert = null;
  }

  const why = t.raw("why") as { title: string; body: string }[];
  const lang = locale === "kr" ? "ko" : locale;

  return (
    <RevealRoot lang={lang}>
      {/* 히어로 */}
      <section id="top" className="b3-hero">
        <div className="b3-hero-field" data-tour-ring>
          <div className="flex flex-wrap items-end justify-between gap-10">
            <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-6 animate-fade-up">
              <h1 className="b3-hero-title">{t("heroTitle")}</h1>
              <p className="b3-hero-sub">{t("heroSub")}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="#how" className="b3-btn b3-btn-sun">
                  {t("heroCta")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <HeroStart />
              </div>
              <TourButton />
            </div>
            <div className="b3-hero-card flex min-w-0 max-w-[360px] flex-[1_1_280px] flex-col gap-3 animate-fade-up [animation-delay:.12s]">
              <p className="text-[14px] font-extrabold text-[#1f6f62]">{t("heroCardLabel")}</p>
              <ul className="flex flex-wrap gap-2">
                {CURRENT_VISAS.map((v) => (
                  <li key={v}>
                    <VisaChip code={v} className="b3-chip" />
                  </li>
                ))}
              </ul>
              <p className="text-[13px] leading-[1.5] text-[#47605b]">{t("heroCardNote")}</p>
            </div>
          </div>
          <div className="b3-mono" aria-hidden="true">
            <span>L</span>
            <span>N</span>
            <span>K</span>
          </div>
        </div>
        <div className="b3-letters">
          <span>L · Learn — {t("learn")}</span>
          <span>N · Network — {t("network")}</span>
          <span>K · Keep — {t("keep")}</span>
        </div>
      </section>

      {/* 이용 방법: 분할 스크롤 */}
      <section id="how" className="b3-wrap pb-16 pt-24 md:pb-20 md:pt-32">
        <h2 className="b3-h2 mb-10 max-w-[760px] md:mb-14" data-reveal>
          {t("howTitle")}
        </h2>
        <div data-tour-ring>
          <HowSplit expert={expert} />
        </div>
      </section>

      {/* 서비스 */}
      <section id="services" className="b3-wrap pb-24 pt-16 md:pb-28 md:pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div className="max-w-[660px]">
            <h2 className="b3-h2">{t("svcTitle")}</h2>
            <p className="b3-lead">{t("svcSub")}</p>
          </div>
        </div>
        <div data-tour-ring data-reveal style={{ ["--d" as string]: ".08s" }}>
          <ServiceGrid />
        </div>
      </section>

      {/* 질문 */}
      <section id="ask" className="b3-ask py-20 md:py-28">
        <div className="b3-wrap flex flex-wrap gap-12" data-tour-ring>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5" data-reveal>
            <h2 className="b3-h2">{t("askTitle")}</h2>
            <p className="text-[17px] leading-[1.65] text-[#2d2a12]">{t("askSub")}</p>
            <div className="flex flex-wrap gap-3">
              <AskButton label={t("askCta")} />
              <Link href={`/${locale}/community`} className="b3-btn b3-btn-ghost">
                {t("askCta2")}
              </Link>
            </div>
          </div>
          <div className="min-w-0 flex-[999_1_520px]" data-reveal style={{ ["--d" as string]: ".1s" }}>
            <AskList />
          </div>
        </div>
      </section>

      {/* 근거 */}
      <section className="b3-wrap py-24 md:py-28">
        <h2 className="b3-h2 mb-10 max-w-[760px]" data-reveal>
          {t("whyTitle")}
        </h2>
        <div className="b3-why">
          {why.map((w, i) => (
            <div key={w.title} data-reveal style={{ ["--d" as string]: `${i * 0.1}s` }}>
              <h3 className="text-[20px] font-extrabold tracking-[-0.02em]">{w.title}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.75] text-[#47605b]">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 마무리 */}
      <section className="b3-close">
        <div className="b3-close-box" data-reveal>
          <div className="relative z-[1] flex max-w-[820px] flex-col gap-6">
            <h2 className="text-[clamp(32px,5vw,64px)] font-extrabold leading-[1.08] tracking-[-0.035em]">{t("closeTitle")}</h2>
            <p className="text-[17px] text-[#c4d3cf]">{t("closeSub")}</p>
            <ul className="flex flex-wrap gap-2.5">
              {CURRENT_VISAS.map((v) => (
                <li key={v}>
                  <VisaChip code={v} className="b3-visa-chip" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FirstVisitGuide />
    </RevealRoot>
  );
}
