import { Skeleton } from '@/components/ui/skeleton';

// Static widths for code line skeletons (hoisted outside component for purity)
const CODE_LINE_WIDTHS = [
  'w-3/4',
  'w-1/2',
  'w-2/3',
  'w-5/6',
  'w-1/3',
  'w-4/5',
  'w-2/5',
  'w-3/5',
  'w-1/2',
  'w-2/3',
  'w-1/4',
  'w-3/4',
];

/**
 * Diagram editor loading skeleton
 * Shows while editor is initializing
 */
export default function DiagramEditorLoading() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Header skeleton */}
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status and actions */}
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </header>

      {/* Editor area skeleton */}
      <main className="flex-1 flex overflow-hidden">
        {/* Code editor pane */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="h-10 border-b px-4 flex items-center justify-between bg-gray-50">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            {CODE_LINE_WIDTHS.map((width, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-6" />
                <Skeleton className={`h-4 ${width}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Preview pane */}
        <div className="w-1/2 flex flex-col">
          <div className="h-10 border-b px-4 flex items-center justify-between bg-gray-50">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-50/50">
            <div className="space-y-4 text-center">
              <Skeleton className="h-32 w-48 mx-auto rounded-lg" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
