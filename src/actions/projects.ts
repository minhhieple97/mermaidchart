'use server';

// actions/projects.ts
// Server actions for project management
// Requirements: 2.2, 2.3, 2.6, 2.7

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Schema for creating a new project
 * - name: non-empty, max 255 characters, trimmed
 */
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters')
    .trim(),
});

/**
 * Schema for updating an existing project
 * - id: valid UUID
 * - name: non-empty, max 255 characters, trimmed
 */
const updateProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters')
    .trim(),
});

/**
 * Schema for deleting a project
 * - id: valid UUID
 */
const deleteProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Create a new project for the authenticated user
 * Requirements: 2.2 - Create project with valid name
 */
export const createProjectAction = authActionClient
  .schema(createProjectSchema)
  .action(async ({ parsedInput: { name }, ctx: { user, supabase } }) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, user_id: user.id })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, project: data };
  });

/**
 * Update an existing project's name
 * Requirements: 2.7 - Edit project name
 */
export const updateProjectAction = authActionClient
  .schema(updateProjectSchema)
  .action(async ({ parsedInput: { id, name }, ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, project: data };
  });

/**
 * Delete a project and all associated diagrams (cascade)
 * Requirements: 2.6 - Delete project and associated diagrams
 */
export const deleteProjectAction = authActionClient
  .schema(deleteProjectSchema)
  .action(async ({ parsedInput: { id }, ctx: { supabase } }) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  });
