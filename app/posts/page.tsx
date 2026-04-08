"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MessageCircle, Heart, ChevronLeft } from "lucide-react";
import { getPosts, type PostWithDetails } from "@/lib/supabase/actions/posts";

const LIMIT = 12;

function PostCard({ post }: { post: PostWithDetails }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="overflow-hidden border-[#F5DCC8] bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-square">
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
              <span className="rounded-full bg-[#FFB7C5] px-3 py-1 text-xs font-medium text-white">
                {"채팅마감"}
              </span>
            </div>
          )}
          <Badge className="absolute left-2 top-2 bg-[#E8A87C] text-white">
            {post.category}
          </Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-[#5D4037]">
            {post.title}
          </h3>
          <div className="mb-2 flex flex-wrap gap-1">
            {post.want_tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-[#FFB7C5] bg-[#FFF0E5] text-xs text-[#E8A87C]"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-[#8D6E63]">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{`${post.chat_count}/${post.max_chat}`}</span>
            </div>
            <span>{post.profiles?.nickname ?? ""}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#F5DCC8] bg-white">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function PostsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "latest";
  const search = searchParams.get("search") ?? "";

  // Local state for search input so it updates instantly while URL is debounced
  const [inputValue, setInputValue] = useState(search);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to always hold the latest loadMore so IntersectionObserver doesn't go stale
  const loadMoreFnRef = useRef<() => void>(() => {});

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateParams({ search: value });
    }, 300);
  };

  // Fetch initial posts whenever filters change
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    offsetRef.current = 0;

    getPosts({
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      sortBy: sortBy as "latest" | "popular" | "chat",
      limit: LIMIT,
      offset: 0,
    }).then((data) => {
      if (cancelled) return;
      setPosts(data);
      setHasMore(data.length === LIMIT);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [search, category, sortBy]);

  // Load next page
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const newOffset = offsetRef.current + LIMIT;
    const data = await getPosts({
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      sortBy: sortBy as "latest" | "popular" | "chat",
      limit: LIMIT,
      offset: newOffset,
    });
    offsetRef.current = newOffset;
    setPosts((prev) => [...prev, ...data]);
    setHasMore(data.length === LIMIT);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, search, category, sortBy]);

  // Keep the ref current so the observer always calls the latest version
  useEffect(() => {
    loadMoreFnRef.current = loadMore;
  }, [loadMore]);

  // Stable IntersectionObserver — created once, uses ref for callback
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
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-[#5D4037]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#5D4037]">{"교환글 목록"}</h1>
        </div>
      </header>

      <div className="p-4 pb-24">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D6E63]" />
          <Input
            placeholder="검색어를 입력하세요"
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border-[#F5DCC8] bg-white pl-10 focus:border-[#E8A87C]"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <Select
            value={category}
            onValueChange={(value) => updateParams({ category: value })}
          >
            <SelectTrigger className="w-[140px] border-[#F5DCC8] bg-white">
              <Filter className="mr-2 h-4 w-4 text-[#8D6E63]" />
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"전체"}</SelectItem>
              <SelectItem value="피규어">{"피규어"}</SelectItem>
              <SelectItem value="문구류">{"문구류"}</SelectItem>
              <SelectItem value="CD/앨범">{"CD/앨범"}</SelectItem>
              <SelectItem value="기타굿즈">{"기타굿즈"}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => updateParams({ sortBy: value })}
          >
            <SelectTrigger className="w-[120px] border-[#F5DCC8] bg-white">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">{"최신순"}</SelectItem>
              <SelectItem value="popular">{"인기순"}</SelectItem>
              <SelectItem value="chat">{"채팅순"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-[#8D6E63]">
            <Heart className="mb-3 h-12 w-12 text-[#F5DCC8]" />
            <p className="font-medium">{"게시글이 없습니다."}</p>
            {(search || category !== "all") && (
              <p className="mt-1 text-sm text-[#BCAAA4]">{"다른 조건으로 검색해보세요."}</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load more skeleton */}
            {isLoadingMore && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF8F0] p-4">
          <div className="grid grid-cols-2 gap-4 pt-20">
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
      }
    >
      <PostsContent />
    </Suspense>
  );
}
