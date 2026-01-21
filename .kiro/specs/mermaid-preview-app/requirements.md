# Requirements Document

## Introduction

The Mermaid Chart Preview Application is a modern web application that enables users to create, edit, and preview Mermaid diagrams in real-time. The application features a split-pane editor with live preview, project-based organization for managing multiple diagrams, and AI-powered syntax fixing capabilities. Built with Next.js, Supabase for authentication and data persistence, and the Vercel AI SDK for intelligent syntax correction.

## Glossary

- **Editor**: The code editing component where users write Mermaid diagram syntax
- **Preview_Pane**: The rendering component that displays the visual representation of Mermaid diagrams
- **Split_Pane_Editor**: The combined interface showing the Editor on the left and Preview_Pane on the right
- **Project**: A container that groups related diagrams together for organizational purposes
- **Diagram**: A single Mermaid chart with its code and metadata stored within a Project
- **Syntax_Fixer**: The AI-powered component that analyzes and corrects Mermaid syntax errors
- **User**: An authenticated individual who can create and manage projects and diagrams
- **Mermaid_Renderer**: The component responsible for parsing Mermaid code and generating visual diagrams
- **Auth_System**: The Supabase-based authentication system managing user sessions

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to sign up, log in, and manage my account, so that I can securely access my projects and diagrams.

#### Acceptance Criteria

1. WHEN a user visits the application without authentication THEN THE Auth_System SHALL redirect them to the login page
2. WHEN a user submits valid credentials THEN THE Auth_System SHALL authenticate the user and redirect to the dashboard
3. WHEN a user submits invalid credentials THEN THE Auth_System SHALL display an error message and remain on the login page
4. WHEN a user clicks the sign-up link THEN THE Auth_System SHALL display the registration form
5. WHEN a user submits valid registration details THEN THE Auth_System SHALL create a new account and immediately log the user in without requiring email confirmation
6. WHEN a user clicks the logout button THEN THE Auth_System SHALL terminate the session and redirect to the login page
7. THE Auth_System SHALL persist user sessions across browser refreshes

### Requirement 2: Project Management

**User Story:** As a user, I want to create and manage projects, so that I can organize my diagrams into logical groups.

#### Acceptance Criteria

1. WHEN a user clicks the create project button THEN THE System SHALL display a project creation form
2. WHEN a user submits a valid project name THEN THE System SHALL create a new project and display it in the project list
3. WHEN a user submits an empty project name THEN THE System SHALL display a validation error and prevent creation
4. WHEN a user clicks on a project THEN THE System SHALL navigate to the project view showing all diagrams
5. WHEN a user clicks the delete project button THEN THE System SHALL prompt for confirmation before deletion
6. WHEN a user confirms project deletion THEN THE System SHALL delete the project and all associated diagrams
7. WHEN a user edits a project name THEN THE System SHALL update the project name and reflect changes immediately
8. THE System SHALL display projects sorted by last modified date in descending order

### Requirement 3: Diagram Management

**User Story:** As a user, I want to create, edit, and delete diagrams within projects, so that I can manage my Mermaid charts effectively.

#### Acceptance Criteria

1. WHEN a user clicks the create diagram button within a project THEN THE System SHALL create a new diagram with default template code
2. WHEN a user submits a valid diagram name THEN THE System SHALL save the diagram with the specified name
3. WHEN a user submits an empty diagram name THEN THE System SHALL display a validation error and prevent creation
4. WHEN a user clicks on a diagram THEN THE System SHALL open the Split_Pane_Editor with the diagram loaded
5. WHEN a user clicks the delete diagram button THEN THE System SHALL prompt for confirmation before deletion
6. WHEN a user confirms diagram deletion THEN THE System SHALL remove the diagram from the project
7. WHEN a user renames a diagram THEN THE System SHALL update the diagram name and reflect changes immediately
8. THE System SHALL display diagrams within a project sorted by last modified date in descending order

### Requirement 4: Split-Pane Editor with Live Preview

**User Story:** As a user, I want to write Mermaid code and see the diagram preview in real-time, so that I can visualize my diagrams as I create them.

#### Acceptance Criteria

1. WHEN a user opens a diagram THEN THE Split_Pane_Editor SHALL display the Editor on the left and Preview_Pane on the right
2. WHEN a user types in the Editor THEN THE Mermaid_Renderer SHALL update the Preview_Pane within 500ms of the last keystroke
3. WHEN the Editor contains valid Mermaid syntax THEN THE Preview_Pane SHALL display the rendered diagram
4. WHEN the Editor contains invalid Mermaid syntax THEN THE Preview_Pane SHALL display an error indicator without crashing
5. WHEN a user resizes the split pane divider THEN THE Split_Pane_Editor SHALL adjust the widths of both panes proportionally
6. WHEN a user modifies diagram code THEN THE System SHALL auto-save changes after 2 seconds of inactivity
7. THE Editor SHALL provide syntax highlighting for Mermaid code
8. THE Editor SHALL display line numbers for code navigation

### Requirement 5: AI-Powered Syntax Fixing

**User Story:** As a user, I want AI to help fix syntax errors in my Mermaid diagrams, so that I can quickly resolve issues without manual debugging.

#### Acceptance Criteria

1. WHEN the Editor contains invalid Mermaid syntax THEN THE System SHALL display a "Fix with AI" button
2. WHEN a user clicks the "Fix with AI" button THEN THE Syntax_Fixer SHALL analyze the code and generate a corrected version
3. WHEN THE Syntax_Fixer generates a fix THEN THE System SHALL display a diff view comparing the original and fixed code with additions highlighted in green and deletions highlighted in red
4. WHEN a user accepts the AI fix THEN THE System SHALL replace the Editor content with the corrected code
5. WHEN a user rejects the AI fix THEN THE System SHALL dismiss the suggestion and retain the original code
6. WHILE THE Syntax_Fixer is processing THEN THE System SHALL display a loading indicator
7. IF THE Syntax_Fixer fails to generate a fix THEN THE System SHALL display an error message with troubleshooting guidance

### Requirement 6: Diagram Persistence

**User Story:** As a user, I want my diagrams to be saved automatically, so that I don't lose my work.

#### Acceptance Criteria

1. WHEN a user modifies diagram code THEN THE System SHALL persist changes to the database after auto-save triggers
2. WHEN a user reopens a diagram THEN THE System SHALL load the most recently saved version
3. WHEN a user creates a new diagram THEN THE System SHALL store it with a unique identifier
4. IF a save operation fails THEN THE System SHALL display an error notification and retry automatically
5. THE System SHALL store diagram metadata including creation date, last modified date, and owner

### Requirement 7: Dashboard and Navigation

**User Story:** As a user, I want a clear dashboard to navigate between my projects and diagrams, so that I can efficiently manage my work.

#### Acceptance Criteria

1. WHEN a user logs in THEN THE System SHALL display the dashboard with a list of their projects
2. WHEN a user has no projects THEN THE System SHALL display an empty state with a prompt to create a project
3. THE System SHALL provide breadcrumb navigation showing the current location (Dashboard > Project > Diagram)
4. WHEN a user clicks a breadcrumb THEN THE System SHALL navigate to that location
5. THE System SHALL display project cards showing project name, diagram count, and last modified date
