import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  description: "ساخت حساب کاربری در لیان دیزاین",
};

export default function RegisterPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-obsidian px-6 py-32">
      <RegisterForm />
    </section>
  );
}
