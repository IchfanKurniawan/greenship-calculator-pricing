import { describe, expect, it } from "vitest";
import { calculateEstimate } from "./calculator";

describe("GREENSHIP pricing", () => {
  it("calculates NB office bracket", () => expect(calculateEstimate({ scheme: "NB", area: 12_500, buildingFunction: "office" }).total).toBe(175_000_000));
  it("calculates NB high-area surcharge", () => expect(calculateEstimate({ scheme: "NB", area: 150_001, buildingFunction: "office" }).total).toBe(245_001_500));
  it("caps Transit Station", () => {
    const value = calculateEstimate({ scheme: "TS", area: 300_000 });
    expect(value.total).toBe(500_000_000);
    expect(value.capApplied).toBe(true);
    expect(value.surcharge).toBeUndefined();
  });
  it("calculates Interior Space commercial", () => expect(calculateEstimate({ scheme: "IS", area: 10_000, buildingFunction: "other" }).total).toBe(122_500_000));
  it.each([[150, 42_000_000], [200, 42_000_000], [201, 46_000_000], [500, 46_000_000], [501, 50_000_000]])("calculates Homes Individual %s", (area, total) => expect(calculateEstimate({ scheme: "HOMES_A", area }).total).toBe(total));
  it("calculates Homes Developer with the weighted area multiplier", () => {
    const result = calculateEstimate({ scheme: "HOMES_B", homeTypes: [{ id: "a", name: "Tipe A", units: 25, floorArea: 90 }, { id: "b", name: "Tipe B", units: 16, floorArea: 120 }] });
    expect(result.baseFee).toBe(74_375_000);
    expect(result.surcharge).toBe(9_000_000);
    expect(result.total).toBe(91_712_500);
  });
  it.each([[3, 42_500_000], [4, 44_500_000], [9, 45_500_000], [25, 47_500_000], [26, 52_000_000], [100, 57_000_000], [101, 63_000_000]])("uses the Homes Developer base fee and surcharge threshold at %s units", (units, total) => {
    expect(calculateEstimate({ scheme: "HOMES_B", homeTypes: [{ id: "a", name: "Tipe A", units, floorArea: 90 }] }).total).toBe(total);
  });
  it.each([[4, 2_000_000], [9, 3_000_000]])("calculates the per-type surcharge for %s units", (units, surcharge) => {
    expect(calculateEstimate({ scheme: "HOMES_B", homeTypes: [{ id: "a", name: "Tipe A", units, floorArea: 90 }] }).surcharge).toBe(surcharge);
  });
  it("ranks Homes Developer discounts by descending unit count", () => {
    const homeTypes = [
      { id: "small", name: "Small", units: 4, floorArea: 90 },
      { id: "largest", name: "Largest", units: 101, floorArea: 90 },
      { id: "medium", name: "Medium", units: 26, floorArea: 90 },
      { id: "smallest", name: "Smallest", units: 3, floorArea: 90 },
    ];
    const result = calculateEstimate({ scheme: "HOMES_B", homeTypes });
    expect(result.lineItems.filter((item) => item.label.includes("certification")).map((item) => item.label)).toEqual(["Largest · 100% certification", "Medium · 75% certification", "Small · 75% certification", "Smallest · 60% certification"]);
    expect(result.baseFee).toBe(145_625_000);
    expect(result.surcharge).toBe(17_000_000);
    expect(result.total).toBe(162_625_000);
    expect(homeTypes.map((type) => type.id)).toEqual(["small", "largest", "medium", "smallest"]);
  });
  it("moves Plan 200.5 into band 2", () => expect(calculateEstimate({ scheme: "NH_PLAN", area: 200.5 }).total).toBe(85_500_000));
  it("moves Built 20.3 into band 2", () => expect(calculateEstimate({ scheme: "NH_BUILT", area: 20.3 }).total).toBe(130_000_000));
});

