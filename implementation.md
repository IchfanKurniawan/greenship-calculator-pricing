# GREENSHIP Certification Table — Implementation Plan

> Final product revision (29 October 2026): the deployed experience opens directly on the calculator, uses formal English only, uses “donation” instead of “fee” in all user-facing copy, reduces the header to the linked GBC Indonesia logo, and provides one result action to continue to GBC Indonesia. These decisions supersede the earlier scheme-finder, print-action, and bilingual wording sections below.

## 1. Outcome

Redesign the GREENSHIP fee calculator as a clearly GBC Indonesia-owned service that works equally well for:

- building owners and developers estimating certification costs independently; and
- GBCI staff guiding an applicant through scheme selection and fee interpretation.

The redesign must preserve the pricing mathematics in `doc.md`, use only free ReUI components/examples, use free web technology, and deploy on Vercel's free tier.

Design references produced for this plan:

- `mockups/greenship-redesign-scheme-finder.png`
- `mockups/greenship-redesign-desktop.png`
- `mockups/greenship-redesign-mobile.png`

Design provenance and quality bar:

- FORM: `seed:d1b4bb04b7b2052b`.
- Direction: **Measured Building Section** — familiar operational controls, GBCI's institutional palette and type, and one calibrated measurement spine that connects project inputs to the active fee rule.
- Quality bar: a first-time applicant can identify the correct scheme without knowing GREENSHIP codes; GBCI staff can explain the estimate from the screen without opening a separate fee table; the same task remains clear and unobstructed at 390 px.

## 2. Current UX audit

### Critical

1. **The mobile navigation can obscure the calculator.** At a 390 px viewport, the open drawer covers the left portion of the form while the underlying controls and result remain present. The drawer needs a true modal sheet, focus trap, backdrop, close behavior, and scroll lock.
2. **The first screen assumes scheme knowledge.** Users are shown seven certification names and abbreviations without being helped to decide which scheme applies to their project.

### High impact

3. **Navigation is duplicated.** The desktop sidebar lists every scheme while the landing screen repeats the same schemes as cards. This consumes attention without helping the decision.
4. **The result is spatially disconnected from the task.** Before valid input, half of the desktop workspace is a large empty result panel. On mobile the result sits far below the input, so users lack feedback while completing the form.
5. **Complex and simple schemes use the same layout.** New Building needs two inputs, while Homes — Developer can need up to 20 unit types. Treating both as the same two-column form creates cramped rows and weak validation guidance.
6. **Homes — Developer starts with two empty types but reports zero active types.** The initial state is visually busy and semantically confusing. A type should become active only when a user explicitly adds it or enters data.
7. **Neighborhood terminology is not explained.** “Plan” and “Built” are presented without plain-language definitions. The phase control, unit control, and area input compete for visual priority.

### Medium impact

8. **The current identity is adjacent to GBCI, not integrated with it.** It uses a green palette but omits the real GBCI mark, parent-site typography, architectural imagery, blue/orange supporting accents, and the parent site's editorial tone.
9. **Important calculation behavior is hidden.** Brackets, caps, multipliers, and surcharges appear only after calculation, so the result can feel arbitrary.
10. **Reset is over-prominent.** “Kalkulasi Baru” occupies the primary action position before a calculation exists. Reset belongs near the current calculation and should require confirmation only when entered data would be lost.
11. **Formatting can be ambiguous.** A placeholder such as `0.000` can read as zero or a decimal. Inputs need Indonesian grouping, explicit units, and raw-number accessibility labels.

## 3. Target journey

```text
Arrive
  → Choose “Help me choose” or “I know my scheme”
  → Scheme finder asks up to three plain-language questions
  → Confirm recommended scheme
  → Enter only the inputs required by that scheme
  → See a live estimate summary
  → Review the full calculation and exclusions
  → Download/print the summary or continue to GBCI certification
```

### Entry screen

Replace the repeated card directory with two clear paths:

1. **Temukan skema yang tepat** — recommended default for first-time users.
2. **Saya sudah tahu skemanya** — opens a searchable/selectable list for staff and experienced applicants.

The finder asks:

1. What is being certified: a building, interior, transit station, home/development, or neighborhood?
2. What is its stage: design/construction, operating, masterplan, or built?
3. When applicable, is it an individual home or a developer project?

Every recommendation must state why it was chosen and allow comparison with all other schemes.

### Calculator shell

- Desktop: a compact scheme rail, main input workspace, and sticky result summary.
- Mobile: no persistent rail. Use a top-bar menu implemented as a modal Sheet; show a sticky bottom estimate summary after valid input.
- Keep the current scheme in the URL, for example `?scheme=NB`, so staff can share a starting point.
- Do not encode project input values in the URL by default.

