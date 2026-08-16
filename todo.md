# Energy logs persistence

Hook Log your energy and Energy History to `energy_logs` (one row per user per day, RLS).

- [x] Migration + types + service
- [x] Hook: load, optimistic save with revert
- [x] Wire EnergyLogCard and EnergyHistory (loading / error / empty / data)
- [x] Verify `npm run build`

## Review

- `energy_logs`: one score + note per user per day, RLS on `auth.uid()`.
- Save upserts today, updates history immediately, reverts if the write fails.
- Guests get the existing data-logging toast and no row is kept.
- Apply `supabase/migrations/20260815230000_energy_logs.sql` before saving in a live project.
