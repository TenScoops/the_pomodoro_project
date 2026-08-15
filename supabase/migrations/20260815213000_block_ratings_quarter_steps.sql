-- Quarter-step productivity (1.00–10.00) and load (1.00–5.00).

alter table public.block_ratings
  alter column rating type numeric(4, 2) using rating::numeric(4, 2);

alter table public.block_ratings
  drop constraint if exists block_ratings_rating_check;

alter table public.block_ratings
  add constraint block_ratings_rating_check
  check (
    rating >= 1
    and rating <= 10
    and rating * 4 = round(rating * 4)
  );

alter table public.block_ratings
  alter column load type numeric(4, 2) using load::numeric(4, 2);

alter table public.block_ratings
  drop constraint if exists block_ratings_load_check;

alter table public.block_ratings
  add constraint block_ratings_load_check
  check (
    load is null
    or (
      load >= 1
      and load <= 5
      and load * 4 = round(load * 4)
    )
  );

comment on column public.block_ratings.rating is 'Per-block productivity rating from 1 to 10 in 0.25 steps.';
comment on column public.block_ratings.load is 'Per-block load / difficulty from 1 to 5 in 0.25 steps. Null for ratings saved before this column existed.';
comment on table public.block_ratings is 'Per-block productivity rating (1–10) and load (1–5) for a session, in 0.25 steps.';
