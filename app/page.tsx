import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Header } from "@/components/header"
import HomeFeed from "./HomeFeed"
import { Skeleton } from "@/components/ui/skeleton"

function HomeFeedSkeleton() {
  return (
    <div className="p-4 pb-24">
      <div className="grid grid-cols-2 gap-4 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-[#F5DCC8] bg-white">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function Home() {
  const { userId } = await auth()
  if (!userId) redirect("/about")

  return (
    <main className="min-h-screen pb-20">
      <Header />
      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeed />
      </Suspense>
    </main>
  )
}
