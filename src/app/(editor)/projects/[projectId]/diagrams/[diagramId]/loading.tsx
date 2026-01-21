import { Skeleton } from '@/components/ui/skeleton';

export default function DiagramLoading() {
  return (
    <div className="flex flex-col h-screen">
      {/* Editor Header Skeleton */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-32" />
          <div className="h-6 w-px bg-gray-200" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Split Pane Skeleton */}
      <div className="flex-1 flex">
        {/* Code Editor Skeleton */}
        <div className="w-1/2 flex flex-col border-r">
          <div className="h-11 px-4 flex items-center border-b bg-gray-100">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        {/* Preview Skeleton */}
        <div className="w-1/2 flex flex-col">
          <div className="h-11 px-4 flex items-center justify-between border-b bg-gray-100">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-48 w-64 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
