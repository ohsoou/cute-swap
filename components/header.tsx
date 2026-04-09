"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Bell, User, Menu, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import { getUnreadCount } from "@/lib/supabase/actions/notifications"

const CATEGORY_LINKS = [
  { label: "피규어", value: "figure" },
  { label: "문구류", value: "stationery" },
  { label: "CD/앨범", value: "cd" },
  { label: "기타굿즈", value: "etc" },
]

export function Header() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch initial unread count + subscribe to realtime
  useEffect(() => {
    if (!isLoaded || !user) {
      setUnreadCount(0)
      return
    }

    getUnreadCount().then(setUnreadCount)

    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => setUnreadCount((prev) => prev + 1)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isLoaded, user])

  // Reset badge when visiting /notifications
  useEffect(() => {
    if (pathname === '/notifications') {
      setUnreadCount(0)
    }
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/posts?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#F5DCC8] shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB7C5]">
              <span className="text-xl">🎀</span>
            </div>
            <span className="hidden text-xl font-bold text-[#5D4037] sm:block">
              {"Cute Swap"}
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.value}
                href={`/posts?category=${c.value}`}
                className="text-sm font-medium text-[#5D4037] transition-colors hover:text-[#E8A87C]"
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D6E63]" />
              <Input
                type="search"
                placeholder="교환하고 싶은 굿즈를 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-none bg-white pl-10 text-sm placeholder:text-[#8D6E63]"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isLoaded && user && (
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full text-[#5D4037] hover:bg-[#FFB7C5]/20"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFB7C5] px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  <span className="sr-only">{"알림"}</span>
                </Button>
              </Link>
            )}

            {isLoaded && user ? (
              <Link href="/mypage">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-[#E8A87C]/40 hover:ring-[#E8A87C]">
                  <AvatarImage src={user.imageUrl} alt={user.fullName ?? "프로필"} />
                  <AvatarFallback className="bg-[#FFB7C5] text-[#5D4037] text-xs">
                    {(user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : isLoaded ? (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-full text-[#5D4037] hover:bg-[#FFB7C5]/20"
                >
                  <LogIn className="h-4 w-4" />
                  {"로그인"}
                </Button>
              </Link>
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#F5DCC8] animate-pulse" />
            )}

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-[#5D4037] hover:bg-[#FFB7C5]/20 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{"메뉴"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-[#E8A87C]/30 py-4 md:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D6E63]" />
                <Input
                  type="search"
                  placeholder="교환하고 싶은 굿즈를 검색해보세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border-none bg-white pl-10 text-sm placeholder:text-[#8D6E63]"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              {CATEGORY_LINKS.map((c) => (
                <Link
                  key={c.value}
                  href={`/posts?category=${c.value}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#5D4037] hover:bg-[#FFB7C5]/20"
                >
                  {c.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
