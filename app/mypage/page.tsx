"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Settings,
  Heart,
  MessageCircle,
  Package,
  CheckCircle,
  ChevronRight,
  LogOut,
  Info,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { getProfile, getUserPosts, getChatStats } from "@/lib/supabase/actions/profile";
import type { Profile } from "@/lib/supabase/types";

type UserPost = Awaited<ReturnType<typeof getUserPosts>>[0];

export default function MyPage() {
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myPosts, setMyPosts] = useState<UserPost[]>([]);
  const [activeChats, setActiveChats] = useState(0);
  const [agreedTrades, setAgreedTrades] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clerkUser) return;

    async function load() {
      const [profileData, postsData, chatStats] = await Promise.all([
        getProfile(clerkUser!.id),
        getUserPosts(clerkUser!.id),
        getChatStats(clerkUser!.id),
      ]);

      setProfile(profileData);
      setMyPosts(postsData);
      setActiveChats(chatStats.activeChats);
      setAgreedTrades(chatStats.agreedTrades);
      setIsLoading(false);
    }
    load();
  }, [clerkUser]);

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/' });
  };

  const completedPosts = myPosts.filter((p) => p.status === "completed");
  const activePosts = myPosts.filter((p) => p.status !== "completed");
  const displayedActivePosts = activePosts.slice(0, 5);
  const displayedCompletedPosts = completedPosts.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8A87C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-[#5D4037]">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-[#5D4037]">{"마이페이지"}</h1>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/mypage/edit">
              <Button variant="ghost" size="icon" className="text-[#5D4037]">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[#8D6E63]">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <div className="bg-gradient-to-b from-[#FFB7C5]/20 to-[#FFF8F0] p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-[#FFB7C5] text-2xl text-white">
              {(profile?.nickname ?? "?")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#5D4037]">{profile?.nickname ?? "닉네임 없음"}</h2>
            {profile?.bio && (
              <p className="mt-1 text-sm text-[#8D6E63]">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card className="border-[#F5DCC8] bg-white/80">
            <CardContent className="p-4 text-center">
              <Package className="mx-auto mb-1 h-5 w-5 text-[#E8A87C]" />
              <p className="text-lg font-bold text-[#5D4037]">{myPosts.length}</p>
              <p className="text-xs text-[#8D6E63]">{"교환글"}</p>
            </CardContent>
          </Card>
          <Card className="border-[#F5DCC8] bg-white/80">
            <CardContent className="p-4 text-center">
              <MessageCircle className="mx-auto mb-1 h-5 w-5 text-[#E8A87C]" />
              <p className="text-lg font-bold text-[#5D4037]">{activeChats}</p>
              <p className="text-xs text-[#8D6E63]">{"진행중 채팅"}</p>
            </CardContent>
          </Card>
          <Card className="border-[#F5DCC8] bg-white/80">
            <CardContent className="p-4 text-center">
              <CheckCircle className="mx-auto mb-1 h-5 w-5 text-[#E8A87C]" />
              <p className="text-lg font-bold text-[#5D4037]">{agreedTrades}</p>
              <p className="text-xs text-[#8D6E63]">{"완료 교환"}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="p-4">
        <Card className="border-[#F5DCC8] bg-white">
          <CardContent className="divide-y divide-[#F5DCC8] p-0">
            <Link href="/chat" className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-[#E8A87C]" />
                <span className="text-[#5D4037]">{"채팅 내역"}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#8D6E63]" />
            </Link>
            <Link href="/favorites" className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#E8A87C]" />
                <span className="text-[#5D4037]">{"찜 목록"}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#8D6E63]" />
            </Link>
            <Link href="/about" className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-[#E8A87C]" />
                <span className="text-[#5D4037]">{"서비스 소개"}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#8D6E63]" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs defaultValue="my-posts" className="w-full">
          <TabsList className="w-full bg-[#FFF0E5]">
            <TabsTrigger
              value="my-posts"
              className="flex-1 data-[state=active]:bg-[#E8A87C] data-[state=active]:text-white"
            >
              {"내 교환글"}
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 data-[state=active]:bg-[#E8A87C] data-[state=active]:text-white"
            >
              {"완료된 교환"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-posts" className="mt-4">
            {activePosts.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <p className="mb-3 text-sm text-[#8D6E63]">{"작성한 교환글이 없습니다."}</p>
                <Link href="/posts/new">
                  <Button size="sm" className="bg-[#E8A87C] text-white hover:bg-[#d49a6e]">
                    {"첫 교환글 작성하기"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedActivePosts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <Card className="border-[#F5DCC8] bg-white">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                          {post.image ? (
                            <Image src={post.image} alt={post.title} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full bg-[#F5DCC8]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#5D4037]">{post.title}</h3>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge className="bg-green-500 text-white">{"진행중"}</Badge>
                            <span className="text-xs text-[#8D6E63]">
                              {`채팅 ${post.chat_count}/${post.max_chat}`}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[#8D6E63]" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {activePosts.length > 5 && (
                  <Link href="/posts" className="block text-center text-sm text-[#E8A87C] py-2 hover:underline">
                    {"전체 보기 →"}
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {completedPosts.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#8D6E63]">{"완료된 교환이 없습니다."}</p>
            ) : (
              <div className="space-y-3">
                {displayedCompletedPosts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <Card className="border-[#F5DCC8] bg-white">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                          {post.image ? (
                            <Image src={post.image} alt={post.title} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full bg-[#F5DCC8]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#5D4037]">{post.title}</h3>
                          <p className="text-xs text-[#8D6E63]">{post.created_at.slice(0, 10)}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {completedPosts.length > 5 && (
                  <Link href="/posts" className="block text-center text-sm text-[#E8A87C] py-2 hover:underline">
                    {"전체 보기 →"}
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
