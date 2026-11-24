# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Mongolian international students already living in Korea, on language-study (D-4), degree-study (D-2) or job-seeking (D-10) visas, plus graduates moving on to work (E-7) and residence (F-2, F-2-7) visas. They are in the middle of a stay with a real expiry date, often reading Korean as a second language, and need to know what to do next to keep and upgrade their status. (Confirmed by the user, 2026-11-24.)

Secondary (not the first target): students from other countries, and Mongolian students still preparing to come to Korea.

## Product Purpose

LNK (Learn · Network · Keep) is a life assistant for international students in Korea. It turns the visa a student holds today into a personal roadmap toward permanent residence, with dated next steps and the documents for each, and connects the student to Korean practice, university-admission guidance and real people (senior mentors and a licensed immigration administrator) when they get stuck.

Success: a student signs up, sees their own roadmap and the one thing to do now, and comes back for the next step; the visa roadmap is the paid core.

## Positioning

The visa roadmap is computed by rules from the Ministry of Justice "외국인체류 안내매뉴얼" (Nov 2026 edition), not guessed by AI: current visa + expiry + desired visa produce the route (e.g. D-2 → E-7 → F-2-7 → F-5-16) with deadlines, requirements and documents, in Korean, English and Mongolian. Consultants and study-abroad agencies sell advice per session; LNK gives every student their own ongoing plan and escalates to a human only when needed.

## Operating Context

- Students enter visa type and expiry date at sign-up; the roadmap is built on My page from that data and is members-only (not public).
- A visa-only AI assistant answers from the manual text.
- Students can book and pay for mentor sessions (1:1 messages, video consultations) and live classes with replays.
- University admissions are handled through existing application sites (UwayApply / JinhakApply); LNK explains, it does not take applications.
- Korean is the default locale; every string is translated (kr/en/mn).

## Capabilities and Constraints

- Next.js 14 + Supabase + Netlify; main auto-deploys; changes go to a preview branch first.
- Supported roadmap visas: D-4, D-2, D-10, E-7, F-2, F-2-7 → up to F-5-1, F-5-10, F-5-16.
- Payments are wired (PortOne + Toss Payments) but run in test mode until a Korean business registration exists.
- Undecided: pricing of the visa roadmap membership; platform fee percentage.

## Brand Commitments

- Name and meaning: LNK = Learn · Network · Keep.
- The "Letters" LNK wordmark (each letter carrying Learn / Network / Keep) in `public/brand/` is the logo; LNK teal is the brand colour family.
- Korean-first, fully translated into English and Mongolian; untranslated text reads as an error.
- Work is held to a professional standard: nothing that looks like a demo or placeholder ships on public pages.

## Evidence on Hand

- Real: one verified expert mentor, administrator 임효선 (E-7 visa and immigration filings), with photo and profile in the database.
- Real: the visa rules and documents themselves (manual-based content in `lib/visa/`), the Korean question bank (`lib/korean/questions.ts`) and the admission guide content (`lib/admission/content.ts`).
- Real: logo files in `public/brand/`.
- Absent, never to be fabricated: user counts, testimonials, reviews, success rates, partner logos, press. The other mentors and lectures in the database are seed/demo content and must not be presented as real.
- The user answered the assets question with "CTA" (interpreted as: no further real photos or proof yet; the page must drive to sign-up / roadmap creation). Confirm with the user.

## Product Principles

1. Show the student their own next step, not a catalogue of features.
2. Rules and sources over persuasion: every visa statement traces to the manual; say when something needs the immigration office to decide.
3. Mongolian students should never feel like guests in a Korean-only service.
4. Escalate to a real person when software cannot be sure.
5. Never show placeholder, demo or empty content to a visitor.

## Accessibility & Inclusion

Many users read Korean as a second language: plain wording, no idioms in critical text, language switch always reachable, mobile-first reading (most students use phones).
