# Cute Swap (큐트 스왑)

> 오타쿠 굿즈 교환 C2C 플랫폼 — 피규어, 포토카드, CD, 키링 등 소중한 굿즈를 다른 컬렉터들과 직접 교환하세요.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## 목차

- [서비스 소개](#서비스-소개)
- [주요 기능](#주요-기능)
- [서비스 화면](#서비스-화면)
- [사용 방법](#사용-방법)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [데이터베이스 구조](#데이터베이스-구조)
- [프로젝트 실행하기](#프로젝트-실행하기)
- [라이선스](#라이선스)

---

## 서비스 소개

**Cute Swap**은 오타쿠 굿즈 특화 물물교환 플랫폼입니다.

중고거래와 달리 금전 거래 없이 **굿즈 대 굿즈**로 직접 교환하는 방식으로, 가지고 있는 굿즈를 원하는 굿즈와 바꿀 수 있습니다. 태그 기반 검색과 채팅 기능으로 원하는 교환 상대를 쉽고 빠르게 찾을 수 있습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 교환글 작성 | 굿즈 사진(최대 5장), 카테고리, 상태, 설명, 원하는 교환 태그를 등록 |
| 태그 기반 검색 | 원하는 굿즈 태그로 교환 상대 빠르게 탐색 |
| 카테고리 필터 | 피규어, 문구류, CD/앨범, 키링, 포스터, 포토카드 등 카테고리별 탐색 |
| 채팅 협의 | 게시글당 최대 3개의 채팅방 제한으로 효율적인 교환 협의 |
| 찜 기능 | 관심 있는 게시글을 저장하고 모아서 확인 |
| 알림 | 채팅 요청, 찜, 교환 완료 등 실시간 알림 수신 |
| 마이페이지 | 내 게시글, 교환 통계, 프로필 관리 |
| 신고 기능 | 부적절한 게시글 및 사용자 신고 |

---

## 서비스 화면

### 랜딩 페이지 (`/about`)
로그인하지 않은 사용자에게 표시되는 소개 페이지입니다.

- **히어로 섹션**: 서비스 핵심 가치와 시작하기 버튼
- **카테고리 섹션**: 피규어, 문구류, CD/앨범, 키링/열쇠고리, 포스터/브로마이드, 포토카드 6개 카테고리
- **인기 태그 섹션**: 많이 사용되는 교환 태그 목록
- **이용 방법 섹션**: 4단계 가이드 (교환글 올리기 → 원하는 태그 등록 → 채팅으로 협의 → 교환 완료)
- **CTA 섹션**: 회원가입 유도

### 홈 피드 (`/`)
로그인한 사용자의 메인 화면입니다.

- 최신 교환글을 그리드 형태로 표시
- 각 카드에 썸네일 이미지, 카테고리 뱃지, 제목, 교환 태그, 찜/채팅 수 표시
- 채팅 마감된 게시글은 오버레이로 표시
- 무한 스크롤로 추가 게시글 로드

### 교환글 목록 (`/posts`)
검색 및 필터를 통해 게시글을 탐색하는 페이지입니다.

- **검색**: 제목 키워드로 게시글 검색
- **카테고리 필터**: 드롭다운으로 카테고리 선택
- **정렬**: 최신순 / 인기순 정렬
- 그리드 레이아웃으로 게시글 카드 표시
- 무한 스크롤 지원

### 교환글 상세 (`/posts/[id]`)
게시글의 상세 내용을 확인하는 페이지입니다.

- 이미지 캐러셀 (최대 5장)
- 제목, 카테고리, 상품 상태, 설명 표시
- 작성자 프로필 (아바타, 닉네임)
- 원하는 교환 태그 목록
- 찜하기 버튼
- 채팅 신청 버튼 (채팅 마감 시 비활성화)
- 신고하기 버튼

### 교환글 작성 (`/posts/new`) — 로그인 필요
새 교환글을 작성하는 페이지입니다.

- 이미지 업로드 (최대 5장, 드래그 앤 드롭 또는 클릭)
- 제목 입력 (최대 100자)
- 카테고리 선택 (6개 카테고리)
- 상품 상태 선택
- 상세 설명 입력 (최소 10자, 최대 2000자)
- 교환 태그 추가 (최소 1개, 최대 10개)
- Zod 기반 실시간 유효성 검사

### 채팅 목록 (`/chat`) — 로그인 필요
진행 중인 채팅방 목록 페이지입니다.

- **탭 필터**: 전체 / 진행중 / 합의완료 / 종료
- 각 채팅방에 상대방 아바타, 닉네임, 마지막 메시지, 시간 표시
- 읽지 않은 메시지 수 뱃지 표시

### 채팅방 (`/chat/[id]`) — 로그인 필요
1:1 채팅으로 교환 협의를 진행하는 페이지입니다.

- Supabase Realtime 기반 실시간 메시지
- 이미지 전송 지원
- 교환 관련 게시글 정보 표시
- 채팅 상태 변경 (진행중 → 합의완료 → 종료)

### 찜 목록 (`/favorites`) — 로그인 필요
찜한 게시글을 모아보는 페이지입니다.

- 찜한 게시글 그리드 표시
- 찜 해제 기능
- 빈 상태 안내 메시지

### 알림 (`/notifications`) — 로그인 필요
수신한 알림을 확인하는 페이지입니다.

- 알림 유형: 채팅 요청, 찜, 교환 완료
- 읽음/안읽음 상태 관리
- 전체 읽음 처리
- 알림 삭제

### 마이페이지 (`/mypage`) — 로그인 필요
내 프로필과 활동 내역을 확인하는 페이지입니다.

- 프로필 이미지, 닉네임, 자기소개 표시
- 활동 통계: 교환글 수, 활성 채팅 수, 합의 완료 수
- **탭**: 내 게시글 / 진행중 교환
- 프로필 편집 이동
- 로그아웃

### 프로필 편집 (`/mypage/edit`) — 로그인 필요
프로필 정보를 수정하는 페이지입니다.

- 프로필 이미지 변경 (Supabase Storage 업로드)
- 닉네임 변경
- 자기소개 변경

---

## 사용 방법

### 1단계: 회원가입 / 로그인
`/signup` 또는 `/login`에서 Clerk 인증으로 계정을 만들거나 로그인합니다.  
이메일, 소셜 로그인(Google 등) 지원합니다.

### 2단계: 교환글 작성
1. 하단 네비게이션의 **+** 버튼 또는 `/posts/new`로 이동
2. 굿즈 이미지를 1~5장 업로드
3. 제목, 카테고리, 상태, 설명 입력
4. **원하는 태그** 입력 — 교환받고 싶은 굿즈 키워드를 태그로 추가
5. **등록** 버튼 클릭

### 3단계: 교환 상대 탐색
1. `/posts`에서 검색 또는 카테고리 필터로 원하는 굿즈 탐색
2. 마음에 드는 게시글 클릭하여 상세 확인
3. **찜하기**로 저장하거나 **채팅 신청**으로 교환 협의 시작

### 4단계: 채팅으로 협의
1. `/chat`에서 채팅방 확인
2. 상대방과 실시간 채팅으로 교환 조건 협의
3. 합의가 되면 **합의완료** 상태로 변경

### 5단계: 교환 완료
실제 굿즈 교환 후 채팅 상태를 **종료**로 변경하여 거래를 마무리합니다.

---

## 기술 스택

### Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 16.2 | React 풀스택 프레임워크 (App Router) |
| [React](https://react.dev/) | 19 | UI 라이브러리 |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | 정적 타입 |
| [Tailwind CSS](https://tailwindcss.com/) | 4.2 | 유틸리티 기반 스타일링 |
| [Radix UI](https://www.radix-ui.com/) | - | 접근성 기반 헤드리스 컴포넌트 |
| [Lucide React](https://lucide.dev/) | 0.564 | 아이콘 |
| [React Hook Form](https://react-hook-form.com/) | 7.54 | 폼 상태 관리 |
| [Zod](https://zod.dev/) | 3.24 | 스키마 유효성 검사 |
| [date-fns](https://date-fns.org/) | 4.1 | 날짜 포맷팅 |
| [Sonner](https://sonner.emilkowal.ski/) | 1.7 | 토스트 알림 |

### Backend / 인프라

| 기술 | 용도 |
|------|------|
| [Supabase](https://supabase.com/) | PostgreSQL DB, 파일 스토리지, Realtime |
| [Clerk](https://clerk.com/) | 사용자 인증 (이메일, 소셜 로그인) |
| [Vercel](https://vercel.com/) | 배포 및 Analytics |

---

## 프로젝트 구조

```
goods-swap/
├── app/                          # Next.js App Router 페이지
│   ├── page.tsx                  # 홈 피드 (로그인 필요, 미인증 시 /about 리디렉션)
│   ├── HomeFeed.tsx              # 홈 피드 클라이언트 컴포넌트
│   ├── layout.tsx                # 루트 레이아웃 (Clerk Provider, 테마)
│   ├── about/                    # 랜딩 페이지 (비로그인 사용자)
│   ├── posts/
│   │   ├── page.tsx              # 교환글 목록 (검색, 필터)
│   │   ├── new/page.tsx          # 교환글 작성
│   │   └── [id]/
│   │       ├── page.tsx          # 교환글 상세
│   │       └── edit/             # 교환글 수정
│   ├── chat/
│   │   ├── page.tsx              # 채팅 목록
│   │   └── [id]/page.tsx         # 채팅방
│   ├── favorites/page.tsx        # 찜 목록
│   ├── notifications/page.tsx    # 알림
│   ├── mypage/
│   │   ├── page.tsx              # 마이페이지
│   │   └── edit/page.tsx         # 프로필 편집
│   ├── login/page.tsx            # 로그인
│   ├── signup/page.tsx           # 회원가입
│   ├── report/page.tsx           # 신고
│   ├── sso-callback/page.tsx     # 소셜 로그인 콜백
│   └── api/
│       └── webhooks/             # Clerk 웹훅 (프로필 자동 생성)
│
├── components/                   # 공유 컴포넌트
│   ├── header.tsx                # 공통 헤더 (로고, 알림, 메뉴)
│   ├── bottom-navigation.tsx     # 하단 네비게이션 바
│   ├── footer.tsx                # 푸터
│   ├── hero-section.tsx          # 랜딩 히어로 섹션
│   ├── category-section.tsx      # 카테고리 탐색 섹션
│   ├── popular-tags-section.tsx  # 인기 태그 섹션
│   ├── how-it-works-section.tsx  # 이용 방법 섹션
│   ├── cta-section.tsx           # CTA 섹션
│   ├── theme-provider.tsx        # 다크/라이트 테마
│   └── ui/                       # shadcn/ui 기반 공통 UI 컴포넌트
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase 클라이언트 (브라우저)
│   │   ├── server.ts             # Supabase 클라이언트 (서버)
│   │   ├── middleware.ts         # Supabase 미들웨어 헬퍼
│   │   ├── types.ts              # DB 타입 정의
│   │   └── actions/              # 서버 액션 / DB 쿼리
│   │       ├── auth.ts           # 인증 관련 (프로필 조회/생성)
│   │       ├── posts.ts          # 게시글 CRUD
│   │       ├── chat.ts           # 채팅방 및 메시지
│   │       ├── favorites.ts      # 찜 토글 및 조회
│   │       ├── notifications.ts  # 알림 CRUD
│   │       ├── profile.ts        # 프로필 업데이트
│   │       └── reports.ts        # 신고 처리
│   └── utils.ts                  # 공통 유틸리티 (cn 등)
│
├── hooks/                        # 커스텀 React 훅
├── styles/                       # 글로벌 스타일
│
├── supabase/
│   ├── migrations/               # DB 마이그레이션 SQL
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_missing_columns.sql
│   │   └── 003_notification_triggers.sql
│   └── seed.sql                  # 초기 데이터
│
├── middleware.ts                 # Clerk 인증 미들웨어 (라우트 보호)
├── next.config.mjs               # Next.js 설정
└── package.json
```

---

## 데이터베이스 구조

Supabase PostgreSQL을 사용하며, 인증은 Clerk이 담당합니다.

```
profiles              — 사용자 프로필 (id = Clerk user ID)
item_posts            — 교환글 (title, category, condition, status, chat_count)
post_images           — 게시글 이미지 (Supabase Storage URL)
tags                  — 태그 목록
item_post_tags        — 게시글-태그 연결 (have / want 구분)
chat_rooms            — 채팅방 (게시글 1개당 최대 3개)
chat_messages         — 채팅 메시지 (텍스트 / 이미지)
favorites             — 찜 (user_id + post_id)
notifications         — 알림 (chat / like / trade 유형)
reports               — 신고
```

**RLS 정책**
- `SELECT`: 비로그인(anon) 포함 모든 사용자 허용 (공개 데이터)
- `INSERT / UPDATE / DELETE`: `service_role`만 허용 (서버에서만 데이터 변경)

---

## 프로젝트 실행하기

### 요구 사항

- Node.js 18 이상
- npm / yarn / pnpm / bun

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/goods-swap.git
cd goods-swap
```

### 2. 의존성 설치

```bash
npm install
# 또는
bun install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다.

```env
# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk 리디렉션 URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase — https://app.supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Clerk 설정 방법
1. [Clerk 대시보드](https://dashboard.clerk.com)에서 새 애플리케이션 생성
2. **API Keys** 탭에서 `Publishable Key`, `Secret Key` 복사
3. **Webhooks** 탭에서 엔드포인트 추가: `https://your-domain/api/webhooks/clerk`
   - 이벤트: `user.created`, `user.updated` 선택
   - Webhook Secret을 환경 변수에 추가: `CLERK_WEBHOOK_SECRET=whsec_...`

#### Supabase 설정 방법
1. [Supabase 대시보드](https://app.supabase.com)에서 새 프로젝트 생성
2. **Project Settings → API**에서 URL, anon key, service_role key 복사
3. **SQL Editor**에서 마이그레이션 파일 순서대로 실행:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_add_missing_columns.sql
   supabase/migrations/003_notification_triggers.sql
   ```
4. (선택) 초기 데이터 삽입: `supabase/seed.sql`
5. **Storage**에서 버킷 생성:
   - `post-images` (공개)
   - `avatars` (공개)

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 5. 빌드 및 프로덕션 실행

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 코드 검사 |

---

## 라이선스

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.