'use client';

/**
 * Diagram List Component
 * Displays a grid of diagram cards or an empty state when no diagrams exist
 *
 * Requirements:
 * - 3.4: Display diagrams within a project
 * - 3.8: Display diagrams sorted by last modified date in descending order
 */

import { FileText } from 'lucide-react';
import { DiagramCard } from '@/components/diagram-card';
import type { Diagram } from '@/types/database';

export interface DiagramListProps {
  diagrams: Diagram[];
  onDiagramClick: (diagram: Diagram) => void;
  onDiagramDelete: (diagramId: string) => void;
  onDiagramRename?: (diagram: Diagram) => void;
}

/**
 * Empty state component shown when project has no diagrams
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No diagrams yet</h3>
      <p className="text-muted-foreground max-w-sm">
        Create your first diagram to start building Mermaid charts. Click the
        &quot;New Diagram&quot; button above to get started.
      </p>
    </div>
  );
}

export function DiagramList({
  diagrams,
  onDiagramClick,
  onDiagramDelete,
  onDiagramRename,
}: DiagramListProps) {
  // Show empty state when no diagrams
  if (!diagrams || diagrams.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {diagrams.map((diagram) => (
        <DiagramCard
          key={diagram.id}
          diagram={diagram}
          onClick={() => onDiagramClick(diagram)}
          onDelete={() => onDiagramDelete(diagram.id)}
          onRename={
            onDiagramRename ? () => onDiagramRename(diagram) : undefined
          }
        />
      ))}
    </div>
  );
}
