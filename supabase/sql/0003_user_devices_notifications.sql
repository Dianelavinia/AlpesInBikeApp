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
