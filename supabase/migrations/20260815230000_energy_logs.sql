-- One energy check-in per user per calendar day (Energy tab "Log your energy").

create table public.energy_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  energy smallint not null check (energy >= 1 and energy <= 5),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

comment on table public.energy_logs is 'Per-user daily energy score (1-5) with optional note.';
comment on column public.energy_logs.energy is 'Self-reported energy from 1 (Low) to 5 (Great).';
comment on column public.energy_logs.note is 'Optional context for that calendar day (max 500 characters).';

create index energy_logs_user_id_date_idx on public.energy_logs (user_id, date desc);

alter table public.energy_logs enable row level security;

create policy "energy_logs_select_own"
  on public.energy_logs for select
  using (auth.uid() = user_id);

create policy "energy_logs_insert_own"
  on public.energy_logs for insert
  with check (auth.uid() = user_id);

create policy "energy_logs_update_own"
  on public.energy_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "energy_logs_delete_own"
  on public.energy_logs for delete
  using (auth.uid() = user_id);
