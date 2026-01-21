'use client';

/**
 * Preview Pane Component
 * Displays rendered Mermaid diagrams or error messages
 *
 * Requirements:
 * - 4.3: Display rendered diagram for valid syntax
 * - 4.4: Display error indicator for invalid syntax without crashing
 * - 1.1, 2.1: Export to PNG/SVG from preview pane
 */

import { Loader2, AlertCircle } from 'lucide-react';
import { ExportToolbar } from './export-toolbar';
import { useExport } from '../hooks/use-export';

interface PreviewPaneProps {
  /** Rendered SVG string */
  svg: string | null;
  /** Error message if rendering failed */
  error: string | null;
  /** Whether rendering is in progress */
  isRendering: boolean;
  /** Diagram name for export filename */
  diagramName: string;
}

/**
 * Preview pane for displaying Mermaid diagrams
 */
export function PreviewPane({
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

  // Loading state
  if (isRendering) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <span className="text-sm font-medium">Preview</span>
          <ExportToolbar
            canExport={false}
            isExporting={false}
            onExportPng={exportPng}
            onExportSvg={exportSvg}
          />
        </div>
        <div className="flex items-center justify-center flex-1 bg-background">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Rendering...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <span className="text-sm font-medium">Preview</span>
          <ExportToolbar
            canExport={false}
            isExporting={false}
            onExportPng={exportPng}
            onExportSvg={exportSvg}
          />
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-6 bg-background">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-destructive">Syntax Error</h3>
            <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!svg) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <span className="text-sm font-medium">Preview</span>
          <ExportToolbar
            canExport={false}
            isExporting={false}
            onExportPng={exportPng}
            onExportSvg={exportSvg}
          />
        </div>
        <div className="flex items-center justify-center flex-1 bg-background">
          <p className="text-muted-foreground text-sm">
            Start typing to see your diagram...
          </p>
        </div>
      </div>
    );
  }

  // Success state - render the SVG
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <span className="text-sm font-medium">Preview</span>
        <ExportToolbar
          canExport={canExport}
          isExporting={isExporting}
          onExportPng={exportPng}
          onExportSvg={exportSvg}
        />
      </div>
      <div className="flex-1 overflow-auto bg-background p-4">
        <div
          ref={svgContainerRef}
          className="flex items-center justify-center min-h-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
