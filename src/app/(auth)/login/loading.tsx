import { Skeleton } from '@/components/ui/skeleton';

/**
 * Login page loading skeleton
 */
export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <Skeleton className="h-9 w-48 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Footer link */}
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}
