'use client';

import { Lock, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisibilityToggleProps {
  isPublic: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

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
      className="gap-1.5"
    >
      {disabled ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPublic ? (
        <Globe className="h-4 w-4 text-green-500" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
      {isPublic ? 'Public' : 'Private'}
    </Button>
  );
}
