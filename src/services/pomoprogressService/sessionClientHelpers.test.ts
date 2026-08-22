import {
  cumulativeWorkSecondsAfterRatedBlocks,
  workSecondsForRatedBlock,
} from "./sessionClientHelpers";

describe("workSecondsForRatedBlock", () => {
  it("splits a 1-hour session with one 10-minute break into two equal work blocks", () => {
    // 60 minutes on the clock minus 10 minutes of break = 50 minutes of focus.
    expect(workSecondsForRatedBlock(1, 1, 10, 1)).toBe(1500);
    expect(workSecondsForRatedBlock(1, 1, 10, 2)).toBe(1500);
    expect(cumulativeWorkSecondsAfterRatedBlocks(1, 1, 10, 2)).toBe(3000);
  });

  it("returns 0 for a block number that has not started", () => {
    expect(workSecondsForRatedBlock(1, 1, 10, 0)).toBe(0);
    expect(cumulativeWorkSecondsAfterRatedBlocks(1, 1, 10, 0)).toBe(0);
  });

  it("does not invent extra seconds after the last block", () => {
    expect(workSecondsForRatedBlock(1, 1, 10, 3)).toBe(0);
    expect(cumulativeWorkSecondsAfterRatedBlocks(1, 1, 10, 3)).toBe(3000);
  });
});
