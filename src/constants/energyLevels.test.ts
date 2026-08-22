import { parseEnergyLevel } from "./energyLevels";

describe("parseEnergyLevel", () => {
  it("accepts whole numbers and half steps", () => {
    expect(parseEnergyLevel(1)).toBe(1);
    expect(parseEnergyLevel(3.5)).toBe(3.5);
    expect(parseEnergyLevel(5)).toBe(5);
  });

  it("accepts Postgres numeric strings such as 4.0", () => {
    expect(parseEnergyLevel("4.0")).toBe(4);
    expect(parseEnergyLevel("3.5")).toBe(3.5);
  });

  it("snaps tiny float noise onto the nearest half step", () => {
    expect(parseEnergyLevel(3.5000000001)).toBe(3.5);
  });

  it("rejects values that are not on the 1–5 half-step scale", () => {
    expect(parseEnergyLevel(3.6)).toBeNull();
    expect(parseEnergyLevel(0)).toBeNull();
    expect(parseEnergyLevel(6)).toBeNull();
    expect(parseEnergyLevel("")).toBeNull();
  });
});
