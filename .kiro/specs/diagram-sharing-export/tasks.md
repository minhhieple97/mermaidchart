# Implementation Plan: Diagram Sharing & Export

## Overview

This implementation plan breaks down the diagram sharing and export feature into discrete coding tasks. The implementation follows the existing feature-based architecture and builds incrementally, ensuring each step produces working code that integrates with previous steps.

## Tasks

- [x] 1. Database schema and type updates
  - [x] 1.1 Create migration for is_public column and RLS policies
    - Create `supabase/migrations/002_add_diagram_visibility.sql`
    - Add `is_public` boolean column with default false
    - Add index on `is_public` column
    - Add RLS policy for public diagram viewing
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 1.2 Update TypeScript types for Diagram entity
    - Update `src/types/database.ts` to add `is_public` field to Diagram interface
    - _Requirements: 3.1_

- [x] 2. Export functionality
  - [x] 2.1 Create export types and utilities
    - Create `src/features/editor/types/export.types.ts` with ExportFormat and ExportOptions types
    - Create `src/features/editor/utils/export.utils.ts` with filename sanitization and download trigger functions
    - _Requirements: 1.2, 2.2_
  - [x] 2.2 Write property test for export filename format
    - **Property 3: Export Filename Format**
    - **Validates: Requirements 1.2, 2.2**
  - [x] 2.3 Create useExport hook
    - Create `src/features/editor/hooks/use-export.ts`
    - Implement PNG export using html-to-image library
    - Implement SVG export using Blob and download
    - _Requirements: 1.1, 2.1, 2.4_
  - [x] 2.4 Write property test for SVG export round-trip
    - **Property 2: SVG Export Round-Trip**
    - **Validates: Requirements 2.4**
  - [x] 2.5 Create ExportToolbar component
    - Create `src/features/editor/components/export-toolbar.tsx`
    - Render PNG and SVG export buttons with icons
    - Disable buttons when hasError or svg is null
    - Show tooltips explaining disabled state
    - _Requirements: 1.1, 1.3, 2.1, 2.3_
  - [x] 2.6 Write property test for export buttons disabled on error
    - **Property 4: Export Buttons Disabled on Error**
    - **Validates: Requirements 1.3, 2.3**
  - [x] 2.7 Integrate ExportToolbar into PreviewPane
    - Update `src/features/editor/components/preview-pane.tsx` to include ExportToolbar
    - Pass svg, hasError, and diagramName props
    - Update `src/features/editor/components/split-pane-editor.tsx` to pass diagramName
    - _Requirements: 1.1, 2.1_
  - [x] 2.8 Update editor feature exports
    - Update `src/features/editor/index.ts` to export new components, hooks, and types
    - _Requirements: 1.1, 2.1_

- [x] 3. Checkpoint - Export functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Sharing feature setup
  - [x] 4.1 Create sharing feature structure
    - Create `src/features/sharing/` directory structure (components/, hooks/, actions/, types/)
    - Create `src/features/sharing/types/sharing.types.ts` with PublicDiagram and ShareUrlParams types
    - Create `src/features/sharing/index.ts` for exports
    - _Requirements: 4.5_
  - [x] 4.2 Create visibility server action
    - Create `src/features/sharing/actions/visibility.actions.ts`
    - Implement toggleVisibilityAction using authActionClient
    - _Requirements: 3.2, 3.6_
  - [x] 4.3 Write property test for visibility toggle persistence
    - **Property 5: Visibility Toggle Persistence**
    - **Validates: Requirements 3.2, 3.6**
  - [x] 4.4 Create useVisibility hook
    - Create `src/features/sharing/hooks/use-visibility.ts`
    - Manage local state and server sync
    - Handle optimistic updates and error rollback
    - _Requirements: 3.2, 3.6_

- [x] 5. Visibility toggle UI
  - [x] 5.1 Create VisibilityToggle component
    - Create `src/features/sharing/components/visibility-toggle.tsx`
    - Display Lock icon for private, Globe icon for public
    - Handle toggle with loading state
    - _Requirements: 3.1, 3.2, 3.5_
  - [x] 5.2 Create CopyLinkButton component
    - Create `src/features/sharing/components/copy-link-button.tsx`
    - Conditionally render based on isPublic
    - Copy share URL to clipboard on click
    - Show success toast
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 5.3 Write property test for Copy Link button visibility
    - **Property 8: Copy Link Button Visibility**
    - **Validates: Requirements 4.1, 4.4**
  - [x] 5.4 Write property test for share URL format
    - **Property 9: Share URL Format**
    - **Validates: Requirements 4.5**
  - [x] 5.5 Integrate visibility controls into diagram editor page
    - Update `src/app/(dashboard)/projects/[projectId]/diagrams/[diagramId]/page.tsx`
    - Add VisibilityToggle and CopyLinkButton to header
    - Pass diagram visibility state and handlers
    - _Requirements: 3.2, 4.1_

- [x] 6. Checkpoint - Visibility controls complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Public share page
  - [x] 7.1 Create public diagram server action
    - Create `src/features/sharing/actions/share.actions.ts`
    - Implement getPublicDiagramAction (unauthenticated)
    - Return diagram data or not found error
    - _Requirements: 5.1, 5.4, 5.5_
  - [x] 7.2 Write property test for public diagram accessibility
    - **Property 7: Public Diagram Accessibility**
    - **Validates: Requirements 3.4, 5.1, 5.3, 6.2**
  - [x] 7.3 Write property test for private diagram access control
    - **Property 6: Private Diagram Access Control**
    - **Validates: Requirements 3.3, 6.3**
  - [x] 7.4 Write property test for private/non-existent diagram error handling
    - **Property 10: Private/Non-existent Diagram Error Handling**
    - **Validates: Requirements 5.4, 5.5**
  - [x] 7.5 Create share page route
    - Create `src/app/share/[diagramId]/page.tsx`
    - Fetch public diagram data (server component)
    - Render diagram using Mermaid (client component wrapper)
    - Display error state for private/non-existent diagrams
    - Set page title to diagram name
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_
  - [x] 7.6 Write property test for share page title
    - **Property 11: Share Page Title**
    - **Validates: Requirements 5.6**
  - [x] 7.7 Create read-only diagram viewer component
    - Create `src/features/sharing/components/diagram-viewer.tsx`
    - Render diagram without editor
    - Handle Mermaid rendering client-side
    - _Requirements: 5.1, 5.2_

- [x] 8. Final integration and cleanup
  - [x] 8.1 Update sharing feature exports
    - Update `src/features/sharing/index.ts` with all components, hooks, actions, and types
    - _Requirements: All_
  - [x] 8.2 Update diagram hooks for visibility
    - Update `src/hooks/use-diagrams.ts` to include is_public in queries
    - Add cache invalidation for visibility changes
    - _Requirements: 3.2_

- [x] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks including property tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The implementation uses the existing feature-based architecture pattern
- html-to-image library needs to be installed for PNG export
