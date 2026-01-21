'use client';

/**
 * Project View Page
 * Displays all diagrams within a project
 *
 * Requirements:
 * - 2.4: Navigate to project view showing all diagrams
 * - 3.4: Display diagrams within a project
 * - 3.8: Display diagrams sorted by last modified date in descending order
 * - 7.3: Display breadcrumb navigation showing current location
 */

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiagramList } from '@/components/diagram-list';
import { CreateDiagramDialog } from '@/components/create-diagram-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BreadcrumbNav } from '@/features/navigation';
import { useDiagrams, useDeleteDiagram } from '@/hooks/use-diagrams';
import { useProjects } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import type { Diagram } from '@/types/database';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: diagrams, isLoading, error } = useDiagrams(projectId);
  const { data: projects } = useProjects();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState<string | null>(null);

  // Find current project name for breadcrumb
  const currentProject = projects?.find((p) => p.id === projectId);

  // Handle delete success callback
  const handleDeleteSuccess = useCallback(() => {
    toast({
      title: 'Diagram deleted',
      description: 'The diagram has been deleted successfully.',
    });
    setDeleteDialogOpen(false);
    setDiagramToDelete(null);
  }, [toast]);

  // Handle delete error callback
  const handleDeleteError = useCallback(
    (errorMessage: string) => {
      toast({
        title: 'Failed to delete diagram',
        description: errorMessage,
        variant: 'destructive',
      });
    },
    [toast],
  );

  const { deleteDiagram, isLoading: isDeleting } = useDeleteDiagram({
    onSuccess: handleDeleteSuccess,
    onError: handleDeleteError,
  });

  /**
   * Navigate to diagram editor when a diagram is clicked
   * Requirements: 3.4 - Open Split_Pane_Editor with diagram loaded
   */
  const handleDiagramClick = (diagram: Diagram) => {
    router.push(`/projects/${projectId}/diagrams/${diagram.id}`);
  };

  /**
   * Handle diagram deletion with confirmation
   * Requirements: 3.5, 3.6 - Prompt for confirmation and delete diagram
   */
  const handleDiagramDelete = (diagramId: string) => {
    setDiagramToDelete(diagramId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!diagramToDelete) return;
    deleteDiagram({ id: diagramToDelete });
  };

  /**
   * Handle successful diagram creation
   * Navigate to the new diagram editor
   */
  const handleDiagramCreated = (diagramId: string) => {
    router.push(`/projects/${projectId}/diagrams/${diagramId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load diagrams
        </h2>
        <p className="text-muted-foreground max-w-sm">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mt-4"
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav
          items={[{ label: currentProject?.name || 'Project' }]}
          className="mb-6"
        />

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentProject?.name || 'Diagrams'}
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your Mermaid diagrams
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Diagram
            </Button>
          </div>
        </div>

        <DiagramList
          diagrams={diagrams ?? []}
          onDiagramClick={handleDiagramClick}
          onDiagramDelete={handleDiagramDelete}
        />
      </div>

      <CreateDiagramDialog
        projectId={projectId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleDiagramCreated}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Diagram"
        description="Are you sure you want to delete this diagram? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
