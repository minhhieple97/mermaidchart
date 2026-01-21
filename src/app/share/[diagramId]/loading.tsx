import { Skeleton } from '@/components/ui/skeleton';

/**
 * Share page loading skeleton
 * Shows while public diagram is loading
 */
export default function ShareLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </header>

      {/* Diagram viewer */}
      <div
        className="flex items-center justify-center p-8"
        style={{ minHeight: 'calc(100vh - 56px)' }}
      >
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-xl border shadow-sm p-8">
            {/* Diagram placeholder */}
            <div className="aspect-[16/10] flex items-center justify-center">
              <div className="space-y-6 text-center w-full max-w-md">
                <Skeleton className="h-40 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
