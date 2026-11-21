import { NextRequest, NextResponse } from "next/server";
import { localeFromRequest, trError } from "@/lib/i18n/runtime";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildVisaPlan, visaTemplateKey } from "@/lib/visa/plan";
import { DEGREE_LEVELS, EMPTY_FACTS, isVisaCode, type VisaFacts } from "@/lib/visa/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}

/** 클라이언트가 보낸 값을 그대로 믿지 않고 하나씩 정리 */
function sanitizeFacts(raw: unknown): VisaFacts {
  const f = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const degree = DEGREE_LEVELS.includes(f.degree as VisaFacts["degree"]) ? (f.degree as VisaFacts["degree"]) : "none";
  const income = f.income == null || f.income === "" ? null : clampInt(f.income, 0, 1_000_000);
  const birthYear = f.birthYear == null || f.birthYear === "" ? null : clampInt(f.birthYear, 1940, new Date().getFullYear());
  const gradDate = typeof f.gradDate === "string" && DATE_RE.test(f.gradDate) ? f.gradDate : null;
  return {
    ...EMPTY_FACTS,
    degree,
    domesticDegree: Boolean(f.domesticDegree),
    stem: Boolean(f.stem),
    topik: clampInt(f.topik, 0, 6),
    kiip: clampInt(f.kiip, 0, 5),
    jobOffer: Boolean(f.jobOffer),
    income,
    birthYear,
    gradDate,
  };
}

/** 비자 로드맵 저장: 기존 비자 로드맵은 보관 처리하고 새로 만듦 */
export async function POST(request: NextRequest) {
  let locale = localeFromRequest(request);
  try {
    const body = await request.json();
    locale = localeFromRequest(request, body.locale);

    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: trError("authRequired", locale) }, { status: 401 });

    const { from, to } = body;
    const expiry = typeof body.expiry === "string" && DATE_RE.test(body.expiry) ? body.expiry : null;
    if (!isVisaCode(from) || !isVisaCode(to)) {
      return NextResponse.json({ error: "invalid visa" }, { status: 400 });
    }
    const facts = sanitizeFacts(body.facts);
    const plan = buildVisaPlan({ from, to, expiry, facts });
    if (!plan) return NextResponse.json({ error: "no route" }, { status: 400 });

    // 지금 비자·만료일은 프로필에도 저장 (대시보드 D-day, 알림에 사용)
    await supabase
      .from("profiles")
      .update({ visa_type: from, visa_expire_date: expiry, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    // 비자 로드맵은 하나만 진행: 이전 것은 보관
    await supabase
      .from("roadmaps")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("status", "active")
      .like("template_key", "visa:%");

    const firstDue = plan.steps.find((s) => s.dueDate)?.dueDate ?? null;
    const { data: roadmap, error } = await supabase
      .from("roadmaps")
      .insert({
        user_id: user.id,
        title: `${from} → ${to}`,
        // 언어와 무관한 데이터만 저장 (화면 문구는 보는 사람 언어로 다시 만듦)
        description: JSON.stringify({ v: 1, from, to, expiry, facts }),
        priority: "high",
        progress: 0,
        status: "active",
        template_key: visaTemplateKey(from, to),
        due_date: firstDue,
      })
      .select("id")
      .single();

    if (error || !roadmap) {
      return NextResponse.json({ error: error?.message || trError("roadmapCreateFailed", locale) }, { status: 500 });
    }

    const rows = plan.steps.map((s, i) => ({
      roadmap_id: roadmap.id,
      user_id: user.id,
      title: s.key,
      description: null,
      completed: false,
      active: i === 0,
      sort_order: i,
      due_date: s.dueDate,
    }));
    const { error: stepErr } = await supabase.from("roadmap_steps").insert(rows);
    if (stepErr) return NextResponse.json({ error: stepErr.message }, { status: 500 });

    return NextResponse.json({ id: roadmap.id });
  } catch (e) {
    console.error("visa roadmap error", e);
    return NextResponse.json({ error: trError("roadmapCreateFailed", locale) }, { status: 500 });
  }
}
