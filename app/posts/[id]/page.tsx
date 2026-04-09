"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  Heart,
  Share2,
  MessageCircle,
  Flag,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { getPostById, deletePost, type PostWithDetails } from "@/lib/supabase/actions/posts";
import { toggleFavorite, isFavorited } from "@/lib/supabase/actions/favorites";
import { createChatRoom } from "@/lib/supabase/actions/chat";
import { getUser } from "@/lib/supabase/actions/auth";
import { toast } from "sonner";

// ── Image carousel ──────────────────────────────────────────────────────────

function ImageGallery({ images, title }: { images: { url: string }[]; title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  if (images.length === 0) {
    return <div className="aspect-square w-full bg-[#F5DCC8]" />;
  }

  if (images.length === 1) {
    return (
      <div className="relative aspect-square w-full bg-white">
        <Image src={images[0].url} alt={title} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square w-full shrink-0">
              <Image src={img.url} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      {/* Dot indicators */}
      <div className="flex justify-center gap-2 bg-white py-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === selectedIndex ? "bg-[#E8A87C]" : "bg-[#F5DCC8]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="sticky top-0 z-50 h-14 border-b border-[#F5DCC8] bg-white/80" />
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatPending, startChatTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const [postData, user, liked] = await Promise.all([
        getPostById(postId),
        getUser(),
        isFavorited(postId),
      ]);
      setPost(postData);
      setCurrentUserId(user?.id ?? null);
      setIsLiked(liked);
    }
    load();
  }, [postId]);

  // Optimistic favorite toggle
  const handleLike = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    // Optimistic update
    setIsLiked((prev) => !prev);
    const result = await toggleFavorite(postId);
    if (result.error) {
      // Revert on error
      setIsLiked((prev) => !prev);
      toast.error(result.error);
    }
  };

  const handleStartChat = () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    setChatError(null);
    startChatTransition(async () => {
      const result = await createChatRoom(postId);
      if (result?.error) setChatError(result.error);
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deletePost(postId);
      if (result?.error) toast.error(result.error);
      // On success, deletePost redirects to /posts
    });
  };

  if (!post) return <PostDetailSkeleton />;

  const isChatAvailable = post.chat_count < post.max_chat && post.status === "posting";
  const isAuthor = currentUserId === post.author_id;

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-40">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/posts">
            <Button variant="ghost" size="icon" className="text-[#5D4037]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-[#5D4037]">
              <Share2 className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#5D4037]">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor && (
                  <>
                    <Link href={`/posts/${params.id}/edit`}>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        {"수정하기"}
                      </DropdownMenuItem>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {"삭제하기"}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{"게시글을 삭제할까요?"}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {"삭제하면 복구할 수 없습니다. 관련된 채팅도 모두 종료됩니다."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{"취소"}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeletePending}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isDeletePending ? "삭제 중..." : "삭제"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                {!isAuthor && (
                  <Link href={`/report?type=post&id=${params.id}`}>
                    <DropdownMenuItem className="text-red-500">
                      <Flag className="mr-2 h-4 w-4" />
                      {"신고하기"}
                    </DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <ImageGallery images={post.post_images} title={post.title} />

      <div className="p-4">
        {/* Post Info */}
        <div className="mb-4">
          {/* Author */}
          <div className="mb-3 flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-[#FFB7C5]">
              <AvatarImage src={post.profiles?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#FFB7C5] text-xs text-white">
                {(post.profiles?.nickname ?? "?")[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-[#8D6E63]">{post.profiles?.nickname ?? "알 수 없음"}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-[#E8A87C] text-white">{post.category}</Badge>
            <Badge
              variant="outline"
              className={
                isChatAvailable
                  ? "border-green-500 text-green-500"
                  : "border-[#8D6E63] text-[#8D6E63]"
              }
            >
              {isChatAvailable ? "교환가능" : "채팅마감"}
            </Badge>
          </div>
          <h1 className="mb-2 text-xl font-bold text-[#5D4037]">{post.title}</h1>
          <p className="text-sm text-[#8D6E63]">{post.created_at.slice(0, 10)}</p>
        </div>

        {/* Description */}
        <div className="mb-6 whitespace-pre-line text-[#5D4037]">{post.description}</div>

        {/* Want Tags */}
        {post.want_tags.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-medium text-[#5D4037]">{"원하는 교환"}</h3>
            <div className="flex flex-wrap gap-2">
              {post.want_tags.map((tag) => (
                <Badge key={tag} className="bg-gradient-to-r from-[#FFB7C5] to-[#E8A87C] text-white">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Chat Status */}
        <div className="flex items-center justify-between rounded-xl border border-[#F5DCC8] bg-[#FFF0E5] px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#E8A87C]" />
            <span className="text-[#5D4037]">{"채팅 현황"}</span>
          </div>
          <span className="font-bold text-[#E8A87C]">
            {`${post.chat_count} / ${post.max_chat}`}
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#F5DCC8] bg-white p-4">
        {chatError && (
          <p className="mb-2 text-center text-sm text-red-500">{chatError}</p>
        )}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={isLiked ? "text-red-500" : "text-[#8D6E63]"}
          >
            <Heart className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} />
          </Button>
          {isAuthor ? (
            <Link href={`/posts/${params.id}/edit`} className="flex-1">
              <Button
                variant="outline"
                className="w-full border-[#E8A87C] text-[#E8A87C] hover:bg-[#FFF0E5]"
              >
                <Pencil className="mr-2 h-5 w-5" />
                {"수정하기"}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleStartChat}
              disabled={!isChatAvailable || isChatPending}
              className="flex-1 bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {isChatPending ? "연결 중..." : isChatAvailable ? "채팅 시작하기" : "채팅 마감"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
