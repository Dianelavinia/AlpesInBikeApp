-- ============================================================
-- ALPES IN BIKE : Setup complet Supabase, FICHIER UNIQUE
-- Genere automatiquement depuis 0001 a 0005
-- A coller dans le SQL Editor Supabase puis cliquer Run
-- ============================================================


-- ============================================================
-- 0001_leaderboard_carbon.sql
-- ============================================================

-- =====================================================================
-- ALPES IN BIKE : Schéma classement multi-dimensions + bilan carbone
-- A coller dans Supabase SQL editor. Idempotent (create if not exists).
-- =====================================================================

-- Extensions utiles
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1) Tables
-- =====================================================================

create table if not exists public.clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  region      text,
  city        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id                    uuid primary key references auth.users on delete cascade,
  display_name          text not null,
  avatar                text not null,
  sex                   text check (sex in ('F','H','X')),
  birth_date            date,
  region                text,
  city                  text,
  club_id               uuid references public.clubs(id) on delete set null,
  annual_co2_goal_kg    int not null default 500,
  created_at            timestamptz not null default now()
);

create table if not exists public.friendships (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  friend_id   uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists public.rides (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  started_at    timestamptz not null,
  ended_at      timestamptz not null,
  distance_m    int not null check (distance_m >= 0),
  elevation_m   int not null default 0 check (elevation_m >= 0),
  co2_saved_g   int not null default 0,
  points        int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.badges_earned (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  badge_id    text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists rides_user_started_idx on public.rides (user_id, started_at desc);
create index if not exists rides_started_idx       on public.rides (started_at desc);
create index if not exists profiles_region_idx     on public.profiles (region);
create index if not exists profiles_sex_idx        on public.profiles (sex);
create index if not exists profiles_club_idx       on public.profiles (club_id);

-- =====================================================================
-- 2) Helpers immutables
-- =====================================================================

create or replace function public.age_bracket(birth date)
returns text language sql immutable as $$
  select case
    when birth is null then null
    when extract(year from age(birth)) < 25 then 'u25'
    when extract(year from age(birth)) < 35 then '25_34'
    when extract(year from age(birth)) < 45 then '35_44'
    when extract(year from age(birth)) < 55 then '45_54'
    else '55p'
  end;
$$;

create or replace function public.period_start(p text)
returns timestamptz language sql stable as $$
  select case p
    when 'week'  then date_trunc('week',  now())
    when 'month' then date_trunc('month', now())
    when 'year'  then date_trunc('year',  now())
    when 'all'   then '1970-01-01'::timestamptz
    else date_trunc('month', now())
  end;
$$;

-- =====================================================================
-- 3) Trigger : calcul auto des points + CO2 économisé
-- 121 g CO2 par km évité (moyenne voiture France ADEME).
-- 1 point Club = 1 km + 0,5 par 10 m de dénivelé.
-- =====================================================================

create or replace function public.compute_ride_metrics()
returns trigger language plpgsql as $$
begin
  if new.co2_saved_g is null or new.co2_saved_g = 0 then
    new.co2_saved_g := (new.distance_m * 121) / 1000;
  end if;
  if new.points is null or new.points = 0 then
    new.points := (new.distance_m / 1000) + (new.elevation_m / 20);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_compute_ride_metrics on public.rides;
create trigger trg_compute_ride_metrics
  before insert on public.rides
  for each row execute function public.compute_ride_metrics();

-- =====================================================================
-- 4) Trigger : création auto du profil à l'inscription
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_initials text;
begin
  v_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  v_initials := upper(substring(regexp_replace(v_name, '[^a-zA-Z]', '', 'g') for 2));

  insert into public.profiles (id, display_name, avatar, sex, birth_date, region, city, club_id)
  values (
    new.id,
    v_name,
    coalesce(nullif(v_initials, ''), 'AB'),
    (new.raw_user_meta_data->>'sex')::text,
    (new.raw_user_meta_data->>'birth_date')::date,
    new.raw_user_meta_data->>'region',
    new.raw_user_meta_data->>'city',
    (new.raw_user_meta_data->>'club_id')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 5) RPC : get_leaderboard
-- Filtres scope : global / myAge / mySex / myRegion / friends / club
-- Périodes      : week / month / year / all
-- Métriques     : km / elevation / co2 / rides / points
-- =====================================================================

