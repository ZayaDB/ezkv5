import { NextRequest, NextResponse } from "next/server";
import { getVisaAnswer } from "@/lib/ai/chatbot";
import { buildVisaActions } from "@/lib/ai/assistantActions";
import { isVisaTopic, ruleBasedVisaAnswer, visaCopy } from "@/lib/visa/assistant";
import { getApiUser } from "@/lib/middleware/supabaseApiAuth";
import { createServerSupabase } from "@/lib/supabase/server";

const quotaMessages: Record<string, string> = {
  kr: "오늘의 AI 대화 이용 한도(30회)에 도달했습니다. 내일 다시 이용해주세요.",
  en: "You've reached today's AI chat limit (30 uses). Please try again tomorrow.",
  mn: "Өнөөдрийн AI чатын хязгаар (30 удаа) хүрлээ. Маргааш дахин оролдоно уу.",
};

/** AI 없이 답하기 (비로그인, 키 없음, AI 오류일 때) */
function guideJson(message: string, locale: string, mode: "guide" | "limited" = "guide") {
  const visa = isVisaTopic(message);
  return {
    response: ruleBasedVisaAnswer(message, locale),
    actions: visa ? buildVisaActions(message, locale) : [],
    links: [],
    mode,
  };
}

/**
 * 비서 = 비자 전용
 * - 비자·체류와 관계없는 질문은 AI를 부르지 않고 정중히 안내
 * - 로그인 + 유효한 키가 있으면 매뉴얼 검색 결과를 근거로 AI가 답함
 */
export async function POST(request: NextRequest) {
  let locale = "kr";
  let messageText = "";
  try {
    const body = await request.json();
    locale = typeof body.locale === "string" && ["kr", "en", "mn"].includes(body.locale) ? body.locale : "kr";
    messageText = typeof body.message === "string" ? body.message.trim() : "";

    if (!messageText) return NextResponse.json({ error: "Message is required" }, { status: 400 });
    if (messageText.length > 500) {
      return NextResponse.json({ error: "Message must be 500 characters or fewer" }, { status: 400 });
    }

    if (!isVisaTopic(messageText)) {
      return NextResponse.json({ response: visaCopy(locale, "offTopic"), actions: [], links: [], mode: "guide" });
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim() || "";
    const looksInvalidKey = !/^sk-[A-Za-z0-9._-]{20,}$/.test(apiKey);
    const user = await getApiUser();
    if (!user || looksInvalidKey) return NextResponse.json(guideJson(messageText, locale));

    const supabase = await createServerSupabase();
    const { data: allowed, error: quotaError } = await supabase.rpc("consume_chat_quota", { p_limit: 30 });
    if (quotaError || allowed !== true) {
      return NextResponse.json(
        { response: quotaMessages[locale] || quotaMessages.kr, actions: [], links: [], mode: "limited" },
        { status: 429 }
      );
    }

    try {
      const { response } = await getVisaAnswer(messageText, locale);
      return NextResponse.json({ response, actions: buildVisaActions(messageText, locale), links: [], mode: "chat" });
    } catch (err) {
      // 크레딧 부족·네트워크 오류 등: 정리된 비자 안내로 대신 답함
      console.error("Visa AI error:", err);
      return NextResponse.json(guideJson(messageText, locale));
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(guideJson(messageText || "visa", locale));
  }
}
