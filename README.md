# MentorLink - Production Platform

A full-stack web platform for international students studying in Korea, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🌍 **Multi-language Support**: Korean, English, and Mongolian (i18n)
- 🤖 **AI Chatbot**: OpenAI-powered assistant that can search and guide users
- 👥 **Mentor Matching**: Find mentors for visa, housing, healthcare, academic support, and more
- 📚 **Lectures**: Online and offline courses
- 👨‍👩‍👧‍👦 **Community Groups**: Connect with other international students
- 💼 **Freelancer Groups**: Find freelance opportunities
- 📖 **Study in Korea Guide**: Comprehensive information about visas, housing, hospitals, and life tips

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **State Management**: Zustand (optional)
- **AI**: OpenAI API
- **Icons**: Lucide React

## Database

schema.sql 전체를 Supabase SQL Editor에서 한 번 실행 (idempotent)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mentorlink
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:

```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/
│   ├── [locale]/          # Localized routes
│   │   ├── page.tsx       # Home page
│   │   ├── mentors/      # Mentors page
│   │   ├── lectures/      # Lectures page
│   │   ├── community/     # Community page
│   │   ├── freelancers/   # Freelancers page
│   │   └── study-in-korea/ # Study guide page
│   ├── api/
│   │   └── chat/          # Chatbot API endpoint
│   └── globals.css        # Global styles
├── components/
│   ├── layout/            # Layout components
│   ├── chatbot/           # AI Chatbot component
│   └── cards/             # Card components
├── lib/
│   ├── i18n/              # i18n configuration
│   ├── ai/                 # AI/OpenAI utilities
│   └── search/            # Internal search functionality
├── data/
│   └── mockData.ts         # Mock data
└── types/
    └── index.ts            # TypeScript types
```

## Features in Detail

### AI Chatbot

The chatbot is available on every page as a floating button. It can:

- Answer questions about the platform
- Search internal content (mentors, lectures, community, etc.)
- Provide recommendations based on user queries
- Respond in the user's selected language (KR/EN/MN)

Example queries:

- "한국에서 유학하려면 비자 어떻게 해?" (How do I get a visa to study in Korea?)
- "프리랜서 일 할 수 있는 커뮤니티 찾아줘" (Find me a community for freelancers)
- "몽골 학생 멘토 추천해줘" (Recommend a mentor for Mongolian students)

### i18n

The platform supports three languages:

- Korean (kr) - Default
- English (en)
- Mongolian (mn)

URLs are locale-prefixed:

- `/kr/mentors` - Korean
- `/en/mentors` - English
- `/mn/mentors` - Mongolian

### Pages

1. **Home** (`/[locale]/`): Landing page with feature overview
2. **Mentors** (`/[locale]/mentors`): Browse and filter mentors
3. **Lectures** (`/[locale]/lectures`): Online and offline courses
4. **Community** (`/[locale]/community`): Community groups
5. **Freelancers** (`/[locale]/freelancers`): Freelancer groups and opportunities
6. **Study in Korea** (`/[locale]/study-in-korea`): Comprehensive guide with visa, housing, hospital, and life tips

## Development

### Adding New Translations

1. Add translations to `lib/i18n/messages/[locale].json`
2. Use translations in components with `useTranslations('namespace')`

### Adding New Pages

1. Create a new folder in `app/[locale]/`
2. Add `page.tsx` with your page component
3. Add translations to all locale files
4. Update navigation in `components/layout/Header.tsx`

### Mock Data

Currently using mock data from `data/mockData.ts`. Replace with real API calls when backend is ready.

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `OPENAI_API_KEY`: Required for chatbot functionality
- `NEXT_PUBLIC_APP_URL`: App URL (optional)

## License

MIT
