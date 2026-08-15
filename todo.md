# Replace Create a session with setup modal

Remove the old setter page. Open a setup modal from Session → Edit, using existing dark styling and the current timer store (hours / breaks / break length).

- [x] Write plan and list files
- [x] Add setup math, stepper, fields, preview, modal
- [x] Wire store + Edit; drop Setter
- [x] Sync work type with the timer title
- [x] Verify with `npm run build`

## Files

- deleted `src/components/setter/Setter.tsx`, `Setter.css`
- added `src/components/sessionSetup/*`
- `src/store/sessionStore.ts`
- `src/App.tsx`
- `src/components/timer/Timer.tsx`
- `src/components/timer/components/TimerClock.tsx`

## Review

- Create a session sliders are gone. Session → Edit opens **Set Up Your Focus Session**.
- Start Session maps focus time / blocks / break length onto the existing timer store and resets the current run.
- Work type is shared with the timer title. `npm run build` succeeded.
