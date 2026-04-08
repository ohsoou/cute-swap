"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Bell, MessageCircle, Heart, CheckCircle, Trash2 } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/supabase/actions/notifications";
import type { Notification } from "@/lib/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const getIcon = (type: string) => {
  switch (type) {
    case "chat": return <MessageCircle className="h-5 w-5" />;
    case "like": return <Heart className="h-5 w-5" />;
    case "trade": return <CheckCircle className="h-5 w-5" />;
    default: return <Bell className="h-5 w-5" />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const data = await getNotifications();
      setNotifications(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    startTransition(async () => {
      await markAsRead(id);
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    startTransition(async () => {
      await markAllAsRead();
    });
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    startTransition(async () => {
      await deleteNotification(id);
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-[#5D4037]">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-[#5D4037]">{"알림"}</h1>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFB7C5] px-1.5 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-sm text-[#E8A87C]">
              {"모두 읽음"}
            </Button>
          )}
        </div>
      </header>

      {/* Notifications List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-[#F5DCC8] bg-white" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-[#F5DCC8] transition-colors ${
                  notification.is_read ? "bg-white" : "bg-[#FFF0E5]"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        notification.is_read
                          ? "bg-[#F5DCC8] text-[#8D6E63]"
                          : "bg-gradient-to-br from-[#FFB7C5] to-[#E8A87C] text-white"
                      }`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {notification.link ? (
                        <Link href={notification.link} onClick={() => handleMarkAsRead(notification.id)}>
                          <h3 className="font-medium text-[#5D4037]">{notification.title}</h3>
                          <p className="mt-1 text-sm text-[#8D6E63]">{notification.message}</p>
                        </Link>
                      ) : (
                        <>
                          <h3 className="font-medium text-[#5D4037]">{notification.title}</h3>
                          <p className="mt-1 text-sm text-[#8D6E63]">{notification.message}</p>
                        </>
                      )}
                      <p className="mt-2 text-xs text-[#8D6E63]">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notification.id)}
                      className="shrink-0 text-[#8D6E63] hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0E5]">
              <Bell className="h-10 w-10 text-[#E8A87C]" />
            </div>
            <h2 className="mb-2 text-lg font-medium text-[#5D4037]">{"알림이 없어요"}</h2>
            <p className="text-center text-sm text-[#8D6E63]">
              {"새로운 알림이 오면 여기에 표시됩니다."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
