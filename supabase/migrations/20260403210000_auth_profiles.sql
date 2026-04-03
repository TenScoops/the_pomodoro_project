-- Pomoprogress: one public profile row per auth user (for RLS-friendly app data and future fields).
-- Apply with Supabase CLI (`supabase db push`) or paste into the SQL Editor (Dashboard).

-- ---------------------------------------------------------------------------
-- profiles: mirrors auth.users id; created automatically on sign-up
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App-facing row per Supabase Auth user; extend with display name, prefs, etc.';

alter table public.profiles enable row level security;

-- Signed-in users can read and update only their own row (insert/delete happen via trigger / cascade).
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Trigger: create profile when a new auth.users row is inserted (email sign-up, etc.)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

comment on function public.handle_new_user() is 'Runs after auth.users insert; keeps public.profiles in sync with Supabase Auth.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
