import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCustomizationOptions, getCustomization } from "@/lib/data/customizer";
import CustomizerClient from "./customizer-client";

export async function generateMetadata({ params }: { params: { websiteId: string } }): Promise<Metadata> {
  const website = await db.website.findFirst({ where: { id: params.websiteId, status: "PUBLISHED" } });
  return { title: website ? `شخصی‌سازی ${website.name}` : "شخصی‌سازی" };
}

export default async function CustomizePage({ params }: { params: { websiteId: string } }) {
  const website = await db.website.findFirst({
    where: { id: params.websiteId, status: "PUBLISHED" },
    select: { id: true, name: true, slug: true, basePrice: true },
  });
  if (!website) notFound();

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [options, initial] = await Promise.all([
    getCustomizationOptions(),
    userId ? getCustomization(userId, website.id) : Promise.resolve(null),
  ]);

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <Link href={`/websites/${website.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          بازگشت به {website.name}
        </Link>
        <h1 className="text-4xl font-lalezar text-gray-900 dark:text-white mb-2">شخصی‌سازی {website.name}</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mb-10">رنگ، فونت، صفحات و امکانات را انتخاب کنید — قیمت زنده حساب می‌شود.</p>
        <CustomizerClient
          website={website}
          options={options}
          initial={initial}
          isLoggedIn={!!userId}
          loginHref={`/login?callbackUrl=/customize/${website.id}`}
        />
      </div>
    </section>
  );
}
