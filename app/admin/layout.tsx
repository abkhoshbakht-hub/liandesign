import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  LayoutDashboard, ShoppingBag, Globe, Package, Star, Users, Ticket, Percent, FolderTree, HelpCircle, Megaphone, CreditCard, Undo2, Newspaper, MessageCircle,
} from "lucide-react";
import { authOptions } from "@/lib/auth";

const links = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/orders", label: "سفارش‌ها", icon: ShoppingBag },
  { href: "/admin/payments", label: "پرداخت‌ها", icon: CreditCard },
  { href: "/admin/refunds", label: "استردادها", icon: Undo2 },
  { href: "/admin/websites", label: "سایت‌ها", icon: Globe },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/admin/reviews", label: "نظرات", icon: Star },
  { href: "/admin/coupons", label: "کوپن‌ها", icon: Percent },
  { href: "/admin/tickets", label: "تیکت‌ها", icon: Ticket },
  { href: "/admin/chat", label: "گفتگوی زنده", icon: MessageCircle },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/blog", label: "وبلاگ", icon: Newspaper },
  { href: "/admin/advertising", label: "تبلیغات", icon: Megaphone },
  { href: "/admin/help", label: "راهنما", icon: HelpCircle },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/");

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-lalezar text-gray-900 dark:text-white mb-2">پنل مدیریت</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mb-8">مدیریت فروشگاه، سفارش‌ها و کاربران</p>
        <div className="grid lg:grid-cols-5 gap-8">
          <nav className="glass-card p-4 h-fit space-y-1 lg:col-span-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-white/60 hover:text-cyan hover:bg-cyan/5 transition-colors"
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="lg:col-span-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
