'use server';

import { z } from 'zod';
import { authAction, ActionError } from '@/lib/safe-action';

const toggleVisibilitySchema = z.object({
  diagramId: z.string().uuid(),
  isPublic: z.boolean(),
});

export const toggleVisibilityAction = authAction
  .inputSchema(toggleVisibilitySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { diagramId, isPublic } = parsedInput;
    const { supabase, user } = ctx;

    const { data: diagram, error: fetchError } = await supabase
      .from('diagrams')
      .select('id, project_id, projects!inner(user_id)')
      .eq('id', diagramId)
      .single();

    if (fetchError || !diagram) {
      throw new ActionError('Diagram not found');
    }

    const projects = diagram.projects as unknown as { user_id: string };
    if (projects.user_id !== user.id) {
      throw new ActionError('Unauthorized');
    }

    const { error: updateError } = await supabase
      .from('diagrams')
      .update({ is_public: isPublic })
      .eq('id', diagramId);

    if (updateError) {
      throw new ActionError('Failed to update visibility');
    }

    return { success: true, isPublic };
  });
