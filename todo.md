# Persist work type on blocks + Recent days

Work type was only in the client store, so Recent days always showed "—". Save each rated block’s type and focus seconds, then label the day from those totals.

- [x] Write plan and list files
- [x] Migration: `work_type` + `duration_seconds` on `block_ratings`
- [x] Types, insert payload, nested select
- [x] Save type + duration on rate (and bulk fallback / localStorage)
- [x] Recent days: Deep Work, Routine, or Deep Work/Routine from stored seconds
- [x] Verify with `npm run build`

## Review

- Work type was only in the timer store, so Recent days always showed "—".
- Each rated block now saves `work_type` and `duration_seconds` on `block_ratings`.
- Mixed days show **Deep Work/Routine**. Deep Work seconds and Routine seconds are stored per block.
- Apply `supabase/migrations/20260815190000_block_ratings_work_type.sql` before new ratings will save.

## Files

- `supabase/migrations/20260815183000_block_ratings_work_type.sql` (timestamp after daily notes)
- `src/types/pomoprogress.ts`
- `src/services/pomoprogressService/sessionClientHelpers.ts`
- `src/services/pomoprogressService/sessionRating.ts`
- `src/services/pomoprogressService/sessionFinalizeBulk.ts`
- `src/services/pomoprogressService/sessionQueries.ts`
- `src/components/rating/Rating.tsx`
- `src/components/focus/recentDaysData.ts`
- `src/components/focus/RecentDays.tsx`
