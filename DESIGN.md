# GREENSHIP Calculator Design System

## Direction

**Measured Building Section** combines GBC Indonesia's institutional green identity with a restrained measurement motif. The interface opens directly on the calculator, uses formal English, and lets applicants or GBCI staff trace every donation estimate from the same screen.

## Brand tokens

- Primary green: `#43814e`; navigation/result green: `#295244`; deep header: `#183d32`.
- Heading: `#354f45`; text: `#18332a`; muted text: `#5e746b`.
- Mint selection: `#e1f4e5`; page surface: `#f7faf6`; line: `#dbe5dc`.
- Blue `#00b9f0` is limited to progress and measurement. Orange `#ffa24a` marks exclusions or cap attention.
- Use the official light GBCI logo and architectural header texture from `public/assets`; never redraw the logo.

## Typography and shape

- Display: Parkinsans when available, falling back to Onest and the system sans.
- UI/body: Onest when available, falling back to Segoe UI and the system sans.
- Panel radius: 14–18 px. Control radius: 8–12 px. Pills only for compact status labels.
- Prefer fine borders or one offset shadow. Avoid stacking both on ordinary panels.

## Interaction rules

- The application opens directly on New Building; users switch schemes from the desktop rail or mobile sheet.
- Scheme names lead; codes are compact secondary labels.
- Valid inputs update the result immediately. Invalid input remains visible with a recovery-focused message.
- The result answers, in order: estimated donation, calculation basis, exclusions, and one next action to GBC Indonesia.
- Desktop uses a compact scheme rail and sticky result. Mobile moves scheme navigation into a focus-trapped Sheet and stacks the result directly below input.
- Use the measurement spine only for schemes governed by the Rp500 million cap.
- The total and marker may transition together over 220 ms; reduced-motion removes the transition.

## Component policy

Use only free ReUI-compatible primitives/patterns: Radio Group, Sheet/Dialog, Buttons, Fields, Badges, Alerts, editable rows, and responsive accordion-like cards. Radix primitives provide accessible behavior; Lucide provides the free icon set. No paid blocks, icon packs, or runtime license key.

## Accessibility

Target WCAG 2.2 AA, keep visible three-pixel focus rings, maintain a 44 px practical tap target, use semantic labels, preserve keyboard order, and announce result changes politely. Color is never the sole state indicator.
