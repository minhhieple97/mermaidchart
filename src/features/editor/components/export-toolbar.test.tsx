/**
 * Property Tests for Export Toolbar Component
 * Feature: diagram-sharing-export
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ExportToolbar } from './export-toolbar';

describe('ExportToolbar', () => {
  /**
   * Property 4: Export Buttons Disabled on Error
   * For any diagram with a rendering error (hasError = true),
   * both PNG and SVG export buttons SHALL be disabled.
   *
   * **Validates: Requirements 1.3, 2.3**
   */
  describe('Property 4: Export Buttons Disabled on Error', () => {
    it('should disable export buttons when canExport is false', () => {
      fc.assert(
        fc.property(fc.boolean(), (isExporting) => {
          const onExportPng = vi.fn();
          const onExportSvg = vi.fn();

          const { unmount } = render(
            <ExportToolbar
              canExport={false}
              isExporting={isExporting}
              onExportPng={onExportPng}
              onExportSvg={onExportSvg}
            />,
          );

          // Both buttons should be disabled when canExport is false
          const pngButton = screen.getByRole('button', { name: /png/i });
          const svgButton = screen.getByRole('button', { name: /svg/i });

          expect(pngButton).toBeDisabled();
          expect(svgButton).toBeDisabled();

          unmount();
        }),
        { numRuns: 10 },
      );
    });

    it('should enable export buttons when canExport is true and not exporting', () => {
      const onExportPng = vi.fn();
      const onExportSvg = vi.fn();

      render(
        <ExportToolbar
          canExport={true}
          isExporting={false}
          onExportPng={onExportPng}
          onExportSvg={onExportSvg}
        />,
      );

      const pngButton = screen.getByRole('button', { name: /png/i });
      const svgButton = screen.getByRole('button', { name: /svg/i });

      expect(pngButton).not.toBeDisabled();
      expect(svgButton).not.toBeDisabled();
    });

    it('should disable PNG button while exporting', () => {
      const onExportPng = vi.fn();
      const onExportSvg = vi.fn();

      render(
        <ExportToolbar
          canExport={true}
          isExporting={true}
          onExportPng={onExportPng}
          onExportSvg={onExportSvg}
        />,
      );

      const pngButton = screen.getByRole('button', { name: /png/i });
      expect(pngButton).toBeDisabled();
    });
  });
});
