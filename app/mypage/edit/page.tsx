"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { ChevronLeft, Camera, Plus, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { getProfile, updateProfile } from "@/lib/supabase/actions/profile";

export default function EditProfilePage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkUser) return;
    getProfile(clerkUser.id).then((profile) => {
      if (profile) {
        setNickname(profile.nickname);
        setBio(profile.bio ?? "");
        setTags(profile.interest_tags ?? []);
        setAvatarUrl(profile.avatar_url ?? null);
      }
      setIsLoading(false);
    });
  }, [clerkUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("nickname", nickname);
    formData.set("bio", bio);
    formData.set("interest_tags", JSON.stringify(tags));
    if (avatarFile) {
      formData.set("avatar", avatarFile);
    }

    const result = await updateProfile(formData);
    setIsSaving(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/mypage");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8A87C] border-t-transparent" />
      </div>
    );
  }

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
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className="bg-[#FFB7C5] text-3xl text-white">
                {nickname[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A87C] text-white shadow-md"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <p className="mt-2 text-sm text-[#8D6E63]">{"프로필 사진 변경"}</p>
        </div>

        <FieldGroup className="space-y-6">
          {/* Nickname */}
          <Field>
            <FieldLabel className="text-[#5D4037]">{"닉네임"}</FieldLabel>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
              required
            />
          </Field>

          {/* Bio */}
          <Field>
            <FieldLabel className="text-[#5D4037]">{"소개"}</FieldLabel>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
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
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
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

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-[#F5DCC8] bg-white p-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}