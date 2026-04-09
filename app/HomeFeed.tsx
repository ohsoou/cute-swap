"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle } from "lucide-react";
import { getPosts, type PostWithDetails } from "@/lib/supabase/actions/posts";

const LIMIT = 12;

function PostCard({ post }: { post: PostWithDetails }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="overflow-hidden border-[#F5DCC8] bg-white transition-shadow hover:shadow-lg">
        <div className="flex">
          {/* 이미지 */}
          <div className="relative h-28 w-28 shrink-0">
            {post.post_images[0] ? (
              <Image
                src={post.post_images[0].url}
                alt={post.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#F5DCC8]" />
            )}
            {post.chat_count >= post.max_chat && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-full bg-[#FFB7C5] px-2 py-0.5 text-[10px] font-medium text-white">
                  {"채팅마감"}
                </span>
              </div>
            )}
          </div>

          {/* 콘텐츠 */}
          <CardContent className="flex flex-1 flex-col justify-between p-3">
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <Badge className="bg-[#E8A87C] px-1.5 py-0 text-[10px] text-white">
                  {post.category}
                </Badge>
              </div>
              <h3 className="mb-2 line-clamp-2 text-sm font-medium text-[#5D4037]">
                {post.title}
              </h3>
              <div className="flex flex-wrap gap-1">
                {post.want_tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-[#FFB7C5] bg-[#FFF0E5] px-1.5 py-0 text-[10px] text-[#E8A87C]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#8D6E63]">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{`${post.chat_count}/${post.max_chat}`}</span>
              </div>
              <span>{post.profiles?.nickname ?? ""}</span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#F5DCC8] bg-white">
      <div className="flex">
        <Skeleton className="h-28 w-28 shrink-0 rounded-none" />
        <div className="flex flex-1 flex-col justify-between p-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function HomeFeed() {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreFnRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    offsetRef.current = 0;

    getPosts({ sortBy: "latest", limit: LIMIT, offset: 0 }).then((data) => {
      if (cancelled) return;
      setPosts(data);
      setHasMore(data.length === LIMIT);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const newOffset = offsetRef.current + LIMIT;
    const data = await getPosts({ sortBy: "latest", limit: LIMIT, offset: newOffset });
    offsetRef.current = newOffset;
    setPosts((prev) => [...prev, ...data]);
    setHasMore(data.length === LIMIT);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    loadMoreFnRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreFnRef.current();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-4 pb-24">
      <h2 className="mb-4 text-base font-bold text-[#5D4037]">{"최신 교환글"}</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-[#8D6E63]">
          <Heart className="mb-3 h-12 w-12 text-[#F5DCC8]" />
          <p className="font-medium">{"아직 교환글이 없습니다."}</p>
          <p className="mt-1 text-sm text-[#BCAAA4]">{"첫 번째 교환글을 올려보세요!"}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {isLoadingMore && (
            <div className="mt-4 grid grid-cols-1 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          )}
        </>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
