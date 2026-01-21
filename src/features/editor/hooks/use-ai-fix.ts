'use client';

/**
 * AI Fix Hook
 * Handles AI-powered Mermaid syntax fixing
 *
 * Requirements:
 * - 5.2: Analyze code and generate corrected version
 * - 5.6: Display loading indicator while processing
 * - 5.7: Display error message if fix fails
 */

import { useAction } from 'next-safe-action/hooks';
import { fixMermaidSyntaxAction } from '../actions/ai.actions';

/**
 * Hook for AI-powered syntax fixing
 * @returns AI fix state and handlers
 */
export function useAIFix() {
  const { execute, status, result, reset } = useAction(fixMermaidSyntaxAction);

  return {
    /** Execute the AI fix */
    fixSyntax: execute,
    /** Whether the AI is processing */
    isLoading: status === 'executing',
    /** The fixed code (if successful) */
    fixedCode: result?.data?.fixedCode,
    /** Explanation of the fix (if successful) */
    explanation: result?.data?.explanation,
    /** Error message (if failed) */
    error: result?.serverError || result?.data?.error,
    /** Reset the state */
    reset,
  };
}
