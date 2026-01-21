'use client';

/**
 * Diagram Card Component
 * Displays a single diagram with name, last modified date, and actions
 *
 * Requirements:
 * - 3.4: Click on diagram to open Split_Pane_Editor
 * - 3.5: Delete diagram button with confirmation
 */

import { FileText, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Diagram } from '@/types/database';

export interface DiagramCardProps {
  diagram: Diagram;
  onClick: () => void;
  onDelete: () => void;
  onRename?: () => void;
}

export function DiagramCard({
  diagram,
  onClick,
  onDelete,
  onRename,
}: DiagramCardProps) {
  const formattedDate = new Date(
    diagram.updated_at ?? diagram.created_at ?? new Date(),
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h3 className="font-semibold truncate">{diagram.name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRename && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Last modified {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}
