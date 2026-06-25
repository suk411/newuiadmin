# Design System Inspired by customer service system

> Auto-extracted from `http://52.66.19.235/customer-system/#/recharge/rechargeList` on 2026-06-25

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

**Key Characteristics:**
- Inter as the heading font
- Helvetica Neue as the body font for all running text
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#208fff` used for CTAs and brand highlights
- 5 shadow level(s) detected — tinted shadows
- Rounded corners (4px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, compact, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#208fff`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#409eff`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#208fff`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#f1f1f1`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#f1f1f1` | `--palette-1` | block | large | text-dark |
| 2 | `#208fff` | `--palette-2` | button | medium | text-light |
| 3 | `#ffffff` | `--palette-3` | block | medium | text-dark |
| 4 | `#eaeaea` | `--palette-4` | button | medium | text-dark |
| 5 | `#409eff` | `--palette-5` | text-accent | small | text-dark |
| 6 | `#42b983` | `--palette-6` | button | small | text-dark |

## 3. Typography Rules

- **Heading Font:** `Inter`, sans-serif
- **Body Font:** `Helvetica Neue`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Body | Helvetica Neue | 14px | 400 | 16.1px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `20px` | headings |
| H1 | `18px` | headings |
| H2 | `16px` | headings |
| H3 | `14px` | headings |
| H4 | `13px` | headings |
| Body L | `12px` | body / supporting text |

### Japanese Typography (CJK)

This site uses Japanese (CJK) text. Apply the following rules:

- **Line height:** Use `1.7`–`2.0` for body text (CJK needs more vertical space than Latin)
- **Letter spacing:** Use `0.04em`–`0.08em` for body text (improves Japanese readability)
- **Font fallback:** Always include a Japanese font fallback: `Inter, "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif`
- **Word break:** Use `word-break: normal` and `overflow-wrap: anywhere` — never `break-all` for Japanese
- **Kinsoku (禁則処理):** Avoid line breaks before closing brackets 」）】 or after opening brackets 「（【
- **Heading line-height:** `1.3`–`1.5` (tighter than body, but looser than Latin headings)
- **Minimum body font size:** `14px` (Japanese characters are complex, smaller is hard to read)

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #000000;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 0px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #ffffff;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 13px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #409eff;
  color: #ffffff;
  border-radius: 3px;
  padding: 9px 15px;
  font-size: 12px;
  font-weight: 500;
  border: 0.8px solid rgb(64, 158, 255);
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #ffffff;
  color: #c0c4cc;
  border-radius: 0px;
  padding: 0px 6px;
  font-size: 13px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `2px` — use multiples (4px, 6px, 8px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `2px` | element |
| spacing-2 | `6px` | element |
| spacing-3 | `7px` | element |
| spacing-4 | `20px` | element |
| spacing-5 | `8px` | element |
| spacing-6 | `10px` | element |
| spacing-7 | `12px` | element |
| spacing-8 | `5px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-subtle | `4px` | subtle |
| radius-subtle | `3px` | subtle |
| radius-card | `50px` | card |
| radius-subtle | `2px` | subtle |
| radius-button | `10px` | button |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0.32) 0px 1px 1px 0px, rgba(0, 0, 0, 0.2) 0px 0px 1px 0px` | Cards, subtle elevation |
| Mid | `rgba(0, 0, 0, 0.1) 0px 2px 12px 0px` | Dropdowns, popovers |
| Low | `rgba(0, 0, 0, 0.3) 0px 1px 3px 0px` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0.12) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 0px` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0.3) 2px 2px 3px 0px` | Cards, subtle elevation |

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `Inter` for all headings and `Helvetica Neue` for body text
- Use `#208fff` as the single dominant accent/CTA color
- Maintain `2px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`4px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values
- Use `line-height: 1.7-2.0` for Japanese body text
- Include Japanese font fallback (Noto Sans JP, Hiragino, Yu Gothic)

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Inter/Helvetica Neue with generic alternatives
- Don't use irregular spacing — stick to 2px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette
- Don't use `word-break: break-all` for Japanese text — it breaks in the middle of words
- Don't set body font size below 14px for Japanese — characters are too complex
- Don't use Latin-optimized line-height (1.2-1.4) for Japanese body text

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 2px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #208fff
Secondary:   #409eff
Border:      #f1f1f1
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Inter` heading in `#000000`, and a `#208fff` CTA button with 3px radius."
2. "Create a pricing card using background `#208fff`, border `#f1f1f1`, `Helvetica Neue` for text, and 6px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#208fff` for active state."
4. "Build a feature grid with 3 columns, 6px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#ffffff` text, and 4px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct
# customer service system

## Mission
Create implementation-ready, token-driven UI guidance for customer service system that is optimized for consistency, accessibility, and fast delivery across dashboard web app.

## Brand
- Product/brand: customer service system
- URL: http://52.66.19.235/customer-system/#/recharge/rechargeList
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Helvetica Neue`, `font.family.stack=Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif`, `font.size.base=13px`, `font.weight.base=400`, `font.lineHeight.base=14.95px`
- Typography scale: `font.size.xs=0px`, `font.size.sm=12px`, `font.size.md=13px`, `font.size.lg=14px`, `font.size.xl=20px`
- Color palette: `color.text.primary=#242625`, `color.text.secondary=#666666`, `color.text.tertiary=#ffffff`, `color.surface.base=#000000`, `color.surface.muted=#eaeaea`, `color.surface.raised=#ecf5ff`, `color.border.default=rgb(36, 38, 37) rgb(36, 38, 37) rgb(188, 198, 222)`, `color.border.muted=rgb(102, 102, 102) rgb(102, 102, 102) rgb(188, 198, 222)`
- Spacing scale: `space.1=2px`, `space.2=3px`, `space.3=4px`, `space.4=6px`, `space.5=7px`, `space.6=8px`, `space.7=9px`, `space.8=10px`
- Radius/shadow/motion tokens: `radius.xs=3px`, `radius.sm=4px` | `motion.duration.instant=100ms`, `motion.duration.fast=200ms`, `motion.duration.normal=250ms`, `motion.duration.slow=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: buttons (11), links (5), inputs (4), lists (4), tables (2).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
