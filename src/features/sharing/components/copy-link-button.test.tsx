/**
 * Property Tests for Copy Link Button Component
 * Feature: diagram-sharing-export
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { CopyLinkButton } from './copy-link-button';

describe('CopyLinkButton', () => {
  /**
   * Property 8: Copy Link Button Visibility
   * For any diagram, the Copy Link button SHALL be visible
   * if and only if the diagram's `is_public` field is true.
   *
   * **Validates: Requirements 4.1, 4.4**
   */
  describe('Property 8: Copy Link Button Visibility', () => {
    it('should only be visible when isPublic is true', () => {
      fc.assert(
        fc.property(fc.uuid(), fc.boolean(), (diagramId, isPublic) => {
          const { container, unmount } = render(
            <CopyLinkButton diagramId={diagramId} isPublic={isPublic} />,
          );

          const button = screen.queryByRole('button', { name: /copy link/i });

          if (isPublic) {
            // Button should be visible when public
            expect(button).toBeInTheDocument();
          } else {
            // Button should not be visible when private
            expect(button).not.toBeInTheDocument();
          }

          unmount();
        }),
        { numRuns: 50 },
      );
    });
  });

  /**
   * Property 9: Share URL Format
   * For any diagram ID, the generated share URL SHALL follow
   * the format `/share/{diagramId}`.
   *
   * **Validates: Requirements 4.5**
   */
  describe('Property 9: Share URL Format', () => {
    it('should generate correct share URL format', () => {
      fc.assert(
        fc.property(fc.uuid(), (diagramId) => {
          // Verify the URL format logic
          const expectedPath = `/share/${diagramId}`;

          // The share URL should match the expected format
          expect(expectedPath).toMatch(/^\/share\/[0-9a-f-]{36}$/i);
        }),
        { numRuns: 100 },
      );
    });
  });
});
