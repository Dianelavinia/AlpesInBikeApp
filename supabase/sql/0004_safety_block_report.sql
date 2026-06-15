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
