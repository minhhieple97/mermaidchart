'use client';

/**
 * Export Hook
 * Handles exporting diagrams to PNG and SVG formats
 *
 * Requirements:
 * - 1.1: Export to PNG matching displayed diagram
 * - 2.1: Export to SVG from current diagram
 * - 2.4: Use raw SVG string for SVG export
 */

import { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { triggerDownload, getExportFilename } from '../utils/export.utils';

interface UseExportOptions {
  /** SVG string to export */
  svg: string | null;
  /** Filename without extension */
  filename: string;
}

interface UseExportResult {
  /** Export as PNG */
  exportPng: () => Promise<void>;
  /** Export as SVG */
  exportSvg: () => void;
  /** Whether PNG export is in progress */
  isExporting: boolean;
  /** Reference to attach to the SVG container for PNG export */
  svgContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for exporting diagrams to PNG and SVG formats
 */
export function useExport(options: UseExportOptions): UseExportResult {
  const { svg, filename } = options;
  const [isExporting, setIsExporting] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const exportPng = useCallback(async () => {
    if (!svgContainerRef.current || !svg) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(svgContainerRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2, // Higher quality
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const exportFilename = getExportFilename(filename, 'png');
      triggerDownload(blob, exportFilename);
    } catch (error) {
      console.error('Failed to export PNG:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [svg, filename]);

  const exportSvg = useCallback(() => {
    if (!svg) return;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const exportFilename = getExportFilename(filename, 'svg');
    triggerDownload(blob, exportFilename);
  }, [svg, filename]);

  return {
    exportPng,
    exportSvg,
    isExporting,
    svgContainerRef,
  };
}
