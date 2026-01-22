'use client';

/**
 * Auto-Save Hook
 * Handles automatic saving of diagram code with debouncing
 *
 * Requirements:
 * - 4.6: Auto-save changes after 2 seconds of inactivity
 * - 6.1: Persist changes to database after auto-save triggers
 *
 * Optimizations (vercel-react-best-practices):
 * - rerender-functional-setstate: Using functional setState for stable callbacks
 * - rerender-defer-reads: Deferred state reads to usage point
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { EDITOR_CONSTANTS } from '../constants';
import type { AutoSaveState } from '../types/editor.types';

interface UseAutoSaveOptions {
  /** Callback to save the value */
  onSave: (value: string) => Promise<void>;
  /** Whether auto-save is enabled */
  enabled?: boolean;
}

/**
 * Hook for auto-saving content with debouncing
 * @param value - The current value to save
 * @param options - Configuration options
 * @returns AutoSaveState with isSaving, lastSaved, and error
 */
export function useAutoSave(
  value: string,
  options: UseAutoSaveOptions,
): AutoSaveState {
  const { onSave, enabled = true } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track the initial value to avoid saving on mount
  const initialValueRef = useRef(value);
  const hasChangedRef = useRef(false);
  const previousValueRef = useRef(value);
  // Store onSave in ref to avoid dependency changes (advanced-use-latest pattern)
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Track if value has changed from initial
  useEffect(() => {
    if (value !== initialValueRef.current) {
      hasChangedRef.current = true;
    }
  }, [value]);

  const save = useCallback(
    async (valueToSave: string) => {
      if (!enabled || !hasChangedRef.current) return;

      setIsSaving(true);
      setError(null);

      try {
        await onSaveRef.current(valueToSave);
        setLastSaved(new Date());
        previousValueRef.current = valueToSave;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save';
        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    // Don't save if disabled or value hasn't changed from previous save
    if (!enabled || value === previousValueRef.current) return;

    const timer = setTimeout(() => {
      save(value);
    }, EDITOR_CONSTANTS.AUTO_SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [value, save, enabled]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}
