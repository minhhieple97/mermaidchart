'use client';

/**
 * Diagram Viewer Component
 * Read-only Mermaid diagram viewer for public share pages
 *
 * Requirements:
 * - 5.1: Display rendered diagram
 * - 5.2: Read-only mode without editor
 */

import { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertCircle } from 'lucide-react';

interface DiagramViewerProps {
  /** Mermaid code to render */
  code: string;
  /** Diagram name for display */
  name: string;
}

/**
 * Read-only diagram viewer with Mermaid rendering
 */
export function DiagramViewer({ code, name }: DiagramViewerProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        // Generate unique ID for this render
        const id = `mermaid-${Date.now()}`;

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, code);

        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to render diagram';
          setError(errorMessage);
          setSvg(null);
        }
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

  // Loading state
  if (isRendering) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Rendering diagram...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-destructive">Rendering Error</h3>
          <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-6">{name}</h1>
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-sm p-6 max-w-full overflow-auto"
        dangerouslySetInnerHTML={{ __html: svg || '' }}
      />
    </div>
  );
}
