import type { EnergyLogRecord } from "../../services/pomoprogressService";
import { buildStatsSummaryCards, periodEnergyAvgFromLogs } from "./statsPeriodSummary";

function energyLog(date: string, energy: EnergyLogRecord["energy"]): EnergyLogRecord {
  return { id: `energy-${date}`, date, energy, note: "" };
}

describe("periodEnergyAvgFromLogs", () => {
  it("averages unique in-range days and ignores other months", () => {
    const result = periodEnergyAvgFromLogs(
      [
        energyLog("2026-07-31", 5),
        energyLog("2026-08-01", 3.5),
        energyLog("2026-08-10", 4),
        energyLog("2026-08-20", 4.5),
        energyLog("2026-09-01", 1),
      ],
      "2026-08-01",
      "2026-08-31"
    );

    expect(result.logCount).toBe(3);
    expect(result.energyAvg).toBe(4);
  });

  it("keeps the last day of the month when the date includes a time", () => {
    const result = periodEnergyAvgFromLogs(
      [energyLog("2026-08-31T00:00:00.000Z", 4)],
      "2026-08-01",
      "2026-08-31"
    );

    expect(result).toEqual({ energyAvg: 4, logCount: 1 });
  });

  it("uses one score per calendar day when a date is duplicated", () => {
    const result = periodEnergyAvgFromLogs(
      [energyLog("2026-08-02", 2), energyLog("2026-08-02", 5)],
      "2026-08-01",
      "2026-08-31"
    );

    expect(result).toEqual({ energyAvg: 5, logCount: 1 });
  });

  it("returns zero when there are no logs in the range", () => {
    expect(periodEnergyAvgFromLogs([energyLog("2026-07-01", 5)], "2026-08-01", "2026-08-31")).toEqual({
      energyAvg: 0,
      logCount: 0,
    });
  });
});

describe("buildStatsSummaryCards energy", () => {
  it("shows a one-decimal average and the / 5 suffix when logs exist", () => {
    const cards = buildStatsSummaryCards({
      workSeconds: 0,
      energyAvg: 4,
      energyCount: 3,
      loadAvg: 0,
      loadCount: 0,
      productivityAvg: 0,
      ratingCount: 0,
    });
    const energyCard = cards.find((card) => card.id === "energy");

    expect(energyCard).toMatchObject({ value: "4.0", suffix: "/ 5" });
  });

  it("shows 0 with no suffix when no energy was logged", () => {
    const cards = buildStatsSummaryCards({
      workSeconds: 0,
      energyAvg: 0,
      energyCount: 0,
      loadAvg: 0,
      loadCount: 0,
      productivityAvg: 0,
      ratingCount: 0,
    });
    const energyCard = cards.find((card) => card.id === "energy");

    expect(energyCard).toMatchObject({ value: "0", suffix: null });
  });
});
