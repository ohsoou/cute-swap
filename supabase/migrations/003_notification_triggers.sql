-- ============================================================
-- 003_notification_triggers.sql
-- Triggers to auto-create notifications on chat events:
--   1. New chat request  → notify post owner
--   2. Trade agreed      → notify both requester and owner
-- ============================================================

-- ────────────────────────────
-- Trigger function: new chat request
-- ────────────────────────────
create or replace function notify_chat_request()
returns trigger
language plpgsql
security definer
as $$
declare
  v_post_title         text;
  v_requester_nickname text;
begin
  select title    into v_post_title         from item_posts where id = NEW.post_id;
  select nickname into v_requester_nickname from profiles   where id = NEW.requester_id;

  insert into notifications (user_id, type, title, message, link)
  values (
    NEW.owner_id,
    'chat',
    '새로운 교환 신청',
    coalesce(v_requester_nickname, '누군가') || '님이 "'
      || coalesce(v_post_title, '게시글') || '" 교환을 신청했습니다.',
    '/chat/' || NEW.id
  );

  return NEW;
end;
$$;

create trigger chat_room_created_notify
  after insert on chat_rooms
  for each row
  execute function notify_chat_request();

-- ────────────────────────────
-- Trigger function: trade agreed
-- ────────────────────────────
create or replace function notify_trade_agreed()
returns trigger
language plpgsql
security definer
as $$
declare
  v_post_title text;
begin
  if NEW.status = 'agreed' and OLD.status <> 'agreed' then
    select title into v_post_title from item_posts where id = NEW.post_id;

    -- Notify requester
    insert into notifications (user_id, type, title, message, link)
    values (
      NEW.requester_id,
      'trade',
      '교환이 성사되었습니다!',
      '"' || coalesce(v_post_title, '게시글') || '" 교환이 성사되었습니다. 채팅방에서 확인해보세요.',
      '/chat/' || NEW.id
    );

    -- Notify owner
    insert into notifications (user_id, type, title, message, link)
    values (
      NEW.owner_id,
      'trade',
      '교환이 성사되었습니다!',
      '"' || coalesce(v_post_title, '게시글') || '" 교환이 성사되었습니다. 채팅방에서 확인해보세요.',
      '/chat/' || NEW.id
    );
  end if;

  return NEW;
end;
$$;

create trigger chat_room_agreed_notify
  after update on chat_rooms
  for each row
  execute function notify_trade_agreed();
