import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { getPopularTags } from "@/lib/supabase/actions/posts"

export async function PopularTagsSection() {
  const tags = await getPopularTags(12)

  // Top 3 by count are "hot"
  const hotThreshold = tags[2]?.count ?? 0

  return (
    <section id="tags" className="relative overflow-hidden bg-[#FFB7C5]/10 py-16">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-[#FFB7C5]/20 blur-2xl" />
        <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-[#E8A87C]/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#E8A87C]" />
            <h2 className="text-3xl font-bold text-[#5D4037]">인기 태그</h2>
          </div>
          <p className="text-[#8D6E63]">지금 가장 핫한 교환 태그들을 확인해보세요!</p>
        </div>

        {tags.length === 0 ? (
          <p className="text-center text-sm text-[#8D6E63]">아직 등록된 태그가 없어요.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {tags.map((tag) => {
              const isHot = tag.count >= hotThreshold && hotThreshold > 0
              return (
                <Link key={tag.name} href={`/posts?tag=${encodeURIComponent(tag.name)}`}>
                  <Badge
                    variant="secondary"
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isHot
                        ? "bg-gradient-to-r from-[#FFB7C5] to-[#E8A87C] text-white hover:from-[#E8A87C] hover:to-[#FFB7C5]"
                        : "bg-white text-[#5D4037] hover:bg-[#FFB7C5]/20"
                    }`}
                  >
                    #{tag.name}
                    {isHot && <span className="ml-1">🔥</span>}
                  </Badge>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
