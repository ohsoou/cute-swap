"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { ChevronLeft, Camera, Plus, X } from "lucide-react";

const MOCK_USER = {
  nickname: "마이멜로팬",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  bio: "산리오 덕후입니다! 주로 마이멜로디, 시나모롤 굿즈 수집해요 :)",
  tags: ["산리오", "마이멜로디", "시나모롤"],
};

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    nickname: MOCK_USER.nickname,
    bio: MOCK_USER.bio,
    tags: MOCK_USER.tags,
  });
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update profile:", formData);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/mypage">
            <Button variant="ghost" size="icon" className="text-[#5D4037]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#5D4037]">{"프로필 수정"}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4">
        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={MOCK_USER.avatar} />
              <AvatarFallback className="bg-[#FFB7C5] text-3xl text-white">
                {formData.nickname[0]}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A87C] text-white shadow-md"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-[#8D6E63]">{"프로필 사진 변경"}</p>
        </div>

        <FieldGroup className="space-y-6">
          {/* Nickname */}
          <Field>
            <FieldLabel className="text-[#5D4037]">{"닉네임"}</FieldLabel>
            <Input
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
              required
            />
          </Field>

          {/* Bio */}
          <Field>
            <FieldLabel className="text-[#5D4037]">{"소개"}</FieldLabel>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="자신을 소개해주세요"
              className="min-h-[100px] border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
            />
          </Field>

          {/* Interest Tags */}
          <Field>
            <FieldLabel className="text-[#5D4037]">{"관심 태그"}</FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder="태그 입력 후 추가"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="shrink-0 bg-[#E8A87C] hover:bg-[#d49a6e]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-gradient-to-r from-[#FFB7C5] to-[#E8A87C] text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Field>
        </FieldGroup>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-[#F5DCC8] bg-white p-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
          >
            {"저장하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
