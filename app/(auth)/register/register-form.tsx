"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/lib/actions/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerUser({ name, email: email.trim(), password });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const login = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (login?.error) {
        router.push("/login");
      } else {
        router.push("/");
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
        <CardTitle>ثبت‌نام در لیان دیزاین</CardTitle>
        <CardDescription>حساب بسازید و سفارش خود را مدیریت کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 dark:text-white/40">نام و نام خانوادگی</label>
            <Input
              type="text"
              placeholder="نام شما"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            <label className="text-xs text-gray-400 dark:text-white/40">رمز عبور (حداقل ۸ کاراکتر)</label>
            <Input
              type="password"
              dir="ltr"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-gray-400 dark:text-white/40">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="text-cyan hover:underline">
            وارد شوید
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
