# Skip ratings do not count time; reload restarts

Skipped blocks (no productivity or load) must not add hours. Closing the page must restart the timer so leftover persisted state cannot resume.

- [x] Write plan and list files
- [x] Session totals = sum of rated `duration_seconds` only
- [x] Skip does not log time; last-block skip does not write planned full hours
- [x] Session card Completed excludes skipped blocks
- [x] Do not restore the timer on load; clear persistence and detach the draft id
- [x] Verify with `npm run build`

## Review

- Skip / close on Rate your session does not insert a block rating, so that block’s minutes are not stored.
- Finalize sums rated block durations instead of writing the full planned session.
- Reload clears the countdown and starts at block 1; already-saved ratings stay in the database.
