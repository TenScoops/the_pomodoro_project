# Stats page — work type + load breakdowns

- [x] Add hardcoded work-type hours/percents and load-level hours/percents
- [x] Build Breakdown by Work Type donut + legend
- [x] Build By Load horizontal bars
- [x] Place both cards in a row under Daily Overview
- [x] Empty states if a series is empty
- [x] Verify with `npm run build`

## Files

- `src/components/stats/statsBreakdownData.ts`
- `src/components/stats/StatsWorkTypeBreakdown.tsx`
- `src/components/stats/StatsLoadBreakdown.tsx`
- `src/components/stats/StatsBreakdowns.css`
- `src/components/stats/StatsPage.tsx`

## Review

- Under Daily Overview: donut (Deep Work 41.2h / 61%, Routine 26.9h / 39%, center 68.1) and By Load bars (5 Very Heavy through 1 Very Light).
- Dark panels match the rest of Stats. Values are hardcoded. `npm run build` compiles successfully.
