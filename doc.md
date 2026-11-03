# Greenship Certification Pricing Calculator

Version: 1.6
Date: 2026-11-03

Primary implementation references:
- `src/engine/calculator.ts`
- `src/engine/types.ts`
- `src/engine/calculator.test.ts`
- `src/App.tsx`

## 1. Overview

This project is a single-page calculator for estimating GREENSHIP certification fees across the supported schemes. The app is built with Vite, React, TypeScript, and plain CSS, and it is deployed as a static site.

All fee logic lives in the TypeScript engine under `src/engine/`. The React layer is responsible for collecting user input, validating it, and rendering the fee breakdown.

## 2. Supported schemes

| Scheme | Code | Pricing model | Key inputs |
| --- | --- | --- | --- |
| New Building | NB | Bracket table + high-area surcharge | Area (m2), building function |
| Existing Building | EB | Bracket table + high-area surcharge | Area (m2), building function |
| Interior Space | IS | Bracket table | Area (m2), building function |
| Transit Station | TS | Bracket table + high-area surcharge | Area (m2) |
| Homes - Individual | HOMES_A | Category lookup | Floor area (m2) |
| Homes - Developer | HOMES_B | Per-type discount + surcharge + cap + weighted-area multiplier | Unit types, floor area per type |
| Neighborhood - Plan | NH_PLAN | Linear interpolation by hectare band | Area (ha or m2) |
| Neighborhood - Built | NH_BUILT | Linear interpolation by hectare band | Area (ha or m2) |

## 3. Pricing rules

### 3.1 NB / EB

| Area (m2) | Office | Commercial / Healthcare / Hospitality |
| --- | --- | --- |
| 250 - 2,749 | 130,000,000 | 150,000,000 |
| 2,750 - 9,999 | 152,500,000 | 175,000,000 |
| 10,000 - 29,999 | 175,000,000 | 205,000,000 |
| 30,000 - 79,999 | 210,000,000 | 245,000,000 |
| 80,000 - 149,999 | 245,000,000 | 285,000,000 |
| >= 150,000 | Base fee of the last bracket + Rp 1,500 x (area - 150,000) |

For areas below 150,000 m2, fractional values stay in the bracket containing their whole-number part. For example, 2,749.5 m2 uses the 250–2,749 bracket; 2,750 m2 starts the next bracket. Above 150,000 m2, the surcharge uses the full area, including any fraction.

Total fee cap:

```text
total = min(baseFee + surcharge, 500,000,000)
```

UI rule:
- If the final total reaches Rp 500,000,000, the surcharge row is hidden from the breakdown.

### 3.2 Interior Space

| Area (m2) | Office | Commercial / Healthcare / Hospitality |
| --- | --- | --- |
| 25 - 249 | 40,000,000 | 45,500,000 |
| 250 - 749 | 47,500,000 | 55,000,000 |
| 750 - 1,499 | 52,500,000 | 62,500,000 |
| 1,500 - 2,499 | 67,500,000 | 72,500,000 |
| 2,500 - 9,999 | 85,000,000 | 95,000,000 |
| >= 10,000 | 110,000,000 | 122,500,000 |

Interior Space has no surcharge and no 500M total cap rule.
Fractional areas stay in the bracket containing their whole-number part; for example, 249.5 m2 uses the 25–249 bracket.

### 3.3 Transit Station

| Area (m2) | Fee |
| --- | --- |
| 250 - 2,749 | 150,000,000 |
| 2,750 - 9,999 | 175,000,000 |
| 10,000 - 29,999 | 205,000,000 |
| 30,000 - 79,999 | 245,000,000 |
| 80,000 - 149,999 | 285,000,000 |
| >= 150,000 | 285,000,000 + Rp 1,500 x (area - 150,000) |

For areas below 150,000 m2, fractional values stay in the bracket containing their whole-number part. Above 150,000 m2, the surcharge uses the full area.

Total fee cap:

```text
total = min(baseFee + surcharge, 500,000,000)
```

UI rule:
- If the final total reaches Rp 500,000,000, the surcharge row is hidden from the breakdown.

### 3.4 Homes - Individual

Certification fee:

| Floor area | Cert fee |
| --- | --- |
| <= 100 m2 | 40,000,000 |
| > 100 - 200 m2 | 44,000,000 |
| > 200 m2 | 50,000,000 |

Total:

```text
total = certFee
```

UI rule:
- The Homes A calculation shows certification donation only.

### 3.5 Homes - Developer

Certification cap:

```text
CAP = 250,000,000
```

Step 1 - base fee by units:

| Units | Base fee |
| --- | --- |
| <= 25 | 42,500,000 |
| 26 - 100 | 47,000,000 |
| > 100 | 53,000,000 |

Step 2 - sort active types by unit count in descending order, then apply the discount by rank. Ties retain their input order. The result breakdown follows this ranked order:

| Rank | Discount multiplier |
| --- | --- |
| 1st | 1.00 |
| 2nd | 0.75 |
| 3rd | 0.75 |
| 4th+ | 0.60 |

