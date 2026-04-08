import Link from "next/link"

const categories = [
  { icon: "🎎", name: "피규어", count: 1234 },
  { icon: "✏️", name: "문구류", count: 856 },
  { icon: "💿", name: "CD/앨범", count: 2341 },
  { icon: "🎀", name: "키링/열쇠고리", count: 1567 },
  { icon: "🖼️", name: "포스터/브로마이드", count: 923 },
  { icon: "💝", name: "포토카드", count: 3421 },
]

export function CategorySection() {
  return (
    <section id="categories" className="bg-[#FFF8F0] py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#5D4037]">
            카테고리별 탐색
          </h2>
          <p className="text-[#8D6E63]">원하는 굿즈 카테고리를 선택해보세요</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/posts?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB7C5]/30 to-[#E8A87C]/30 text-3xl transition-transform group-hover:scale-110">
                {category.icon}
              </div>
              <span className="font-medium text-[#5D4037]">{category.name}</span>
              <span className="mt-1 text-sm text-[#8D6E63]">{category.count.toLocaleString()}개</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
