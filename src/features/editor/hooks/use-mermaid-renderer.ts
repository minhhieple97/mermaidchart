'use client';

/**
 * Mermaid Renderer Hook
 * Handles debounced rendering of Mermaid diagrams with error detection
 *
 * Requirements:
 * - 4.2: Update preview within 500ms of last keystroke
 * - 4.3: Display rendered diagram for valid syntax
 * - 4.4: Display error indicator for invalid syntax without crashing
 *
 * Optimizations (vercel-react-best-practices):
 * - rerender-lazy-state-init: Lazy initialization for expensive state
 * - js-cache-function-results: Module-level caching for mermaid instance
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { EDITOR_CONSTANTS } from '../constants';
import type { MermaidRenderResult } from '../types/editor.types';

// Module-level cache for mermaid instance (js-cache-function-results)
let mermaidInstance: typeof import('mermaid').default | null = null;
let mermaidInitPromise: Promise<typeof import('mermaid').default> | null = null;

// Singleton pattern with promise caching to prevent duplicate imports
async function getMermaid() {
  if (mermaidInstance) return mermaidInstance;

  // Prevent duplicate imports during concurrent calls
  if (!mermaidInitPromise) {
    mermaidInitPromise = import('mermaid').then((mod) => {
      mermaidInstance = mod.default;
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });
      return mermaidInstance;
    });
  }

  return mermaidInitPromise;
}

/**
 * Hook for rendering Mermaid diagrams with debouncing and error detection
 * @param code - The Mermaid code to render
 * @returns MermaidRenderResult with svg, error, isRendering, and hasError
 */
export function useMermaidRenderer(code: string): MermaidRenderResult {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderIdRef = useRef(0);

  const renderDiagram = useCallback(
    async (diagramCode: string, renderId: number) => {
      if (!diagramCode.trim()) {
        setSvg(null);
        setError(null);
        return;
      }

      setIsRendering(true);

      try {
        const mermaid = await getMermaid();

        // First, validate the syntax
        await mermaid.parse(diagramCode);

        // If validation passes, render the diagram
        const uniqueId = `mermaid-preview-${renderId}-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(
          uniqueId,
          diagramCode,
        );

        // Only update state if this is still the latest render
        if (renderId === renderIdRef.current) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        // Only update state if this is still the latest render
        if (renderId === renderIdRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          setSvg(null);
        }
      } finally {
        if (renderId === renderIdRef.current) {
          setIsRendering(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    // Increment render ID to track latest render
    renderIdRef.current += 1;
    const currentRenderId = renderIdRef.current;

    // Debounce the rendering
    const timer = setTimeout(() => {
      renderDiagram(code, currentRenderId);
    }, EDITOR_CONSTANTS.DEBOUNCE_RENDER_MS);

    return () => clearTimeout(timer);
  }, [code, renderDiagram]);

  return {
    svg,
    error,
    isRendering,
    hasError: error !== null,
  };
}
