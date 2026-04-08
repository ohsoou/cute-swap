"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Eye, EyeOff, Heart } from "lucide-react";

export default function LoginPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const isPending = fetchStatus === "fetching";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn.password({ emailAddress: email, password });

    if (error) {
      console.error(error);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
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

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn.mfa.verifyPhoneCode({ code: mfaCode });

    if (signIn.status === "complete") {
      await signIn.finalize({
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

  if (signIn.status === "needs_second_factor") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFE8D6] px-4 py-12">
        <Card className="w-full max-w-md border-[#F5DCC8] bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-2xl font-bold text-[#5D4037]">{"2단계 인증"}</CardTitle>
            <CardDescription className="text-[#8D6E63]">{"인증 코드를 입력하세요"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMFA} className="space-y-6">
              <Field>
                <FieldLabel className="text-[#5D4037]">{"인증 코드"}</FieldLabel>
                <Input
                  type="text"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="border-[#F5DCC8] bg-[#FFF8F0] focus:border-[#E8A87C]"
                  required
                />
              </Field>
              {errors?.global?.map((err, i) => (
                <div key={i} className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err.message}</div>
              ))}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
              >
                {isPending ? "확인 중..." : "확인"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFE8D6] px-4 py-12">
      <Card className="w-full max-w-md border-[#F5DCC8] bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#E8A87C]">
            <Heart className="h-8 w-8 text-white" fill="white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#5D4037]">{"Kawaii Swap"}</CardTitle>
          <CardDescription className="text-[#8D6E63]">{"계정에 로그인하세요"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel className="text-[#5D4037]">{"이메일"}</FieldLabel>
                <Input
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[#F5DCC8] bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-[#E8A87C]"
                  required
                />
                {errors?.fields?.identifier && (
                  <p className="text-sm text-red-600">{errors.fields.identifier.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel className="text-[#5D4037]">{"비밀번호"}</FieldLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {errors?.fields?.password && (
                  <p className="text-sm text-red-600">{errors.fields.password.message}</p>
                )}
              </Field>
            </FieldGroup>

            {errors?.global?.map((err, i) => (
              <div key={i} className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err.message}</div>
            ))}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] text-white hover:opacity-90"
            >
              {isPending ? "로그인 중..." : "로그인"}
            </Button>

            <div className="relative flex items-center gap-2">
              <div className="flex-1 border-t border-[#F5DCC8]" />
              <span className="text-xs text-[#8D6E63]">또는</span>
              <div className="flex-1 border-t border-[#F5DCC8]" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#F5DCC8] bg-white hover:bg-[#FFF8F0]"
              onClick={() =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (signIn as any).authenticateWithRedirect({
                  strategy: "oauth_google",
                  redirectUrl: "/sso-callback",
                  redirectUrlComplete: "/",
                })
              }
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {"Google로 로그인"}
            </Button>

            <div className="text-center text-sm text-[#8D6E63]">
              {"계정이 없으신가요? "}
              <Link href="/signup" className="font-medium text-[#E8A87C] hover:underline">
                {"회원가입"}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