## 4. Information architecture

### Global navigation

- GBC Indonesia logo linked to `gbcindonesia.org`.
- Product name: **GREENSHIP Fee Calculator**.
- Links: Panduan, Tentang GREENSHIP, and gbcindonesia.org.
- Current table/version status: **Tabel biaya 2026**.

### Scheme groups

Group schemes by user language before showing internal codes:

- **Bangunan:** New Building, Existing Building, Transit Station.
- **Ruang:** Interior Space.
- **Hunian:** Homes — Individual, Homes — Developer.
- **Kawasan:** Neighborhood — Plan, Neighborhood — Built.

Codes such as NB, EB, IS, and NH remain secondary labels, not the primary decision language.

## 5. Scheme-specific UX

### New Building / Existing Building

- Input order: function, gross floor area.
- Use a two-option Radio Group for function; do not make the longer option visually dominant.
- Show the matching bracket immediately below the area input.
- Above 150,000 m², preview the surcharge formula before the result.
- At the Rp500,000,000 cap, state that the cap was applied; preserve the documented rule that hides the surcharge row in the final breakdown.

### Interior Space

- Reuse the simple building form but change the minimum, bracket summary, and copy.
- Do not mention a surcharge or cap because neither applies.

### Transit Station

- Ask only for gross floor area.
- Explain that building function is not needed.
- Use the same high-area and cap explanation as applicable to the Transit Station formula.

### Homes — Individual

- Ask only for floor area.
- Present the three category boundaries in a compact reference below the input.
- Result shows certification price only.

### Homes — Developer

- Start with one explicit **Tambah tipe rumah** action, not two empty rows.
- Desktop: use an editable free ReUI Data Grid with columns for type name, units, floor area, validation, and row action.
- Mobile: render each type as an Accordion item with a concise summary such as `Type A · 25 unit · 90 m²`.
- Show an always-visible summary above the result: active types, total units, weighted average floor area, multiplier, and certification subtotal against the Rp250,000,000 cap.
- Validate at the row level. A missing floor area message must identify the affected type and explain how to recover.
- Explain discounts by active type rank in the calculation details.
- Keep row identity stable when rows are added or removed; ranking recalculates from the visible active order.

### Neighborhood

- Ask phase first with plain-language descriptions:
  - **Plan:** masterplan or area not yet fully built.
  - **Built:** area that has been developed/operated.
- Ask unit second. When switching between hectares and square meters, convert the current value instead of clearing it.
- Show the active pricing band and interpolation endpoints below the area input.
- Explain fractional boundary behavior in the result when it changes the selected band.
- Above 400 ha, preview the applicable per-hectare surcharge.

## 6. Result design

The result must answer four questions in this order:

1. **What is the estimate?** Large formatted total with an `ESTIMASI` badge.
2. **What produced it?** Scheme, key inputs, active bracket/category, base fee, surcharge, cap, discount, or multiplier as applicable.
3. **What is excluded?** Verifier accommodation outside Jabodetabek and any other supplied official exclusions.
4. **What should I do next?** Continue to the official GBCI certification pathway, download/print, or revise inputs.

Use the “measurement spine” shown in the desktop mockup as the single signature visual: a restrained scale from Rp0 to the Rp500,000,000 cap with the current estimate marked. Hide the scale for schemes without that cap.

## 7. Brand system

### Assets

- Use the official GBCI light logo from the parent site in the dark header.
- Use parent-site architectural imagery only as a low-opacity header texture, never behind form text.
- Do not redraw or approximate the logo.

### Typography

- Display: Parkinsans, weights 500–700.
- Body and UI: Onest, weights 400–700.
- Self-host the font files in production to avoid a runtime dependency on Google Fonts.

### Color tokens

Use the parent site's tokens as the source of truth:

```css
--gbci-green: #43814e;
--gbci-green-dark: #295244;
--gbci-heading: #354f45;
--gbci-accent: #5fb25c;
--gbci-mint: #e1f4e5;
--gbci-blue: #00b9f0;
--gbci-orange: #ffa24a;
--surface: #f7faf6;
--line: #dbe5dc;
--text: #18332a;
```

- Dark green owns navigation and result emphasis.
- Mint owns selected and supporting surfaces.
- Blue appears in measurement/progress only.
- Orange is reserved for exclusions, warnings, and cap-related attention.
- Red is reserved for errors.

### Shape and depth

- Panel radius: 14–16 px.
- Control radius: 10–12 px.
- Pills only for status badges and compact filters.
- Use either a fine border or a soft offset shadow, never both on the same panel.