describe("building and transit pricing scenarios", () => {
  const buildingBands = [
    [250, 130_000_000, 150_000_000],
    [2_749.5, 130_000_000, 150_000_000],
    [2_750, 152_500_000, 175_000_000],
    [9_999.5, 152_500_000, 175_000_000],
    [10_000, 175_000_000, 205_000_000],
    [29_999.5, 175_000_000, 205_000_000],
    [30_000, 210_000_000, 245_000_000],
    [79_999.5, 210_000_000, 245_000_000],
    [80_000, 245_000_000, 285_000_000],
    [149_999.5, 245_000_000, 285_000_000],
  ] as const;
  it.each(buildingBands)("prices NB and EB at %s m²", (area, office, other) => {
    for (const scheme of ["NB", "EB"] as const) {
      expect(calculateEstimate({ scheme, area, buildingFunction: "office" }).total).toBe(office);
      expect(calculateEstimate({ scheme, area, buildingFunction: "other" }).total).toBe(other);
    }
  });
  it.each([
    [250, 150_000_000], [2_749.5, 150_000_000],
    [2_750, 175_000_000], [9_999.5, 175_000_000],
    [10_000, 205_000_000], [29_999.5, 205_000_000],
    [30_000, 245_000_000], [79_999.5, 245_000_000],
    [80_000, 285_000_000], [149_999.5, 285_000_000],
  ])("prices TS at %s m²", (area, total) => {
    expect(calculateEstimate({ scheme: "TS", area }).total).toBe(total);
  });
  it("starts high-area surcharges at 150,000 m² and caps the total", () => {
    expect(calculateEstimate({ scheme: "NB", area: 150_000, buildingFunction: "office" }).total).toBe(245_000_000);
    expect(calculateEstimate({ scheme: "EB", area: 150_001, buildingFunction: "other" }).total).toBe(285_001_500);
    expect(calculateEstimate({ scheme: "TS", area: 150_001 }).total).toBe(285_001_500);
    for (const scheme of ["NB", "EB", "TS"] as const) {
      const result = calculateEstimate({ scheme, area: 400_000 });
      expect(result.total).toBe(500_000_000);
      expect(result.capApplied).toBe(true);
      expect(result.lineItems.some((item) => item.label === "Additional area donation")).toBe(false);
    }
  });
  it.each(["NB", "EB", "TS"] as const)("rejects an area below the minimum for %s", (scheme) => {
    expect(() => calculateEstimate({ scheme, area: 249.99 })).toThrow("Project area minimum 250.");
  });
});

describe("interior and individual home pricing scenarios", () => {
  it.each([
    [25, 40_000_000, 45_500_000], [249.5, 40_000_000, 45_500_000],
    [250, 47_500_000, 55_000_000], [749.5, 47_500_000, 55_000_000],
    [750, 52_500_000, 62_500_000], [1_499.5, 52_500_000, 62_500_000],
    [1_500, 67_500_000, 72_500_000], [2_499.5, 67_500_000, 72_500_000],
    [2_500, 85_000_000, 95_000_000], [9_999.5, 85_000_000, 95_000_000],
    [10_000, 110_000_000, 122_500_000],
  ])("prices Interior Space at %s m²", (area, office, other) => {
    expect(calculateEstimate({ scheme: "IS", area, buildingFunction: "office" }).total).toBe(office);
    expect(calculateEstimate({ scheme: "IS", area, buildingFunction: "other" }).total).toBe(other);
  });
  it("rejects Interior Space below 25 m²", () => {
    expect(() => calculateEstimate({ scheme: "IS", area: 24.99 })).toThrow("Project area minimum 25.");
  });
  it.each([
    [150, 42_000_000], [200, 42_000_000], [200.9, 42_000_000],
    [201, 46_000_000], [500, 46_000_000], [500.9, 46_000_000],
    [501, 50_000_000], [1_000, 50_000_000],
  ])("prices Homes Individual at %s m²", (area, total) => {
    expect(calculateEstimate({ scheme: "HOMES_A", area }).total).toBe(total);
  });
  it.each([1, 100, 149, 149.9])("marks Homes Individual at %s m² as on request", (area) => {
    const result = calculateEstimate({ scheme: "HOMES_A", area });
    expect(result.total).toBeNull();
    expect(result.lineItems).toEqual([]);
    expect(result.contactMessage).toContain("rating@gbcindonesia.org");
    expect(result.contactMessage).toContain("sertifikasi@gbcindonesia.org");
  });
  it("rejects a nonpositive individual home area", () => {
    expect(() => calculateEstimate({ scheme: "HOMES_A", area: 0 })).toThrow("Floor area minimum 1.");
  });
  it("labels the individual home bands accurately", () => {
    expect(calculateEstimate({ scheme: "HOMES_A", area: 150.5 }).bracketLabel).toBe("150–200 m²");
    expect(calculateEstimate({ scheme: "HOMES_A", area: 201 }).bracketLabel).toBe("201–500 m²");
    expect(calculateEstimate({ scheme: "HOMES_A", area: 501 }).bracketLabel).toBe("> 500 m²");
    expect(calculateEstimate({ scheme: "HOMES_A", area: 149.9 }).bracketLabel).toBe("< 150 m²");
  });
});

