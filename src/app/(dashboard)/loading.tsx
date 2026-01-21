import { Skeleton } from '@/components/ui/skeleton';

/**
 * Dashboard loading skeleton
 * Shows while projects list is loading
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Project cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} delay={i * 100} />
        ))}
      </div>
    </div>
  );
}

function ProjectCardSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-xl border bg-white p-5 space-y-4 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon and title */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}
