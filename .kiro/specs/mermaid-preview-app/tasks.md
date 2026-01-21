# Implementation Plan: Mermaid Chart Preview Application

## Overview

This implementation plan breaks down the Mermaid Chart Preview Application into discrete, incremental tasks. Each task builds on previous work and includes specific requirements references. The application uses Next.js with App Router, Supabase, shadcn/ui, TanStack Query, next-safe-action, and the Vercel AI SDK.

## Tasks

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize Next.js project with pnpm and configure base dependencies
    - Run `pnpm create next-app@latest` with App Router, TypeScript, Tailwind CSS, ESLint, src directory
    - Install core dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `@t3-oss/env-nextjs`
    - Install UI dependencies: `@tanstack/react-query`, `next-safe-action`
    - Install AI SDK: `pnpm add ai @ai-sdk/google`
    - _Requirements: All_

  - [x] 1.2 Configure environment variables with @t3-oss/env-nextjs
    - Create `src/env.ts` with typed environment schema
    - Add `.env.local.example` with required variables (GOOGLE_GENERATIVE_AI_API_KEY, Supabase keys)
    - _Requirements: All_

  - [x] 1.3 Set up shadcn/ui and install required components
    - Run `pnpm dlx shadcn@latest init`
    - Install components: button, card, dialog, form, input, toast, alert-dialog, dropdown-menu
    - _Requirements: All_

  - [x] 1.4 Configure TanStack Query provider
    - Create `src/providers/query-provider.tsx`
    - Wrap app layout with QueryClientProvider
    - _Requirements: All_

  - [x] 1.5 Set up next-safe-action client
    - Create `src/lib/safe-action.ts` with base action client
    - Create authenticated action client with Supabase middleware
    - _Requirements: All_

- [x] 2. Supabase Setup and Database Schema
  - [x] 2.1 Configure Supabase client for server and browser
    - Create `src/lib/supabase/client.ts` for browser client
    - Create `src/lib/supabase/server.ts` for server client
    - Create `src/lib/supabase/middleware.ts` for auth middleware
    - _Requirements: 1.1, 1.7_

  - [x] 2.2 Create database schema and RLS policies
    - Create `supabase/migrations/001_initial_schema.sql`
    - Create `projects` table with user_id, name, timestamps
    - Create `diagrams` table with project_id, name, code, timestamps
    - Set up Row Level Security policies for both tables
    - Create indexes and update triggers
    - _Requirements: 2.2, 3.2, 6.3, 6.5_

  - [x] 2.3 Create TypeScript types for database entities
    - Create `src/types/database.ts` with Project, Diagram, User interfaces
    - Create Zod validation schemas for project and diagram names
    - _Requirements: 2.3, 3.3_

- [x] 3. Authentication System
  - [x] 3.1 Implement authentication server actions
    - Create `src/features/auth/actions/auth.ts` with signInAction, signUpAction, signOutAction
    - Use next-safe-action with Zod validation
    - _Requirements: 1.2, 1.3, 1.5, 1.6_

  - [x] 3.2 Create auth middleware for protected routes
    - Create `src/middleware.ts` to protect dashboard routes
    - Redirect unauthenticated users to login
    - _Requirements: 1.1_

  - [ ] 3.3 Write property test for protected route redirection
    - **Property 1: Protected Route Redirection**
    - **Validates: Requirements 1.1**

  - [x] 3.4 Create login page with auth form
    - Create `src/app/(auth)/login/page.tsx`
    - Create `src/features/auth/components/auth-form.tsx` using shadcn Form
    - Handle login errors and success redirect
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 3.5 Create signup page
    - Create `src/app/(auth)/signup/page.tsx`
    - Reuse auth-form component with signup mode
    - _Requirements: 1.4, 1.5_

- [x] 4. Checkpoint - Authentication Complete
  - Ensure all auth tests pass, ask the user if questions arise.

