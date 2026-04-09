"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/posts", icon: Search, label: "목록" },
  { href: "/posts/new", icon: PlusCircle, label: "작성", isMain: true },
  { href: "/chat", icon: MessageCircle, label: "채팅" },
  { href: "/mypage", icon: User, label: "마이" },
];

interface BottomNavigationProps {
  userId: string | null;
}

export function BottomNavigation({ userId }: BottomNavigationProps) {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  // Hide on chat room pages
  if (pathname.match(/^\/chat\/\d+$/)) {
    return null;
  }

  // Hide on edit pages (they have their own sticky action bar)
  if (pathname === "/mypage/edit" || pathname.match(/^\/posts\/\d+\/edit$/)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#F5DCC8] bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            // If user is not logged in, /posts/new will be handled by middleware redirect
            return (
              <Link
                key={item.href}
                href={userId ? item.href : "/login"}
                className="flex flex-col items-center py-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white shadow-lg transition-transform hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
                isActive ? "text-[#E8A87C]" : "text-[#8D6E63]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
