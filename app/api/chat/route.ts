import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/ai/chatbot";
import { searchContent, type SearchResult } from "@/lib/search";

const errorMessages: Record<string, string> = {
  kr: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  en: "Sorry, a temporary error occurred. Please try again later.",
  mn: "Уучлаарай, түр алдаа гарлаа. Дараа дахин оролдоно уу.",
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
  const isFreelance = /프리랜서|알바|job|freelance|ажил/.test(m);

  const msg: Record<string, string> = {
    kr: "필요한 정보를 빠르게 찾을 수 있도록 도와드릴게요.",
    en: "I can help you quickly find the right page.",
    mn: "Танд хэрэгтэй мэдээллийг хурдан олоход тусалъя.",
  };
  const tips: Record<string, string[]> = {
    kr: [
      "비자/체류: `/study-in-korea` 또는 비자 멘토 탐색 `/mentors`",
      "주거/생활: `/study-in-korea`",
      "멘토 상담: `/mentors`",
      "강의 탐색: `/lectures`",
      "커뮤니티: `/community`",
      "프리랜서: `/freelancers`",
    ],
    en: [
      "Visa/Stay: `/study-in-korea` or visa mentors `/mentors`",
      "Housing/Life: `/study-in-korea`",
      "Mentor consultation: `/mentors`",
      "Lectures: `/lectures`",
      "Community: `/community`",
      "Freelance jobs: `/freelancers`",
    ],
    mn: [
      "Виз/оршин суух: `/study-in-korea` эсвэл визийн ментор `/mentors`",
      "Байр/амьдрал: `/study-in-korea`",
      "Ментор зөвлөгөө: `/mentors`",
      "Лекц хайх: `/lectures`",
      "Нийгэмлэг: `/community`",
      "Freelance ажил: `/freelancers`",
    ],
  };

  let first: string;
  if (isVisa) first = tips[locale]?.[0] || tips.kr[0];
  else if (isHousing || isHealth) first = tips[locale]?.[1] || tips.kr[1];
  else if (isMentor) first = tips[locale]?.[2] || tips.kr[2];
  else if (isLecture) first = tips[locale]?.[3] || tips.kr[3];
  else if (isCommunity) first = tips[locale]?.[4] || tips.kr[4];
  else if (isFreelance) first = tips[locale]?.[5] || tips.kr[5];
  else first = tips[locale]?.[0] || tips.kr[0];

  const response = `${msg[locale] || msg.kr}\n\n${first}`;
  return { response, links: links.slice(0, 4) };
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

    const apiKey = process.env.OPENAI_API_KEY?.trim() || "";
    // OpenAI API 키 형식이 아닐 경우 즉시 로컬 가이드 모드로 처리
    const looksInvalidKey = !/^sk-[A-Za-z0-9._-]{20,}$/.test(apiKey);

    if (looksInvalidKey) {
      const links = await searchContent(messageText, locale);
      return NextResponse.json(buildLocalGuideResponse(messageText, locale, links));
    }

    const result = await getChatbotResponse(messageText, {
      locale,
    });

    return NextResponse.json(result);
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