- [x] 5. Project Management
  - [x] 5.1 Implement project server actions
    - Create `src/features/projects/actions/projects.ts` with createProjectAction, updateProjectAction, deleteProjectAction
    - Use authActionClient for authenticated actions
    - Validate project names with Zod (non-empty, max 255 chars)
    - _Requirements: 2.2, 2.3, 2.6, 2.7_

  - [x] 5.2 Create TanStack Query hooks for projects
    - Create `src/features/projects/hooks/use-projects.ts` with useProjects, useCreateProject, useUpdateProject, useDeleteProject
    - Integrate with next-safe-action useAction hook
    - Handle cache invalidation on mutations
    - _Requirements: 2.2, 2.7, 2.8_

  - [ ] 5.3 Write property test for project name validation
    - **Property 3: Name Validation Rejects Invalid Input**
    - **Validates: Requirements 2.3, 3.3**

  - [ ] 5.4 Write property test for project list sorting
    - **Property 6: List Sorting by Updated Date**
    - **Validates: Requirements 2.8, 3.8**

  - [x] 5.5 Create dashboard page with project list
    - Create `src/app/(dashboard)/page.tsx`
    - Create `src/features/projects/components/project-list.tsx` and `project-card.tsx`
    - Display projects sorted by updated_at descending
    - Show empty state when no projects
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 5.6 Create project creation dialog
    - Create `src/features/projects/components/create-project-dialog.tsx` using shadcn Dialog
    - Integrate with useCreateProject hook
    - Show validation errors for empty names
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.7 Create project deletion with confirmation
    - Create `src/components/shared/confirm-dialog.tsx` using shadcn AlertDialog
    - Integrate with useDeleteProject hook
    - _Requirements: 2.5, 2.6_

  - [ ] 5.8 Write property test for cascade deletion
    - **Property 4: Cascade Deletion**
    - **Validates: Requirements 2.6**

- [x] 6. Diagram Management
  - [x] 6.1 Implement diagram server actions
    - Create `src/features/diagrams/actions/diagrams.ts` with createDiagramAction, updateDiagramAction, deleteDiagramAction
    - Set default template code for new diagrams
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_

  - [x] 6.2 Create TanStack Query hooks for diagrams
    - Create `src/features/diagrams/hooks/use-diagrams.ts` with useDiagrams, useDiagram, useCreateDiagram, useUpdateDiagram, useDeleteDiagram
    - Handle cache invalidation on mutations
    - _Requirements: 3.2, 3.7, 3.8_

  - [ ] 6.3 Write property test for new diagram default template
    - **Property 7: New Diagram Default Template**
    - **Validates: Requirements 3.1**

  - [x] 6.4 Create project view page with diagram list
    - Create `src/app/(dashboard)/projects/[projectId]/page.tsx`
    - Create `src/features/diagrams/components/diagram-list.tsx` and `diagram-card.tsx`
    - Display diagrams sorted by updated_at descending
    - _Requirements: 2.4, 3.4, 3.8_

  - [x] 6.5 Create diagram creation dialog
    - Create `src/features/diagrams/components/create-diagram-dialog.tsx`
    - Integrate with useCreateDiagram hook
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 6.6 Create diagram deletion with confirmation
    - Reuse confirm-dialog component
    - Integrate with useDeleteDiagram hook
    - _Requirements: 3.5, 3.6_

  - [ ] 6.7 Write property test for diagram deletion
    - **Property 9: Diagram Deletion**
    - **Validates: Requirements 3.6**

- [x] 7. Checkpoint - Project and Diagram Management Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Split-Pane Editor with Live Preview
  - [x] 8.1 Create Mermaid renderer hook
    - Create `src/features/editor/hooks/use-mermaid-renderer.ts`
    - Install mermaid library: `pnpm add mermaid`
    - Implement debounced rendering (500ms)
    - Handle render errors gracefully
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 8.2 Write property test for valid Mermaid rendering
    - **Property 12: Valid Mermaid Rendering**
    - **Validates: Requirements 4.3**

  - [ ] 8.3 Write property test for invalid Mermaid error handling
    - **Property 13: Invalid Mermaid Error Handling**
    - **Validates: Requirements 4.4**

  - [x] 8.4 Create code editor component
    - Create `src/features/editor/components/code-editor.tsx`
    - Install Monaco Editor: `pnpm add @monaco-editor/react`
    - Configure syntax highlighting for Mermaid
    - Display line numbers
    - _Requirements: 4.7, 4.8_

  - [x] 8.5 Create preview pane component
    - Create `src/features/editor/components/preview-pane.tsx`
    - Render Mermaid SVG output
    - Display error messages for invalid syntax
    - _Requirements: 4.3, 4.4_

  - [x] 8.6 Create split pane hook and container
    - Create `src/features/editor/hooks/use-split-pane.ts` for drag-to-resize
    - Create `src/features/editor/components/split-pane-editor.tsx`
    - Wire up code editor and preview pane
    - _Requirements: 4.1, 4.5_

  - [x] 8.7 Create auto-save hook
    - Create `src/features/editor/hooks/use-auto-save.ts`
    - Implement 2-second debounce after last change
    - Show save status indicator
    - _Requirements: 4.6, 6.1_

  - [ ] 8.8 Write property test for diagram code round-trip persistence
    - **Property 18: Diagram Code Round-Trip Persistence**
    - **Validates: Requirements 6.1, 6.2**

  - [x] 8.9 Create diagram editor page
    - Create `src/app/(dashboard)/projects/[projectId]/diagrams/[diagramId]/page.tsx`
    - Load diagram data with useDiagram hook
    - Wire up auto-save with updateDiagramAction
    - _Requirements: 3.4, 4.1, 6.2_

