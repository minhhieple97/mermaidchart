'use client';

/**
 * Diagram Viewer Component
 * Read-only Mermaid diagram viewer for public share pages
 *
 * Requirements:
 * - 5.1: Display rendered diagram
 * - 5.2: Read-only mode without editor
 */

import { memo, useEffect, useState, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagramViewerProps {
  code: string;
  name: string;
}

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 1;

/**
 * Loading state component
 */
const LoadingState = memo(function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin" />
        <span className="text-lg">Rendering diagram...</span>
      </div>
    </div>
  );
});

/**
 * Error state component
 */
const ErrorState = memo(function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="flex flex-col items-center gap-4 max-w-lg text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold text-destructive">
          Unable to render diagram
        </h3>
        <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </div>
  );
});

/**
 * Zoom controls component
 */
const ZoomControls = memo(function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onDownload,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg border p-1 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM}
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[4rem] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM}
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border" />
      <Button variant="ghost" size="icon" onClick={onReset} title="Reset zoom">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDownload}
        title="Download as PNG"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
});

/**
 * Read-only diagram viewer with Mermaid rendering
 */
export const DiagramViewer = memo(function DiagramViewer({
  code,
  name,
}: DiagramViewerProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        const id = `mermaid-${Date.now()}`;
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

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
  }, []);

  const handleDownload = useCallback(() => {
    if (!svg || !containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${name}.png`;
      link.href = pngUrl;
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [svg, name]);

  if (isRendering) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold truncate max-w-[300px] sm:max-w-[500px]">
              {name}
            </h1>
          </div>
          <ZoomControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            onDownload={handleDownload}
          />
        </div>
      </header>

      {/* Diagram Container */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
          <div
            ref={containerRef}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-10 transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            dangerouslySetInnerHTML={{ __html: svg || '' }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur-sm py-3">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Created with Mermaid Preview
        </div>
      </footer>
    </div>
  );
});
