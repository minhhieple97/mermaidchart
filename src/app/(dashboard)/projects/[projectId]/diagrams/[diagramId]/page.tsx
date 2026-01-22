'use client';

import { useParams } from 'next/navigation';
import { Loader2, Save, Check, Lock, Globe, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BreadcrumbNav } from '@/features/navigation';
import { SplitPaneEditor, useDiagramEditor } from '@/features/editor';

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
  } = useDiagramEditor({ diagramId, projectId });

  if (isLoading) {
    return <EditorSkeleton />;
  }

  if (error || !diagram) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <BreadcrumbNav
          items={[
            {
              label: currentProject?.name || 'Project',
              href: `/projects/${projectId}`,
            },
            { label: diagram.name },
          ]}
        />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            {isSaving ? (
              <>
                <Save className="h-3.5 w-3.5 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="hidden md:inline">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
                <span className="md:hidden">Saved</span>
              </>
            ) : (
              <span className="hidden md:inline">
                Last saved {new Date(diagram.updated_at).toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVisibility}
            disabled={isVisibilitySaving}
            className="gap-1.5 h-8"
          >
            {isVisibilitySaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPublic ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isPublic ? 'Public' : 'Private'}
            </span>
          </Button>
          {isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="gap-1.5 h-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </Button>
          )}
        </div>
      </div>
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
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
