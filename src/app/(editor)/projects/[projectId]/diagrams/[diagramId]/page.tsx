'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SplitPaneEditor,
  EditorHeader,
  useDiagramEditor,
} from '@/features/editor';

export default function DiagramEditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const diagramId = params.diagramId as string;

  const {
    diagram,
    isLoading,
    error,
    currentProject,
    code,
    setCode,
    isSaving,
    lastSaved,
    isPublic,
    toggleVisibility,
    isVisibilitySaving,
    copied,
    copyLink,
    signOut,
    isSigningOut,
  } = useDiagramEditor({ diagramId, projectId });

  if (isLoading) {
    return <EditorSkeleton />;
  }

  if (error || !diagram) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Failed to load diagram
        </h2>
        <p className="text-gray-500 max-w-sm mb-4">
          {error instanceof Error
            ? error.message
            : 'The diagram could not be found or you do not have access.'}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader
        projectId={projectId}
        projectName={currentProject?.name}
        diagramName={diagram.name}
        updatedAt={diagram.updated_at}
        isSaving={isSaving}
        lastSaved={lastSaved}
        isPublic={isPublic}
        isVisibilitySaving={isVisibilitySaving}
        copied={copied}
        isSigningOut={isSigningOut}
        onToggleVisibility={toggleVisibility}
        onCopyLink={copyLink}
        onSignOut={signOut}
      />
      <div className="flex-1 overflow-hidden">
        <SplitPaneEditor
          code={code}
          onCodeChange={setCode}
          diagramName={diagram.name}
        />
      </div>
    </div>
  );
}

function EditorSkeleton() {
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
