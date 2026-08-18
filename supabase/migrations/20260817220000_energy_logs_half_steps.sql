-- Energy check-ins support half steps (1.0–5.0 in 0.5 increments).

alter table public.energy_logs
  alter column energy type numeric(3, 1) using energy::numeric(3, 1);

alter table public.energy_logs
  drop constraint if exists energy_logs_energy_check;

alter table public.energy_logs
  add constraint energy_logs_energy_check
  check (
    energy >= 1
    and energy <= 5
    and energy * 2 = round(energy * 2)
  );

comment on column public.energy_logs.energy is 'Self-reported energy from 1 (Low) to 5 (Great) in 0.5 steps.';
comment on table public.energy_logs is 'Per-user daily energy score (1–5, half steps) with optional note.';
