"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("ایمیل یا رمز عبور اشتباه است");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("خطایی رخ داد. دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>ورود به لیان دیزاین</CardTitle>
        <CardDescription>برای ادامه خرید وارد حساب خود شوید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 dark:text-white/40">ایمیل</label>
            <Input
              type="email"
              dir="ltr"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 dark:text-white/40">رمز عبور</label>
            <Input
              type="password"
              dir="ltr"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-gray-400 dark:text-white/40">
          حساب ندارید؟{" "}
          <Link href="/register" className="text-cyan hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
