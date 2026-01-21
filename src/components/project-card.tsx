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
function formatDate(dateString: string): string {
  const date = new Date(dateString);
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
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold truncate pr-2">
            {project.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            aria-label={`Delete project ${project.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="flex flex-col gap-1">
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
