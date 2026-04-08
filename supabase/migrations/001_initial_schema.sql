-- ============================================================
-- Kawaii Swap Market – Initial Schema
-- Auth: Clerk (not Supabase Auth)
-- RLS  : SELECT → anon (public)
--        INSERT/UPDATE/DELETE → service_role only (bypasses RLS)
-- ============================================================

-- ────────────────────────────
-- profiles
-- id = Clerk user ID (user_xxx)
-- ────────────────────────────
create table if not exists profiles (
  id          text        primary key,
  email       text,
  nickname    text        not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_public"
  on profiles for select
  using (true);

-- ────────────────────────────
-- tags
-- ────────────────────────────
create table if not exists tags (
  id   bigint generated always as identity primary key,
  name text not null unique
);

alter table tags enable row level security;

create policy "tags_select_public"
  on tags for select
  using (true);

-- ────────────────────────────
-- item_posts
-- ────────────────────────────
create table if not exists item_posts (
  id          bigint generated always as identity primary key,
  author_id   text        not null references profiles (id),
  title       text        not null,
  description text        not null,
  category    text        not null,
  condition   text        not null,
  status      text        not null default 'posting'
                check (status in ('posting', 'chat_closed', 'in_progress', 'completed')),
  chat_count  int         not null default 0,
  max_chat    int         not null default 3,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table item_posts enable row level security;

create policy "item_posts_select_public"
  on item_posts for select
  using (true);

-- ────────────────────────────
-- item_post_tags
-- ────────────────────────────
create table if not exists item_post_tags (
  post_id  bigint not null references item_posts (id) on delete cascade,
  tag_id   bigint not null references tags (id),
  tag_type text   not null check (tag_type in ('have', 'want')),
  primary key (post_id, tag_id, tag_type)
);

alter table item_post_tags enable row level security;

create policy "item_post_tags_select_public"
  on item_post_tags for select
  using (true);

-- ────────────────────────────
-- post_images
-- ────────────────────────────
create table if not exists post_images (
  id            bigint generated always as identity primary key,
  post_id       bigint not null references item_posts (id) on delete cascade,
  url           text   not null,
  display_order int    not null default 0
);

alter table post_images enable row level security;

create policy "post_images_select_public"
  on post_images for select
  using (true);

-- ────────────────────────────
-- chat_rooms
-- ────────────────────────────
create table if not exists chat_rooms (
  id           bigint generated always as identity primary key,
  post_id      bigint not null references item_posts (id),
  requester_id text   not null references profiles (id),
  owner_id     text   not null references profiles (id),
  status       text   not null default 'active'
                 check (status in ('active', 'agreed', 'ended')),
  created_at   timestamptz not null default now()
);

alter table chat_rooms enable row level security;

create policy "chat_rooms_select_public"
  on chat_rooms for select
  using (true);

-- ────────────────────────────
-- chat_messages
-- ────────────────────────────
create table if not exists chat_messages (
  id         bigint generated always as identity primary key,
  room_id    bigint not null references chat_rooms (id) on delete cascade,
  sender_id  text   not null references profiles (id),
  content    text   not null,
  type       text   not null default 'text'
               check (type in ('text', 'image', 'system')),
  created_at timestamptz not null default now()
);

alter table chat_messages enable row level security;

create policy "chat_messages_select_public"
  on chat_messages for select
  using (true);

-- ────────────────────────────
-- favorites
-- ────────────────────────────
create table if not exists favorites (
  id         bigint generated always as identity primary key,
  user_id    text   not null references profiles (id),
  post_id    bigint not null references item_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

alter table favorites enable row level security;

create policy "favorites_select_public"
  on favorites for select
  using (true);

-- ────────────────────────────
-- notifications
-- ────────────────────────────
create table if not exists notifications (
  id         bigint generated always as identity primary key,
  user_id    text    not null references profiles (id),
  type       text    not null check (type in ('chat', 'like', 'trade', 'system')),
  title      text    not null,
  message    text    not null,
  is_read    boolean not null default false,
  link       text,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "notifications_select_public"
  on notifications for select
  using (true);

-- ────────────────────────────
-- reports
-- ────────────────────────────
create table if not exists reports (
  id          bigint generated always as identity primary key,
  reporter_id text not null references profiles (id),
  target_type text not null check (target_type in ('post', 'user', 'chat')),
  target_id   text not null,
  reason      text not null,
  detail      text,
  created_at  timestamptz not null default now()
);

alter table reports enable row level security;

create policy "reports_select_public"
  on reports for select
  using (true);

-- ────────────────────────────
-- Helper functions
-- ────────────────────────────

-- create_chat_room: atomically opens a chat room and increments chat_count
create or replace function create_chat_room(p_post_id bigint, p_requester_id text)
returns bigint
language plpgsql
security definer
as $$
declare
  v_owner_id text;
  v_room_id  bigint;
begin
  select author_id into v_owner_id from item_posts where id = p_post_id;

  insert into chat_rooms (post_id, requester_id, owner_id)
  values (p_post_id, p_requester_id, v_owner_id)
  returning id into v_room_id;

  update item_posts set chat_count = chat_count + 1 where id = p_post_id;

  return v_room_id;
end;
$$;

-- decrement_chat_count: called when a chat room ends
create or replace function decrement_chat_count(p_post_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  update item_posts
  set chat_count = greatest(0, chat_count - 1)
  where id = p_post_id;
end;
$$;

-- ────────────────────────────
-- Storage bucket: post-images
-- ────────────────────────────
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Public read for post images
create policy "post_images_bucket_select_public"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- Service role handles uploads (no anon write policy needed)