describe("developer home pricing scenarios", () => {
  const home = (units: number, floorArea = 90, id = "a") => ({ id, name: `Type ${id}`, units, floorArea });

  it.each([[3, 0], [4, 2_000_000], [6, 2_000_000], [7, 3_000_000], [9, 3_000_000], [12, 3_000_000], [13, 4_000_000]])("rounds the surcharge at %s units", (units, surcharge) => {
    expect(calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(units)] }).surcharge).toBe(surcharge);
  });
  it.each([[100, 1, 42_500_000], [100.1, 1.1, 46_750_000], [200, 1.1, 46_750_000], [200.1, 1.175, 49_937_500]])("applies the area multiplier at %s m²", (floorArea, multiplier, total) => {
    const result = calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(3, floorArea)] });
    expect(result.multiplier).toBe(multiplier);
    expect(result.total).toBe(total);
  });
  it("uses a unit-weighted average across different types", () => {
    const result = calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(3, 80, "small"), home(9, 120, "large")] });
    expect(result.weightedAverageArea).toBe(110);
    expect(result.multiplier).toBe(1.1);
    expect(result.total).toBe(85_112_500);
  });
  it("keeps input order for tied unit counts", () => {
    const result = calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(3, 90, "a"), home(3, 90, "b"), home(3, 90, "c"), home(3, 90, "d")] });
    expect(result.lineItems.map((item) => item.label)).toEqual([
      "Type a · 100% certification", "Type b · 75% certification",
      "Type c · 75% certification", "Type d · 60% certification",
    ]);
  });
  it("caps discounted certification fees before adding surcharges", () => {
    const homeTypes = Array.from({ length: 7 }, (_, index) => home(101, 90, String(index)));
    const result = calculateEstimate({ scheme: "HOMES_B", homeTypes });
    expect(result.baseFee).toBe(250_000_000);
    expect(result.surcharge).toBe(70_000_000);
    expect(result.total).toBe(320_000_000);
    expect(result.capApplied).toBe(true);
    expect(result.lineItems.find((item) => item.label === "Certification cap adjustment")?.amount).toBe(-9_700_000);
    expect(result.lineItems.reduce((sum, item) => sum + (item.amount ?? 0), 0)).toBe(result.total);
    expect(result.warnings).toHaveLength(1);
    const multiplied = calculateEstimate({ scheme: "HOMES_B", homeTypes: homeTypes.map((type) => ({ ...type, floorArea: 250 })) });
    expect(multiplied.multiplier).toBe(1.175);
    expect(multiplied.total).toBe(376_000_000);
  });
  it.each([0, -1, 1.5, NaN, Infinity])("rejects %s units", (units) => {
    expect(() => calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(units)] })).toThrow("whole number of units");
  });
  it.each([0, -1, NaN, Infinity])("rejects %s floor area", (floorArea) => {
    expect(() => calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(3, floorArea)] })).toThrow("floor area");
  });
  it("does not silently ignore an invalid unnamed type", () => {
    expect(() => calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(3), { id: "bad", name: "", units: -1, floorArea: 0 }] })).toThrow("whole number of units");
  });
  it("rejects a total unit count beyond safe integer precision", () => {
    expect(() => calculateEstimate({ scheme: "HOMES_B", homeTypes: [home(Number.MAX_SAFE_INTEGER, 90, "a"), home(1, 90, "b")] })).toThrow("Total number of units is too large");
  });
});

describe("neighborhood pricing scenarios", () => {
  it.each([
    ["NH_PLAN", 10, 73_000_000], ["NH_PLAN", 105, 79_000_000],
    ["NH_PLAN", 200, 85_000_000], ["NH_PLAN", 200.5, 85_500_000],
    ["NH_PLAN", 201, 85_500_000], ["NH_PLAN", 300.5, 89_500_000],
    ["NH_PLAN", 400, 93_500_000], ["NH_PLAN", 401, 93_700_000],
    ["NH_BUILT", 1, 110_000_000], ["NH_BUILT", 10.5, 119_500_000],
    ["NH_BUILT", 20, 129_000_000], ["NH_BUILT", 20.3, 130_000_000],
    ["NH_BUILT", 35.5, 141_500_000], ["NH_BUILT", 50.5, 154_000_000],
    ["NH_BUILT", 125.5, 171_500_000], ["NH_BUILT", 200.5, 190_000_000],
    ["NH_BUILT", 300.5, 201_000_000], ["NH_BUILT", 400, 212_000_000],
    ["NH_BUILT", 401, 212_400_000],
  ] as const)("prices %s at %s ha", (scheme, area, total) => {
    expect(calculateEstimate({ scheme, area }).total).toBe(total);
  });
  it.each([["NH_PLAN", 2432.5], ["NH_BUILT", 1120]] as const)("caps %s at %s ha", (scheme, area) => {
    const result = calculateEstimate({ scheme, area });
    expect(result.total).toBe(500_000_000);
    expect(result.capApplied).toBe(true);
    expect(result.surcharge).toBeUndefined();
  });
  it.each([["NH_PLAN", 9.99], ["NH_BUILT", 0.99]] as const)("rejects %s below its minimum", (scheme, area) => {
    expect(() => calculateEstimate({ scheme, area })).toThrow("Neighborhood area minimum");
  });
});

it("rejects an unsupported scheme instead of pricing it as Neighborhood Plan", () => {
  expect(() => calculateEstimate({ scheme: "UNKNOWN" as never, area: 25 })).toThrow("Unsupported scheme.");
});
