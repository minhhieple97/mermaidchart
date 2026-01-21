'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyLinkButtonProps {
  diagramId: string;
  isPublic: boolean;
}

export function CopyLinkButton({ diagramId, isPublic }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!isPublic) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${diagramId}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  );
}
