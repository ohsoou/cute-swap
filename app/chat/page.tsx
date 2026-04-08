"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { getChatRooms, type ChatRoomWithDetails } from "@/lib/supabase/actions/chat";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatRoomWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getChatRooms();
      setChats(data);
      setIsLoading(false);
    }
    load();
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
          <h1 className="text-lg font-bold text-[#5D4037]">{"채팅"}</h1>
        </div>
      </header>

      {/* Chat List */}
      {isLoading ? (
        <div className="divide-y divide-[#F5DCC8]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white p-4">
              <div className="h-14 w-14 animate-pulse rounded-lg bg-[#F5DCC8]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#F5DCC8]" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-[#F5DCC8]" />
              </div>
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0E5]">
            <MessageCircle className="h-10 w-10 text-[#E8A87C]" />
          </div>
          <h2 className="mb-2 text-lg font-medium text-[#5D4037]">{"아직 채팅이 없어요"}</h2>
          <p className="text-center text-sm text-[#8D6E63]">
            {"마음에 드는 교환글에서 채팅을 시작해보세요!"}
          </p>
          <Link href="/posts" className="mt-4">
            <Button className="bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white">
              {"교환글 둘러보기"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#F5DCC8]">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <div className="flex items-center gap-3 bg-white p-4 transition-colors hover:bg-[#FFF0E5]">
                {/* Post Image */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                  {chat.post_image ? (
                    <Image src={chat.post_image} alt={chat.post_title} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[#F5DCC8]" />
                  )}
                </div>

                {/* Chat Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-[#FFB7C5]">
                      <AvatarImage src={chat.partner_avatar ?? undefined} />
                      <AvatarFallback className="bg-[#FFB7C5] text-xs text-white">
                        {chat.partner_nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-[#5D4037]">{chat.partner_nickname}</span>
                    {(chat.status === "ended" || chat.status === "agreed") && (
                      <Badge className="bg-[#8D6E63] text-xs text-white">
                        {chat.status === "agreed" ? "합의완료" : "종료"}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-[#5D4037]">{chat.post_title}</p>
                  <p className="truncate text-sm text-[#8D6E63]">{chat.last_message ?? ""}</p>
                </div>

                {/* Time */}
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-[#8D6E63]">
                    {chat.last_message_at
                      ? formatDistanceToNow(new Date(chat.last_message_at), {
                          addSuffix: true,
                          locale: ko,
                        })
                      : ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
