import type {
  BuildingFunction,
  EstimateInput,
  EstimateResult,
  HomeType,
  Scheme,
} from "./types";

const CAP = 500_000_000;
const HOMES_CAP = 250_000_000;

const BUILDING_BRACKETS = [
  {
    min: 250,
    max: 2_749,
    office: 130_000_000,
    other: 150_000_000,
    label: "250–2,749 m²",
  },
  {
    min: 2_750,
    max: 9_999,
    office: 152_500_000,
    other: 175_000_000,
    label: "2,750–9,999 m²",
  },
  {
    min: 10_000,
    max: 29_999,
    office: 175_000_000,
    other: 205_000_000,
    label: "10,000–29,999 m²",
  },
  {
    min: 30_000,
    max: 79_999,
    office: 210_000_000,
    other: 245_000_000,
    label: "30,000–79,999 m²",
  },
  {
    min: 80_000,
    max: 149_999,
    office: 245_000_000,
    other: 285_000_000,
    label: "80,000–149,999 m²",
  },
] as const;

const INTERIOR_BRACKETS = [
  {
    min: 25,
    max: 249,
    office: 40_000_000,
    other: 45_500_000,
    label: "25–249 m²",
  },
  {
    min: 250,
    max: 749,
    office: 47_500_000,
    other: 55_000_000,
    label: "250–749 m²",
  },
  {
    min: 750,
    max: 1_499,
    office: 52_500_000,
    other: 62_500_000,
    label: "750–1,499 m²",
  },
  {
    min: 1_500,
    max: 2_499,
    office: 67_500_000,
    other: 72_500_000,
    label: "1,500–2,499 m²",
  },
  {
    min: 2_500,
    max: 9_999,
    office: 85_000_000,
    other: 95_000_000,
    label: "2,500–9,999 m²",
  },
  {
    min: 10_000,
    max: Infinity,
    office: 110_000_000,
    other: 122_500_000,
    label: "≥ 10,000 m²",
  },
] as const;

const TRANSIT_BRACKETS = [
  { min: 250, max: 2_749, fee: 150_000_000, label: "250–2,749 m²" },
  { min: 2_750, max: 9_999, fee: 175_000_000, label: "2,750–9,999 m²" },
  { min: 10_000, max: 29_999, fee: 205_000_000, label: "10,000–29,999 m²" },
  { min: 30_000, max: 79_999, fee: 245_000_000, label: "30,000–79,999 m²" },
  { min: 80_000, max: 149_999, fee: 285_000_000, label: "80,000–149,999 m²" },
] as const;

function requirePositive(
  value: number | undefined,
  min: number,
  label: string,
) {
  if (!Number.isFinite(value) || (value ?? 0) < min)
    throw new Error(`${label} minimum ${min}.`);
  return value as number;
}

function buildingEstimate(area: number, fn: BuildingFunction): EstimateResult {
  area = requirePositive(area, 250, "Project area");
  const key = fn === "office" ? "office" : "other";
  if (area >= 150_000) {
    const baseFee = key === "office" ? 245_000_000 : 285_000_000;
    const surcharge = (area - 150_000) * 1_500;
    const total = Math.min(baseFee + surcharge, CAP);
    const capApplied = total === CAP;
    return result(
      total,
      baseFee,
      capApplied ? undefined : surcharge,
      "≥ 150,000 m²",
      capApplied,
    );
  }
  const bracket = BUILDING_BRACKETS.find(
    (item) => Math.floor(area) >= item.min && Math.floor(area) <= item.max,
  )!;
  return result(bracket[key], bracket[key], 0, bracket.label, false);
}

function interiorEstimate(area: number, fn: BuildingFunction): EstimateResult {
  area = requirePositive(area, 25, "Project area");
  const key = fn === "office" ? "office" : "other";
  const bracket = INTERIOR_BRACKETS.find(
    (item) => Math.floor(area) >= item.min && Math.floor(area) <= item.max,
  )!;
  return result(bracket[key], bracket[key], undefined, bracket.label, false);
}

