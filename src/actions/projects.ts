'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { createProject, updateProject, deleteProject } from '@/queries';
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
} from '@/lib/validations';

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