Step 3 - surcharge for types with more than 3 units:

```text
surcharge = ROUND(sqrt(units), 0) x 1,000,000
```

Step 4 - certification subtotal cap:

```text
certAfterCap = min(sumDiscountedFees, 250,000,000)
```

Step 5 - weighted average floor-area multiplier:

```text
weightedAvg = sum(units_i x floorArea_i) / sum(units_i)
```

| Weighted average | Multiplier |
| --- | --- |
| <= 100 m2 | 1.000 |
| > 100 - 200 m2 | 1.100 |
| > 200 m2 | 1.175 |

Step 6 - final total:

```text
total = round((certAfterCap + totalSurcharge) x multiplier)
```

Validation rule:
- Every active type must have a positive whole-number unit count and a finite `floorArea > 0` before calculation can run.
- Invalid rows are not silently ignored, including unnamed rows with a negative or nonnumeric value.

UI rules:
- The Homes B calculation shows certification donation only.
- If any active type is missing floor area, the calculator does not return a result.
- The breakdown shows discounted certification and unit surcharge separately for each type, followed by a negative cap adjustment when discounted fees exceed Rp 250,000,000.
- The Rp 250,000,000 cap applies only to discounted certification fees. Surcharges are added after this cap, then the area multiplier applies to their sum. A cap warning appears when the subtotal is reduced.

### 3.6 Neighborhood

Area is stored internally in hectares. The UI accepts either `ha` or `m2`.

#### Plan

| Area (ha) | Price range |
| --- | --- |
| 10 - 200 | 73,000,000 - 85,000,000 |
| 201 - 400 | 85,500,000 - 93,500,000 |
| > 400 | 93,500,000 + surcharge |

Surcharge above 400 ha:

```text
surcharge = (area - 400) x 200,000
```

#### Built

| Area (ha) | Price range |
| --- | --- |
| 1 - 20 | 110,000,000 - 129,000,000 |
| 21 - 50 | 130,000,000 - 153,000,000 |
| 51 - 200 | 154,000,000 - 189,000,000 |
| 201 - 400 | 190,000,000 - 212,000,000 |
| > 400 | 212,000,000 + surcharge |

Surcharge above 400 ha:

```text
surcharge = (area - 400) x 400,000
```

Interpolation formula:

```text
price = p1 + ((effectiveArea - a1) / (a2 - a1)) x (p2 - p1)
```

Boundary rule:
- If the area crosses an integer upper boundary with a fractional value, interpolation moves into the next band and clamps the effective interpolation area to the lower bound of that next band.
- Example: `200.5 ha` in Plan is treated as band 2 with an effective area of `201`.
- Example: `20.3 ha` in Built is treated as band 2 with an effective area of `21`.

Total fee cap:

```text
total = min(baseFee + surcharge, 500,000,000)
```

UI rule:
- If the final total reaches Rp 500,000,000, the surcharge row is hidden from the breakdown.

## 4. Current application structure

```text
Office_PricingCalc/
├── public/assets/
├── src/
│   ├── engine/
│   │   ├── calculator.ts
│   │   ├── calculator.test.ts
│   │   └── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── doc.md
├── index.html
├── package.json
├── vercel.json
└── vite.config.ts
```

## 5. Validation and UI behavior

- The forms compute validation and derived results directly from current input state.
- Result panels update in real time as valid inputs become available.
- `NB`, `EB`, `TS`, and `NH` hide surcharge rows when the final total reaches Rp 500,000,000.
- Homes B requires floor area for every active type before any total is shown.
- Homes B requires a positive integer count for every active type.
- Neighborhood unit changes convert the current area between hectares and square metres; scheme changes reset the calculator input.
- Area input formatting preserves fractional values through 15 decimal places to avoid changing a pricing bracket on blur.
- Weighted average floor area displays up to six decimal places (or `> 100` / `> 200`) when two-decimal rounding would hide a multiplier threshold crossing.
- The result panel includes:
  - Total fee in IDR
  - Fee breakdown
  - Warning cards
  - CTA to the GBCI form

## 6. Security and deployment notes

- Frontend-only static application
- No server, database, or SQL layer
- Vercel headers are configured in `vercel.json`
- The app does not use `dangerouslySetInnerHTML`
- Pricing logic is isolated in pure TypeScript for easier review and testing

## 7. Regression scenarios

`src/engine/calculator.test.ts` checks all eight schemes at bracket starts and ends, fractional areas, surcharge and cap boundaries, neighborhood interpolation boundaries, and invalid inputs. Representative Homes B results with 90 m2 per unit are:

| Scenario | Certification before multiplier | Surcharge | Total |
| --- | ---: | ---: | ---: |
| One type, 4 units | 42,500,000 | 2,000,000 | 44,500,000 |
| One type, 9 units | 42,500,000 | 3,000,000 | 45,500,000 |
| Seven types, 101 units each | 250,000,000 after cap | 70,000,000 | 320,000,000 |
