'use client';

/**
 * Visibility Hook
 * Manages diagram visibility state with optimistic updates
 *
 * Requirements:
 * - 3.2: Toggle visibility setting
 * - 3.6: Persist change immediately
 */

import { useState, useCallback } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { toggleVisibilityAction } from '../actions/visibility.actions';

interface UseVisibilityOptions {
  /** Initial visibility state */
  initialIsPublic: boolean;
  /** Diagram ID */
  diagramId: string;
  /** Callback on successful toggle */
  onSuccess?: (isPublic: boolean) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

interface UseVisibilityResult {
  /** Current visibility state */
  isPublic: boolean;
  /** Toggle visibility */
  toggleVisibility: () => void;
  /** Whether save is in progress */
  isSaving: boolean;
  /** Error message if save failed */
  error: string | null;
}

/**
 * Hook for managing diagram visibility with optimistic updates
 */
export function useVisibility(
  options: UseVisibilityOptions,
): UseVisibilityResult {
  const { initialIsPublic, diagramId, onSuccess, onError } = options;

  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [error, setError] = useState<string | null>(null);

  const { execute, isPending } = useAction(toggleVisibilityAction, {
    onSuccess: (result) => {
      if (result.data?.isPublic !== undefined) {
        setIsPublic(result.data.isPublic);
        setError(null);
        onSuccess?.(result.data.isPublic);
      }
    },
    onError: (err) => {
      // Revert optimistic update
      setIsPublic(!isPublic);
      const errorMessage =
        err.error.serverError || 'Failed to update visibility';
      setError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const toggleVisibility = useCallback(() => {
    const newValue = !isPublic;
    // Optimistic update
    setIsPublic(newValue);
    setError(null);
    execute({ diagramId, isPublic: newValue });
  }, [isPublic, diagramId, execute]);

  return {
    isPublic,
    toggleVisibility,
    isSaving: isPending,
    error,
  };
}
