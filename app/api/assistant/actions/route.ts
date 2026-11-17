import { NextRequest, NextResponse } from "next/server";
import { buildVisaActions } from "@/lib/ai/assistantActions";
import { ruleBasedVisaAnswer } from "@/lib/visa/assistant";
import { getRoadmapTemplate } from "@/lib/roadmap/templates";
import { localeFromRequest, trError } from "@/lib/i18n/runtime";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let locale = localeFromRequest(request);
  try {
    const body = await request.json();
    const { message, executeAction } = body;
    locale = localeFromRequest(request, body.locale);

    if (!message && !executeAction) {
      return NextResponse.json({ error: trError("messageOrActionRequired", locale) }, { status: 400 });
    }

    if (!executeAction) {
      const supa = await createServerSupabase();
      const { data: auth } = await supa.auth.getUser();
      if (!auth.user) return NextResponse.json({ error: trError("authRequired", locale) }, { status: 401 });
      const text = String(message);
      return NextResponse.json({ response: ruleBasedVisaAnswer(text, locale), actions: buildVisaActions(text, locale), links: [] });
    }

    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: trError("authRequired", locale) }, { status: 401 });
    }

    const { type, templateKey, title, startsAt } = executeAction;

    if (type === "create_roadmap" && templateKey) {
      const template = getRoadmapTemplate(String(templateKey), locale);
      if (!template) {
        return NextResponse.json({ error: trError("unknownRoadmapTemplate", locale) }, { status: 400 });
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
        return NextResponse.json({ error: error?.message || trError("roadmapCreateFailed", locale) }, { status: 500 });
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

      const { data: savedSteps } = await supabase
        .from("roadmap_steps")
        .select("id, title, description, completed, sort_order")
        .eq("roadmap_id", roadmap.id)
        .order("sort_order", { ascending: true });

      return NextResponse.json({
        ok: true,
        roadmapId: roadmap.id,
        roadmap: {
          id: String(roadmap.id),
          title: roadmap.title,
          templateKey: roadmap.template_key,
          progress: 0,
          steps: (savedSteps || []).map((s) => ({
            id: String(s.id),
            title: s.title,
            description: s.description || undefined,
            completed: Boolean(s.completed),
          })),
        },
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
        return NextResponse.json({ error: error?.message || trError("eventAddFailed", locale) }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        eventId: event.id,
        redirectUrl: `/my/schedule`,
      });
    }

    return NextResponse.json({ error: trError("unsupportedAction", locale) }, { status: 400 });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : trError("actionFailed", locale);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