## 8. Free ReUI component plan

Only free primitives and free `c-*` examples from ReUI may be used. Do not use ReUI Pro blocks, paid icon packs, or templates.

| Need                                        | Free component                          |
| ------------------------------------------- | --------------------------------------- |
| Desktop scheme navigation                   | Sidebar                                 |
| Mobile navigation                           | Sheet                                   |
| Guided scheme selection                     | Stepper, Progress, Radio Group, Button  |
| Scheme and function choices                 | Radio Group or Toggle Group             |
| Area, units, counts                         | Number Field, Field, Label, Input Group |
| Unit selection                              | Toggle Group or Native Select           |
| Homes Developer desktop rows                | Data Grid                               |
| Homes Developer mobile rows                 | Accordion                               |
| Result status                               | Badge                                   |
| Exclusions and validation summary           | Alert                                   |
| Empty result guidance                       | Empty                                   |
| Calculation explanation                     | Accordion, Separator                    |
| Help for formulas/terms                     | Tooltip, Popover                        |
| Confirmation before discarding entered data | Alert Dialog                            |
| Success/error feedback                      | Sonner                                  |

Registry rules:

- Free ReUI examples use the `@reui/c-*` naming pattern.
- Free ReUI primitives such as Stepper, Number Field, Data Grid, Badge, and Alert may be installed from the public `@reui` registry.
- Stock shadcn components shown in ReUI use their normal shadcn install names.
- No `REUI_LICENSE_KEY` may be required anywhere in the project.
- Before implementation, connect the ReUI MCP and resolve the exact example IDs for the table above. The MCP was not available in the current Codex session, so this plan deliberately avoids inventing registry IDs.

Recommended public registry configuration:

```json
{
  "style": "base-nova",
  "registries": {
    "@reui": "https://reui.io/r/{style}/{name}.json"
  }
}
```

## 9. Calculation contract

Treat the calculator as a pure function with typed inputs and a result object containing:

```ts
type EstimateResult = {
  total: number;
  baseFee?: number;
  surcharge?: number;
  capApplied?: boolean;
  bracketLabel: string;
  multiplier?: number;
  weightedAverageArea?: number;
  lineItems: Array<{ label: string; amount?: number; value?: string }>;
  warnings: string[];
};
```

The UI may format or explain these fields but must not reimplement the mathematics.

### Required calculation tests

| Case                                        |                                 Expected result |
| ------------------------------------------- | ----------------------------------------------: |
| NB office, 12,500 m²                        |                                   Rp175,000,000 |
| NB office, 150,001 m²                       |                                   Rp245,001,500 |
| Transit Station, 300,000 m²                 | Rp500,000,000 cap applied; surcharge row hidden |
| Interior Space commercial, 10,000 m²        |                                   Rp122,500,000 |
| Homes Individual, 100 m²                    |                                    Rp40,000,000 |
| Homes Individual, 101 m²                    |                                    Rp44,000,000 |
| Homes Individual, 201 m²                    |                                    Rp50,000,000 |
| Homes Developer: 25 × 90 m² and 16 × 120 m² |                                    Rp86,900,000 |
| Neighborhood Plan, 200.5 ha                 |        band 2 at effective 201 ha; Rp85,500,000 |
| Neighborhood Built, 20.3 ha                 |        band 2 at effective 21 ha; Rp130,000,000 |

Also test every lower/upper boundary, one value on each side of a boundary, zero/negative inputs, unit conversion, all cap cases, and Homes Developer rank changes after row removal.

## 10. Interaction and state requirements

### Validation

- Validate on blur and on attempted continuation, not on the first keystroke.
- Keep the user's value visible after an error.
- Error copy must name the problem and recovery, for example: `Masukkan luas lantai untuk Tipe B agar estimasi dapat dihitung.`
- Move focus to the first invalid field after a failed continuation.

### Loading and empty states

- Calculation itself is local and should not show a fake loading state.
- Empty result copy should say what input is still needed; never show a generic calculator icon in a large blank panel.
- If official links or assets fail to load, the calculator must remain usable.

### Motion

- When valid input changes the estimate, animate the total and measurement marker together over 220 ms using an ease-out curve; update the active bracket label in the same authored transition.
- Do not scatter entrance animations across panels or controls.
- Under `prefers-reduced-motion: reduce`, update the total, marker, and bracket label immediately with no interpolation.

### Reset

- Show reset near the current calculation, not as the first global action.
- If no input exists, reset acts immediately.
- If input exists, use Alert Dialog: `Mulai kalkulasi baru? Data yang sudah diisi akan dihapus.`

