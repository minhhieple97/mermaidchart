// types/database.ts
// Re-exports Supabase generated types and provides Zod validation schemas
// Requirements: 2.3, 3.3

import { z } from 'zod';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database.types';

// ============================================================================
// TypeScript Types (from Supabase generated types)
// ============================================================================

/**
 * Project entity representing a container for diagrams
 * Generated from Supabase schema
 */
export type Project = Tables<'projects'> & {
  diagram_count?: number; // computed field from joined query
  diagrams?: Array<{ count: number }>; // for aggregate queries
};

/**
 * Diagram entity representing a single Mermaid chart
 * Generated from Supabase schema
 */
export type Diagram = Tables<'diagrams'>;

/**
 * Project insert type for creating new projects
 */
export type ProjectInsert = TablesInsert<'projects'>;

/**
 * Project update type for updating existing projects
 */
export type ProjectUpdate = TablesUpdate<'projects'>;

/**
 * Diagram insert type for creating new diagrams
 */
export type DiagramInsert = TablesInsert<'diagrams'>;

/**
 * Diagram update type for updating existing diagrams
 */
export type DiagramUpdate = TablesUpdate<'diagrams'>;

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
