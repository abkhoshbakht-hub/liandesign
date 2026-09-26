import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به حساب کاربری لیان دیزاین",
};

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const callbackUrl =
    searchParams.callbackUrl && searchParams.callbackUrl.startsWith("/") ? searchParams.callbackUrl : "/";
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-obsidian px-6 py-32">
      <LoginForm callbackUrl={callbackUrl} />
    </section>
  );
}
