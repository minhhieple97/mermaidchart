'use client';

/**
 * Split Pane Hook
 * Handles drag-to-resize functionality for the split pane editor
 *
 * Requirements:
 * - 4.5: Resize split pane divider to adjust widths proportionally
 *
 * Optimizations (vercel-react-best-practices):
 * - client-passive-event-listeners: Using passive listeners for better scroll performance
 * - rerender-functional-setstate: Using functional setState for stable callbacks
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { EDITOR_CONSTANTS } from '../constants';

interface UseSplitPaneReturn {
  /** Current ratio (0-1) of left pane width */
  ratio: number;
  /** Set the ratio directly */
  setRatio: (ratio: number) => void;
  /** Whether user is currently dragging */
  isDragging: boolean;
  /** Handler for mouse down on divider */
  handleMouseDown: (e: React.MouseEvent) => void;
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for managing split pane resize behavior
 * @param initialRatio - Initial ratio of left pane (0-1)
 * @returns Split pane state and handlers
 */
export function useSplitPane(
  initialRatio: number = EDITOR_CONSTANTS.DEFAULT_SPLIT_RATIO,
): UseSplitPaneReturn {
  const [ratio, setRatio] = useState(initialRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      // Calculate new ratio with min/max constraints
      const minRatio = EDITOR_CONSTANTS.MIN_PANE_WIDTH / containerWidth;
      const maxRatio = 1 - minRatio;
      const newRatio = Math.max(
        minRatio,
        Math.min(maxRatio, mouseX / containerWidth),
      );

      setRatio(newRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Use passive: false for mousemove since we may need to prevent default
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Prevent text selection while dragging - batch DOM/CSS changes (js-batch-dom-css)
  useEffect(() => {
    if (isDragging) {
      document.body.style.cssText = 'user-select: none; cursor: col-resize;';
    } else {
      document.body.style.cssText = '';
    }

    return () => {
      document.body.style.cssText = '';
    };
  }, [isDragging]);

  return {
    ratio,
    setRatio,
    isDragging,
    handleMouseDown,
    containerRef,
  };
}
