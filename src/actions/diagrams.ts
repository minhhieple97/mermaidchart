'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';
import { createDiagram, updateDiagram, deleteDiagram } from '@/queries';

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
  .action(async ({ parsedInput: { projectId, name } }) => {
    try {
      const diagram = await createDiagram(projectId, name);
      return { success: true, diagram };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to create diagram',
      );
    }
  });

/**
 * Update an existing diagram's name or code
 */
export const updateDiagramAction = authAction
  .inputSchema(updateDiagramSchema)
  .action(async ({ parsedInput: { id, ...updates } }) => {
    try {
      const diagram = await updateDiagram(id, updates);
      return { success: true, diagram };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to update diagram',
      );
    }
  });

/**
 * Delete a diagram
 */
export const deleteDiagramAction = authAction
  .inputSchema(deleteDiagramSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      await deleteDiagram(id);
      return { success: true };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to delete diagram',
      );
    }
  });
