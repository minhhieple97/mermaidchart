'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, FolderKanban } from 'lucide-react';
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

  const handleDeleteSuccess = useCallback(() => {
    toast({
      title: 'Project deleted',
      description: 'The project and all its diagrams have been deleted.',
    });
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  }, [toast]);

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

  const handleProjectClick = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const handleProjectDelete = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;
    deleteProject({ id: projectToDelete });
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
          Failed to load projects
        </h2>
        <p className="text-gray-500 max-w-sm">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-500 mt-0.5">
                {projects?.length || 0} project
                {projects?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Project List */}
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
