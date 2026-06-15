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
