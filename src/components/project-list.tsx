'use client';

/**
 * Project List Component
 * Displays a grid of project cards or an empty state when no projects exist
 *
 * Requirements:
 * - 7.1: Display dashboard with list of projects when user logs in
 * - 7.2: Display empty state with prompt to create project when no projects
 */

import { FolderPlus } from 'lucide-react';
import { ProjectCard } from '@/components/project-card';
import type { Project } from '@/types/database';

export interface ProjectListProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
}

/**
 * Empty state component shown when user has no projects
 * Requirements: 7.2 - Display empty state with prompt to create project
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FolderPlus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-muted-foreground max-w-sm">
        Create your first project to start building Mermaid diagrams. Click the
        &quot;New Project&quot; button above to get started.
      </p>
    </div>
  );
}

export function ProjectList({
  projects,
  onProjectClick,
  onProjectDelete,
}: ProjectListProps) {
  // Show empty state when no projects
  if (!projects || projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          onDelete={() => onProjectDelete(project.id)}
        />
      ))}
    </div>
  );
}
