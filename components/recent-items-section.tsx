import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Heart, ArrowRight } from "lucide-react"
import { getPosts } from "@/lib/supabase/actions/posts"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  posting:     { label: "채팅가능", className: "bg-[#E8A87C] text-white" },
  chat_closed: { label: "채팅마감", className: "bg-[#8D6E63] text-white" },
  in_progress: { label: "진행중",   className: "bg-blue-400 text-white" },
  completed:   { label: "교환완료", className: "bg-gray-400 text-white" },
}

const PLACEHOLDER_GRADIENTS = [
  "from-[#E8A87C] to-[#FFB7C5]",
  "from-[#FFB7C5] to-[#F5DCC8]",
  "from-[#F5DCC8] to-[#E8A87C]",
  "from-[#FFB7C5] to-[#E8A87C]",
  "from-[#E8A87C] to-[#F5DCC8]",
  "from-[#F5DCC8] to-[#FFB7C5]",
]

export async function RecentItemsSection() {
  const posts = await getPosts({ sortBy: "latest" })
  const recent = posts.slice(0, 6)

  return (
    <section className="bg-[#FFF8F0] py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-[#5D4037]">최신 교환글</h2>
            <p className="text-[#8D6E63]">방금 올라온 따끈따끈한 교환글을 확인해보세요</p>
          </div>
          <Link href="/posts">
            <Button variant="ghost" className="text-[#E8A87C] hover:bg-[#E8A87C]/10">
              전체보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#F5DCC8] py-20 text-center">
            <span className="mb-3 text-5xl">🎁</span>
            <p className="font-medium text-[#5D4037]">아직 교환글이 없어요</p>
            <p className="mt-1 text-sm text-[#8D6E63]">첫 번째 교환글을 올려보세요!</p>
            <Link href="/posts/new" className="mt-4">
              <Button size="sm" className="rounded-full bg-[#E8A87C] text-white hover:bg-[#D4976B]">
                교환글 작성하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((post, idx) => {
              const firstImage = post.post_images[0]?.url
              const statusInfo = STATUS_LABEL[post.status] ?? STATUS_LABEL.posting
              const gradient = PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length]

              return (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="group overflow-hidden border-none bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                    {/* Image */}
                    <div className={`relative h-48 bg-gradient-to-br ${gradient}`}>
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl opacity-50">🎁</span>
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                      </div>

                      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#FFB7C5]">
                        <Heart className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline" className="border-[#E8A87C] text-[#E8A87C]">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-[#8D6E63]">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.chat_count}/{post.max_chat}</span>
                        </div>
                      </div>

                      <h3 className="mb-1 line-clamp-1 font-semibold text-[#5D4037] transition-colors group-hover:text-[#E8A87C]">
                        {post.title}
                      </h3>
                      <p className="mb-3 line-clamp-1 text-sm text-[#8D6E63]">{post.description}</p>

                      {post.want_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs text-[#8D6E63]">원하는 굿즈:</span>
                          {post.want_tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-[#FFB7C5]/20 text-[#5D4037] text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
