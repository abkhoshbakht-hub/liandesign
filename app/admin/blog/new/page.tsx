import { listBlogCategoriesAdmin } from "@/lib/data/blog";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function NewBlogPost() {
  const categories = await listBlogCategoriesAdmin();
  return (
    <div className="space-y-6">
      <div className="text-sm font-bold text-white">مقاله جدید</div>
      <BlogPostForm categories={categories} />
    </div>
  );
}
