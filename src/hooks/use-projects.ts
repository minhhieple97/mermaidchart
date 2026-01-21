'use client';

/**
 * TanStack Query hooks for project management
 * Requirements: 2.2, 2.7, 2.8
 *
 * These hooks provide:
 * - useProjects: Fetch all projects with diagram count, sorted by updated_at descending
 * - useCreateProject: Create a new project with cache invalidation
 * - useUpdateProject: Update a project with cache invalidation
 * - useDeleteProject: Delete a project with cache invalidation
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { createClient } from '@/lib/supabase/client';
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from '@/actions/projects';

// ============================================================================
// Query Keys
// ============================================================================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all projects for the authenticated user with diagram count
 * Projects are sorted by updated_at in descending order (most recent first)
 *
 * Requirements: 2.8 - Display projects sorted by last modified date in descending order
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*, diagrams(count)')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Project type
      return data.map((project) => ({
        ...project,
        diagrams: project.diagrams as unknown as Array<{ count: number }>,
      }));
    },
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new project
 * Integrates with next-safe-action useAction hook
 * Handles cache invalidation on success
 *
 * Requirements: 2.2 - Create project with valid name
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { execute, status, result } = useAction(createProjectAction, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  return {
    createProject: execute,
    isLoading: status === 'executing',
    result,
  };
}

/**
 * Update an existing project
 * Integrates with next-safe-action useAction hook
 * Handles cache invalidation on success
 *
 * Requirements: 2.7 - Edit project name with immediate reflection
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { execute, status, result } = useAction(updateProjectAction, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  return {
    updateProject: execute,
    isLoading: status === 'executing',
    result,
  };
}

/**
 * Delete a project
 * Integrates with next-safe-action useAction hook
 * Handles cache invalidation on success
 *
 * Requirements: 2.6 - Delete project and all associated diagrams
 */
export function useDeleteProject(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const queryClient = useQueryClient();
  const { execute, status, result } = useAction(deleteProjectAction, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      options?.onSuccess?.();
    },
    onError: ({ error }) => {
      options?.onError?.(error.serverError ?? 'Failed to delete project');
    },
  });

  return {
    deleteProject: execute,
    isLoading: status === 'executing',
    result,
  };
}
