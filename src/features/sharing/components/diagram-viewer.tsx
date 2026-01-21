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
  Maximize2,
  Download,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagramViewerProps {
  code: string;
  name: string;
}

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const DEFAULT_ZOOM = 1;

/**
 * Loading state component
 */
const LoadingState = memo(function LoadingState() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <span className="text-lg font-medium">Rendering diagram...</span>
      </div>
    </div>
  );
});

/**
 * Error state component
 */
const ErrorState = memo(function ErrorState({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-6">
      <div className="flex flex-col items-center gap-5 max-w-md text-center">
        <div className="rounded-full bg-red-50 p-5">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">
          Unable to render diagram
        </h3>
        <p className="text-sm text-slate-600 break-words whitespace-pre-wrap leading-relaxed">
          {message}
        </p>
      </div>
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
  const viewportRef = useRef<HTMLDivElement>(null);

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

  // No auto-fit - let user control zoom manually

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || !viewportRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Reset zoom first to get accurate dimensions
    setZoom(1);

    requestAnimationFrame(() => {
      const svgWidth = svgElement.getBoundingClientRect().width;
      const svgHeight = svgElement.getBoundingClientRect().height;
      const viewportWidth = viewportRef.current!.clientWidth - 80;
      const viewportHeight = viewportRef.current!.clientHeight - 80;

      const scaleX = viewportWidth / svgWidth;
      const scaleY = viewportHeight / svgHeight;
      const fitScale = Math.min(scaleX, scaleY, MAX_ZOOM);

      setZoom(Math.max(MIN_ZOOM, fitScale));
    });
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

  // Handle mouse wheel zoom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom((prev) => Math.max(MIN_ZOOM, Math.min(prev + delta, MAX_ZOOM)));
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  if (isRendering) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50">
      {/* Header - Floating style */}
      <header className="absolute top-4 left-4 right-4 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-slate-200/60">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[400px]">
                {name}
              </h1>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1.5 shadow-sm border border-slate-200/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="h-8 w-8 p-0 hover:bg-slate-100 cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4 text-slate-600" />
              </Button>

              <span className="text-sm font-medium text-slate-700 min-w-[3.5rem] text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="h-8 w-8 p-0 hover:bg-slate-100 cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4 text-slate-600" />
              </Button>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleFitToScreen}
                className="h-8 w-8 p-0 hover:bg-slate-100 cursor-pointer"
                title="Fit to screen"
              >
                <Maximize2 className="h-4 w-4 text-slate-600" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0 hover:bg-slate-100 cursor-pointer"
                title="Download PNG"
              >
                <Download className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Diagram Viewport - Full screen with pan/zoom */}
      <main
        ref={viewportRef}
        className="absolute inset-0 overflow-auto flex items-center justify-center"
        style={{
          backgroundImage:
            'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          ref={containerRef}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-12 transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className="[&>svg]:max-w-none [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg || '' }}
          />
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm border border-slate-200/60">
          <span className="text-xs text-slate-500">
            Created with Mermaid Preview
          </span>
        </div>
      </footer>

      {/* Keyboard shortcut hint */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-slate-200/60">
          <span className="text-xs text-slate-400">Ctrl + Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
});
