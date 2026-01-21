'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SplitPaneEditor,
  useDiagramEditor,
  EditorHeader,
} from '@/features/editor';

export default function DiagramEditorPage() {
  const params = useParams();
  const diagramId = params.diagramId as string;
  const projectId = params.projectId as string;

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
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-600 font-medium">Failed to load diagram</p>
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}`}>Back to Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
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
      <main className="flex-1 overflow-hidden">
        <SplitPaneEditor
          code={code}
          onCodeChange={setCode}
          diagramName={diagram.name}
        />
      </main>
    </div>
  );
}
