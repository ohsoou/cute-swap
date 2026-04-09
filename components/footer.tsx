import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#5D4037] text-white">
      {/* Wave divider */}
      <div className="bg-[#FFF8F0]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 55C840 50 960 40 1080 35C1200 30 1320 30 1380 30L1440 30V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" 
            fill="#5D4037"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB7C5]">
                <span className="text-xl">🎀</span>
              </div>
              <span className="text-xl font-bold">Cute Swap</span>
            </Link>
            <p className="text-sm text-white/70">
              오타쿠를 위한 귀여운 굿즈 교환 플랫폼. 
              소중한 굿즈에게 새로운 주인을 찾아주세요!
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-semibold">서비스</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/posts/new" className="hover:text-[#FFB7C5] transition-colors">교환글 올리기</Link></li>
              <li><Link href="/posts" className="hover:text-[#FFB7C5] transition-colors">교환글 둘러보기</Link></li>
              {/* <li><Link href="#tags" className="hover:text-[#FFB7C5] transition-colors">인기 태그</Link></li> */}
              {/* <li><Link href="#categories" className="hover:text-[#FFB7C5] transition-colors">카테고리</Link></li> */}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">고객지원</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {/* <li><Link href="#" className="hover:text-[#FFB7C5] transition-colors">자주 묻는 질문</Link></li> */}
              {/* <li><Link href="#" className="hover:text-[#FFB7C5] transition-colors">공지사항</Link></li> */}
              {/* <li><Link href="#" className="hover:text-[#FFB7C5] transition-colors">1:1 문의</Link></li> */}
              {/* <li><Link href="/report" className="hover:text-[#FFB7C5] transition-colors">신고하기</Link></li> */}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">회사</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {/* <li><Link href="#" className="hover:text-[#FFB7C5] transition-colors">서비스 소개</Link></li> */}
              {/* <li><Link href="#" className="hover:text-[#FFB7C5] transition-colors">이용약관</Link></li> */}
              {/* <li><Link href="#" className="hover:text-[#FFB7C5] transition-colors">개인정보처리방침</Link></li> */}
              {/* <li><Link href="#" className="hover:text-[#FFB7C5] transition-colors">운영정책</Link></li> */}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/50">
          <p>© 2026 Cute Swap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
