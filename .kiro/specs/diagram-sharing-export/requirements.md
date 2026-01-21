# Requirements Document

## Introduction

This feature adds export to image functionality and publish/private visibility controls for Mermaid diagrams. Users will be able to export their diagrams as PNG or SVG images, control diagram visibility (public/private), and share public diagrams via unique URLs.

## Glossary

- **Diagram**: A Mermaid chart entity stored in the database with code, name, and visibility settings
- **Preview_Pane**: The right-side component of the split-pane editor that displays rendered diagrams
- **Export_Service**: The service responsible for converting rendered SVG diagrams to PNG or SVG files
- **Visibility_Toggle**: A UI control that allows users to switch between public and private diagram states
- **Share_Page**: A read-only page accessible without authentication that displays public diagrams
- **Owner**: The authenticated user who created and owns a diagram

## Requirements

### Requirement 1: Export to PNG

**User Story:** As a user, I want to export my diagram as a PNG image, so that I can use it in documents, presentations, or share it externally.

#### Acceptance Criteria

1. WHEN a user clicks the PNG export button in the Preview_Pane toolbar, THE Export_Service SHALL generate a PNG image matching the currently displayed diagram
2. WHEN the PNG export completes successfully, THE Export_Service SHALL trigger a browser download with filename format `{diagram-name}.png`
3. IF the diagram has a rendering error, THEN THE Export_Service SHALL disable the PNG export button and display a tooltip explaining export is unavailable
4. WHEN exporting to PNG, THE Export_Service SHALL preserve the visual fidelity of the rendered SVG including colors, fonts, and layout

### Requirement 2: Export to SVG

**User Story:** As a user, I want to export my diagram as an SVG file, so that I can have a scalable vector format for high-quality printing or further editing.

#### Acceptance Criteria

1. WHEN a user clicks the SVG export button in the Preview_Pane toolbar, THE Export_Service SHALL generate an SVG file from the current diagram
2. WHEN the SVG export completes successfully, THE Export_Service SHALL trigger a browser download with filename format `{diagram-name}.svg`
3. IF the diagram has a rendering error, THEN THE Export_Service SHALL disable the SVG export button and display a tooltip explaining export is unavailable
4. THE Export_Service SHALL use the raw SVG string from the Mermaid renderer for SVG export

### Requirement 3: Visibility Toggle

**User Story:** As a user, I want to control whether my diagram is public or private, so that I can choose to share specific diagrams while keeping others private.

#### Acceptance Criteria

1. THE Diagram SHALL have an `is_public` boolean field that defaults to false (private)
2. WHEN a user toggles the visibility setting, THE System SHALL update the diagram's `is_public` field in the database
3. WHEN a diagram is private, THE System SHALL only allow the Owner to view and edit it
4. WHEN a diagram is public, THE System SHALL allow anyone with the share URL to view it (read-only)
5. THE Visibility_Toggle SHALL display the current visibility state clearly to the user
6. WHEN the visibility is changed, THE System SHALL persist the change immediately

### Requirement 4: Copy Share Link

**User Story:** As a user, I want to copy a shareable link for my public diagram, so that I can easily share it with others.

#### Acceptance Criteria

1. WHEN a diagram is public, THE System SHALL display a "Copy Link" button in the diagram editor
2. WHEN a user clicks the "Copy Link" button, THE System SHALL copy the share URL to the clipboard
3. WHEN the link is copied successfully, THE System SHALL display a confirmation message to the user
4. WHILE a diagram is private, THE System SHALL hide the "Copy Link" button
5. THE share URL SHALL follow the format `/share/{diagramId}`

### Requirement 5: Public Diagram Viewing

**User Story:** As a visitor, I want to view public diagrams without logging in, so that I can see diagrams shared with me.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/share/{diagramId}` for a public diagram, THE Share_Page SHALL display the rendered diagram
2. THE Share_Page SHALL display the diagram in read-only mode without an editor
3. THE Share_Page SHALL NOT require authentication to view public diagrams
4. IF a visitor navigates to `/share/{diagramId}` for a private diagram, THEN THE Share_Page SHALL display a "Diagram not found or is private" message
5. IF a visitor navigates to `/share/{diagramId}` for a non-existent diagram, THEN THE Share_Page SHALL display a "Diagram not found or is private" message
6. THE Share_Page SHALL display the diagram name as the page title

### Requirement 6: Database Schema Update

**User Story:** As a developer, I want the database schema updated to support visibility settings, so that the feature can persist diagram visibility state.

#### Acceptance Criteria

1. THE System SHALL add an `is_public` boolean column to the diagrams table with default value false
2. THE System SHALL update RLS policies to allow unauthenticated read access to public diagrams
3. THE System SHALL maintain existing RLS policies for private diagrams (owner-only access)
4. THE System SHALL create an index on the `is_public` column for query performance
