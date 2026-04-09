"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronLeft,
  Send,
  ImageIcon,
  MoreVertical,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import {
  getChatRoom,
  getChatMessages,
  sendMessage,
  agreeChatRoom,
  endChatRoom,
} from "@/lib/supabase/actions/chat";
import type { ChatMessage } from "@/lib/supabase/types";

type RoomInfo = Awaited<ReturnType<typeof getChatRoom>>;

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = Number(params.id);
  const [room, setRoom] = useState<RoomInfo>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomStatus, setRoomStatus] = useState<"active" | "agreed" | "ended">("active");
  const [isPending, startTransition] = useTransition();
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Initial data load
  useEffect(() => {
    async function load() {
      const [roomData, msgs] = await Promise.all([
        getChatRoom(roomId),
        getChatMessages(roomId),
      ]);
      setRoom(roomData);
      setMessages(msgs);
      if (roomData) setRoomStatus(roomData.status);
    }
    load();
  }, [roomId]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            // Deduplicate by id
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const content = newMessage;
    setNewMessage("");
    startTransition(async () => {
      await sendMessage(roomId, content, "text");
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageInputRef.current) imageInputRef.current.value = "";

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      alert("jpg, png, webp 형식만 업로드 가능합니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("5MB 이하의 파일만 업로드 가능합니다.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setPendingImage({ file, preview });
  };

  const handleSendImage = async () => {
    if (!pendingImage) return;
    setIsUploadingImage(true);

    const supabase = createClient();
    const ext = pendingImage.file.name.split(".").pop() ?? "jpg";
    const path = `chat/${roomId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("post-images").upload(path, pendingImage.file);
    if (error) {
      setIsUploadingImage(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("post-images").getPublicUrl(path);
    URL.revokeObjectURL(pendingImage.preview);
    setPendingImage(null);
    setIsUploadingImage(false);
    await sendMessage(roomId, publicUrl, "image");
  };

  const handleCancelImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.preview);
    setPendingImage(null);
  };

  const handleAgree = () => {
    startTransition(async () => {
      const result = await agreeChatRoom(roomId);
      if (!result.error) setRoomStatus("agreed");
    });
  };

  const handleEndChat = () => {
    startTransition(async () => {
      const result = await endChatRoom(roomId);
      if (!result.error) setRoomStatus("ended");
    });
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8A87C] border-t-transparent" />
      </div>
    );
  }

  const currentUserId = room.currentUserId;

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="text-[#5D4037]">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-8 w-8 border border-[#FFB7C5]">
              <AvatarImage src={room.partner.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#FFB7C5] text-white">
                {room.partner.nickname[0]}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-[#5D4037]">{room.partner.nickname}</span>
          </div>
          {roomStatus === "active" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#5D4037]">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <XCircle className="mr-2 h-4 w-4" />
                      {"채팅 종료"}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{"채팅 종료"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {"채팅을 종료하시겠습니까? 종료 후에는 다시 채팅할 수 없습니다."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{"취소"}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleEndChat}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {"종료"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Info */}
        <Link href={`/posts/${room.post.id}`}>
          <div className="flex items-center gap-3 border-t border-[#F5DCC8] bg-[#FFF0E5] px-4 py-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg">
              {room.post.image ? (
                <Image src={room.post.image} alt={room.post.title ?? ""} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-[#F5DCC8]" />
              )}
            </div>
            <p className="flex-1 truncate text-sm text-[#5D4037]">{room.post.title}</p>
          </div>
        </Link>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            if (message.type === "system") {
              return (
                <div key={message.id} className="flex justify-center">
                  <Card className="border-[#E8A87C] bg-[#FFF0E5]">
                    <CardContent className="px-4 py-2">
                      <p className="text-center text-sm text-[#E8A87C]">{message.content}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            }

            const isMe = message.sender_id === currentUserId;

            return (
              <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[75%] gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  {!isMe && (
                    <Avatar className="h-8 w-8 shrink-0 border border-[#FFB7C5]">
                      <AvatarImage src={room.partner.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-[#FFB7C5] text-white">
                        {room.partner.nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {message.type === "image" ? (
                      <div className="overflow-hidden rounded-2xl">
                        <Image
                          src={message.content}
                          alt="Shared image"
                          width={200}
                          height={200}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white"
                            : "bg-white text-[#5D4037]"
                        }`}
                      >
                        {message.content}
                      </div>
                    )}
                    <p className={`mt-1 text-xs text-[#8D6E63] ${isMe ? "text-right" : ""}`}>
                      {new Date(message.created_at).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Action Bar */}
      {roomStatus === "active" && (
        <div className="border-t border-[#F5DCC8] bg-white p-2">
          <div className="flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#E8A87C] text-[#E8A87C] hover:bg-[#E8A87C] hover:text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {"교환 합의하기"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{"교환 합의"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {"상대방과 교환을 합의하시겠습니까? 합의 후 상세 일정을 조율해주세요."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{"취소"}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAgree} className="bg-[#E8A87C] hover:bg-[#d49a6e]">
                    {"합의"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Input */}
      {roomStatus === "active" ? (
        <div className="border-t border-[#F5DCC8] bg-white p-4">
          <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
          {pendingImage && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#F5DCC8] bg-[#FFF0E5] p-2">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image src={pendingImage.preview} alt="Preview" fill className="object-cover" />
              </div>
              <div className="flex flex-1 gap-2">
                <Button
                  onClick={handleSendImage}
                  disabled={isUploadingImage}
                  className="flex-1 bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
                >
                  {isUploadingImage ? "전송 중..." : "이미지 전송"}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancelImage} className="text-[#8D6E63]">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-[#8D6E63]"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              placeholder="메시지를 입력하세요"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="border-[#F5DCC8] bg-[#FFF8F0] focus:border-[#E8A87C]"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isPending}
              className="shrink-0 bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-[#F5DCC8] bg-[#FFF0E5] p-4 text-center text-sm text-[#8D6E63]">
          {roomStatus === "agreed" ? "교환 합의가 완료된 채팅입니다." : "종료된 채팅입니다."}
        </div>
      )}
    </div>
  );
}
