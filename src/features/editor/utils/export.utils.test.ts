/**
 * Property Tests for Export Utilities
 * Feature: diagram-sharing-export
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sanitizeFilename, getExportFilename } from './export.utils';

describe('Export Utilities', () => {
  /**
   * Property 3: Export Filename Format
   * For any diagram name and export format (PNG or SVG), the exported filename
   * SHALL follow the pattern `{sanitized-diagram-name}.{format}` where the
   * diagram name is sanitized for filesystem compatibility.
   *
   * **Validates: Requirements 1.2, 2.2**
   */
  describe('Property 3: Export Filename Format', () => {
    it('should produce valid filenames for any diagram name and format', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 300 }),
          fc.constantFrom('png', 'svg') as fc.Arbitrary<'png' | 'svg'>,
          (diagramName, format) => {
            const filename = getExportFilename(diagramName, format);

            // Filename should end with correct extension
            expect(filename).toMatch(new RegExp(`\\.${format}$`));

            // Filename should not contain invalid filesystem characters
            const invalidChars = /[<>:"/\\|?*]/;
            const nameWithoutExtension = filename.slice(0, -4);
            expect(nameWithoutExtension).not.toMatch(invalidChars);

            // Filename should not be empty (fallback to 'diagram')
            expect(nameWithoutExtension.length).toBeGreaterThan(0);

            // Filename should not have leading/trailing dashes
            expect(nameWithoutExtension).not.toMatch(/^-|-$/);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should sanitize filenames consistently', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 100 }), (name) => {
          const sanitized = sanitizeFilename(name);

          // Should be deterministic
          expect(sanitizeFilename(name)).toBe(sanitized);

          // Should not contain invalid characters
          expect(sanitized).not.toMatch(/[<>:"/\\|?*]/);

          // Should not have multiple consecutive dashes
          expect(sanitized).not.toMatch(/--+/);

          // Should have reasonable length
          expect(sanitized.length).toBeLessThanOrEqual(200);
        }),
        { numRuns: 100 },
      );
    });
  });
});
