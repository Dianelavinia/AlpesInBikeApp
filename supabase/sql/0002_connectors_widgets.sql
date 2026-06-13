-- =====================================================================
-- ALPES IN BIKE : connecteurs montres et capteurs + sessions live
-- =====================================================================

-- Liste des sources fitness connectées par utilisateur.
create table if not exists public.user_connectors (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  connector_id  text not null,
  connected     boolean not null default false,
  device_name   text,
  battery_pct   int,
  last_sync_at  timestamptz,
  -- Jetons OAuth chiffrés côté server (gérés via Edge Function, jamais lus
  -- depuis le client). Stockés en JSONB pour souplesse.
  oauth_tokens  jsonb,
  scopes        text[],
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, connector_id)
);

create index if not exists user_connectors_user_idx on public.user_connectors(user_id);

-- Sessions live de capteur (1 enregistrement par ride avec sa série de mesures).
-- Les mesures sont stockées en JSONB pour rester souple sur le format BLE.
create table if not exists public.sensor_sessions (
  id            uuid primary key default gen_random_uuid(),
  ride_id       uuid references public.rides(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  source        text not null,        -- 'ble-hr', 'apple-watch', 'garmin'...
  device_name   text,
  started_at    timestamptz not null,
  ended_at      timestamptz,
  avg_hr        int,
  max_hr        int,
  avg_power     int,
  max_power     int,
  -- Compactage : [{t:0,hr:142,p:195,cad:84}, ...] échantillonnage 1 Hz max.
  samples       jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists sensor_sessions_user_idx on public.sensor_sessions(user_id, started_at desc);
create index if not exists sensor_sessions_ride_idx on public.sensor_sessions(ride_id);

-- Cache widget : dernier snapshot écrit pour push vers WidgetKit / Glance.
-- Le client écrit dans cette table à chaque fin de ride, puis une Edge
-- Function (ou un trigger d'app) déclenche un push silencieux APNs/FCM
-- pour rafraîchir le widget natif.
create table if not exists public.widget_snapshots (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  km_week           int not null default 0,
  km_month          int not null default 0,
  km_monthly_goal   int not null default 400,
  co2_year_kg       int not null default 0,
  rank_global       int,
  rank_total        int,
  streak_days       int not null default 0,
  badges_count      int not null default 0,
  updated_at        timestamptz not null default now()
);

-- =====================================================================
-- RLS
-- =====================================================================

alter table public.user_connectors enable row level security;
alter table public.sensor_sessions enable row level security;
alter table public.widget_snapshots enable row level security;

drop policy if exists "user_connectors_self" on public.user_connectors;
create policy "user_connectors_self"
  on public.user_connectors for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "sensor_sessions_self" on public.sensor_sessions;
create policy "sensor_sessions_self"
  on public.sensor_sessions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "widget_snapshots_self" on public.widget_snapshots;
create policy "widget_snapshots_self"
  on public.widget_snapshots for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================================
-- RPC : refresh_widget_snapshot
-- Recalcule le snapshot widget après chaque ride.
-- =====================================================================

create or replace function public.refresh_widget_snapshot()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me_id uuid := auth.uid();
  v_km_week int;
  v_km_month int;
  v_co2 int;
  v_badges int;
  v_goal int;
begin
  select coalesce(sum(distance_m), 0) / 1000 into v_km_week
    from rides where user_id = me_id and started_at >= date_trunc('week', now());

  select coalesce(sum(distance_m), 0) / 1000 into v_km_month
    from rides where user_id = me_id and started_at >= date_trunc('month', now());

  select coalesce(sum(co2_saved_g), 0) / 1000 into v_co2
    from rides where user_id = me_id and started_at >= date_trunc('year', now());

  select count(*)::int into v_badges from badges_earned where user_id = me_id;
  select annual_co2_goal_kg into v_goal from profiles where id = me_id;

  insert into widget_snapshots (user_id, km_week, km_month, km_monthly_goal, co2_year_kg, badges_count, updated_at)
  values (me_id, v_km_week, v_km_month, coalesce(v_goal / 12, 33), v_co2, v_badges, now())
  on conflict (user_id) do update set
    km_week         = excluded.km_week,
    km_month        = excluded.km_month,
    km_monthly_goal = excluded.km_monthly_goal,
    co2_year_kg     = excluded.co2_year_kg,
    badges_count    = excluded.badges_count,
    updated_at      = now();
end;
$$;

grant execute on function public.refresh_widget_snapshot() to authenticated;
