import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