- [x] 9. Checkpoint - Editor Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. AI-Powered Syntax Fixing
  - [x] 10.1 Implement AI fix server action
    - Create `src/features/editor/actions/ai.ts` with fixMermaidSyntaxAction
    - Use Gemini 2.0 Flash via `@ai-sdk/google`
    - Configure system prompt for Mermaid syntax fixing
    - Parse response to extract fixed code and explanation
    - _Requirements: 5.2_

  - [x] 10.2 Create AI fix hook
    - Create `src/features/editor/hooks/use-ai-fix.ts`
    - Integrate with fixMermaidSyntaxAction using useAction
    - Handle loading and error states
    - _Requirements: 5.2, 5.6, 5.7_

  - [x] 10.3 Create AI fix button component
    - Create `src/features/editor/components/ai-fix-button.tsx`
    - Show button only when syntax error exists
    - Display loading state during AI processing
    - _Requirements: 5.1, 5.6_

  - [ ] 10.4 Write property test for AI fix button visibility
    - **Property 15: AI Fix Button Visibility**
    - **Validates: Requirements 5.1**

  - [x] 10.5 Create AI fix modal component
    - Create `src/features/editor/components/ai-fix-modal.tsx` using shadcn Dialog
    - Show original code, fixed code preview, and explanation
    - Provide accept and reject buttons
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 10.5.1 Enhance AI fix modal with diff view
    - Install `react-diff-viewer-continued` library: `pnpm add react-diff-viewer-continued`
    - Update `src/features/editor/components/ai-fix-modal.tsx` to use ReactDiffViewer
    - Configure side-by-side diff view with additions in green and deletions in red
    - Add "Original Code" and "Fixed Code" titles to diff columns
    - Ensure scrollable content for large code blocks
    - _Requirements: 5.3_

  - [ ] 10.5.2 Write property test for diff view highlighting
    - **Property 15.1: AI Fix Diff View Highlighting**
    - **Validates: Requirements 5.3**

  - [ ] 10.6 Write property test for AI fix accept updates editor
    - **Property 16: AI Fix Accept Updates Editor**
    - **Validates: Requirements 5.4**

  - [ ] 10.7 Write property test for AI fix reject preserves original
    - **Property 17: AI Fix Reject Preserves Original**
    - **Validates: Requirements 5.5**

  - [x] 10.8 Integrate AI fix into split-pane editor
    - Add AI fix button to editor toolbar
    - Wire up modal with accept/reject handlers
    - Update editor content on accept
    - _Requirements: 5.1, 5.4, 5.5_

- [ ] 11. Navigation and Polish
  - [ ] 11.1 Create breadcrumb navigation component
    - Create `src/features/navigation/components/breadcrumb-nav.tsx`
    - Show current location: Dashboard > Project > Diagram
    - Make breadcrumbs clickable for navigation
    - _Requirements: 7.3, 7.4_

  - [ ] 11.2 Create dashboard layout with navigation
    - Create `src/app/(dashboard)/layout.tsx`
    - Add header with logo and user menu
    - Add logout functionality
    - _Requirements: 1.6, 7.1_

  - [ ] 11.3 Add toast notifications for actions
    - Configure shadcn toast provider
    - Show success/error toasts for CRUD operations
    - Show save status notifications
    - _Requirements: 2.3, 3.3, 5.7, 6.4_

  - [ ] 11.4 Write property test for project card information completeness
    - **Property 21: Project Card Information Completeness**
    - **Validates: Requirements 7.5**

- [ ] 12. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are implemented
  - Test complete user flows: auth → create project → create diagram → edit with AI fix

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Use `pnpm` for all package management commands
