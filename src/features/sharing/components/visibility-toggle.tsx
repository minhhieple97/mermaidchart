'use client';

/**
 * Visibility Toggle Component
 * Toggle between public and private diagram visibility
 *
 * Requirements:
 * - 3.1: Display current visibility state
 * - 3.2: Toggle visibility setting
 * - 3.5: Display current visibility state clearly
 */

import { Lock, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisibilityToggleProps {
  /** Current visibility state */
  isPublic: boolean;
  /** Callback when visibility changes */
  onToggle: () => void;
  /** Whether toggle is disabled (during save) */
  disabled?: boolean;
}

/**
 * Toggle button for diagram visibility
 */
export function VisibilityToggle({
  isPublic,
  onToggle,
  disabled = false,
}: VisibilityToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      disabled={disabled}
      className="gap-2"
    >
      {disabled ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPublic ? (
        <Globe className="h-4 w-4 text-green-500" />
      ) : (
        <Lock className="h-4 w-4 text-muted-foreground" />
      )}
      <span>{isPublic ? 'Public' : 'Private'}</span>
    </Button>
  );
}
