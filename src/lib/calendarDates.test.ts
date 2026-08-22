import { isoDatePrefix, parseLocalISODate, shiftLocalISODate } from "./calendarDates";

describe("parseLocalISODate", () => {
  it("parses a real calendar day", () => {
    const parsed = parseLocalISODate("2026-08-21");
    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(7);
    expect(parsed?.getDate()).toBe(21);
  });

  it("rejects impossible and malformed dates", () => {
    expect(parseLocalISODate("2026-02-29")).toBeNull();
    expect(parseLocalISODate("2026-13-01")).toBeNull();
    expect(parseLocalISODate("08-21-2026")).toBeNull();
    expect(parseLocalISODate("")).toBeNull();
  });

  it("accepts a real leap day", () => {
    expect(parseLocalISODate("2024-02-29")).not.toBeNull();
  });
});

describe("isoDatePrefix", () => {
  it("keeps YYYY-MM-DD and strips a time suffix", () => {
    expect(isoDatePrefix("2026-08-31")).toBe("2026-08-31");
    expect(isoDatePrefix("2026-08-31T00:00:00.000Z")).toBe("2026-08-31");
  });
});

describe("shiftLocalISODate", () => {
  it("crosses month boundaries without UTC drift", () => {
    expect(shiftLocalISODate("2026-08-01", -1)).toBe("2026-07-31");
    expect(shiftLocalISODate("2026-08-31", 1)).toBe("2026-09-01");
  });
});
