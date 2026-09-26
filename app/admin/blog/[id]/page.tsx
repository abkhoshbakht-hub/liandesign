import { notFound } from "next/navigation";
import { getBlogPostAdmin, listBlogCategoriesAdmin } from "@/lib/data/blog";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditBlogPost({ params }: { params: { id: string } }) {
  const [post, categories] = await Promise.all([getBlogPostAdmin(params.id), listBlogCategoriesAdmin()]);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="text-sm font-bold text-white">ویرایش مقاله</div>
      <BlogPostForm
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          body: post.body,
          categoryId: post.categoryId,
          status: post.status,
        }}
      />
    </div>
  );
}
