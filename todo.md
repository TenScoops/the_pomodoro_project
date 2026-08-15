# Focus → hardcoded Recent Days under timer

- [x] Add static data + types for summary cards and recent-day rows
- [x] Build Recent Days UI (3 cards + table) with no fetching or timer logic
- [x] Place it under the Focus timer in App
- [x] Style to match existing hub panels (dark timer-panel look)
- [x] Verify with `npm run build`
- [x] Review
  - Focus timer page now shows hardcoded summary cards + a Recent days table below the clock.
  - Values match the mockup (hours, load, productivity, seven day rows). View all / View more / row menus are display-only.
  - Styled like HubTodayDashboard (`#1e212dcd`) so it sits on the themed background.
  - `npm run build` compiles successfully.
