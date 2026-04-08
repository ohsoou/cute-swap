"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Plus, X, ImageIcon } from "lucide-react";
import { createPost } from "@/lib/supabase/actions/posts";
import { createClient } from "@/lib/supabase/client";

const postSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이내로 입력해주세요"),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  condition: z.string().min(1, "상품 상태를 선택해주세요"),
  description: z
    .string()
    .min(10, "설명은 10자 이상 입력해주세요")
    .max(2000, "설명은 2000자 이내로 입력해주세요"),
  wantTags: z
    .array(z.string())
    .min(1, "교환 태그를 1개 이상 추가해주세요")
    .max(10, "태그는 최대 10개까지 추가 가능합니다"),
  imageCount: z
    .number()
    .min(1, "사진을 1장 이상 추가해주세요")
    .max(5, "사진은 최대 5장까지 추가 가능합니다"),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof postSchema>, string>>;

export default function NewPostPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "new",
    description: "",
    wantTags: [] as string[],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTagInput = (value: string) => {
    setTagInput(value);
    if (tagDebounceRef.current) clearTimeout(tagDebounceRef.current);
    if (!value.trim()) {
      setTagSuggestions([]);
      return;
    }
    tagDebounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("tags")
        .select("name")
        .ilike("name", `%${value.trim()}%`)
        .limit(5);
      setTagSuggestions(
        (data ?? [])
          .map((t) => t.name)
          .filter((name) => !formData.wantTags.includes(name))
      );
    }, 300);
  };

  const handleAddTag = (tag?: string) => {
    const value = (tag ?? tagInput).trim();
    if (value && !formData.wantTags.includes(value) && formData.wantTags.length < 10) {
      setFormData((prev) => ({ ...prev, wantTags: [...prev.wantTags, value] }));
      setTagInput("");
      setTagSuggestions([]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, wantTags: prev.wantTags.filter((t) => t !== tag) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    const valid: File[] = [];
    for (const f of toAdd) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        toast.error(`${f.name}: jpg, png, webp 형식만 업로드 가능합니다`);
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: 5MB 이하의 파일만 업로드 가능합니다`);
        continue;
      }
      valid.push(f);
    }
    setImageFiles((prev) => [...prev, ...valid]);
    setImagePreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = postSchema.safeParse({
      ...formData,
      imageCount: imageFiles.length,
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const fd = new FormData();
    fd.set("title", formData.title);
    fd.set("category", formData.category);
    fd.set("condition", formData.condition);
    fd.set("description", formData.description);
    fd.set("wantTags", formData.wantTags.join(","));
    imageFiles.forEach((file) => fd.append("images", file));

    startTransition(async () => {
      const result = await createPost(fd);
      if (result?.error) {
        toast.error(result.error);
      }
      // On success, createPost redirects — we never reach here
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-36">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/posts">
              <Button variant="ghost" size="icon" className="text-[#5D4037]">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-[#5D4037]">{"교환글 작성"}</h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4">
        {/* Image Upload */}
        <div className="mb-6">
          <FieldLabel className="mb-2 block text-[#5D4037]">{"사진"}</FieldLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {imageFiles.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E8A87C] bg-[#FFF0E5] text-[#E8A87C] transition-colors hover:bg-[#FFE8D6]"
              >
                <ImageIcon className="h-6 w-6" />
                <span className="mt-1 text-xs">{`${imageFiles.length}/5`}</span>
              </button>
            )}
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative h-24 w-24 shrink-0">
                <Image src={preview} alt={`Upload ${index + 1}`} fill className="rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {fieldErrors.imageCount && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.imageCount}</p>
          )}
        </div>

        <FieldGroup className="space-y-4">
          <Field>
            <FieldLabel className="text-[#5D4037]">{"제목"}</FieldLabel>
            <Input
              placeholder="교환글 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
            />
            {fieldErrors.title && (
              <p className="text-sm text-red-500">{fieldErrors.title}</p>
            )}
          </Field>

          <Field>
            <FieldLabel className="text-[#5D4037]">{"카테고리"}</FieldLabel>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="border-[#F5DCC8] bg-white">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="피규어">{"피규어"}</SelectItem>
                <SelectItem value="문구류">{"문구류"}</SelectItem>
                <SelectItem value="CD/앨범">{"CD/앨범"}</SelectItem>
                <SelectItem value="기타굿즈">{"기타굿즈"}</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.category && (
              <p className="text-sm text-red-500">{fieldErrors.category}</p>
            )}
          </Field>

          <Field>
            <FieldLabel className="text-[#5D4037]">{"상품 상태"}</FieldLabel>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData({ ...formData, condition: value })}
            >
              <SelectTrigger className="border-[#F5DCC8] bg-white">
                <SelectValue placeholder="상태를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{"미개봉"}</SelectItem>
                <SelectItem value="like-new">{"거의 새것"}</SelectItem>
                <SelectItem value="good">{"상태 좋음"}</SelectItem>
                <SelectItem value="used">{"사용감 있음"}</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.condition && (
              <p className="text-sm text-red-500">{fieldErrors.condition}</p>
            )}
          </Field>

          <Field>
            <FieldLabel className="text-[#5D4037]">{"설명"}</FieldLabel>
            <Textarea
              placeholder="교환할 물건에 대해 설명해주세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[120px] border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-500">{fieldErrors.description}</p>
            )}
          </Field>

          <Field>
            <FieldLabel className="text-[#5D4037]">{"원하는 교환 태그"}</FieldLabel>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="태그 입력 후 추가 (최대 10개)"
                  value={tagInput}
                  onChange={(e) => handleTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
                />
                {tagSuggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-[#F5DCC8] bg-white shadow-md">
                    {tagSuggestions.map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onClick={() => handleAddTag(suggestion)}
                          className="w-full px-3 py-2 text-left text-sm text-[#5D4037] hover:bg-[#FFF0E5]"
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button
                type="button"
                onClick={() => handleAddTag()}
                disabled={formData.wantTags.length >= 10}
                className="shrink-0 bg-[#E8A87C] hover:bg-[#d49a6e]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.wantTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.wantTags.map((tag) => (
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
            {fieldErrors.wantTags && (
              <p className="text-sm text-red-500">{fieldErrors.wantTags}</p>
            )}
          </Field>
        </FieldGroup>

        <div className="fixed bottom-16 left-0 right-0 border-t border-[#F5DCC8] bg-white p-4 z-40">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
          >
            {isPending ? "게시 중..." : "게시하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
