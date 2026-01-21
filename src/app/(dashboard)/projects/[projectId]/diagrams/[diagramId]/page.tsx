'use client';

/**
 * Diagram Editor Page
 * Full-featured split-pane editor for Mermaid diagrams
 *
 * Requirements:
 * - 3.4: Open Split_Pane_Editor with diagram loaded
 * - 4.1: Display Editor on left and Preview_Pane on right
 * - 4.6: Auto-save changes after 2 seconds of inactivity
 * - 6.2: Load most recently saved version when reopening
 * - 7.3: Display breadcrumb navigation showing current location
 * - 3.2: Toggle visibility setting (public/private)
 * - 4.1: Display "Copy Link" button when diagram is public
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BreadcrumbNav } from '@/features/navigation';
import { useDiagram, useUpdateDiagram } from '@/hooks/use-diagrams';
import { useProjects } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import { SplitPaneEditor, useAutoSave } from '@/features/editor';
import {
  VisibilityToggle,
  CopyLinkButton,
  useVisibility,
} from '@/features/sharing';

export default function DiagramEditorPage() {
  const params = useParams();
  const { toast } = useToast();

  const diagramId = params.diagramId as string;
  const projectId = params.projectId as string;

  const { data: diagram, isLoading, error } = useDiagram(diagramId);
  const { data: projects } = useProjects();
  const { updateDiagram } = useUpdateDiagram();

  // Find current project name for breadcrumb
  const currentProject = projects?.find((p) => p.id === projectId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error || !diagram) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load diagram
        </h2>
        <p className="text-muted-foreground max-w-sm mb-4">
          {error instanceof Error
            ? error.message
            : 'The diagram could not be found'}
        </p>
        <Button variant="outline" asChild>
          <a href={`/projects/${projectId}`}>Back to Project</a>
        </Button>
      </div>
    );
  }

  // Render the editor once diagram is loaded
  return (
    <DiagramEditorContent
      diagram={diagram}
      projectId={projectId}
      diagramId={diagramId}
      currentProject={currentProject}
      updateDiagram={updateDiagram}
      toast={toast}
    />
  );
}

// Separate component to handle the editor state after diagram is loaded
function DiagramEditorContent({
  diagram,
  projectId,
  diagramId,
  currentProject,
  updateDiagram,
  toast,
}: {
  diagram: {
    code: string;
    name: string;
    updated_at: string;
    is_public: boolean;
  };
  projectId: string;
  diagramId: string;
  currentProject?: { name: string };
  updateDiagram: (data: { id: string; code: string }) => void;
  toast: (options: {
    title: string;
    description: string;
    variant?: 'destructive';
  }) => void;
}) {
  // Initialize code with diagram data
  const [code, setCode] = useState(diagram.code);

  // Visibility hook
  const {
    isPublic,
    toggleVisibility,
    isSaving: isVisibilitySaving,
  } = useVisibility({
    initialIsPublic: diagram.is_public ?? false,
    diagramId,
    onSuccess: (newIsPublic) => {
      toast({
        title: newIsPublic ? 'Diagram is now public' : 'Diagram is now private',
        description: newIsPublic
          ? 'Anyone with the link can view this diagram'
          : 'Only you can view this diagram',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update visibility',
        description: error,
        variant: 'destructive',
      });
    },
  });

  // Auto-save handler
  const handleSave = useCallback(
    async (codeToSave: string) => {
      updateDiagram({ id: diagramId, code: codeToSave });
    },
    [diagramId, updateDiagram],
  );

  // Auto-save hook
  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave(code, {
    onSave: handleSave,
    enabled: true,
  });

  // Show toast on save error
  useEffect(() => {
    if (saveError) {
      toast({
        title: 'Failed to save',
        description: saveError,
        variant: 'destructive',
      });
    }
  }, [saveError, toast]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex flex-col gap-1">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNav
            items={[
              {
                label: currentProject?.name || 'Project',
                href: `/projects/${projectId}`,
              },
              { label: diagram.name },
            ]}
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Save className="h-3 w-3 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : (
              <span>
                Last saved: {new Date(diagram.updated_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="flex items-center gap-2">
          <VisibilityToggle
            isPublic={isPublic}
            onToggle={toggleVisibility}
            disabled={isVisibilitySaving}
          />
          <CopyLinkButton diagramId={diagramId} isPublic={isPublic} />
        </div>
      </header>

      {/* Editor */}
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
