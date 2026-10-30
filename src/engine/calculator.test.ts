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
  it.each([[100, 40_000_000], [101, 44_000_000], [201, 50_000_000]])("calculates Homes Individual %s", (area, total) => expect(calculateEstimate({ scheme: "HOMES_A", area }).total).toBe(total));
  it("calculates Homes Developer", () => expect(calculateEstimate({ scheme: "HOMES_B", homeTypes: [{ id: "a", name: "Tipe A", units: 25, floorArea: 90 }, { id: "b", name: "Tipe B", units: 16, floorArea: 120 }] }).total).toBe(86_900_000));
  it("moves Plan 200.5 into band 2", () => expect(calculateEstimate({ scheme: "NH_PLAN", area: 200.5 }).total).toBe(85_500_000));
  it("moves Built 20.3 into band 2", () => expect(calculateEstimate({ scheme: "NH_BUILT", area: 20.3 }).total).toBe(130_000_000));
});
