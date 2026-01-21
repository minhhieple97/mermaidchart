'use client';

/**
 * Copy Link Button Component
 * Copy shareable link for public diagrams
 *
 * Requirements:
 * - 4.1: Display "Copy Link" button when diagram is public
 * - 4.2: Copy share URL to clipboard on click
 * - 4.3: Display confirmation message on copy
 * - 4.4: Hide button when diagram is private
 * - 4.5: Share URL format /share/{diagramId}
 */

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyLinkButtonProps {
  /** Diagram ID for generating share URL */
  diagramId: string;
  /** Whether the diagram is public */
  isPublic: boolean;
}

/**
 * Button to copy shareable link for public diagrams
 */
export function CopyLinkButton({ diagramId, isPublic }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  // Don't render if diagram is private
  if (!isPublic) {
    return null;
  }

  const handleCopy = async () => {
    const shareUrl = `${window.location.origin}/share/${diagramId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          <span>Copy Link</span>
        </>
      )}
    </Button>
  );
}
