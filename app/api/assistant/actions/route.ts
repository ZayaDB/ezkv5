import { NextRequest, NextResponse } from "next/server";
import { buildActionAssistantResponse } from "@/lib/ai/assistantActions";
import { ROADMAP_TEMPLATES } from "@/lib/roadmap/templates";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, locale = "kr", executeAction } = body;

    if (!message && !executeAction) {
      return NextResponse.json({ error: "message 또는 executeAction이 필요합니다." }, { status: 400 });
    }

    if (!executeAction) {
      const result = buildActionAssistantResponse(String(message), locale);
      return NextResponse.json(result);
    }

    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { type, templateKey, title, startsAt } = executeAction;

    if (type === "create_roadmap" && templateKey) {
      const template = ROADMAP_TEMPLATES[String(templateKey)];
      if (!template) {
        return NextResponse.json({ error: "알 수 없는 로드맵 템플릿입니다." }, { status: 400 });
      }

      const { data: roadmap, error } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          title: template.title,
          description: template.description,
          priority: template.priority,
          progress: 0,
          status: "active",
          template_key: template.key,
        })
        .select("*")
        .single();

      if (error || !roadmap) {
        return NextResponse.json({ error: error?.message || "로드맵 생성 실패" }, { status: 500 });
      }

      const stepRows = template.steps.map((step, index) => ({
        roadmap_id: roadmap.id,
        user_id: user.id,
        title: step.title,
        description: step.description || null,
        completed: false,
        sort_order: index,
        active: index === 0,
      }));

      const { error: stepErr } = await supabase.from("roadmap_steps").insert(stepRows);
      if (stepErr) {
        return NextResponse.json({ error: stepErr.message }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        roadmapId: roadmap.id,
        redirectUrl: `/roadmap`,
      });
    }

    if (type === "create_calendar_event" && title && startsAt) {
      const { data: event, error } = await supabase
        .from("calendar_events")
        .insert({
          user_id: user.id,
          title: String(title),
          starts_at: new Date(startsAt).toISOString(),
          category: "general",
          status: "planned",
        })
        .select("id")
        .single();

      if (error || !event) {
        return NextResponse.json({ error: error?.message || "일정 추가 실패" }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        eventId: event.id,
        redirectUrl: `/calendar`,
      });
    }

    return NextResponse.json({ error: "지원하지 않는 액션입니다." }, { status: 400 });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : "처리하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
