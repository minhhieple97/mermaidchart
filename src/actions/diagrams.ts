'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';

const createDiagramSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z
    .string()
    .min(1, 'Diagram name is required')
    .max(255, 'Diagram name must be less than 255 characters')
    .trim(),
});

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

const deleteDiagramSchema = z.object({
  id: z.string().uuid('Invalid diagram ID'),
});

/**
 * Create a new diagram with default template code
 */
export const createDiagramAction = authAction
  .inputSchema(createDiagramSchema)
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
      throw new ActionError(error.message);
    }

    return { success: true, diagram: data };
  });

/**
 * Update an existing diagram's name or code
 */
export const updateDiagramAction = authAction
  .inputSchema(updateDiagramSchema)
  .action(async ({ parsedInput: { id, ...updates }, ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('diagrams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ActionError(error.message);
    }

    return { success: true, diagram: data };
  });

/**
 * Delete a diagram
 */
export const deleteDiagramAction = authAction
  .inputSchema(deleteDiagramSchema)
  .action(async ({ parsedInput: { id }, ctx: { supabase } }) => {
    const { error } = await supabase.from('diagrams').delete().eq('id', id);

    if (error) {
      throw new ActionError(error.message);
    }

    return { success: true };
  });
