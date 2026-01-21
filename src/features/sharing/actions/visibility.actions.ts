'use server';

/**
 * Visibility Server Actions
 * Handles toggling diagram visibility (public/private)
 *
 * Requirements:
 * - 3.2: Update diagram's is_public field in database
 * - 3.6: Persist visibility change immediately
 */

import { z } from 'zod';
import { authActionClient } from '@/lib/safe-action';

const toggleVisibilitySchema = z.object({
  diagramId: z.string().uuid(),
  isPublic: z.boolean(),
});

export const toggleVisibilityAction = authActionClient
  .schema(toggleVisibilitySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { diagramId, isPublic } = parsedInput;
    const { supabase, user } = ctx;

    // First verify the user owns this diagram (via project ownership)
    const { data: diagram, error: fetchError } = await supabase
      .from('diagrams')
      .select('id, project_id, projects!inner(user_id)')
      .eq('id', diagramId)
      .single();

    if (fetchError || !diagram) {
      throw new Error('Diagram not found');
    }

    // Check ownership through project
    const projects = diagram.projects as unknown as { user_id: string };
    if (projects.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    // Update visibility
    const { error: updateError } = await supabase
      .from('diagrams')
      .update({ is_public: isPublic })
      .eq('id', diagramId);

    if (updateError) {
      throw new Error('Failed to update visibility');
    }

    return { success: true, isPublic };
  });
