'use client';

/**
 * TanStack Query hooks for diagram management
 * Requirements: 3.2, 3.7, 3.8
 *
 * These hooks provide:
 * - useDiagrams: Fetch all diagrams for a project, sorted by updated_at descending
 * - useDiagram: Fetch a single diagram by ID
 * - useCreateDiagram: Create a new diagram with cache invalidation
 * - useUpdateDiagram: Update a diagram with cache invalidation
 * - useDeleteDiagram: Delete a diagram with cache invalidation
 * - useInvalidateDiagram: Invalidate diagram cache (for visibility changes)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  createDiagramAction,
  updateDiagramAction,
  deleteDiagramAction,
} from '@/actions/diagrams';

// ============================================================================
// Query Keys
// ============================================================================

export const diagramKeys = {
  all: ['diagrams'] as const,
  lists: () => [...diagramKeys.all, 'list'] as const,
  list: (projectId: string) => [...diagramKeys.lists(), projectId] as const,
  details: () => [...diagramKeys.all, 'detail'] as const,
  detail: (id: string) => [...diagramKeys.details(), id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all diagrams for a specific project
 * Diagrams are sorted by updated_at in descending order (most recent first)
 *
 * Requirements: 3.8 - Display diagrams sorted by last modified date in descending order
 */
export function useDiagrams(projectId: string) {
  return useQuery({
    queryKey: diagramKeys.list(projectId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch a single diagram by ID
 */
export function useDiagram(id: string) {
  return useQuery({
    queryKey: diagramKeys.detail(id),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new diagram
 * Integrates with next-safe-action useAction hook
 * Handles cache invalidation on success
 *
 * Requirements: 3.1, 3.2 - Create diagram with default template code
 */
export function useCreateDiagram() {
  const queryClient = useQueryClient();
  const { execute, status, result } = useAction(createDiagramAction, {
    onSuccess: (data) => {
      if (data?.data?.diagram) {
        queryClient.invalidateQueries({
          queryKey: diagramKeys.list(data.data.diagram.project_id),
        });
      }
    },
  });

  return {
    createDiagram: execute,
    isLoading: status === 'executing',
    result,
  };
}

/**
 * Update an existing diagram
 * Integrates with next-safe-action useAction hook
 * Handles cache invalidation on success
 *
 * Requirements: 3.7 - Rename diagram with immediate reflection
 */
export function useUpdateDiagram() {
  const queryClient = useQueryClient();
  const { execute, status, result } = useAction(updateDiagramAction, {
    onSuccess: (data) => {
      if (data?.data?.diagram) {
        const diagram = data.data.diagram;
        queryClient.invalidateQueries({
          queryKey: diagramKeys.detail(diagram.id),
        });
        queryClient.invalidateQueries({
          queryKey: diagramKeys.list(diagram.project_id),
        });
      }
    },
  });

  return {
    updateDiagram: execute,
    isLoading: status === 'executing',
    result,
  };
}

/**
 * Delete a diagram
 * Integrates with next-safe-action useAction hook
 * Handles cache invalidation on success
 *
 * Requirements: 3.6 - Remove diagram from project
 */
export function useDeleteDiagram(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const queryClient = useQueryClient();
  const { execute, status, result } = useAction(deleteDiagramAction, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.lists() });
      if (data?.data?.success) {
        options?.onSuccess?.();
      } else if (data?.data?.error) {
        options?.onError?.(data.data.error);
      }
    },
  });

  return {
    deleteDiagram: execute,
    isLoading: status === 'executing',
    result,
  };
}

/**
 * Invalidate diagram cache
 * Useful for visibility changes that happen outside the normal update flow
 *
 * Requirements: 3.2 - Visibility toggle should reflect immediately
 */
export function useInvalidateDiagram() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    (diagramId: string) => {
      queryClient.invalidateQueries({
        queryKey: diagramKeys.detail(diagramId),
      });
    },
    [queryClient],
  );

  return { invalidate };
}
