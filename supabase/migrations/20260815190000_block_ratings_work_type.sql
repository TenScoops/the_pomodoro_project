-- Per-block work type and focus duration so Recent days / stats can split Deep Work vs Routine.

alter table public.block_ratings
  add column work_type text check (work_type is null or work_type in ('Deep Work', 'Routine')),
  add column duration_seconds integer check (duration_seconds is null or duration_seconds >= 0);

comment on column public.block_ratings.work_type is 'Work type for this block: Deep Work or Routine. Null on rows saved before this column existed.';
comment on column public.block_ratings.duration_seconds is 'Focus time attributed to this block, in seconds. Null on rows saved before this column existed.';
comment on table public.block_ratings is 'Per-block productivity (1–10), load (1–5), work type, and focus duration for a session.';
