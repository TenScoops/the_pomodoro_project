import {
  analysisDateRange,
  comparisonDateRange,
  fetchDateWindow,
  mondayOfWeek,
} from "./aiAnalysisRanges";

describe("mondayOfWeek", () => {
  it("keeps Monday as the start of its own week", () => {
    expect(mondayOfWeek("2026-08-17")).toBe("2026-08-17");
  });

  it("maps Tuesday back to that week's Monday", () => {
    expect(mondayOfWeek("2026-08-18")).toBe("2026-08-17");
  });

  it("maps Sunday to the previous Monday", () => {
    expect(mondayOfWeek("2026-08-16")).toBe("2026-08-10");
  });
});

describe("analysisDateRange", () => {
  it("uses only the local date for today", () => {
    expect(analysisDateRange("today", "2026-08-18")).toEqual({
      startDate: "2026-08-18",
      endDate: "2026-08-18",
    });
  });

  it("uses Monday through today for this week", () => {
    expect(analysisDateRange("week", "2026-08-18")).toEqual({
      startDate: "2026-08-17",
      endDate: "2026-08-18",
    });
  });

  it("looks back 12 weeks for trends and 30 days for ask", () => {
    expect(analysisDateRange("trends", "2026-08-18")).toEqual({
      startDate: "2026-05-27",
      endDate: "2026-08-18",
    });
    expect(analysisDateRange("ask", "2026-08-18")).toEqual({
      startDate: "2026-07-20",
      endDate: "2026-08-18",
    });
  });
});

describe("comparisonDateRange", () => {
  it("compares today to yesterday", () => {
    expect(comparisonDateRange("today", "2026-08-18")).toEqual({
      startDate: "2026-08-17",
      endDate: "2026-08-17",
    });
  });

  it("compares this week to last Monday through Sunday", () => {
    expect(comparisonDateRange("week", "2026-08-18")).toEqual({
      startDate: "2026-08-10",
      endDate: "2026-08-16",
    });
  });

  it("fetches from the previous period start through today", () => {
    expect(fetchDateWindow("today", "2026-08-18")).toMatchObject({
      startDate: "2026-08-17",
      endDate: "2026-08-18",
    });
  });
});
