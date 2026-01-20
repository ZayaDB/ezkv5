import OpenAI from 'openai';
import { searchContent, SearchResult } from '@/lib/search';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface ChatContext {
  locale: string;
  searchResults?: SearchResult[];
}

export async function getChatbotResponse(
  message: string,
  context: ChatContext
): Promise<{ response: string; links?: SearchResult[] }> {
  try {
    // First, search internal content
    const searchResults = searchContent(message, context.locale);

    // Build system prompt with site context
    const localeNames: Record<string, string> = {
      kr: 'Korean',
      en: 'English',
      mn: 'Mongolian',
    };

    const systemPrompt = `You are a helpful AI assistant for MentorLink, a platform for international students studying in Korea.

Available pages and features:
- Mentors (/mentors): Find mentors who can help with visa, housing, healthcare, academic support, career, and daily life. Categories include: Visa & Immigration, Housing, Healthcare, Academic Support, Career & Freelance, Daily Life
- Lectures (/lectures): Online and offline lectures on Korean language, visa applications, tech careers, and more
- Community Groups (/community): Connect with other international students. Groups include: International Students Seoul, Mongolian Students in Korea, Tech Students Korea
- Freelancer Groups (/freelancers): Find freelance job opportunities. Categories: Translation, Web Development, Content Creation
- Study in Korea (/study-in-korea): Comprehensive information about visa (D-2 student visa), housing (Goshiwon, one-room, shared), hospitals (healthcare system, insurance), and life tips

Current language: ${localeNames[context.locale] || 'Korean'}

When users ask questions:
1. If they're asking about finding mentors, lectures, community, freelancers, or study information, recommend the relevant page with the full path
2. Use the search results provided to give specific recommendations with links
3. Always respond in the user's selected language (${localeNames[context.locale] || 'Korean'})
4. Never make up information that doesn't exist on the site
5. Be warm, helpful, and empathetic
6. If search results are provided, format them clearly with titles and URLs

Example responses:
- For visa questions: "비자 관련 도움이 필요하시군요! MentorLink의 '한국 유학' 페이지(/study-in-korea)에서 비자 신청 가이드를 확인하실 수 있습니다. 또한 비자 전문 멘토들도 찾아보실 수 있어요(/mentors)."
- For mentor search: "멘토를 찾고 계시는군요! /mentors 페이지에서 비자, 주거, 의료, 학업 지원 등 다양한 분야의 멘토를 찾으실 수 있습니다."`;

    const userMessage = searchResults.length > 0
      ? `${message}\n\nRelevant content found:\n${searchResults.map((r) => `- ${r.title}: ${r.description}`).join('\n')}`
      : message;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return {
      response,
      links: searchResults.length > 0 ? searchResults : undefined,
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    // Fallback response
    const fallbackMessages = {
      kr: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
      en: 'Sorry, an error occurred. Please try again.',
      mn: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.',
    };

    return {
      response: fallbackMessages[context.locale as keyof typeof fallbackMessages] || fallbackMessages.en,
    };
  }
}


