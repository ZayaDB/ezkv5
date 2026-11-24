---
name: LNK
description: Your stay, as a living document — a security-print paper world for international students' visa routes.
colors:
  paper: "#edf3f0"
  sheet: "#f8fbf9"
  ink: "#10302e"
  ink-soft: "#4c625e"
  teal: "#1f6f62"
  stamp-red: "#b3372b"
  rule: "#c7d7d1"
  close-bg: "#10302e"
  close-ink: "#f3f8f6"
  close-soft: "#b9d0ca"
  dark-paper: "#0f1917"
  dark-sheet: "#13211e"
  dark-ink: "#e6f0ec"
  dark-ink-soft: "#a7bdb7"
  dark-teal: "#6fc1b1"
  dark-stamp-red: "#ec8a7c"
  dark-rule: "#2b3d38"
typography:
  display:
    fontFamily: "Pretendard, system-ui, sans-serif"
    fontSize: "54px"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "Pretendard, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Pretendard, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Pretendard, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Pretendard, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
  data:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
rounded:
  stamp: "8px"
  slip: "12px"
  document: "14px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "48px"
  section: "88px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  stamp-now:
    textColor: "{colors.stamp-red}"
    rounded: "{rounded.stamp}"
    padding: "9px 12px"
  stamp-next:
    textColor: "{colors.teal}"
    rounded: "{rounded.stamp}"
    padding: "9px 12px"
  slip:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.slip}"
    padding: "32px"
  document:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.document}"
---

## Overview

LNK's visual world is a **personal stay document on security paper**. The product turns the visa a student holds into a dated route to permanent residence, so the interface is built like a document the student owns: labelled form fields, ruled rows, stamped visa codes, one red ink for "now" and deadlines, fine guilloche line-work behind it. It must always read as LNK's own document, never as an official government ID: no national emblem, no "대한민국", sample content labelled "예시 · 공식 서류 아님".

Source of truth in code: `app/[locale]/home.css` (CSS variables `--doc-*`, scoped under `.lnk-home`), `components/home/StayHero.tsx`. Product truth lives in `PRODUCT.md`; the home surface's direction contract in `.impeccable/surfaces/app-locale-page-tsx.md`.

## Colors

Restrained-plus-stamp strategy: cool security-paper neutrals tinted from teal, one brand teal for security marks and actions, one stamp red reserved for "now", deadlines and warnings.

- `paper` / `sheet`: page ground and the document sheet. Never warm cream.
- `ink` for text and headings; `ink-soft` for secondary text (≈5.9:1 on paper).
- `teal` (LNK brand) for primary buttons, "next" stamps, checks, links, guilloche (at 12% opacity).
- `stamp-red` only for the current stamp, the "do now" rule, deadlines and expiry warnings. If red appears anywhere else, it is wrong.
- `close-*`: the closing band, deep ink ground with light text.
- Dark theme mirrors every role (`dark-*`); the stamp red lightens to keep contrast.

## Typography

- Pretendard for all prose (Korean-first; Latin and Cyrillic fall back cleanly). Headings 800 weight, tight tracking (-0.03em), `text-wrap: balance`; body `text-wrap: pretty`, `word-break: keep-all` for Korean.
- JetBrains Mono (self-hosted via `@fontsource-variable/jetbrains-mono`) **only for data**: visa codes, dates, the document reference line. Never as decoration for prose.
- Minimum text size 12px (labels); body 15–17px. Many readers use Korean as a second language, so avoid tiny type.
- Dates are formatted in code per locale (kr `2027. 8. 24.`, mn `2027.08.24`, en `24 Aug 2027`), never via `toLocaleDateString`, to avoid server/client mismatches.

## Layout

- Content width 1280px, gutters 20 / 32 / 48px (mobile / tablet / desktop). Sections 88px vertical (64px on phones).
- Hero: 5/12 copy + primary action, 7/12 document. On phones: headline, lead, button, then the document full width with its fields stacked.
- Services: the visa roadmap slip spans the full row (copy left, real steps right); Korean and admission slips share the next row.
- Check every surface at 390px and 1440px (Playwright CLI) and in kr / en / mn; Mongolian copy runs longest.

## Elevation & Depth

Paper, not glass. Depth is one soft, offset shadow on the document only (`0 18px 40px -24px rgba(16,48,46,.45)`). Slips are flat with a 1px rule and a dashed tear line along the top. No glows, no blur, no hard offset shadows.

## Shapes

Rectangles with modest radii: stamps 8px, slips 12px, document 14px. Pills only for buttons, choices and the sample badge. The current-visa stamp sits rotated −3° and stamps in once (520ms, ease-out) when the route changes; reduced motion disables it.

## Components

- **Document field** (`.lnk-field`): small bold label, value on a dashed rule, optional name line underneath. Visa pickers draw their own value (code in mono + name) over an invisible native `<select>`, so long names in en/mn never clip and the native picker stays accessible.
- **Stamp** (`.lnk-stamp`): code + one-word state (지금 / 다음 / 그다음). Connectors are drawn before a stamp, never after, so a wrapped route never ends on a dangling line.
- **Do-now rule**: a 2px red top rule, label, step title, date; `aria-live="polite"`. Expired expiry replaces it with a warning and a link to a human expert.
- **Slip** (`.lnk-slip`): service entry card with tear line; the main slip is outlined in teal. No eyebrow labels above headings.
- **Buttons**: one filled teal primary per view; quiet outlined secondary.

## Do's and Don'ts

- Do show real things working: the rules engine in the hero, a real Korean question that can be answered, the real document checklist.
- Do label every sample as a sample, and keep the official-ID look out (no emblem, no MRZ strips, no "대한민국").
- Do translate everything (kr/en/mn); untranslated text reads as an error.
- Don't show demo lectures, demo mentors, invented numbers, reviews or testimonials.
- Don't use gradients, glass, pulsing dots, icon tiles, eyebrows above headings, cards inside cards, or monospace for prose.
- Don't make elements look tappable unless they are.
