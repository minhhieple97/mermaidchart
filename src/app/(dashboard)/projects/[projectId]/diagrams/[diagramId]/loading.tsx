import { Skeleton } from '@/components/ui/skeleton';

export default function DiagramLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Breadcrumb & Toolbar Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Split Pane Skeleton */}
      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col border-r">
          <div className="h-11 px-4 flex items-center border-b bg-gray-100">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
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
