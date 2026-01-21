'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters')
    .trim(),
});

const updateProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters')
    .trim(),
});

const deleteProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

/**
 * Create a new project for the authenticated user
 */
export const createProjectAction = authAction
  .inputSchema(createProjectSchema)
  .action(async ({ parsedInput: { name }, ctx: { user, supabase } }) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, user_id: user.id })
      .select()
      .single();

    if (error) {
      throw new ActionError(error.message);
    }

    return { success: true, project: data };
  });

/**
 * Update an existing project's name
 */
export const updateProjectAction = authAction
  .inputSchema(updateProjectSchema)
  .action(async ({ parsedInput: { id, name }, ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ActionError(error.message);
    }

    return { success: true, project: data };
  });

/**
 * Delete a project and all associated diagrams (cascade)
 */
export const deleteProjectAction = authAction
  .inputSchema(deleteProjectSchema)
  .action(async ({ parsedInput: { id }, ctx: { supabase } }) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      throw new ActionError(error.message);
    }

    return { success: true };
  });
