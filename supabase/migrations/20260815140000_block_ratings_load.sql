-- Add per-block load / difficulty (1–5) alongside productivity `rating` (1–10).
-- Nullable so existing block_ratings rows remain valid.

alter table public.block_ratings
  add column load smallint check (load is null or (load >= 1 and load <= 5));

comment on column public.block_ratings.load is 'Per-block load / difficulty (1–5). Null for ratings saved before this column existed.';
comment on table public.block_ratings is 'Per-block productivity rating (1–10) and load (1–5) for a session.';
