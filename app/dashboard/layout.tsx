import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { LayoutDashboard, ShoppingBag, Download, Ticket, Bell, Settings } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-lalezar text-gray-900 dark:text-white mb-2">داشبورد</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mb-8">
          خوش آمدید، <span className="text-gray-900 dark:text-white font-bold">{session.user.name ?? session.user.email}</span>
        </p>
        <div className="grid lg:grid-cols-4 gap-8">
          <nav className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 h-fit space-y-1 rounded-xl">
              {[
                { href: "/dashboard", label: "نمای کلی", icon: LayoutDashboard },
                { href: "/dashboard/orders", label: "سفارش‌های من", icon: ShoppingBag },
                { href: "/dashboard/downloads", label: "دانلودهای من", icon: Download },
                { href: "/dashboard/tickets", label: "تیکت‌های من", icon: Ticket },
                { href: "/dashboard/notifications", label: "اعلان‌ها", icon: Bell },
                { href: "/dashboard/settings", label: "تنظیمات", icon: Settings },
              ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-white/60 hover:text-cyan hover:bg-cyan/5 transition-colors"
                )}
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
