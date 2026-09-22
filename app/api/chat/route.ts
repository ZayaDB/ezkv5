import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/ai/chatbot";
import { buildActionAssistantResponse } from "@/lib/ai/assistantActions";
import { resolveTemplateKey } from "@/lib/roadmap/templates";
import { searchContent, type SearchResult } from "@/lib/search";
import { getApiUser } from "@/lib/middleware/supabaseApiAuth";
import { createServerSupabase } from "@/lib/supabase/server";

const errorMessages: Record<string, string> = {
  kr: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  en: "Sorry, a temporary error occurred. Please try again later.",
  mn: "Уучлаарай, түр алдаа гарлаа. Дараа дахин оролдоно уу.",
};

const quotaMessages: Record<string, string> = {
  kr: "오늘의 AI 대화 이용 한도(30회)에 도달했습니다. 내일 다시 이용해주세요.",
  en: "You've reached today's AI chat limit (30 uses). Please try again tomorrow.",
  mn: "Өнөөдрийн AI чатын хязгаар (30 удаа) хүрлээ. Маргааш дахин оролдоно уу.",
};

function buildLocalGuideResponse(
  message: string,
  locale: string,
  links: SearchResult[]
): { response: string; links: SearchResult[] } {
  const m = message.toLowerCase();
  const isVisa = /비자|체류|visa|immigration|d-2|виз/.test(m);
  const isHousing = /주거|집|원룸|기숙사|housing|room|байр|орон сууц/.test(m);
  const isHealth = /병원|보험|health|hospital|clinic|эмнэлэг|даатгал/.test(m);
  const isMentor = /멘토|mentor|ментор/.test(m);
  const isLecture = /강의|수강|lecture|course|лекц/.test(m);
  const isCommunity = /커뮤니티|모임|community|group|нийгэмлэг/.test(m);

  const msg: Record<string, string> = {
    kr: "필요한 정보를 빠르게 찾을 수 있도록 도와드릴게요.",
    en: "I can help you quickly find the right page.",
    mn: "Танд хэрэгтэй мэдээллийг хурдан олоход тусалъя.",
  };
  const tips: Record<string, string[]> = {
    kr: [
      "비자/체류: `/study-in-korea` 또는 비자 멘토 `/mentors`",
      "주거/생활: `/study-in-korea`",
      "멘토 상담: `/mentors`",
      "강의 탐색: `/lectures`",
      "커뮤니티: `/community`",
    ],
    en: [
      "Visa/Stay: `/study-in-korea` or visa mentors `/mentors`",
      "Housing/Life: `/study-in-korea`",
      "Mentor consultation: `/mentors`",
      "Lectures: `/lectures`",
      "Community: `/community`",
    ],
    mn: [
      "Виз/оршин суух: `/study-in-korea` эсвэл визийн ментор `/mentors`",
      "Байр/амьдрал: `/study-in-korea`",
      "Ментор зөвлөгөө: `/mentors`",
      "Лекц хайх: `/lectures`",
      "Нийгэмлэг: `/community`",
    ],
  };

  let first: string;
  if (isVisa) first = tips[locale]?.[0] || tips.kr[0];
  else if (isHousing || isHealth) first = tips[locale]?.[1] || tips.kr[1];
  else if (isMentor) first = tips[locale]?.[2] || tips.kr[2];
  else if (isLecture) first = tips[locale]?.[3] || tips.kr[3];
  else if (isCommunity) first = tips[locale]?.[4] || tips.kr[4];
  else first = tips[locale]?.[0] || tips.kr[0];

  const response = `${msg[locale] || msg.kr}\n\n${first}`;
  return { response, links: links.slice(0, 4) };
}

async function ruleBasedJson(messageText: string, locale: string, actionIntent: boolean) {
  if (actionIntent) {
    const actionResult = buildActionAssistantResponse(messageText, locale);
    const links = await searchContent(messageText, locale);
    return NextResponse.json({
      ...actionResult,
      links: links.slice(0, 4),
      mode: "assistant",
    });
  }
  const links = await searchContent(messageText, locale);
  return NextResponse.json({
    ...buildLocalGuideResponse(messageText, locale, links),
    mode: "guide",
  });
}

export async function POST(request: NextRequest) {
  let locale = "kr";
  let messageText = "";
  try {
    const body = await request.json();
    const { message, locale: loc } = body;
    locale = typeof loc === "string" ? loc : "kr";
    messageText = typeof message === "string" ? message : "";

    if (!messageText) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (messageText.length > 500) {
      return NextResponse.json(
        { error: "Message must be 500 characters or fewer" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim() || "";
    const looksInvalidKey = !/^sk-[A-Za-z0-9._-]{20,}$/.test(apiKey);

    const actionIntent = Boolean(
      resolveTemplateKey(messageText) ||
        /이사|일정|캘린더|멘토|비자|연장|calendar|moving|visa|mentor/i.test(messageText)
    );

    const user = await getApiUser();

    // 비로그인·액션 의도·유효하지 않은 키: OpenAI 호출 없이 규칙 기반 응답만
    if (!user || actionIntent || looksInvalidKey) {
      return await ruleBasedJson(messageText, locale, actionIntent);
    }

    const supabase = await createServerSupabase();
    const { data: allowed, error: quotaError } = await supabase.rpc("consume_chat_quota", {
      p_limit: 30,
    });

    if (quotaError || allowed !== true) {
      return NextResponse.json(
        {
          response: quotaMessages[locale] || quotaMessages.kr,
          links: [],
          mode: "limited",
        },
        { status: 429 }
      );
    }

    const result = await getChatbotResponse(messageText, {
      locale,
    });

    return NextResponse.json({ ...result, mode: "chat" });
  } catch (error) {
    console.error("Chat API error:", error);
    const links = messageText ? await searchContent(messageText, locale) : [];
    if (messageText) return NextResponse.json(buildLocalGuideResponse(messageText, locale, links));
    return NextResponse.json({
      response: errorMessages[locale] || errorMessages.kr,
      links: [],
    });
  }
}
