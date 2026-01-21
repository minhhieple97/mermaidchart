'use client';

/**
 * Export Toolbar Component
 * Provides PNG and SVG export buttons for diagrams
 *
 * Requirements:
 * - 1.1: PNG export button in Preview_Pane toolbar
 * - 1.3: Disable PNG export when rendering error exists
 * - 2.1: SVG export button in Preview_Pane toolbar
 * - 2.3: Disable SVG export when rendering error exists
 */

import { FileCode, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportToolbarProps {
  /** Whether export is available (no errors, has SVG) */
  canExport: boolean;
  /** Whether PNG export is in progress */
  isExporting: boolean;
  /** Callback for PNG export */
  onExportPng: () => void;
  /** Callback for SVG export */
  onExportSvg: () => void;
}

/**
 * Toolbar with export buttons for PNG and SVG formats
 */
export function ExportToolbar({
  canExport,
  isExporting,
  onExportPng,
  onExportSvg,
}: ExportToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onExportPng}
        disabled={!canExport || isExporting}
        title={
          canExport ? 'Export as PNG' : 'Fix syntax errors to enable export'
        }
        className="h-7 px-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs">PNG</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onExportSvg}
        disabled={!canExport}
        title={
          canExport ? 'Export as SVG' : 'Fix syntax errors to enable export'
        }
        className="h-7 px-2"
      >
        <FileCode className="h-4 w-4" />
        <span className="ml-1 text-xs">SVG</span>
      </Button>
    </div>
  );
}
