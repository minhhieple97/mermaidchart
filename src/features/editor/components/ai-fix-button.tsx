'use client';

/**
 * AI Fix Button Component
 * Button that appears when syntax errors are detected
 *
 * Requirements:
 * - 5.1: Display "Fix with AI" button when syntax error exists
 * - 5.6: Display loading indicator while processing
 */

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIFixButtonProps {
  /** Whether the button should be visible (only when hasError) */
  visible: boolean;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether AI is processing */
  isLoading: boolean;
}

/**
 * AI Fix button that appears when Mermaid syntax errors are detected
 */
export function AIFixButton({ visible, onClick, isLoading }: AIFixButtonProps) {
  if (!visible) return null;

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="gap-2"
      variant="secondary"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Fixing...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Fix with AI
        </>
      )}
    </Button>
  );
}
