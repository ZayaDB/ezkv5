import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/ai/chatbot";
import { useLocale } from "next-intl";

export async function POST(request: NextRequest) {
  try {
    const { message, locale } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      // Fallback response without OpenAI
      const fallbackMessages: Record<string, string> = {
        kr: "죄송합니다. AI 기능을 사용하려면 OpenAI API 키가 필요합니다. 환경 변수에 OPENAI_API_KEY를 설정해주세요.",
        en: "Sorry, OpenAI API key is required for AI features. Please set OPENAI_API_KEY in environment variables.",
        mn: "Уучлаарай, AI функцийг ашиглахын тулд OpenAI API түлхүүр шаардлагатай. Орчны хувьсагчид OPENAI_API_KEY-г тохируулна уу.",
      };

      return NextResponse.json({
        response: fallbackMessages[locale as string] || fallbackMessages.kr,
        links: [],
      });
    }

    const result = await getChatbotResponse(message, {
      locale: locale || "kr",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);

    // Return user-friendly error message
    const errorMessages: Record<string, string> = {
      kr: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      en: "Sorry, a temporary error occurred. Please try again later.",
      mn: "Уучлаарай, түр алдаа гарлаа. Дараа дахин оролдоно уу.",
    };

    return NextResponse.json({
      response: errorMessages[useLocale() as string] || errorMessages.kr,
      links: [],
    });
  }
}
