import { Skeleton } from '@/components/ui/skeleton';

/**
 * Project page loading skeleton
 * Shows while diagrams list is loading
 */
export default function ProjectLoading() {
  return (
    <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Diagram cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <DiagramCardSkeleton key={i} delay={i * 100} />
        ))}
      </div>
    </div>
  );
}

function DiagramCardSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-xl border bg-white overflow-hidden shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Preview area */}
      <div className="aspect-[4/3] bg-gray-50 p-4">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
      {/* Card content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
