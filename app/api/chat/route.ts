import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/ai/chatbot";

const errorMessages: Record<string, string> = {
  kr: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  en: "Sorry, a temporary error occurred. Please try again later.",
  mn: "Уучлаарай, түр алдаа гарлаа. Дараа дахин оролдоно уу.",
};

export async function POST(request: NextRequest) {
  let locale = "kr";
  try {
    const body = await request.json();
    const { message, locale: loc } = body;
    locale = typeof loc === "string" ? loc : "kr";

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      const fallbackMessages: Record<string, string> = {
        kr: "죄송합니다. AI 기능을 사용하려면 OpenAI API 키가 필요합니다. 환경 변수에 OPENAI_API_KEY를 설정해주세요.",
        en: "Sorry, OpenAI API key is required for AI features. Please set OPENAI_API_KEY in environment variables.",
        mn: "Уучлаарай, AI функцийг ашиглахын тулд OpenAI API түлхүүр шаардлагатай. Орчны хувьсагчид OPENAI_API_KEY-г тохируулна уу.",
      };

      return NextResponse.json({
        response: fallbackMessages[locale] || fallbackMessages.kr,
        links: [],
      });
    }

    const result = await getChatbotResponse(message, {
      locale,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      response: errorMessages[locale] || errorMessages.kr,
      links: [],
    });
  }
}
