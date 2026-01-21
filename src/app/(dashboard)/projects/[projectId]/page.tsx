'use client';

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Home, ChevronRight, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiagramList } from '@/components/diagram-list';
import { CreateDiagramDialog } from '@/components/create-diagram-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
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

  const currentProject = projects?.find((p) => p.id === projectId);

  const handleDeleteSuccess = useCallback(() => {
    toast({
      title: 'Diagram deleted',
      description: 'The diagram has been deleted successfully.',
    });
    setDeleteDialogOpen(false);
    setDiagramToDelete(null);
  }, [toast]);

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

  const handleDiagramClick = (diagram: Diagram) => {
    router.push(`/projects/${projectId}/diagrams/${diagram.id}`);
  };

  const handleDiagramDelete = (diagramId: string) => {
    setDiagramToDelete(diagramId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!diagramToDelete) return;
    deleteDiagram({ id: diagramToDelete });
  };

  const handleDiagramCreated = (diagramId: string) => {
    router.push(`/projects/${projectId}/diagrams/${diagramId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Failed to load diagrams
        </h2>
        <p className="text-gray-500 max-w-sm">
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
      <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-6">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <span className="font-medium text-gray-900">
            {currentProject?.name || 'Project'}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentProject?.name || 'Diagrams'}
              </h1>
              <p className="text-gray-500 mt-0.5">
                {diagrams?.length || 0} diagram
                {diagrams?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Diagram
          </Button>
        </div>

        {/* Diagram List */}
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