create or replace function public.get_leaderboard(
  p_scope   text default 'global',
  p_period  text default 'month',
  p_metric  text default 'km',
  p_limit   int  default 100
)
returns table (
  rank          bigint,
  user_id       uuid,
  display_name  text,
  avatar        text,
  city          text,
  region        text,
  sex           text,
  age_bracket   text,
  club_id       uuid,
  badges        int,
  value         numeric,
  is_you        boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  me_id      uuid := auth.uid();
  me_sex     text;
  me_age     text;
  me_region  text;
  me_club    uuid;
  start_ts   timestamptz := period_start(p_period);
begin
  if me_id is not null then
    select sex, age_bracket(birth_date), region, club_id
      into me_sex, me_age, me_region, me_club
      from public.profiles
      where id = me_id;
  end if;

  return query
  with agg as (
    select
      p.id            as user_id,
      p.display_name,
      p.avatar,
      p.city,
      p.region,
      p.sex,
      age_bracket(p.birth_date) as age_bracket,
      p.club_id,
      (select count(*)::int from public.badges_earned be where be.user_id = p.id) as badges,
      case p_metric
        when 'km'        then coalesce(sum(r.distance_m), 0)::numeric / 1000
        when 'elevation' then coalesce(sum(r.elevation_m), 0)::numeric
        when 'co2'       then coalesce(sum(r.co2_saved_g), 0)::numeric / 1000
        when 'rides'     then count(r.id)::numeric
        when 'points'    then coalesce(sum(r.points), 0)::numeric
        else 0::numeric
      end as value
    from public.profiles p
    left join public.rides r
      on r.user_id = p.id
     and r.started_at >= start_ts
    where case p_scope
      when 'global'   then true
      when 'myAge'    then age_bracket(p.birth_date) = me_age
      when 'mySex'    then p.sex = me_sex
      when 'myRegion' then p.region = me_region
      when 'club'     then me_club is not null and p.club_id = me_club
      when 'friends'  then p.id = me_id or p.id in (
                            select fr.friend_id from public.friendships fr where fr.user_id = me_id
                         )
      else true
    end
    group by p.id
  )
  select
    rank() over (order by value desc, display_name asc) as rank,
    user_id,
    display_name,
    avatar,
    city,
    region,
    sex,
    age_bracket,
    club_id,
    badges,
    round(value, 1) as value,
    (user_id = me_id) as is_you
  from agg
  order by value desc, display_name asc
  limit p_limit;
end;
$$;

grant execute on function public.get_leaderboard(text, text, text, int) to authenticated, anon;

-- =====================================================================
-- 6) RPC : get_my_carbon (bilan carbone personnel)
-- =====================================================================

create or replace function public.get_my_carbon()
returns table (
  co2_saved_kg          int,
  km_ridden             int,
  car_trips_avoided     int,
  fuel_liters_avoided   int,
  annual_goal_kg        int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  me_id      uuid := auth.uid();
  year_start timestamptz := date_trunc('year', now());
begin
  return query
  select
    (coalesce(sum(r.co2_saved_g), 0) / 1000)::int            as co2_saved_kg,
    (coalesce(sum(r.distance_m),  0) / 1000)::int            as km_ridden,
    -- 1 trajet voiture évité = 30 km en moyenne (estimation domicile-loisir)
    (coalesce(sum(r.distance_m),  0) / 30000)::int           as car_trips_avoided,
    -- 1 L essence brûlé = 2,3 kg de CO2 (ADEME)
    (coalesce(sum(r.co2_saved_g), 0) / 2300)::int            as fuel_liters_avoided,
    coalesce(p.annual_co2_goal_kg, 500)::int                 as annual_goal_kg
  from public.profiles p
  left join public.rides r
    on r.user_id = p.id
   and r.started_at >= year_start
  where p.id = me_id
  group by p.annual_co2_goal_kg;
end;
$$;

grant execute on function public.get_my_carbon() to authenticated;

-- =====================================================================
-- 7) Row Level Security
-- =====================================================================

alter table public.profiles      enable row level security;
alter table public.clubs         enable row level security;
alter table public.friendships   enable row level security;
alter table public.rides         enable row level security;
alter table public.badges_earned enable row level security;

-- Profiles : lecture publique (champs non sensibles), update self
drop policy if exists "profiles_read_all"      on public.profiles;
drop policy if exists "profiles_insert_self"   on public.profiles;
drop policy if exists "profiles_update_self"   on public.profiles;
create policy "profiles_read_all"
  on public.profiles for select to authenticated using (true);
create policy "profiles_insert_self"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_self"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Clubs : lecture publique
drop policy if exists "clubs_read_all" on public.clubs;
create policy "clubs_read_all"
  on public.clubs for select to authenticated using (true);

