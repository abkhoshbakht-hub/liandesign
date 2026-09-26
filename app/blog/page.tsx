import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBlogCategories, getBlogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "وبلاگ لیان دیزاین",
  description: "مقالات آموزشی و اخبار طراحی وب",
};

function faDate(d: Date): string {
  return d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [categories, posts] = await Promise.all([
    getBlogCategories(),
    getBlogPosts(searchParams.category || undefined),
  ]);

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">وبلاگ</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">وبلاگ لیان دیزاین</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">مقالات آموزشی و اخبار طراحی وب</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <Link
            href="/blog"
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors",
              !searchParams.category ? "bg-cyan text-obsidian" : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10"
            )}
          >
            همه
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog?category=${c.slug}`}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-colors",
                searchParams.category === c.slug
                  ? "bg-cyan text-obsidian"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10"
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-lg mx-auto">
            <p className="text-sm text-gray-500 dark:text-white/50">مقاله‌ای در این دسته نیست.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="group glass-card overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-cyan/10 to-cyan-50/10 flex items-center justify-center">
                  <span className="text-3xl opacity-20 group-hover:opacity-40 transition-opacity">📝</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">{post.category.name}</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/30">
                      <Calendar size={10} />
                      {faDate(post.createdAt)}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan transition-colors">{post.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-white/40 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-white/30">
                      <User size={10} />
                      {post.author}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-xs text-cyan/70 hover:text-cyan transition-colors">
                      ادامه مطلب
                      <ArrowLeft size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
