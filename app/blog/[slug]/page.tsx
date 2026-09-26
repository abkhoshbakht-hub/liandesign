import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getBlogPost, getBlogPosts } from "@/lib/data/blog";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: "مقاله پیدا نشد" };
  return {
    title: post.title,
    description: post.excerpt ?? post.title,
    openGraph: { title: `${post.title} | لیان دیزاین`, description: post.excerpt ?? "", type: "article" },
  };
}

function faDate(d: Date): string {
  return d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const related = (await getBlogPosts(post.category.slug)).filter((p) => p.id !== post.id).slice(0, 2);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://liandesign.ir/" },
      { "@type": "ListItem", position: 2, name: "وبلاگ", item: "https://liandesign.ir/blog" },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="container mx-auto px-6 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          بازگشت به وبلاگ
        </Link>
        <span className="text-[10px] bg-gold/10 text-gold px-2.5 py-1 rounded-full font-bold">{post.category.name}</span>
        <h1 className="text-3xl md:text-4xl font-lalezar text-gray-900 dark:text-white mt-4 mb-4 leading-relaxed">{post.title}</h1>
        <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-white/30 mb-10">
          <span className="inline-flex items-center gap-1"><User size={11} />{post.author}</span>
          <span className="inline-flex items-center gap-1"><Calendar size={11} />{faDate(post.createdAt)}</span>
        </div>
        <Card className="p-6 md:p-8 mb-10">
          <div className="space-y-4 text-sm text-gray-600 dark:text-white/70 leading-loose">
            {post.body.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </Card>
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">مطالب مرتبط</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`}>
                  <Card className="p-5 hover:border-cyan/30 transition-colors">
                    <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{r.title}</div>
                    <div className="text-[11px] text-gray-500 dark:text-white/40 line-clamp-2">{r.excerpt}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
