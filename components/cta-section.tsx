import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#FFB7C5] to-[#E8A87C] py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Floating emojis */}
      <div className="absolute inset-0 overflow-hidden">
        <span className="absolute top-10 left-[10%] animate-bounce text-4xl opacity-30" style={{ animationDuration: '3s' }}>🎀</span>
        <span className="absolute top-20 right-[15%] animate-bounce text-3xl opacity-30" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>💝</span>
        <span className="absolute bottom-16 left-[20%] animate-bounce text-3xl opacity-30" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>✨</span>
        <span className="absolute bottom-10 right-[25%] animate-bounce text-4xl opacity-30" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>🎁</span>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">지금 바로 시작하세요</span>
        </div>

        <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          내 굿즈에게 새 주인을 찾아주세요
        </h2>
        
        <p className="mb-8 text-lg text-white/90 max-w-2xl mx-auto">
          서랍 속에 잠들어 있는 굿즈를 깨워주세요. 
          당신의 소중한 굿즈가 새로운 주인을 만날 수 있도록!
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button 
            size="lg" 
            className="rounded-full bg-white text-[#E8A87C] hover:bg-white/90 shadow-lg"
          >
            무료로 시작하기
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full border-white bg-transparent text-white hover:bg-white/10"
          >
            더 알아보기
          </Button>
        </div>
      </div>
    </section>
  )
}