### Print/download

- Use a dedicated print stylesheet and `window.print()`; no paid PDF service or server is needed.
- The print view includes GBCI identity, timestamp, scheme, inputs, line items, exclusions, and the estimate disclaimer.
- Hide navigation, form controls, and nonessential actions in print.

## 11. Accessibility

- Target WCAG 2.2 AA.
- Keyboard-accessible scheme finder, forms, data grid, accordion, sheet, and dialogs.
- Modal Sheet must trap focus, close with Escape, restore focus to the menu button, and lock page scroll.
- Minimum body text contrast 4.5:1 and large text 3:1.
- Visible focus ring using a dark-green outline plus an outer mint offset.
- Do not use color alone for selected, warning, error, or cap states.
- Use `inputmode="decimal"` for areas and `inputmode="numeric"` for counts.
- Announce estimate changes through a polite live region after the user leaves an edited field; do not announce on every digit.
- Respect `prefers-reduced-motion`.

## 12. Responsive behavior

### Desktop ≥ 1024 px

- Compact 250 px scheme rail.
- Main form and sticky result in an approximately 58/42 split.
- Homes Developer may use the full content width with the result below or in a narrower sticky side panel.

### Tablet 768–1023 px

- Collapse the scheme rail into a Sheet.
- Keep form and result stacked; result summary remains near the top after valid input.

### Mobile < 768 px

- Single-column flow.
- No open drawer by default.
- Sticky bottom summary contains the current total and one action: `Lihat rincian biaya`.
- Respect safe-area insets.
- Present Homes Developer types as Accordion items rather than a horizontally scrolling table.

## 13. Free implementation stack

- React + TypeScript + Vite.
- Tailwind CSS v4.
- shadcn/ui plus free ReUI primitives/examples.
- Lucide icons or icons already bundled by the selected free ReUI examples; do not use ReUI's paid icon packs.
- Vitest for calculation and component tests.
- Playwright for end-to-end and responsive tests.
- Vercel Hobby for static deployment.
- No database, authentication, paid API, serverless function, analytics dependency, or paid PDF service is required.

## 14. Suggested project structure

```text
src/
  app/
    AppShell.tsx
    routes.ts
  brand/
    tokens.css
    assets/
  components/
    navigation/
    scheme-finder/
    calculator/
    results/
    print/
  calculators/
    calculate.ts
    constants.ts
    schemas.ts
    types.ts
  schemes/
    new-building/
    existing-building/
    interior-space/
    transit-station/
    homes-individual/
    homes-developer/
    neighborhood/
  tests/
```

## 15. Delivery sequence

### Phase 1 — Foundation

- Add brand assets, self-hosted fonts, and tokens.
- Configure shadcn and the public ReUI registry.
- Connect ReUI MCP and select exact free examples.
- Rebuild pricing rules as pure typed functions from `doc.md`.
- Add boundary-focused unit tests before UI integration.

### Phase 2 — Entry and shell

- Build the branded header and responsive shell.
- Build the guided scheme finder and direct scheme selector.
- Add URL scheme state and navigation guards for unsaved input.

### Phase 3 — Simple calculators

- Implement NB, EB, IS, TS, Homes Individual.
- Add live bracket/category explanations.
- Build shared result, warning, empty, and error states.

### Phase 4 — Complex calculators

- Implement Homes Developer Data Grid and mobile Accordion layout.
- Implement Neighborhood phase, unit conversion, interpolation explanation, and boundary messages.

### Phase 5 — Review and export

- Add print stylesheet and estimate summary.
- Add accessibility behavior and keyboard testing.
- Add responsive and end-to-end tests for every scheme.

### Phase 6 — Vercel deployment

- Deploy as a static Vite build to Vercel Hobby.
- Configure the production domain and HTTPS through Vercel.
- Add security headers in `vercel.json` without introducing server code.
- Run post-deployment smoke tests on desktop, 390 px mobile, keyboard-only navigation, and print preview.

## 16. Definition of done

- A first-time user can reach the correct scheme without knowing GREENSHIP codes.
- An experienced user or GBCI staff member can open any scheme directly.
- Every documented calculation boundary passes automated tests.
- Every valid input produces a transparent line-item explanation.
- Homes Developer remains usable with 20 types on desktop and mobile.
- Neighborhood unit switching preserves the user's quantity through conversion.
- Mobile navigation never obscures or leaves the form interactive behind it.
- Desktop, tablet, mobile, keyboard, reduced-motion, error, empty, cap, and print states are verified.
- Only free ReUI components/examples and free dependencies are present.
- Production deploys successfully on Vercel Hobby with no paid service dependency.