function transitEstimate(area: number): EstimateResult {
  area = requirePositive(area, 250, "Project area");
  if (area >= 150_000) {
    const baseFee = 285_000_000;
    const surcharge = (area - 150_000) * 1_500;
    const total = Math.min(baseFee + surcharge, CAP);
    const capApplied = total === CAP;
    return result(
      total,
      baseFee,
      capApplied ? undefined : surcharge,
      "≥ 150,000 m²",
      capApplied,
    );
  }
  const bracket = TRANSIT_BRACKETS.find(
    (item) => Math.floor(area) >= item.min && Math.floor(area) <= item.max,
  )!;
  return result(bracket.fee, bracket.fee, 0, bracket.label, false);
}

function homesIndividual(area: number): EstimateResult {
  area = requirePositive(area, 1, "Floor area");
  const total =
    area <= 100 ? 40_000_000 : area <= 200 ? 44_000_000 : 50_000_000;
  const bracketLabel =
    area <= 100 ? "≤ 100 m²" : area <= 200 ? "Over 100 to 200 m²" : "> 200 m²";
  return {
    total,
    baseFee: total,
    bracketLabel,
    lineItems: [{ label: "Certification donation", amount: total }],
    warnings: [],
  };
}

function homesDeveloper(types: HomeType[]): EstimateResult {
  const active = types.filter(
    (type) => type.units !== 0 || type.floorArea !== 0 || type.name.trim(),
  );
  if (!active.length) throw new Error("Add at least one home type.");
  active.forEach((type, index) => {
    if (!Number.isSafeInteger(type.units) || type.units <= 0)
      throw new Error(
        `Enter a whole number of units for ${type.name || `Type ${index + 1}`}.`,
      );
    if (!Number.isFinite(type.floorArea) || type.floorArea <= 0)
      throw new Error(
        `Enter the floor area for ${type.name || `Type ${index + 1}`}.`,
      );
  });
  const ranked = [...active].sort((a, b) => b.units - a.units);
  const discounts = [1, 0.75, 0.75];
  let discounted = 0;
  let surcharge = 0;
  let totalUnits = 0;
  let weightedArea = 0;
  const lineItems: EstimateResult["lineItems"] = [];
  ranked.forEach((type, index) => {
    const base =
      type.units <= 25
        ? 42_500_000
        : type.units <= 100
          ? 47_000_000
          : 53_000_000;
    const discount = discounts[index] ?? 0.6;
    const fee = base * discount;
    const extra =
      type.units > 3 ? Math.round(Math.sqrt(type.units)) * 1_000_000 : 0;
    discounted += fee;
    surcharge += extra;
    totalUnits += type.units;
    weightedArea += type.units * type.floorArea;
    const name = type.name || `Type ${index + 1}`;
    lineItems.push({
      label: `${name} · ${Math.round(discount * 100)}% certification`,
      amount: fee,
    });
    if (extra > 0)
      lineItems.push({ label: `${name} · unit surcharge`, amount: extra });
  });
  const certAfterCap = Math.min(discounted, HOMES_CAP);
  const capApplied = discounted > HOMES_CAP;
  if (capApplied)
    lineItems.push({
      label: "Certification cap adjustment",
      amount: certAfterCap - discounted,
    });
  if (!Number.isSafeInteger(totalUnits))
    throw new Error("Total number of units is too large to calculate.");
  if (!Number.isFinite(weightedArea))
    throw new Error("Floor area is too large to calculate.");
  const average = weightedArea / totalUnits;
  const multiplier = average <= 100 ? 1 : average <= 200 ? 1.1 : 1.175;
  const total = Math.round((certAfterCap + surcharge) * multiplier);
  return {
    total,
    baseFee: certAfterCap,
    surcharge,
    capApplied,
    bracketLabel: `${active.length} active home ${active.length === 1 ? "type" : "types"}`,
    multiplier,
    weightedAverageArea: average,
    lineItems,
    warnings: capApplied
      ? ["The Rp250,000,000 certification cap has been applied before surcharges and the area multiplier."]
      : [],
  };
}

