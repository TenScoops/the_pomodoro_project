# Pomoprogress — lessons learned

## Authentication (Supabase, 2026)

- **Gate the app on `session`, not a custom backend cookie.** `useAuth` uses `getSession` once plus `onAuthStateChange` so the UI and sidebar stay aligned without duplicate `fetch('/auth/status')` calls.
- **Email sign-up may return `user` but no `session`** until the user confirms email (if confirmations are enabled in Supabase). Show a clear “check your email” message instead of failing silently.
- **Removing Google OAuth** simplifies the sidebar: a single **Logout** path via `signOut()` in `src/lib/auth.ts` (wraps `supabase.auth.signOut()`) matches the Logout modal and avoids mixing legacy localhost redirects with Supabase.
- **Stacking / layout:** fixed sidebar + main content need explicit spacing (`padding-left` or grid) and careful z-index so neither column steals clicks from the other.
- **Auth UX:** Keep the main shell visible and open the same sign-in / sign-up form in a **modal** (`AuthModal` + `AuthForm`) when the user chooses **Sign in** in the sidebar—avoid replacing the whole app with a full-page gate unless the product requires it.
- **Global `button` rules** (e.g. `width: 100px` in `App.css`) apply inside `react-modal` too. Scope overrides under `.auth-panel` / `.auth-modal-close`, give the modal content a **solid background** and **`overflow: hidden`**, and raise **overlay `z-index`** so controls stay clickable and no white `body` strip shows at the bottom.

### Supabase Dashboard + database (sign-in / sign-up)

- **Enable Email provider:** Authentication → Providers → **Email** → enable. Configure “Confirm email” vs “Auto sign-in” to match product: if confirmations are on, `signUp` often returns a user without a session until the user clicks the link; set **Site URL** and **Redirect URLs** (e.g. `http://localhost:3000` for dev) so confirmation links land on your app.
- **Env vars:** `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (anon key) in `.env` — see `.env.example`. Never commit real keys; the anon key is public but RLS must protect data.
- **Server-side auth pairing:** `public.profiles` (one row per `auth.users` id) plus trigger `on_auth_user_created` keeps app tables joinable to `profiles.id` / `user_id` with **RLS** (`auth.uid() = user_id`) on `sessions` and related tables — aligns with “always handle RLS” in `rules.md`.
- **Migrations:** SQL lives under `supabase/migrations/`; apply with Supabase CLI (`supabase db push`) or paste into the SQL Editor. Order matters: sessions migration references `auth.users`; profiles migration adds the trigger after `profiles` exists.
- **Client auth module:** `src/lib/auth.ts` wraps `signInWithPassword`, `signUp` (with `emailRedirectTo` for confirmation emails), and `signOut` so UI code stays thin and typed; `AuthForm` uses these helpers.
- **Session load errors:** `useAuth` exposes `authError` when `getSession` fails (bad network, misconfiguration). `App` shows a retry screen instead of failing silently — covers loading, error, and signed-out/signed-in states per `rules.md`.
