import { Skeleton } from "@/components/ui/skeleton";

export default function WebsitesLoading() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <Skeleton className="h-8 w-64 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    </section>
  );
}
