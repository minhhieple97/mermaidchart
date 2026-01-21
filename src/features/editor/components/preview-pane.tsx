'use client';

import { memo } from 'react';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExport } from '../hooks/use-export';

interface PreviewPaneProps {
  svg: string | null;
  error: string | null;
  isRendering: boolean;
  diagramName: string;
}

export const PreviewPane = memo(function PreviewPane({
  svg,
  error,
  isRendering,
  diagramName,
}: PreviewPaneProps) {
  const { exportPng, exportSvg, isExporting, svgContainerRef } = useExport({
    svg,
    filename: diagramName,
  });

  const canExport = !error && !isRendering && !!svg;

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: '100%' }}>
      {/* Header */}
      <div className="h-11 px-3 sm:px-4 flex items-center justify-between border-b bg-gray-100 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-700">Preview</span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportPng}
            disabled={!canExport || isExporting}
            className="h-8 px-2 sm:px-3 text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="ml-1 sm:ml-1.5">PNG</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportSvg}
            disabled={!canExport}
            className="h-8 px-2 sm:px-3 text-xs"
          >
            <Download className="h-4 w-4" />
            <span className="ml-1 sm:ml-1.5">SVG</span>
          </Button>
        </div>
      </div>

      {/* Content - fills remaining height */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {isRendering ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Rendering...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 max-w-md text-center px-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-red-600 mb-2 text-sm sm:text-base">
                  Syntax Error
                </p>
                <pre className="text-xs text-gray-600 bg-white border border-gray-200 p-3 sm:p-4 rounded-lg text-left whitespace-pre-wrap max-h-40 sm:max-h-48 overflow-auto shadow-sm">
                  {error}
                </pre>
              </div>
            </div>
          </div>
        ) : !svg ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-400 text-center px-4">
              Start typing to see your diagram
            </p>
          </div>
        ) : (
          <div
            ref={svgContainerRef}
            className="flex items-center justify-center min-h-full [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
});
