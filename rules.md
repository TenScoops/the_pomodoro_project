# Vurtuu: Cursor Rules

# These rules apply to every session. Read them before starting any task.

## Code Style

- Write code that a junior developer can read and understand without explanation
- Descriptive variable names only — no single letters (no `r`, `u`, `i` in callbacks)
- Comments explain *why*, not *what*, the code should speak for itself
- Section dividers for long files: Types, Constants, Helpers, Component, Render
- Max ~200 lines per file, if it's growing beyond that, consider splitting
- Handle every state: loading, error, empty, and data — never skip one
- always prefer Tailwind classes over inline styles unless the property isn't supported in NativeWind

## Workflow

### 1. Plan Before You Build

- For any task with 3+ steps or architectural decisions, write a plan first
- If something goes sideways, STOP and re-plan, don't keep pushing
- Write out what files will be touched before touching them

### 2. Verify Before Done

- Never mark a task complete without proving it works
- Ask yourself: "Would a senior engineer approve this?"
- Check logs, run the app, demonstrate it works

### 3. Demanding Elegance

- For non-trivial changes, pause and ask "is there a more elegant way?
- Add comments, must be readable and understandable that a non-coder can understand what's happening
"
- If a fix feels hacky, implement the proper solution instead
- Don't over-engineer simple things, simplicity first
- Challenge your own work before presenting it

### 4. Autonomous Bug Fixing

- When given a bug: just fix it, don't ask for hand-holding
- Find the root cause — no temporary patches
- Zero context switching required from the user

### 5. Minimal Impact

- Changes should only touch what's necessary
- Avoid introducing bugs in unrelated code
- Smallest possible change that solves the problem correctly

### 6. Self-Improvement

- After any correction from the user, update `lessons.md` (project root) with what was learned
- Review `lessons.md` at the start of each session
- Ruthlessly iterate until mistake rate drops

## Task Management

- Write plan to `todo.md` (project root) with checkable items before starting
- Mark items complete as you go
- Add a review section to `todo.md` when done
- Document lessons learned in `lessons.md` after corrections

## Vurtuu-Specific Rules

- Typography: Lora for post body/content, Inter for buttons, usernames, modals, UI
- Bottom sheets use `sheetPosition` for animation, not `panY`
- Always handle RLS when writing Supabase queries
- Optimistic UI must always have a revert on failure
- Every bottom sheet needs: loading skeleton, error state, empty state, data state
- Font files live in `assets/fonts/`
- Components over 200 lines should be evaluated for splitting
- remember im using typescript, use types whereever possible to keep the codebase robust, maintainable, and bug free. use types when it's necessary and needed

