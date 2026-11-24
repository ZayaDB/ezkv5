---
version: 1
slug: "app-locale-page-tsx"
primary_target: "app/[locale]/page.tsx"
related_targets: []
---

# Home (/[locale]) — surface brief

Scope: public home page, all three locales. Mode: Persuade.
Audience: Mongolian students already in Korea (D-4 / D-2 / D-10 and graduates), mostly on phones.
Job: understand in seconds that LNK turns *their* visa into a dated route to permanent residence, then act.
Actions (user-confirmed): three clear entries to the three services — 비자 로드맵 (core, members-only), 한국어 연습, 대학 입시 — with the visa roadmap as primary.
Proof on hand: rules from the Ministry of Justice stay manual (2026-11); one real expert mentor (행정사) with photo. No metrics, reviews or testimonials exist; none may be invented. Demo lectures/mentors must not appear.
Constraints: kr/en/mn fully translated; must never look like an official government ID (no national emblem, no "대한민국", clearly LNK's own document, sample data labelled 예시).
Removed from the old page: monthly TOP-3 lectures/mentors (demo content), generic illustration hero.

## Direction contract

THESIS: Your stay, as a living document. The page refuses the edtech hero (headline + illustration + feature cards); the first thing a student touches is a document of their own status that reprints as they choose a visa.
OWN-WORLD: Security-paper ground (cool mint-grey, never cream) printed with fine teal guilloche line-work; ink is deep blue-teal, LNK teal for security marks, one red stamp ink for "now" and deadlines. Fields set as labelled form rows with hairline rules; codes and dates in a monospaced data face; perforated edges and numbered slips for the three services. No icons tiles, no gradients, no glass.
STORY: The visitor sees their visa become a route (D-2 → E-7 → F-2-7 → F-5-16) with the one thing to do now and its date, learns the rules come from the manual and a real administrator backs it, then takes one of three entries: build my roadmap / test my Korean / check my admission documents.
FIRST VIEWPORT: Left 5/12: plain headline (no eyebrow) and one sentence, primary button "내 로드맵 만들기". Right 7/12 at document scale: the LNK stay document — fields 지금 자격 (working select), 만료일 (example), 목표; route row of stamped visa codes with 지금/다음 stamps; "지금 할 일" line with date; MRZ-style data strip at the foot. Mobile: headline, then the document full-width, then the button.
FORM: Security-print stay document; candidate 2 of my ordered list (LNK pick, chosen by the user over the dealt khadag direction). seed:0b3d28049d912d43
Signature interaction: changing 지금 자격 or 목표 re-computes the real route with the production rules engine and re-stamps the document (one stamp animation).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
