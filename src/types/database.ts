// types/database.ts
// Re-exports Supabase generated types and provides Zod validation schemas
// Single source of truth: database.types.ts (generated from Supabase)

import { z } from 'zod';

// ============================================================================
// Re-export all types from generated database.types.ts
// ============================================================================
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json,
} from '@/types/database.types';

// Import for local use
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database.types';

// ============================================================================
// Convenience Type Aliases (derived from database.types.ts)
// ============================================================================

/** Project row from database */
export type Project = Tables<'projects'> & {
  diagram_count?: number; // computed field from joined query
  diagrams?: Array<{ count: number }>; // for aggregate queries
};

/** Diagram row from database */
export type Diagram = Tables<'diagrams'>;

/** User credits row from database */
export type UserCredits = Tables<'user_credits'>;

/** Credit transaction row from database */
export type CreditTransaction = Tables<'credit_transactions'>;

/** Project insert type */
export type ProjectInsert = TablesInsert<'projects'>;

/** Project update type */
export type ProjectUpdate = TablesUpdate<'projects'>;

/** Diagram insert type */
export type DiagramInsert = TablesInsert<'diagrams'>;

/** Diagram update type */
export type DiagramUpdate = TablesUpdate<'diagrams'>;

/** User credits insert type */
export type UserCreditsInsert = TablesInsert<'user_credits'>;

/** User credits update type */
export type UserCreditsUpdate = TablesUpdate<'user_credits'>;

/** Credit transaction insert type */
export type CreditTransactionInsert = TablesInsert<'credit_transactions'>;

/** Credit transaction update type */
export type CreditTransactionUpdate = TablesUpdate<'credit_transactions'>;

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
