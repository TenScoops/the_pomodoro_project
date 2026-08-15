-- One note per user per calendar day (focus-screen "Add note").
-- Separate from sessions so a note can be saved before any block is rated,
-- and so canceling a draft session does not delete the day's note.

create table public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  note text not null check (char_length(note) >= 1 and char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

comment on table public.daily_notes is 'Per-user daily focus note (max 500 characters).';
comment on column public.daily_notes.note is 'Free-text context for that calendar day.';

create index daily_notes_user_id_date_idx on public.daily_notes (user_id, date desc);

alter table public.daily_notes enable row level security;

create policy "daily_notes_select_own"
  on public.daily_notes for select
  using (auth.uid() = user_id);

create policy "daily_notes_insert_own"
  on public.daily_notes for insert
  with check (auth.uid() = user_id);

create policy "daily_notes_update_own"
  on public.daily_notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_notes_delete_own"
  on public.daily_notes for delete
  using (auth.uid() = user_id);
