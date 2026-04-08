import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5DCC8] to-[#FFF8F0]">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#FFB7C5]/30 blur-3xl" />
        <div className="absolute top-20 -left-10 h-32 w-32 rounded-full bg-[#E8A87C]/20 blur-2xl" />
        <div className="absolute bottom-10 right-1/4 h-24 w-24 rounded-full bg-[#FFB7C5]/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFB7C5]/30 px-4 py-2">
              <Sparkles className="h-4 w-4 text-[#E8A87C]" />
              <span className="text-sm font-medium text-[#5D4037]">오타쿠를 위한 굿즈 교환 플랫폼</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight text-[#5D4037] sm:text-5xl lg:text-6xl">
              <span className="block">내 굿즈와</span>
              <span className="block text-[#E8A87C]">새로운 인연을</span>
              <span className="block">만나보세요</span>
            </h1>
            
            <p className="mb-8 text-lg text-[#8D6E63] max-w-md mx-auto lg:mx-0">
              피규어, 문구류, CD 등 소중한 굿즈를 원하는 굿즈와 교환해요. 
              채팅으로 쉽고 빠르게 거래를 시작하세요!
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/posts/new">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto rounded-full bg-[#E8A87C] text-white hover:bg-[#D4976B] shadow-lg shadow-[#E8A87C]/30"
                >
                  교환글 올리기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/posts">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto rounded-full border-[#E8A87C] text-[#E8A87C] hover:bg-[#E8A87C]/10"
                >
                  둘러보기
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image Area */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main showcase */}
              <div className="relative h-80 w-80 sm:h-96 sm:w-96">
                {/* Floating cards */}
                <div className="absolute left-0 top-8 h-36 w-28 animate-bounce rounded-2xl bg-white p-3 shadow-lg" style={{ animationDuration: '3s' }}>
                  <div className="h-20 w-full rounded-xl bg-gradient-to-br from-[#FFB7C5] to-[#E8A87C]" />
                  <p className="mt-2 text-xs font-medium text-[#5D4037] truncate">피규어</p>
                  <p className="text-xs text-[#8D6E63]">교환가능</p>
                </div>
                
                <div className="absolute right-0 top-0 h-36 w-28 animate-bounce rounded-2xl bg-white p-3 shadow-lg" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                  <div className="h-20 w-full rounded-xl bg-gradient-to-br from-[#E8A87C] to-[#F5DCC8]" />
                  <p className="mt-2 text-xs font-medium text-[#5D4037] truncate">포토카드</p>
                  <p className="text-xs text-[#8D6E63]">교환가능</p>
                </div>
                
                <div className="absolute bottom-8 left-8 h-36 w-28 animate-bounce rounded-2xl bg-white p-3 shadow-lg" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
                  <div className="h-20 w-full rounded-xl bg-gradient-to-br from-[#F5DCC8] to-[#FFB7C5]" />
                  <p className="mt-2 text-xs font-medium text-[#5D4037] truncate">아크릴스탠드</p>
                  <p className="text-xs text-[#8D6E63]">교환가능</p>
                </div>
                
                <div className="absolute bottom-0 right-4 h-36 w-28 animate-bounce rounded-2xl bg-white p-3 shadow-lg" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>
                  <div className="h-20 w-full rounded-xl bg-gradient-to-br from-[#FFB7C5] to-[#F5DCC8]" />
                  <p className="mt-2 text-xs font-medium text-[#5D4037] truncate">CD/앨범</p>
                  <p className="text-xs text-[#8D6E63]">교환가능</p>
                </div>

                {/* Center decoration */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFB7C5]/50 shadow-lg">
                    <span className="text-4xl">💕</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="#FFF8F0"
          />
        </svg>
      </div>
    </section>
  )
}
