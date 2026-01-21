'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';
import { createProject, updateProject, deleteProject } from '@/queries';

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
  .action(async ({ parsedInput: { name }, ctx: { user } }) => {
    try {
      const project = await createProject(user.id, name);
      return { success: true, project };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to create project',
      );
    }
  });

/**
 * Update an existing project's name
 */
export const updateProjectAction = authAction
  .inputSchema(updateProjectSchema)
  .action(async ({ parsedInput: { id, name } }) => {
    try {
      const project = await updateProject(id, name);
      return { success: true, project };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to update project',
      );
    }
  });

/**
 * Delete a project and all associated diagrams (cascade)
 */
export const deleteProjectAction = authAction
  .inputSchema(deleteProjectSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      await deleteProject(id);
      return { success: true };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to delete project',
      );
    }
  });
