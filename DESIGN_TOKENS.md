# MentorLink – Design Tokens Reference

Quick reference for all design tokens used in the MentorLink design system.

---

## 🎨 Colors

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#E6F2FF` | Light backgrounds, hover states |
| `primary-100` | `#CCE5FF` | Subtle backgrounds |
| `primary-500` | `#0066FF` | **Main brand color** - Buttons, links, accents |
| `primary-700` | `#0052CC` | Hover states, active states |
| `primary-900` | `#003D99` | Dark text on light backgrounds |

**Usage**: Trust, clarity, action. Use for primary CTAs, links, and brand elements.

---

### Accent Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-50` | `#E6FCF7` | Success backgrounds |
| `accent-500` | `#00C896` | **Success color** - Confirmations, positive states |
| `accent-700` | `#00A078` | Dark success states |

**Usage**: Success, growth, support. Use for success messages, confirmations, positive indicators.

---

### Neutral Palette (Warm Gray)

| Token | Hex | Usage |
|-------|-----|-------|
| `gray-50` | `#FAFAFA` | Page backgrounds |
| `gray-100` | `#F5F5F5` | Subtle borders, dividers |
| `gray-200` | `#E5E5E5` | Borders, input borders |
| `gray-400` | `#A3A3A3` | Placeholder text, disabled states |
| `gray-600` | `#525252` | Body text, secondary text |
| `gray-900` | `#171717` | Headings, primary text |

**Usage**: All text, backgrounds, borders. Warm tone (not cold blue-gray).

---

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#00C896` | Success messages, confirmations |
| `warning` | `#FFB800` | Warnings, caution states |
| `error` | `#FF4444` | Errors, destructive actions |
| `info` | `#0066FF` | Informational messages |

---

## 📝 Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Primary**: Inter (Google Fonts)  
**Fallback**: System fonts for performance

---

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `display` | `48px` | `56px` | Landing page hero |
| `h1` | `36px` | `44px` | Page titles |
| `h2` | `28px` | `36px` | Section headers |
| `h3` | `22px` | `30px` | Card titles |
| `h4` | `18px` | `26px` | Subsection headers |
| `body-lg` | `18px` | `28px` | Important body text |
| `body` | `16px` | `24px` | Default body text |
| `body-sm` | `14px` | `20px` | Secondary text |
| `caption` | `12px` | `16px` | Labels, metadata |

---

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `regular` | `400` | Body text |
| `medium` | `500` | Emphasis, buttons |
| `semibold` | `600` | Headings, labels |
| `bold` | `700` | Strong emphasis |

---

## 📏 Spacing

**Base Unit**: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `4px` | Tight spacing |
| `sm` | `8px` | Small gaps |
| `md` | `16px` | Default spacing |
| `lg` | `24px` | Section spacing |
| `xl` | `32px` | Large gaps |
| `2xl` | `48px` | Extra large spacing |
| `3xl` | `64px` | Hero spacing |
| `4xl` | `96px` | Maximum spacing |

**Usage**: Use multiples of 4px for consistency. Prefer `md` (16px) as default.

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `6px` | Buttons, inputs, small elements |
| `md` | `8px` | Cards, default elements |
| `lg` | `12px` | Large cards, modals |
| `xl` | `16px` | Extra large modals, hero sections |

**Usage**: Subtle rounding. Avoid sharp corners, but don't over-round.

---

## 🌑 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle elevation |
| `md` | `0 2px 8px rgba(0,0,0,0.08)` | Cards, default elevation |
| `lg` | `0 4px 16px rgba(0,0,0,0.12)` | Modals, dropdowns |
| `xl` | `0 8px 24px rgba(0,0,0,0.16)` | Large modals, overlays |

**Usage**: Subtle, layered. Use sparingly. Hover states: increase shadow by one level.

---

## ⚡ Transitions

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `fast` | `150ms` | `ease` | Hover states, quick feedback |
| `default` | `200ms` | `ease` | Default transitions |
| `slow` | `300ms` | `ease` | Complex animations, page transitions |

**Usage**: Keep transitions subtle. Fast for interactions, slow for page changes.

---

## 🎯 Component-Specific Tokens

### Buttons

```css
/* Primary Button */
background: primary-500
color: white
hover: primary-700
border-radius: sm (6px)
padding: md (16px) horizontal, md (16px) vertical
font-weight: medium (500)
transition: default (200ms)

/* Secondary Button */
background: gray-100
color: gray-900
hover: gray-200
```

### Cards

```css
background: white
border: 1px solid gray-200
border-radius: md (8px)
padding: lg (24px)
shadow: md
hover: shadow-lg (on hover)
```

### Inputs

```css
border: 1px solid gray-200
border-radius: sm (6px)
padding: md (16px)
focus: ring-2 ring-primary-500, border-primary-500
```

### Badges

```css
padding: xs (4px) horizontal, xs (4px) vertical
border-radius: sm (6px)
font-size: body-sm (14px)
font-weight: medium (500)
```

---

## 📱 Responsive Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `640px` | Small tablets, large phones |
| `md` | `768px` | Tablets |
| `lg` | `1024px` | Small desktops |
| `xl` | `1280px` | Desktops |
| `2xl` | `1536px` | Large desktops |

**Approach**: Mobile-first. Design for mobile, enhance for desktop.

---

## 🎨 Usage Guidelines

### Color

- **Primary Blue**: Use for primary actions, links, brand elements
- **Accent Green**: Use for success, confirmations, positive feedback
- **Gray Scale**: Use for all text, backgrounds, borders
- **Semantic Colors**: Use sparingly, only for their specific purpose

### Typography

- **Headings**: Use semibold (600) or bold (700)
- **Body**: Use regular (400) or medium (500) for emphasis
- **Line Height**: Always 1.5x font size for body, tighter for headings

### Spacing

- **Consistency**: Use the spacing scale, don't invent values
- **Hierarchy**: More space = more importance
- **Breathing Room**: Generous spacing feels premium

### Shadows

- **Subtle**: Shadows should be barely noticeable
- **Purpose**: Use to create depth, not decoration
- **Hover**: Increase shadow by one level on hover

---

## 💻 Code Examples

### Tailwind CSS

```jsx
// Button
<button className="bg-primary-500 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors">
  Find Your Mentor
</button>

// Card
<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
  {/* Content */}
</div>

// Text
<h1 className="text-4xl font-bold text-gray-900">Your Title</h1>
<p className="text-base text-gray-600">Body text</p>
```

### CSS Variables

```css
:root {
  --color-primary-500: #0066FF;
  --color-accent-500: #00C896;
  --color-gray-900: #171717;
  --spacing-md: 16px;
  --radius-md: 8px;
  --shadow-md: 0 2px 8px rgba(0,0,0,0.08);
}
```

---

## ✅ Checklist

When implementing components, ensure:

- [ ] Colors match the design tokens
- [ ] Typography uses the type scale
- [ ] Spacing uses the spacing scale (multiples of 4px)
- [ ] Border radius matches the scale
- [ ] Shadows are subtle and appropriate
- [ ] Transitions are smooth (150-300ms)
- [ ] Responsive breakpoints are used correctly
- [ ] Accessibility is considered (contrast, focus states)

---

**These tokens are the foundation of the design system. Use them consistently to maintain visual harmony and brand identity.**



