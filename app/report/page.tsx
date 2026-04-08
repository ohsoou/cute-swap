"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { ChevronLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { submitReport } from "@/lib/supabase/actions/reports";

const REPORT_REASONS = [
  { id: "spam", label: "스팸/광고" },
  { id: "fraud", label: "사기 의심" },
  { id: "inappropriate", label: "부적절한 콘텐츠" },
  { id: "fake", label: "허위 정보" },
  { id: "harassment", label: "욕설/비방" },
  { id: "other", label: "기타" },
];

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetType = searchParams.get("type") || "post";
  const targetId = searchParams.get("id") || "";

  const [selectedReason, setSelectedReason] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("targetType", targetType);
    fd.set("targetId", targetId);
    fd.set("reason", selectedReason);
    fd.set("detail", detail);

    startTransition(async () => {
      const result = await submitReport(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsSubmitted(true);
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] p-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-[#5D4037]">{"신고가 접수되었습니다"}</h1>
        <p className="mb-6 text-center text-[#8D6E63]">
          {"신고 내용을 검토한 후 조치하겠습니다.\n감사합니다."}
        </p>
        <Button
          onClick={() => router.back()}
          className="bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white"
        >
          {"돌아가기"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCC8] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-[#5D4037]">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-[#5D4037]">{"신고하기"}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4">
        {/* Warning */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700">
              {"허위 신고는 서비스 이용에 제한이 있을 수 있습니다. 신중하게 신고해주세요."}
            </p>
          </CardContent>
        </Card>

        <FieldGroup className="space-y-6">
          <Field>
            <FieldLabel className="mb-3 text-[#5D4037]">{"신고 사유를 선택해주세요"}</FieldLabel>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              <div className="space-y-3">
                {REPORT_REASONS.map((reason) => (
                  <Card
                    key={reason.id}
                    className={`cursor-pointer border-[#F5DCC8] transition-colors ${
                      selectedReason === reason.id
                        ? "border-[#E8A87C] bg-[#FFF0E5]"
                        : "bg-white hover:border-[#E8A87C]/50"
                    }`}
                    onClick={() => setSelectedReason(reason.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <RadioGroupItem
                        value={reason.id}
                        id={reason.id}
                        className="border-[#E8A87C] text-[#E8A87C]"
                      />
                      <Label htmlFor={reason.id} className="flex-1 cursor-pointer text-[#5D4037]">
                        {reason.label}
                      </Label>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </Field>

          <Field>
            <FieldLabel className="text-[#5D4037]">{"상세 내용 (선택)"}</FieldLabel>
            <Textarea
              placeholder="신고 사유에 대해 자세히 설명해주세요"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="min-h-[120px] border-[#F5DCC8] bg-white focus:border-[#E8A87C]"
            />
          </Field>
        </FieldGroup>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="fixed bottom-0 left-0 right-0 border-t border-[#F5DCC8] bg-white p-4">
          <Button
            type="submit"
            disabled={!selectedReason || isPending}
            className="w-full bg-red-500 text-white hover:bg-red-600"
          >
            {isPending ? "제출 중..." : "신고 제출"}
          </Button>
        </div>
      </form>
    </div>
  );
}