type Band = { min: number; max: number; p1: number; p2: number; label: string };
const PLAN_BANDS: Band[] = [
  { min: 10, max: 200, p1: 73_000_000, p2: 85_000_000, label: "10–200 ha" },
  { min: 201, max: 400, p1: 85_500_000, p2: 93_500_000, label: "201–400 ha" },
];
const BUILT_BANDS: Band[] = [
  { min: 1, max: 20, p1: 110_000_000, p2: 129_000_000, label: "1–20 ha" },
  { min: 21, max: 50, p1: 130_000_000, p2: 153_000_000, label: "21–50 ha" },
  { min: 51, max: 200, p1: 154_000_000, p2: 189_000_000, label: "51–200 ha" },
  { min: 201, max: 400, p1: 190_000_000, p2: 212_000_000, label: "201–400 ha" },
];

function neighborhood(area: number, built: boolean): EstimateResult {
  const minimum = built ? 1 : 10;
  area = requirePositive(area, minimum, "Neighborhood area");
  const bands = built ? BUILT_BANDS : PLAN_BANDS;
  const top = built ? 212_000_000 : 93_500_000;
  const rate = built ? 400_000 : 200_000;
  if (area > 400) {
    const surcharge = (area - 400) * rate;
    const total = Math.min(top + surcharge, CAP);
    const capApplied = total === CAP;
    return result(
      total,
      top,
      capApplied ? undefined : surcharge,
      "> 400 ha",
      capApplied,
    );
  }
  let effectiveArea = area;
  const crossed = bands.find(
    (band, index) =>
      index > 0 && area > bands[index - 1].max && area < band.min,
  );
  if (crossed) effectiveArea = crossed.min;
  const band = bands.find(
    (item) => effectiveArea >= item.min && effectiveArea <= item.max,
  )!;
  const price =
    band.p1 +
    ((effectiveArea - band.min) / (band.max - band.min)) * (band.p2 - band.p1);
  const total = Math.round(price);
  return {
    total,
    baseFee: total,
    bracketLabel: band.label,
    lineItems: [
      { label: "Interpolated certification donation", amount: total },
    ],
    warnings: crossed
      ? [
          `The fractional boundary rule uses ${crossed.min} ha as the effective area.`,
        ]
      : [],
  };
}

function result(
  total: number,
  baseFee: number,
  surcharge: number | undefined,
  bracketLabel: string,
  capApplied: boolean,
): EstimateResult {
  const lineItems = [{ label: "Base donation", amount: baseFee }];
  if (surcharge !== undefined)
    lineItems.push({ label: "Additional area donation", amount: surcharge });
  return {
    total,
    baseFee,
    surcharge,
    capApplied,
    bracketLabel,
    lineItems,
    warnings: capApplied
      ? ["The maximum donation limit of Rp500,000,000 has been applied."]
      : [],
  };
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const scheme: Scheme = input.scheme;
  if (scheme === "NB" || scheme === "EB")
    return buildingEstimate(
      input.area ?? 0,
      input.buildingFunction ?? "office",
    );
  if (scheme === "IS")
    return interiorEstimate(
      input.area ?? 0,
      input.buildingFunction ?? "office",
    );
  if (scheme === "TS") return transitEstimate(input.area ?? 0);
  if (scheme === "HOMES_A") return homesIndividual(input.area ?? 0);
  if (scheme === "HOMES_B") return homesDeveloper(input.homeTypes ?? []);
  if (scheme === "NH_PLAN" || scheme === "NH_BUILT")
    return neighborhood(input.area ?? 0, scheme === "NH_BUILT");
  throw new Error("Unsupported scheme.");
}
