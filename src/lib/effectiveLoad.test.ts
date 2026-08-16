import {
  blockEffectiveWorkload,
  weightedDailyLoad,
  weightedDailyProductivity,
  workTypeLoadWeight,
} from "./effectiveLoad";

describe("workTypeLoadWeight", () => {
  it("gives Deep Work full influence and Routine half", () => {
    expect(workTypeLoadWeight("Deep Work")).toBe(1);
    expect(workTypeLoadWeight("Routine")).toBe(0.5);
    expect(workTypeLoadWeight(null)).toBe(1);
  });
});

describe("blockEffectiveWorkload", () => {
  it("keeps rated load 4 instead of turning a Routine 4 into a 2", () => {
    const block = blockEffectiveWorkload(4, "Routine", 3600);
    expect(block).not.toBeNull();
    expect(block?.ratedLoad).toBe(4);
    expect(block?.weight).toBe(0.5);
    expect(block?.weightedHours).toBe(0.5);
    expect(block?.weightedLoadContribution).toBe(2);
  });

  it("skips blocks with no duration", () => {
    expect(blockEffectiveWorkload(4, "Deep Work", null)).toBeNull();
    expect(blockEffectiveWorkload(4, "Deep Work", 0)).toBeNull();
  });
});

describe("weightedDailyLoad", () => {
  it("matches the mixed Deep Work / Routine example", () => {
    const result = weightedDailyLoad([
      { load: 4, workType: "Deep Work", durationSeconds: 2 * 3600 },
      { load: 4.5, workType: "Deep Work", durationSeconds: 2 * 3600 },
      { load: 1, workType: "Routine", durationSeconds: 0.5 * 3600 },
      { load: 1, workType: "Routine", durationSeconds: 0.5 * 3600 },
    ]);

    expect(result.loadAvg).toBe(3.89);
    expect(result.loadCount).toBe(4);
  });

  it("lets 3 hours of Deep Work at 4 dominate 30 minutes of Routine at 1", () => {
    const result = weightedDailyLoad([
      { load: 4, workType: "Deep Work", durationSeconds: 3 * 3600 },
      { load: 1, workType: "Routine", durationSeconds: 0.5 * 3600 },
    ]);

    const timeWeightedOnly = (3 * 4 + 0.5 * 1) / 3.5;
    expect(result.loadAvg).toBeGreaterThan(Number(timeWeightedOnly.toFixed(2)));
    expect(result.loadAvg).toBe(3.77);
  });

  it("ignores null loads and empty lists", () => {
    expect(weightedDailyLoad([]).loadCount).toBe(0);
    expect(
      weightedDailyLoad([{ load: null, workType: "Deep Work", durationSeconds: 3600 }]).loadAvg
    ).toBe(0);
  });
});

describe("weightedDailyProductivity", () => {
  it("matches the mixed Deep Work / Routine example", () => {
    const result = weightedDailyProductivity([
      { rating: 9, workType: "Deep Work", durationSeconds: 2 * 3600 },
      { rating: 8, workType: "Deep Work", durationSeconds: 1 * 3600 },
      { rating: 10, workType: "Routine", durationSeconds: 1 * 3600 },
    ]);

    expect(result.productivityAvg).toBe(8.86);
    expect(result.ratingCount).toBe(3);
  });

  it("lets Deep Work out-influence the same hours of Routine", () => {
    const result = weightedDailyProductivity([
      { rating: 6, workType: "Deep Work", durationSeconds: 1 * 3600 },
      { rating: 10, workType: "Routine", durationSeconds: 1 * 3600 },
    ]);

    expect(result.productivityAvg).toBe(7.33);
  });

  it("ignores null ratings, missing duration, and empty lists", () => {
    expect(weightedDailyProductivity([]).ratingCount).toBe(0);
    expect(
      weightedDailyProductivity([
        { rating: null, workType: "Deep Work", durationSeconds: 3600 },
      ]).productivityAvg
    ).toBe(0);
    expect(
      weightedDailyProductivity([
        { rating: 9, workType: "Deep Work", durationSeconds: null },
      ]).ratingCount
    ).toBe(0);
  });
});
