import OpenAI from 'openai';
import { searchContent, SearchResult } from '@/lib/search';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  timeout: 20_000,
});

export interface ChatContext {
  locale: string;
  searchResults?: SearchResult[];
}

export async function getChatbotResponse(
  message: string,
  context: ChatContext
): Promise<{ response: string; links?: SearchResult[] }> {
  let searchResults: SearchResult[] = [];
  try {
    searchResults = await searchContent(message, context.locale);

    // Build system prompt with site context
    const localeNames: Record<string, string> = {
      kr: 'Korean',
      en: 'English',
      mn: 'Mongolian',
    };

    const systemPrompt = `You are a helpful AI assistant for MentorLink, a life-assistant platform for international students in Korea.

Available pages:
- Mentors (/mentors): visa, housing, healthcare, academic, career, daily life
- Lectures (/lectures): online and offline courses
- Community (/community): posts, comments, groups, jobs
- Study in Korea (/study-in-korea): visa, housing, hospitals, life tips
- Calendar (/calendar), Assistant (/assistant): talk to the assistant to create step-by-step tasks shown on the dashboard

Current language: ${localeNames[context.locale] || 'Korean'}

When users ask questions:
1. Recommend only pages that exist, with the full path
2. Use the search results to give specific recommendations
3. Always respond in the user's selected language (${localeNames[context.locale] || 'Korean'})
4. Never make up information
5. Be brief, warm, and practical

Example responses:
- For visa questions: "비자 관련 도움이 필요하시군요! MentorLink의 '한국 유학' 페이지(/study-in-korea)에서 비자 신청 가이드를 확인하실 수 있습니다. 또한 비자 전문 멘토들도 찾아보실 수 있어요(/mentors)."
- For mentor search: "멘토를 찾고 계시는군요! /mentors 페이지에서 비자, 주거, 의료, 학업 지원 등 다양한 분야의 멘토를 찾으실 수 있습니다."`;

    const userMessage = searchResults.length > 0
      ? `${message}\n\nRelevant content found:\n${searchResults.map((r) => `- ${r.title}: ${r.description}`).join('\n')}`
      : message;

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      { timeout: 20_000 }
    );

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return {
      response,
      links: searchResults.length > 0 ? searchResults : undefined,
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    const guidePrefix = {
      kr: 'AI 연결이 불안정해 가이드 모드로 안내드릴게요.',
      en: 'AI connection is unstable, switching to guide mode.',
      mn: 'AI холболт тогтворгүй байна, guide mode руу шилжлээ.',
    };
    const guideSuffix = {
      kr: '멘토는 `/mentors`, 강의는 `/lectures`, 생활/비자는 `/study-in-korea`에서 확인할 수 있어요.',
      en: 'You can check mentors at `/mentors`, lectures at `/lectures`, and visa/life info at `/study-in-korea`.',
      mn: 'Ментор `/mentors`, лекц `/lectures`, виз/амьдралын мэдээлэл `/study-in-korea` хэсгээс үзээрэй.',
    };

    return {
      response: `${guidePrefix[context.locale as keyof typeof guidePrefix] || guidePrefix.en}\n\n${
        guideSuffix[context.locale as keyof typeof guideSuffix] || guideSuffix.en
      }`,
      links: searchResults.length > 0 ? searchResults.slice(0, 4) : undefined,
    };
  }
}


