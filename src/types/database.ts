// types/database.ts
// TypeScript interfaces and Zod validation schemas for database entities
// Requirements: 2.3, 3.3

import { z } from 'zod';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * User entity representing an authenticated user
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Project entity representing a container for diagrams
 */
export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  diagram_count?: number; // computed field from joined query
}

/**
 * Diagram entity representing a single Mermaid chart
 */
export interface Diagram {
  id: string;
  project_id: string;
  name: string;
  code: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * Validation schema for project names
 * - Required (non-empty)
 * - Maximum 255 characters
 * - Trimmed of whitespace
 */
export const ProjectNameSchema = z
  .string()
  .min(1, 'Project name is required')
  .max(255, 'Project name must be less than 255 characters')
  .trim();

/**
 * Validation schema for diagram names
 * - Required (non-empty)
 * - Maximum 255 characters
 * - Trimmed of whitespace
 */
export const DiagramNameSchema = z
  .string()
  .min(1, 'Diagram name is required')
  .max(255, 'Diagram name must be less than 255 characters')
  .trim();

/**
 * Validation schema for diagram code content
 * - Maximum 100,000 characters
 */
export const DiagramCodeSchema = z
  .string()
  .max(100000, 'Diagram code must be less than 100,000 characters');

// ============================================================================
// Inferred Types from Schemas
// ============================================================================

export type ProjectName = z.infer<typeof ProjectNameSchema>;
export type DiagramName = z.infer<typeof DiagramNameSchema>;
export type DiagramCode = z.infer<typeof DiagramCodeSchema>;
