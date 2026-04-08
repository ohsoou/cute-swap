# Kawaii Swap Market (카와이 스왑 마켓)

오타쿠 굿즈를 중심으로 한 **교환 중심 C2C 플랫폼**입니다. 피규어, 문구류, CD 등 소중한 굿즈를 다른 사용자들과 물물교환할 수 있는 서비스를 제공합니다.

## 🚀 주요 기능

- **교환글 작성**: 본인의 굿즈 정보와 원하는 물품 태그를 포함하여 교환글을 게시할 수 있습니다.
- **태그 기반 매칭**: 원하는 굿즈 태그를 통해 쉽고 빠르게 교환 대상을 찾을 수 있습니다.
- **채팅 기반 협의**: 게시글당 최대 3개까지의 채팅 제한을 통해 효율적인 교환 협의가 가능합니다.
- **찜 및 알림**: 관심 있는 게시글을 저장하고, 실시간으로 교환 요청 알림을 받을 수 있습니다.
- **귀여운 UX/UI**: 사용자 친화적이고 감성적인 디자인을 제공합니다.

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Query, Zustand
- **Auth & UI Components**: Clerk, Radix UI, Lucide React

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime (채팅 기능)

## 📦 시작하기

### 환경 변수 설정
`.env.local` 파일을 생성하고 다음 정보를 입력하세요:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📄 라이선스
이 프로젝트는 [MIT License](LICENSE)를 따릅니다.
