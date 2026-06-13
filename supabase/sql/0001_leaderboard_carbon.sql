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
