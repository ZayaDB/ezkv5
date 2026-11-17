import OpenAI from "openai";
import { guideContext, retrieve } from "@/lib/visa/assistant";
import { MANUAL_SOURCE } from "@/lib/visa/manualSearch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  timeout: 20_000,
});

const LANG: Record<string, string> = { kr: "Korean", en: "English", mn: "Mongolian" };

/**
 * 비자 전용 AI 답변
 * - 매뉴얼에서 찾은 부분 + 우리가 정리한 비자 안내만 보고 답하게 함 (지어내지 않게)
 * - 실패하면 throw → 호출한 쪽에서 규칙 기반 답변으로 넘어감
 */
export async function getVisaAnswer(message: string, locale: string): Promise<{ response: string; sections: string[] }> {
  const { hits, codes } = retrieve(message);
  const lang = LANG[locale] || "Korean";

  const excerpts = hits.length
    ? hits.map((h, i) => `[#${i + 1} ${h.section}]\n${h.text.slice(0, 2600)}`).join("\n\n")
    : "(no matching excerpt)";

  const system = `You are the visa assistant of LNK (MentorLink), a service for international students in Korea.
You ONLY answer questions about Korean visas and stay rules (visa types, extension, status change, part-time work permits, alien registration, permanent residence, required documents, fees).
If the question is not about visas or stay rules, politely say you can only help with visa and stay questions, in one or two sentences.

Rules:
- Answer ONLY from the manual excerpts and the LNK visa guide below. Do not use outside knowledge and never invent numbers, dates, fees or documents.
- If the excerpts don't contain the answer, say you couldn't find it in the manual and suggest a visa expert (administrative agent) consultation at /mentors?category=visa.
- Write in ${lang}. Use short sentences and simple words; many users are still learning the language.
- Keep it short: at most about 8 lines. Use a short bullet list for documents or conditions.
- End with one line naming the source, e.g. "${MANUAL_SOURCE} — <section name>", translated naturally into ${lang}.
- When useful, point to the LNK pages: /visa (build a visa roadmap) or /visa/<code in lowercase, e.g. d-2, e-7, f-2-7> (visa guide).
- Remind that the immigration office makes the final decision only if the answer is about eligibility.`;

  const user = `Question:\n${message}\n\n=== LNK visa guide (already in ${lang}) ===\n${guideContext(locale, codes) || "(none)"}\n\n=== Manual excerpts (Korean, ${MANUAL_SOURCE}) ===\n${excerpts}`;

  const completion = await openai.chat.completions.create(
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 700,
    },
    { timeout: 20_000 }
  );

  const response = completion.choices[0]?.message?.content?.trim();
  if (!response) throw new Error("empty completion");
  return { response, sections: [...new Set(hits.map((h) => h.section))] };
}
