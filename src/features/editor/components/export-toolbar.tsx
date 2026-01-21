'use client';

import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportToolbarProps {
  canExport: boolean;
  isExporting: boolean;
  onExportPng: () => void;
  onExportSvg: () => void;
}

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
        className="h-7 px-2 text-xs"
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        <span className="ml-1">PNG</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onExportSvg}
        disabled={!canExport}
        className="h-7 px-2 text-xs"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="ml-1">SVG</span>
      </Button>
    </div>
  );
}
