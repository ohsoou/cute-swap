-- ============================================================
-- Kawaii Swap Market – Seed Data
-- Run this in Supabase SQL Editor after applying migrations
-- ============================================================

-- Dummy profile (replace 'user_demo' with your actual Clerk user ID if needed)
insert into profiles (id, nickname, bio, avatar_url)
values
  ('user_demo1', '카와이짱', '귀여운 굿즈 수집가 🌸', null),
  ('user_demo2', '오타쿠킹', '피규어 전문 컬렉터', null),
  ('user_demo3', '굿즈요정', '아이돌 굿즈 교환 환영!', null)
on conflict (id) do nothing;

-- Tags
insert into tags (name)
values
  ('호시노루비'), ('아이'), ('카구야'), ('나루토'), ('세일러문'),
  ('건담'), ('에반게리온'), ('원피스'), ('리바이'), ('미쿠')
on conflict (name) do nothing;

-- Dummy posts
insert into item_posts (author_id, title, description, category, condition, status, chat_count, max_chat)
values
  ('user_demo1', '[아이돌마스터] 호시노루비 아크릴 스탠드', '새상품입니다. 미개봉 상태에요! 세일러문 굿즈랑 교환 원해요.', '피규어', '미개봉', 'posting', 1, 3),
  ('user_demo2', '귀멸의칼날 탄지로 피규어 교환합니다', '프리미엄 피규어 정품입니다. 박스 보관 상태 양호해요.', '피규어', '미사용', 'posting', 0, 3),
  ('user_demo1', '하츠네 미쿠 라이브 응원봉', '콘서트에서 구매한 공식 굿즈입니다. 원피스 굿즈 원해요!', '기타굿즈', '사용감있음', 'posting', 2, 3),
  ('user_demo3', '방탄소년단 정국 포토카드 풀셋', '방탄소년단 Proof 앨범 정국 포토카드 전종류 있어요.', 'CD/앨범', '미사용', 'posting', 0, 5),
  ('user_demo2', '에반게리온 레이 아야나미 피규어', '에반게리온 레이 아야나미 1/7 스케일 피규어. 박스 있음.', '피규어', '미사용', 'chat_closed', 3, 3),
  ('user_demo3', '원피스 로로노아 조로 아크릴 키링', '원피스 공식 굿즈 키링입니다. 거의 새것이에요.', '기타굿즈', '미사용', 'posting', 1, 3),
  ('user_demo1', '세일러문 필통 & 메모지 세트', '세일러문 문구 세트입니다. 미개봉 새상품!', '문구류', '미개봉', 'posting', 0, 3),
  ('user_demo2', '나루토 질풍전 캐릭터 노트 세트', '나루토 공식 노트 5권 세트. 사용 안 했어요.', '문구류', '미사용', 'posting', 1, 3)
returning id;

-- Link tags to posts (have/want)
-- post 1: have 호시노루비, want 세일러문
with post_ids as (
  select id, row_number() over (order by created_at) as rn
  from item_posts
  where author_id in ('user_demo1', 'user_demo2', 'user_demo3')
)
insert into item_post_tags (post_id, tag_id, tag_type)
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 1 and t.name = '호시노루비'
union all
select p.id, t.id, 'want'
from post_ids p, tags t
where p.rn = 1 and t.name = '세일러문'
union all
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 2 and t.name = '나루토'
union all
select p.id, t.id, 'want'
from post_ids p, tags t
where p.rn = 2 and t.name = '에반게리온'
union all
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 3 and t.name = '미쿠'
union all
select p.id, t.id, 'want'
from post_ids p, tags t
where p.rn = 3 and t.name = '원피스'
union all
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 4 and t.name = '아이'
union all
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 5 and t.name = '에반게리온'
union all
select p.id, t.id, 'want'
from post_ids p, tags t
where p.rn = 5 and t.name = '건담'
union all
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 6 and t.name = '원피스'
union all
select p.id, t.id, 'want'
from post_ids p, tags t
where p.rn = 6 and t.name = '나루토'
union all
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 7 and t.name = '세일러문'
union all
select p.id, t.id, 'have'
from post_ids p, tags t
where p.rn = 8 and t.name = '나루토'
on conflict do nothing;
