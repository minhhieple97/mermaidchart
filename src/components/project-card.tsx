'use client';

/**
 * Project Card Component
 * Displays a single project with name, diagram count, and last modified date
 * Uses shadcn Card component
 *
 * Requirements: 7.5 - Project cards show name, diagram count, and last modified date
 */

import { Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/database';

export interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

/**
 * Formats a date string to a human-readable format
 */
function formatDate(dateString: string | null): string {
  const date = new Date(dateString ?? new Date());
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Gets the diagram count from the project
 * Handles the nested count structure from Supabase query
 */
function getDiagramCount(project: Project): number {
  // The diagrams field from Supabase select with count comes as an array with count
  const diagrams = (project as unknown as { diagrams?: { count: number }[] })
    .diagrams;
  if (diagrams && Array.isArray(diagrams) && diagrams.length > 0) {
    return diagrams[0].count;
  }
  return project.diagram_count ?? 0;
}

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const diagramCount = getDiagramCount(project);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    onDelete();
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98] touch-manipulation"
      onClick={onClick}
    >
      <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold truncate flex-1">
            {project.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive flex-shrink-0 -mr-2"
            onClick={handleDelete}
            aria-label={`Delete project ${project.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <CardDescription className="flex flex-col gap-1 text-sm">
          <span>
            {diagramCount} {diagramCount === 1 ? 'diagram' : 'diagrams'}
          </span>
          <span className="text-xs">
            Last modified: {formatDate(project.updated_at)}
          </span>
        </CardDescription>
      </CardContent>
    </Card>
  );
}
