-- ============================================================
-- 002_add_missing_columns.sql
-- Adds missing columns, indexes, storage buckets,
-- fixes create_chat_room RPC to enforce chat limit,
-- and adds chat_messages.is_read for unread count.
-- ============================================================

-- ────────────────────────────
-- profiles: add interest_tags
-- ────────────────────────────
alter table profiles
  add column if not exists interest_tags text[] not null default '{}';

-- ────────────────────────────
-- chat_messages: add is_read
-- ────────────────────────────
alter table chat_messages
  add column if not exists is_read boolean not null default false;

-- ────────────────────────────
-- Indexes for common query paths
-- ────────────────────────────
create index if not exists idx_item_posts_author_id
  on item_posts (author_id);

create index if not exists idx_item_posts_status
  on item_posts (status);

create index if not exists idx_item_posts_created_at
  on item_posts (created_at desc);

create index if not exists idx_item_post_tags_tag_id
  on item_post_tags (tag_id);

create index if not exists idx_post_images_post_id
  on post_images (post_id);

create index if not exists idx_chat_rooms_post_id
  on chat_rooms (post_id);

create index if not exists idx_chat_rooms_requester_id
  on chat_rooms (requester_id);

create index if not exists idx_chat_rooms_owner_id
  on chat_rooms (owner_id);

create index if not exists idx_chat_messages_room_id
  on chat_messages (room_id);

create index if not exists idx_chat_messages_room_created
  on chat_messages (room_id, created_at asc);

create index if not exists idx_favorites_user_id
  on favorites (user_id);

create index if not exists idx_notifications_user_id
  on notifications (user_id);

create index if not exists idx_notifications_user_unread
  on notifications (user_id, is_read)
  where is_read = false;

-- ────────────────────────────
-- Fix create_chat_room: enforce chat limit atomically
-- ────────────────────────────
create or replace function create_chat_room(p_post_id bigint, p_requester_id text)
returns bigint
language plpgsql
security definer
as $$
declare
  v_owner_id  text;
  v_chat_count int;
  v_max_chat   int;
  v_room_id   bigint;
begin
  -- Lock the post row to prevent concurrent chat room creation race
  select author_id, chat_count, max_chat
    into v_owner_id, v_chat_count, v_max_chat
    from item_posts
   where id = p_post_id
     for update;

  if not found then
    raise exception 'post_not_found';
  end if;

  if v_chat_count >= v_max_chat then
    raise exception 'chat_limit_reached';
  end if;

  insert into chat_rooms (post_id, requester_id, owner_id)
  values (p_post_id, p_requester_id, v_owner_id)
  returning id into v_room_id;

  update item_posts
     set chat_count = chat_count + 1,
         status = case when chat_count + 1 >= max_chat then 'chat_closed' else status end
   where id = p_post_id;

  return v_room_id;
end;
$$;

-- ────────────────────────────
-- Storage bucket: avatars (profile images)
-- ────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_bucket_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- ────────────────────────────
-- Storage bucket: chat-images
-- ────────────────────────────
insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

create policy "chat_images_bucket_select_public"
  on storage.objects for select
  using (bucket_id = 'chat-images');

-- ────────────────────────────
-- Supabase Realtime publications
-- Enable Realtime for chat_messages and notifications
-- so clients can subscribe to INSERT events.
-- ────────────────────────────
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table notifications;
