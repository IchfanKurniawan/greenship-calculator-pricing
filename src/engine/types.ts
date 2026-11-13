export type Scheme = "NB" | "EB" | "IS" | "TS" | "HOMES_A" | "HOMES_B" | "NH_PLAN" | "NH_BUILT";
export type BuildingFunction = "office" | "other";

export type HomeType = { id: string; name: string; units: number; floorArea: number };

export type EstimateInput = {
  scheme: Scheme;
  area?: number;
  buildingFunction?: BuildingFunction;
  homeTypes?: HomeType[];
};

export type LineItem = { label: string; amount?: number; value?: string };

export type EstimateResult = {
  /** null when the scheme is quoted on request instead of returning a price. */
  total: number | null;
  baseFee?: number;
  surcharge?: number;
  capApplied?: boolean;
  bracketLabel: string;
  multiplier?: number;
  weightedAverageArea?: number;
  lineItems: LineItem[];
  warnings: string[];
  contactMessage?: string;
};
