-- Pomoprogress: sessions + block_ratings
-- Run via Supabase CLI (`supabase db push`) or paste into SQL Editor in the dashboard.

-- ---------------------------------------------------------------------------
-- sessions: one row per completed (or saved) focus session for a user
-- ---------------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  total_time_worked integer not null check (total_time_worked >= 0),
  sessions_completed integer not null default 0 check (sessions_completed >= 0),
  blocks_completed integer not null default 0 check (blocks_completed >= 0),
  created_at timestamptz not null default now()
);

comment on table public.sessions is 'Pomodoro session summary per user; total_time_worked is stored in seconds.';
comment on column public.sessions.total_time_worked is 'Total focus time worked in seconds for this session row.';

create index sessions_user_id_created_at_idx on public.sessions (user_id, created_at desc);
create index sessions_user_id_date_idx on public.sessions (user_id, date desc);

-- ---------------------------------------------------------------------------
-- block_ratings: self-ratings per work block, tied to a session
-- ---------------------------------------------------------------------------
create table public.block_ratings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  block_number integer not null check (block_number >= 1),
  rating smallint not null check (rating >= 1 and rating <= 10),
  created_at timestamptz not null default now(),
  unique (session_id, block_number)
);

comment on table public.block_ratings is 'Per-block productivity rating (1–10) for a session.';

create index block_ratings_session_id_idx on public.block_ratings (session_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: users only see and change their own data
-- ---------------------------------------------------------------------------
alter table public.sessions enable row level security;
alter table public.block_ratings enable row level security;

-- sessions: scoped by user_id = authenticated user
create policy "sessions_select_own"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions_delete_own"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- block_ratings: allowed when the parent session belongs to the current user
create policy "block_ratings_select_via_session"
  on public.block_ratings for select
  using (
    exists (
      select 1 from public.sessions session_row
      where session_row.id = block_ratings.session_id
        and session_row.user_id = auth.uid()
    )
  );

create policy "block_ratings_insert_via_session"
  on public.block_ratings for insert
  with check (
    exists (
      select 1 from public.sessions session_row
      where session_row.id = block_ratings.session_id
        and session_row.user_id = auth.uid()
    )
  );

create policy "block_ratings_update_via_session"
  on public.block_ratings for update
  using (
    exists (
      select 1 from public.sessions session_row
      where session_row.id = block_ratings.session_id
        and session_row.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions session_row
      where session_row.id = block_ratings.session_id
        and session_row.user_id = auth.uid()
    )
  );

create policy "block_ratings_delete_via_session"
  on public.block_ratings for delete
  using (
    exists (
      select 1 from public.sessions session_row
      where session_row.id = block_ratings.session_id
        and session_row.user_id = auth.uid()
    )
  );