-- Friendships : self management
drop policy if exists "friendships_read_self"   on public.friendships;
drop policy if exists "friendships_insert_self" on public.friendships;
drop policy if exists "friendships_delete_self" on public.friendships;
create policy "friendships_read_self"
  on public.friendships for select to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "friendships_insert_self"
  on public.friendships for insert to authenticated
  with check (auth.uid() = user_id);
create policy "friendships_delete_self"
  on public.friendships for delete to authenticated
  using (auth.uid() = user_id);

-- Rides : la trace individuelle reste privée, le classement passe par
-- la fonction security definer qui agrège sans exposer les rides bruts.
drop policy if exists "rides_select_self_or_friends" on public.rides;
drop policy if exists "rides_insert_self"            on public.rides;
drop policy if exists "rides_update_self"            on public.rides;
drop policy if exists "rides_delete_self"            on public.rides;
create policy "rides_select_self_or_friends"
  on public.rides for select to authenticated
  using (
    auth.uid() = user_id
    or user_id in (select fr.friend_id from public.friendships fr where fr.user_id = auth.uid())
  );
create policy "rides_insert_self"
  on public.rides for insert to authenticated with check (auth.uid() = user_id);
create policy "rides_update_self"
  on public.rides for update to authenticated using (auth.uid() = user_id);
create policy "rides_delete_self"
  on public.rides for delete to authenticated using (auth.uid() = user_id);

-- Badges : lecture publique (sert au compteur classement)
drop policy if exists "badges_read_all"    on public.badges_earned;
drop policy if exists "badges_insert_self" on public.badges_earned;
create policy "badges_read_all"
  on public.badges_earned for select to authenticated using (true);
create policy "badges_insert_self"
  on public.badges_earned for insert to authenticated with check (auth.uid() = user_id);

-- =====================================================================
-- 8) Seed clubs (optionnel, à exécuter une fois pour la démo)
-- =====================================================================

insert into public.clubs (name, region, city) values
  ('Aix Cycling',   'Savoie',       'Aix-les-Bains'),
  ('Chambéry VTT',  'Savoie',       'Chambéry'),
  ('Annecy Bike',   'Haute-Savoie', 'Annecy'),
  ('Grenoble Riders','Isère',       'Grenoble'),
  ('Belley Outdoor','Ain',          'Belley')
on conflict (name) do nothing;


-- ============================================================
-- 0002_connectors_widgets.sql
-- ============================================================

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


-- ============================================================
-- 0003_user_devices_notifications.sql
-- ============================================================

-- =====================================================================
-- ALPES IN BIKE : table user_devices pour Expo Push Tokens + outbox
-- =====================================================================

