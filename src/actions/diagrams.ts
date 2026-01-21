'use server';

// actions/diagrams.ts
// Server actions for diagram management
// Requirements: 3.1, 3.2, 3.3, 3.6, 3.7

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Schema for creating a new diagram
 * - projectId: valid UUID
 * - name: non-empty, max 255 characters, trimmed
 */
const createDiagramSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z
    .string()
    .min(1, 'Diagram name is required')
    .max(255, 'Diagram name must be less than 255 characters')
    .trim(),
});

/**
 * Schema for updating an existing diagram
 * - id: valid UUID
 * - name: optional, non-empty, max 255 characters, trimmed
 * - code: optional, max 100,000 characters
 */
const updateDiagramSchema = z.object({
  id: z.string().uuid('Invalid diagram ID'),
  name: z
    .string()
    .min(1, 'Diagram name is required')
    .max(255, 'Diagram name must be less than 255 characters')
    .trim()
    .optional(),
  code: z.string().max(100000, 'Diagram code is too large').optional(),
});

/**
 * Schema for deleting a diagram
 * - id: valid UUID
 */
const deleteDiagramSchema = z.object({
  id: z.string().uuid('Invalid diagram ID'),
});

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Create a new diagram with default template code
 * Requirements: 3.1 - Create diagram with default template code
 */
export const createDiagramAction = authActionClient
  .schema(createDiagramSchema)
  .action(async ({ parsedInput: { projectId, name }, ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('diagrams')
      .insert({
        project_id: projectId,
        name,
        code: 'graph TD\n    A[Start] --> B[End]',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, diagram: data };
  });

/**
 * Update an existing diagram's name or code
 * Requirements: 3.7 - Rename diagram with immediate reflection
 */
export const updateDiagramAction = authActionClient
  .schema(updateDiagramSchema)
  .action(async ({ parsedInput: { id, ...updates }, ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('diagrams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, diagram: data };
  });

/**
 * Delete a diagram
 * Requirements: 3.6 - Remove diagram from project
 */
export const deleteDiagramAction = authActionClient
  .schema(deleteDiagramSchema)
  .action(async ({ parsedInput: { id }, ctx: { supabase } }) => {
    const { error } = await supabase.from('diagrams').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  });
