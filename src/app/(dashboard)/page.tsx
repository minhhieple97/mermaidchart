'use client';

/**
 * Dashboard Page
 * Displays the user's projects with loading and error states
 *
 * Requirements:
 * - 7.1: Display dashboard with list of projects when user logs in
 * - 7.2: Display empty state with prompt to create project when no projects
 * - 7.5: Project cards show name, diagram count, and last modified date
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectList } from '@/components/project-list';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types/database';

export default function DashboardPage() {
  const router = useRouter();
  const { data: projects, isLoading, error } = useProjects();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Handle delete success callback
  const handleDeleteSuccess = useCallback(() => {
    toast({
      title: 'Project deleted',
      description: 'The project and all its diagrams have been deleted.',
    });
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  }, [toast]);

  // Handle delete error callback
  const handleDeleteError = useCallback(
    (errorMessage: string) => {
      toast({
        title: 'Failed to delete project',
        description: errorMessage,
        variant: 'destructive',
      });
    },
    [toast],
  );

  const { deleteProject, isLoading: isDeleting } = useDeleteProject({
    onSuccess: handleDeleteSuccess,
    onError: handleDeleteError,
  });

  /**
   * Navigate to project view when a project is clicked
   * Requirements: 2.4 - Navigate to project view showing all diagrams
   */
  const handleProjectClick = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  /**
   * Handle project deletion with confirmation
   * Requirements: 2.5, 2.6 - Prompt for confirmation and delete project
   */
  const handleProjectDelete = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;
    deleteProject({ id: projectToDelete });
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
          Failed to load projects
        </h2>
        <p className="text-muted-foreground max-w-sm">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage your Mermaid diagram projects
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <ProjectList
          projects={projects ?? []}
          onProjectClick={handleProjectClick}
          onProjectDelete={handleProjectDelete}
        />
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will also delete all diagrams within it. This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
