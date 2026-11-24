---
name: LNK
description: Bold teal field, sun-yellow actions, giant L·N·K — a confident, community-first brand for Mongolian students in Korea.
colors:
  teal: "#1f6f62"        # brand field (hero, active nav, primary buttons)
  teal-deep: "#14564c"   # hover / small teal text on light
  sun: "#ffcf3f"         # main call to action, highlights, focus ring
  mint: "#9fe0d2"        # third letter (K), soft accents
  ink: "#111a19"         # text, dark sections, secondary buttons
  mist: "#f1f4f3"        # card fill on white
  line: "#d3dcda"        # borders, inactive chips
  soft: "#47605b"        # body text on white (≥ 4.5:1)
typography:
  family: "Pretendard Variable (self-hosted). Hangul + Latin from the package's dynamic subset; Cyrillic (incl. Mongolian Ө ө Ү ү) from public/fonts/PretendardVariable-cyrillic.woff2. One family for kr / en / mn."
  display: "800, -0.035em, line-height 1.05 (hero clamp 40→96px; en/mn 36→76px)"
  h2: "800, -0.03em, clamp 32→58px"
  body: "15–19px, line-height 1.65, color soft"
  korean: "word-break: keep-all"
tokens_in_code:
  tailwind: "colors.brand.{DEFAULT,deep,mint,sun,ink,mist,line,soft}"
  shared_ui: "components/lnk/ui.tsx (card, cardHover, btnPrimary, btnSun, btnOutline, input …)"
  home: "app/[locale]/home.css (.b3-*)"
---

# LNK design system (B3)

Chosen from the "LNK 홈 시안 3종" canvas (variant B3, Skola-referenced, not copied).

## Shapes
- Pills for every button and chip (`rounded-full`), cards `24–28px`, big fields `28–36px`.
- No gradients, no glassmorphism, no left-border cards, no emoji.

## Buttons
- **Sun** (yellow, ink text): the one main action per screen.
- **Ink** / **teal**: secondary solid. **Outline ink**: tertiary.
- Hover: lift 2px + soft colored shadow; arrow icons slide 3–5px. Active: back down.

## Motion
- Ease `cubic-bezier(.22,1,.36,1)`; 300ms for controls, 500–800ms for cards and reveals.
- Cards lift 4–6px on hover; covers/images zoom to 1.06 (`group-hover`), cover letters to 1.18.
- Sections fade up on scroll (`[data-reveal]`, IntersectionObserver); the hero L·N·K rise on load.
- Everything turns off under `prefers-reduced-motion`.

## Home patterns
- Hero: teal field, giant L·N·K (sun / white / mint), visa chips that prefill sign-up.
- Split scroll (Skola-style): sticky preview on the left, steps scroll on the right; phones get swipeable step cards above the preview.
- First-visit guide (HUR-style): 4-step card, bottom-left (desktop) / above the chat button (phone), remembered in `localStorage`.
- Yellow "ask in Mongolian" band: example questions open the AI assistant prefilled.

## Rules
- Show only real things: real services, real verified experts, rules from the official manual. Unknown data stays out — never invent numbers or testimonials.
- The site header is not part of this pass; leave `components/layout/Header.tsx` as is.
- Focus ring: 3px sun outline (main and footer).
