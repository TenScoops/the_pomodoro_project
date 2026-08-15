# Timer hero layout (circular ring)

Match the reference layout: date → target/title → circular progress clock (time, tagline, Add note inside) → Pause/End. Keep existing dark theme, Kalam, and Source Code Pro.

- [x] Write plan and list files
- [x] Add SVG progress ring around the clock
- [x] Move Add note inside the ring
- [x] Restyle controls as circular Pause/Start + End (keep speed boost)
- [x] Wire End to existing cancel confirmation
- [x] Verify with `npm run build`

## Files

- `src/components/timer/components/TimerProgressRing.tsx` (new)
- `src/components/timer/components/TimerClock.tsx`
- `src/components/timer/components/TimerControls.tsx`
- `src/components/timer/Timer.css`
- `src/components/timer/Timer.tsx`
- `src/components/timer/hooks/usePomodoroTimer.ts`
- `src/components/timer/types/timerTypes.ts`

## Review

- Clock is a circular progress ring; elapsed time of the current work/break block fills it clockwise with a knob.
- Tagline and Add note sit inside the ring. Pause/Start is a filled circle; End is outlined and opens the existing cancel dialog.
- Speed boost stays as a small extra control. Fonts remain Kalam + Source Code Pro; dark cards/shadows kept on date and buttons.
- `npm run build` succeeded.
