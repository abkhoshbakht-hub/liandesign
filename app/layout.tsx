import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Vazirmatn, Plus_Jakarta_Sans, Lalezar } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import MotionProvider from "@/components/MotionProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ads/AdSlot";

const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"), {
  ssr: false,
  loading: () => null,
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const lalezar = Lalezar({
  subsets: ["arabic"],
  variable: "--font-lalezar",
  display: "swap",
  weight: ["400"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://liandesign.ir"),
  title: {
    default: "لیان دیزاین | طراحی وب اختصاصی و فروش قالب",
    template: "%s | لیان دیزاین",
  },
  description: "طراحی سایت حرفه‌ای در بوشهر. فروش قالب آنلاین، کدنویسی اختصاصی و سئو. تضمین نمره ۱۰۰ در Google PageSpeed.",
  keywords: ["لیان دیزاین", "طراح سایت بوشهر", "طراحی وب بوشهر", "قالب آماده سایت", "فروش قالب", "کدنویسی اختصاصی", "سئو بوشهر", "طراحی سایت ارزان"],
  openGraph: {
    title: "لیان دیزاین | طراحی وب اختصاصی",
    description: "طراحی سایت حرفه‌ای در بوشهر با بالاترین کیفیت",
    url: "https://liandesign.ir",
    siteName: "لیان دیزاین",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "لیان دیزاین | طراحی وب اختصاصی",
    description: "طراحی سایت حرفه‌ای در بوشهر با بالاترین کیفیت",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} ${jakarta.variable} ${lalezar.variable} font-vazir antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MotionProvider>
            <Header />
            <main className="min-h-screen bg-gray-50 dark:bg-obsidian">{children}</main>
            <div className="container mx-auto px-6">
              <AdSlot placement="footer" className="max-w-3xl mx-auto mb-8" />
            </div>
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3">
              <AdSlot placement="mobile.sticky" />
            </div>
            <Footer />
            <ChatWidget />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
