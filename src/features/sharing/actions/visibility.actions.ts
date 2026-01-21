'use server';

import { z } from 'zod';
import { authAction, ActionError } from '@/lib/safe-action';
import { verifyDiagramOwnership, updateDiagramVisibility } from '@/queries';

const toggleVisibilitySchema = z.object({
  diagramId: z.string().uuid(),
  isPublic: z.boolean(),
});

export const toggleVisibilityAction = authAction
  .inputSchema(toggleVisibilitySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { diagramId, isPublic } = parsedInput;
    const { user } = ctx;

    try {
      const isOwner = await verifyDiagramOwnership(diagramId, user.id);

      if (!isOwner) {
        throw new ActionError('Unauthorized');
      }

      await updateDiagramVisibility(diagramId, isPublic);

      return { success: true, isPublic };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to update visibility',
      );
    }
  });