create table if not exists public.user_devices (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  platform          text not null check (platform in ('ios','android','web')),
  expo_push_token   text,
  device_id         text,
  device_name       text,
  os_version        text,
  app_version       text,
  is_active         boolean not null default true,
  last_seen_at      timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index if not exists user_devices_user_idx on public.user_devices(user_id);
create index if not exists user_devices_token_idx on public.user_devices(expo_push_token);

alter table public.user_devices enable row level security;

drop policy if exists "user_devices_self" on public.user_devices;
create policy "user_devices_self"
  on public.user_devices for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Outbox notifications : on enregistre les push a envoyer, traites par
-- une Edge Function (cron toutes les 30s) ou un trigger
-- =====================================================================

create table if not exists public.notifications_outbox (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  title             text not null,
  body              text not null,
  data              jsonb default '{}'::jsonb,
  scheduled_at      timestamptz not null default now(),
  sent_at           timestamptz,
  delivery_status   text default 'pending' check (delivery_status in ('pending','sent','failed')),
  error_message     text,
  created_at        timestamptz not null default now()
);

create index if not exists outbox_pending_idx on public.notifications_outbox(scheduled_at)
  where delivery_status = 'pending';
create index if not exists outbox_user_idx on public.notifications_outbox(user_id, created_at desc);

alter table public.notifications_outbox enable row level security;

drop policy if exists "outbox_read_self" on public.notifications_outbox;
create policy "outbox_read_self"
  on public.notifications_outbox for select to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- RPC notify_user : enqueue une notification depuis le code SQL
-- =====================================================================

create or replace function public.notify_user(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_data jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.notifications_outbox (user_id, notification_type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, p_data)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.notify_user(uuid, text, text, text, jsonb) to authenticated;

-- =====================================================================
-- Triggers automatiques : exemples
-- =====================================================================

-- Quand un ride est insere, declenche un push silencieux pour rafraichir widget
create or replace function public.trigger_widget_refresh_on_ride()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform notify_user(
    new.user_id,
    'widget.refresh',
    '',
    '',
    jsonb_build_object('silent', true)
  );
  return new;
end;
$$;

drop trigger if exists on_ride_inserted_refresh_widget on public.rides;
create trigger on_ride_inserted_refresh_widget
  after insert on public.rides
  for each row execute function public.trigger_widget_refresh_on_ride();

-- Quand un badge est debloque
create or replace function public.trigger_badge_notification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform notify_user(
    new.user_id,
    'badge.unlocked',
    'Nouveau badge débloqué',
    'Bravo, votre profil vient de gagner un badge.',
    jsonb_build_object('badge_id', new.badge_id)
  );
  return new;
end;
$$;

drop trigger if exists on_badge_earned_notify on public.badges_earned;
create trigger on_badge_earned_notify
  after insert on public.badges_earned
  for each row execute function public.trigger_badge_notification();


-- ============================================================
-- 0004_safety_block_report.sql
-- ============================================================

-- =====================================================================
-- ALPES IN BIKE : signalement et blocage entre rideurs
-- =====================================================================

create table if not exists public.blocked_users (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  blocked_id     uuid not null references public.profiles(id) on delete cascade,
  created_at     timestamptz not null default now(),
  reason         text,
  primary key (user_id, blocked_id),
  check (user_id <> blocked_id)
);

create index if not exists blocked_users_user_idx on public.blocked_users(user_id);

create table if not exists public.user_reports (
  id             uuid primary key default gen_random_uuid(),
  reporter_id    uuid not null references public.profiles(id) on delete cascade,
  reported_id    uuid not null references public.profiles(id) on delete cascade,
  reason         text not null check (reason in (
    'inappropriate_content', 'spam', 'fake_profile', 'harassment',
    'suspicious_behavior', 'no_show', 'theft_attempt', 'other'
  )),
  message        text,
  context        text,
  status         text not null default 'pending' check (status in ('pending','reviewing','closed','action_taken')),
  reviewed_by    uuid references public.profiles(id),
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists user_reports_reported_idx on public.user_reports(reported_id, created_at desc);
create index if not exists user_reports_pending_idx on public.user_reports(status) where status = 'pending';

-- RLS
alter table public.blocked_users enable row level security;
alter table public.user_reports enable row level security;

drop policy if exists "blocked_self" on public.blocked_users;
create policy "blocked_self"
  on public.blocked_users for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "report_create_self" on public.user_reports;
create policy "report_create_self"
  on public.user_reports for insert to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "report_read_own" on public.user_reports;
create policy "report_read_own"
  on public.user_reports for select to authenticated
  using (auth.uid() = reporter_id);

-- Helper : ne pas afficher les profils bloques dans le matching
create or replace function public.is_blocked_by_me(other_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.blocked_users
    where user_id = auth.uid() and blocked_id = other_id
  );
$$;

-- Auto-blocage si un profil cumule 3 reports valides en moins de 30 jours
create or replace function public.auto_suspend_on_reports()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  select count(*) into v_count
  from public.user_reports
  where reported_id = new.reported_id
    and status in ('reviewing','action_taken')
    and created_at > now() - interval '30 days';
  if v_count >= 3 then
    update public.profiles set
      annual_co2_goal_kg = annual_co2_goal_kg  -- placeholder, ajouter colonne is_suspended dans profile en prod
    where id = new.reported_id;
    -- Log : insert dans une table moderation_actions
  end if;
  return new;
end;
$$;

drop trigger if exists on_report_check_suspend on public.user_reports;
create trigger on_report_check_suspend
  after insert on public.user_reports
  for each row execute function public.auto_suspend_on_reports();


-- ============================================================
-- 0005_rides_messages.sql
-- ============================================================

-- =====================================================================
-- ALPES IN BIKE : Persistance rides détaillés et messagerie in-app
-- =====================================================================

-- =====================================================================
-- Persistance complète d un ride enregistré
-- =====================================================================
-- La table rides existe deja dans 0001. Ici on ajoute des colonnes
-- detaillees pour stocker la polyline GPS, les stats avancees et
-- les samples des capteurs.

alter table public.rides
  add column if not exists title             text,
  add column if not exists zone              text,
  add column if not exists cover_url         text,
  add column if not exists difficulty        text check (difficulty in ('decouverte','facile','intermediaire','difficile','expert')),
  add column if not exists bike_model        text,
  add column if not exists route_coords      jsonb,
  add column if not exists avg_speed_mps     numeric,
  add column if not exists max_speed_mps     numeric,
  add column if not exists calories_kcal     int,
  add column if not exists notes             text,
  add column if not exists is_public         boolean not null default false,
  add column if not exists likes_count       int not null default 0,
  add column if not exists comments_count    int not null default 0;

create index if not exists rides_public_idx on public.rides (is_public, started_at desc) where is_public = true;

-- Likes et commentaires sur un ride public
create table if not exists public.ride_likes (
  ride_id    uuid not null references public.rides(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (ride_id, user_id)
);

create table if not exists public.ride_comments (
  id          uuid primary key default gen_random_uuid(),
  ride_id     uuid not null references public.rides(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists ride_comments_ride_idx on public.ride_comments(ride_id, created_at desc);

-- Triggers pour maintenir les compteurs
create or replace function public.update_ride_likes_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.rides set likes_count = likes_count + 1 where id = new.ride_id;
  elsif TG_OP = 'DELETE' then
    update public.rides set likes_count = greatest(0, likes_count - 1) where id = old.ride_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_ride_likes_count on public.ride_likes;
create trigger trg_ride_likes_count
  after insert or delete on public.ride_likes
  for each row execute function public.update_ride_likes_count();

create or replace function public.update_ride_comments_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.rides set comments_count = comments_count + 1 where id = new.ride_id;
  elsif TG_OP = 'DELETE' then
    update public.rides set comments_count = greatest(0, comments_count - 1) where id = old.ride_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_ride_comments_count on public.ride_comments;
create trigger trg_ride_comments_count
  after insert or delete on public.ride_comments
  for each row execute function public.update_ride_comments_count();

-- RLS rides étendue : les rides publics sont lisibles par tous
drop policy if exists "rides_select_self_or_public" on public.rides;
create policy "rides_select_self_or_friends" on public.rides
  for select to authenticated
  using (auth.uid() = user_id or is_public = true);

alter table public.ride_likes enable row level security;
alter table public.ride_comments enable row level security;

drop policy if exists "ride_likes_all" on public.ride_likes;
create policy "ride_likes_all" on public.ride_likes
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ride_comments_select_public" on public.ride_comments;
create policy "ride_comments_select_public" on public.ride_comments
  for select to authenticated using (true);

drop policy if exists "ride_comments_write_self" on public.ride_comments;
create policy "ride_comments_write_self" on public.ride_comments
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Messagerie in-app
-- =====================================================================

create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  user_a          uuid not null references public.profiles(id) on delete cascade,
  user_b          uuid not null references public.profiles(id) on delete cascade,
  last_message    text,
  last_sent_at    timestamptz,
  created_at      timestamptz not null default now(),
  check (user_a < user_b)
);

create unique index if not exists conv_pair_idx on public.conversations(user_a, user_b);
create index if not exists conv_lastsent_idx on public.conversations(last_sent_at desc);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id       uuid not null references public.profiles(id) on delete cascade,
  text            text not null,
  sent_at         timestamptz not null default now(),
  read_at         timestamptz
);

create index if not exists messages_conv_idx on public.messages(conversation_id, sent_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conv_participants_only" on public.conversations;
create policy "conv_participants_only" on public.conversations
  for all to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "messages_participants_only" on public.messages;
create policy "messages_participants_only" on public.messages
  for all to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  )
  with check (
    author_id = auth.uid() and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  );

-- RPC pour creer ou recuperer une conversation entre 2 users
create or replace function public.get_or_create_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me_id uuid := auth.uid();
  v_user_a uuid;
  v_user_b uuid;
  v_conv_id uuid;
begin
  if me_id is null then raise exception 'Not authenticated'; end if;
  if p_other_user_id = me_id then raise exception 'Cannot message yourself'; end if;

  -- Forcer un ordre alphabetique pour la contrainte check
  if me_id < p_other_user_id then
    v_user_a := me_id;
    v_user_b := p_other_user_id;
  else
    v_user_a := p_other_user_id;
    v_user_b := me_id;
  end if;

  insert into public.conversations (user_a, user_b)
  values (v_user_a, v_user_b)
  on conflict (user_a, user_b) do update set user_a = excluded.user_a
  returning id into v_conv_id;

  return v_conv_id;
end;
$$;

grant execute on function public.get_or_create_conversation(uuid) to authenticated;

-- Update last_message au moment de l insert
create or replace function public.update_conv_last_message()
returns trigger language plpgsql as $$
begin
  update public.conversations set
    last_message = left(new.text, 80),
    last_sent_at = new.sent_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_msg_update_conv on public.messages;
create trigger trg_msg_update_conv
  after insert on public.messages
  for each row execute function public.update_conv_last_message();

