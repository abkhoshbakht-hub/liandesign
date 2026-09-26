import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PreviewClient from "./preview-client";
import { getWebsiteBySlug } from "@/lib/data/websites";
import { logEvent } from "@/lib/analytics";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const website = await getWebsiteBySlug(params.slug);
  return { title: website ? `پیش‌نمایش ${website.name}` : "پیش‌نمایش" };
}

export default async function PreviewPage({ params }: { params: { slug: string } }) {
  const website = await getWebsiteBySlug(params.slug);
  if (!website) notFound();

  await logEvent("demo_open", { websiteId: website.id, slug: website.slug });

  return <PreviewClient website={{ id: website.id, name: website.name, slug: website.slug, demoUrl: website.demoUrl }} />;
}
