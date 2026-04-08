import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { PopularTagsSection } from "@/components/popular-tags-section"
import { RecentItemsSection } from "@/components/recent-items-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen pb-20">
      <Header />
      <HeroSection />
      <CategorySection />
      <PopularTagsSection />
      <RecentItemsSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  )
}
