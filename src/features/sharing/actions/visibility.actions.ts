'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { verifyDiagramOwnership, updateDiagramVisibility } from '@/queries';
import { toggleVisibilitySchema } from '@/lib/validations';

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
