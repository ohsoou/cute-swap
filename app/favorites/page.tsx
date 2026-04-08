"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Heart, MessageCircle } from "lucide-react";
import { getFavorites, toggleFavorite } from "@/lib/supabase/actions/favorites";

type FavoriteItem = Awaited<ReturnType<typeof getFavorites>>[0];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const data = await getFavorites();
      setFavorites(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const removeFavorite = (postId: number) => {
    startTransition(async () => {
      await toggleFavorite(postId);
      setFavorites((prev) => prev.filter((f) => f.post_id !== postId));
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/mypage">
            <Button variant="ghost" size="icon" className="text-[#5D4037]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#5D4037]">{"찜 목록"}</h1>
          {!isLoading && (
            <span className="text-sm text-[#8D6E63]">{`(${favorites.length})`}</span>
          )}
        </div>
      </header>

      {/* Favorites List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex h-28 animate-pulse rounded-xl border border-[#F5DCC8] bg-white" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <Card key={fav.id} className="overflow-hidden border-[#F5DCC8] bg-white">
                <CardContent className="p-0">
                  <div className="flex">
                    <Link href={`/posts/${fav.post_id}`} className="shrink-0">
                      <div className="relative h-28 w-28">
                        {fav.post.image ? (
                          <Image src={fav.post.image} alt={fav.post.title ?? ""} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-[#F5DCC8]" />
                        )}
                        {(fav.post.chat_count ?? 0) >= (fav.post.max_chat ?? 3) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="rounded-full bg-[#FFB7C5] px-2 py-0.5 text-xs text-white">
                              {"마감"}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Badge className="bg-[#E8A87C] text-xs text-white">
                            {fav.post.category}
                          </Badge>
                        </div>
                        <Link href={`/posts/${fav.post_id}`}>
                          <h3 className="line-clamp-2 font-medium text-[#5D4037]">
                            {fav.post.title}
                          </h3>
                        </Link>
                        <p className="mt-1 text-xs text-[#8D6E63]">{fav.post.author_nickname}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-[#8D6E63]">
                          <MessageCircle className="h-3 w-3" />
                          <span>{`${fav.post.chat_count}/${fav.post.max_chat}`}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFavorite(fav.post_id)}
                          className="h-8 w-8 text-red-400 hover:text-red-500"
                        >
                          <Heart className="h-5 w-5" fill="currentColor" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0E5]">
              <Heart className="h-10 w-10 text-[#E8A87C]" />
            </div>
            <h2 className="mb-2 text-lg font-medium text-[#5D4037]">{"찜한 교환글이 없어요"}</h2>
            <p className="text-center text-sm text-[#8D6E63]">{"마음에 드는 교환글을 찜해보세요!"}</p>
            <Link href="/posts" className="mt-4">
              <Button className="bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white">
                {"교환글 둘러보기"}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
