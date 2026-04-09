"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { syncProfile } from "@/lib/supabase/actions/profile";

export default function SignupPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [verifyCode, setVerifyCode] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  const isPending = fetchStatus === "fetching";
  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setServerError("");

    if (formData.password.length < 8) {
      setPasswordError("비밀번호는 8글자 이상이어야 합니다.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const { error } = await signUp.password({
      emailAddress: formData.email,
      password: formData.password,
      unsafeMetadata: { nickname: formData.nickname },
    });

    if (error) {
      setServerError(error.message ?? "회원가입에 실패했습니다.");
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp.verifications.verifyEmailCode({ code: verifyCode });

    if (signUp.status === "complete") {
      // Create the Supabase profile row before navigating away
      if (signUp.createdUserId) {
        await syncProfile(signUp.createdUserId, formData.nickname);
      }

      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
  };

  if (needsVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFE8D6] px-4 py-20 overflow-y-auto">
        <Card className="w-full max-w-md border-[#F5DCC8] bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#E8A87C]">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#5D4037]">{"이메일 인증"}</CardTitle>
            <CardDescription className="text-[#8D6E63]">
              {`${formData.email}로 발송된 인증 코드를 입력하세요`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <Field>
                <FieldLabel className="text-[#5D4037]">{"인증 코드"}</FieldLabel>
                <Input
                  type="text"
                  placeholder="123456"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="border-[#F5DCC8] bg-[#FFF8F0] focus:border-[#E8A87C]"
                  required
                />
                {errors?.fields?.code && (
                  <p className="text-sm text-red-600">{errors.fields.code.message}</p>
                )}
              </Field>

              {errors?.global?.map((err, i) => (
                <div key={i} className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err.message}</div>
              ))}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
              >
                {isPending ? "확인 중..." : "인증하기"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => signUp.verifications.sendEmailCode()}
                  className="text-sm text-[#E8A87C] hover:underline"
                >
                  {"코드 재발송"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFE8D6] px-4 py-20 overflow-y-auto">
      <Card className="w-full max-w-md border-[#F5DCC8] bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#E8A87C]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#5D4037]">{"회원가입"}</CardTitle>
          <CardDescription className="text-[#8D6E63]">
            {"Cute Swap에 가입하고 굿즈를 교환하세요!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel className="text-[#5D4037]">{"이메일"}</FieldLabel>
                <Input
                  type="email"
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-[#F5DCC8] bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-[#E8A87C]"
                  required
                />
                {errors?.fields?.emailAddress && (
                  <p className="text-sm text-red-600">{errors.fields.emailAddress.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel className="text-[#5D4037]">{"비밀번호"}</FieldLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상 입력하세요"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border-[#F5DCC8] bg-[#FFF8F0] pr-10 focus:border-[#E8A87C] focus:ring-[#E8A87C]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#5D4037]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {(passwordError || errors?.fields?.password) && (
                  <p className="text-sm text-red-600">
                    {passwordError || errors?.fields?.password?.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="text-[#5D4037]">{"비밀번호 확인"}</FieldLabel>
                <Input
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="border-[#F5DCC8] bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-[#E8A87C]"
                  required
                />
              </Field>
              <Field>
                <FieldLabel className="text-[#5D4037]">{"닉네임"}</FieldLabel>
                <Input
                  type="text"
                  placeholder="사용할 닉네임을 입력하세요"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="border-[#F5DCC8] bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-[#E8A87C]"
                  required
                />
              </Field>
            </FieldGroup>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeTerms: checked as boolean })
                  }
                  className="border-[#E8A87C] data-[state=checked]:bg-[#E8A87C]"
                />
                <label htmlFor="terms" className="text-sm text-[#5D4037]">
                  {"이용약관에 동의합니다 (필수)"}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="privacy"
                  checked={formData.agreePrivacy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreePrivacy: checked as boolean })
                  }
                  className="border-[#E8A87C] data-[state=checked]:bg-[#E8A87C]"
                />
                <label htmlFor="privacy" className="text-sm text-[#5D4037]">
                  {"개인정보 처리방침에 동의합니다 (필수)"}
                </label>
              </div>
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{serverError}</div>
            )}
            {errors?.global?.map((err, i) => (
              <div key={i} className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err.message}</div>
            ))}

            <Button
              type="submit"
              disabled={!formData.agreeTerms || !formData.agreePrivacy || isPending}
              className="w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
            >
              {isPending ? "가입 중..." : "가입하기"}
            </Button>

            <div className="text-center text-sm text-[#8D6E63]">
              {"이미 계정이 있으신가요? "}
              <Link href="/login" className="font-medium text-[#E8A87C] hover:underline">
                {"로그인"}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
