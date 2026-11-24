"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

type Group = "keep" | "learn" | "network";
const ITEMS: { key: string; group: Group; letter: string; path: string; member: boolean; bg: string; fg: string }[] = [
  { key: "visa", group: "keep", letter: "K", path: "/my/dashboard", member: true, bg: "#1f6f62", fg: "#ffcf3f" },
  { key: "korean", group: "learn", letter: "L", path: "/my/korean", member: true, bg: "#ffcf3f", fg: "#111a19" },
  { key: "mentors", group: "network", letter: "N", path: "/mentors", member: false, bg: "#111a19", fg: "#9fe0d2" },
  { key: "life", group: "keep", letter: "K", path: "/study-in-korea", member: false, bg: "#9fe0d2", fg: "#111a19" },
  { key: "lectures", group: "learn", letter: "L", path: "/lectures", member: false, bg: "#f1f4f3", fg: "#1f6f62" },
  { key: "admission", group: "network", letter: "N", path: "/my/admission", member: true, bg: "#ffcf3f", fg: "#1f6f62" },
];

/** 실제 서비스 6개 — Keep / Learn / Network 로 거르기 */
export default function ServiceGrid() {
  const t = useTranslations("homeB");
  const locale = useLocale();
  const { user } = useAuth();
  const [f, setF] = useState<"all" | Group>("all");
  const svc = t.raw("svc") as Record<string, [string, string, string]>;
  const tabs: { id: "all" | Group; label: string }[] = [
    { id: "all", label: t("fAll") },
    { id: "keep", label: t("fKeep") },
    { id: "learn", label: t("fLearn") },
    { id: "network", label: t("fNetwork") },
  ];
  const list = f === "all" ? ITEMS : ITEMS.filter((i) => i.group === f);
  const href = (path: string, member: boolean) => {
    const target = `/${locale}${path}`;
    return member && !user ? `/${locale}/login?redirect=${encodeURIComponent(target)}` : target;
  };

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label={t("svcTitle")} className="flex flex-wrap gap-2">
        {tabs.map((tb) => (
          <button key={tb.id} type="button" role="tab" aria-selected={f === tb.id} onClick={() => setF(tb.id)} className="b3-tab">
            {tb.label}
          </button>
        ))}
      </div>
      <div className="b3-cards">
        {list.map((it, i) => {
          const [title, desc, kind] = svc[it.key];
          return (
            <Link key={`${f}-${it.key}`} href={href(it.path, it.member)} className="b3-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="b3-cover" style={{ background: it.bg, color: it.fg }}>
                <span className="b3-cover-letter" aria-hidden="true">{it.letter}</span>
                <span className="b3-cover-kind">{kind}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-6">
                <h3 className="text-[21px] font-extrabold leading-[1.3] tracking-[-0.02em]">{title}</h3>
                <p className="flex-1 text-[15px] leading-[1.65] text-[#47605b]">{desc}</p>
                <span className="b3-card-go mt-2">
                  {t("open")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
