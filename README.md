# Pomoprogress

A personal productivity and work-intelligence system built to understand how you actually work.

Plan focused work sessions, break them into structured blocks, and use a circular focus timer to stay on track. After each block, record productivity, workload, and work type, while daily energy and contextual notes capture what was happening beyond the timer.

Over time, the app turns those signals into a detailed picture of your working patterns—hours worked, Deep Work vs. Routine, load, productivity, energy, trends, distributions, and daily history—so you can see not just how much you worked, but what conditions produce your best work.

AI Insights will eventually sit on top of that history, analyzing relationships across your data and helping answer questions like: When am I most productive? How does workload affect performance? Does my energy predict the quality of my work? Am I sustaining too much heavy work?

Everything is built around a simple loop:
Plan → Focus → Reflect → Measure → Understand → Improve.

Signed-in data syncs through Supabase, making the system a persistent, personal record of your work over time.

**Live app:** [the-pomodoro-project.vercel.app](https://the-pomodoro-project.vercel.app/)

# What it does
Focus — Build intentional work sessions around a target duration, number of focus blocks, break length, and work type (Deep Work or Routine). The timer persists across navigation, so an active session stays with you throughout the app. After every block, you reflect on how the work actually went before continuing.
Work Ratings — Each completed block captures two dimensions: Productivity and Load, both recorded in precise 0.25 increments. Raw ratings are preserved exactly as entered, while aggregate Load accounts for work type—giving Routine work half the influence of Deep Work when calculating day-level workload.
Energy & Context — Log your Energy (1–5) once per day and optionally add context about how you're feeling or what affected the day. Daily notes provide another layer of context that numbers alone can't capture.
Stats — Turn your work history into a picture of how you operate. Track hours worked, productivity, load, energy, Deep Work vs. Routine, workload distribution, and day-by-day performance across time. Some advanced charts and the Daily Overview are currently being developed.
My Data — Explore your saved history across longer time horizons, including monthly and yearly productivity and hours-worked trends, built directly from completed sessions.
Themes — Personalize the environment you work in with selectable background scenes from Settings, turning Focus into a workspace that feels like your own.
The bigger picture — The goal isn't simply to count hours or Pomodoros. The system builds a structured history of how much you worked, what kind of work you did, how demanding it was, how productive you were, and what your energy was like—creating the foundation for eventually understanding the conditions under which you do your best work.

Guests can use the timer. Sign in (email) to persist sessions, ratings, notes, and energy. An **AI** tab is listed but not built yet.

## Stack

- React 18 + TypeScript (Create React App)
- Zustand for session UI state
- Chart.js / react-chartjs-2
- [Supabase](https://supabase.com/) for auth, Postgres, and Row Level Security

## Run locally

You need [Node.js](https://nodejs.org/) 18+ and a Supabase project.

```bash
git clone https://github.com/TenScoops/the_pomodoro_project.git
cd the_pomodoro_project
npm install
```

Create a `.env` in the project root (same folder as `package.json`):

```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

Use the **anon / publishable** key from Supabase → Project Settings → API. Do not commit `.env` or the service role key. RLS on `sessions`, `block_ratings`, `daily_notes`, `energy_logs`, and `profiles` is what keeps user data private.

Optional, development only:

```
# Faster countdown while testing (1 = real time)
REACT_APP_TIMER_SPEED_MULTIPLIER=1

# Pretend “today” is another calendar date (YYYY-MM-DD)
REACT_APP_DEV_FAKE_TODAY=
```

Then:

```bash
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

```bash
npm test          # Jest (watch mode unless CI=true)
npx tsc --noEmit  # Typecheck
npm run build     # Production bundle
```

## Supabase setup

1. Enable **Email** under Authentication → Providers. Set **Site URL** and **Redirect URLs** (include `http://localhost:3000` for local work).
2. Apply SQL in `supabase/migrations/` in filename order—either `supabase db push` or paste each file into the SQL Editor.
3. Confirm email vs auto-confirm to match how you want sign-up to feel. If confirmations are on, new users must click the email link before they have a session.

Migrations cover sessions and block ratings, load, work type, quarter-step scores, daily notes, energy logs, and auth profiles.

## Project layout

```
src/
  components/   Focus timer, rating, stats, energy, charts, auth
  hooks/        Auth, month stats, energy logs, chart queries
  lib/          Supabase client, calendar dates, effective load
  services/     Session, rating, notes, and energy persistence
  store/        Timer / session UI (Zustand)
supabase/migrations/
```

## License

Private / unpublished unless you add a license file.
