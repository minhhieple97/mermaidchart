'use server';

/**
 * Share Server Actions
 * Handles fetching public diagrams for unauthenticated access
 *
 * Requirements:
 * - 5.1: Fetch public diagram data
 * - 5.4, 5.5: Return error for private/non-existent diagrams
 */

import { z } from 'zod';
import { actionClient } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';

const getPublicDiagramSchema = z.object({
  diagramId: z.string().uuid(),
});

/**
 * Fetch a public diagram (unauthenticated access)
 * Returns diagram data if public, error if private or not found
 */
export const getPublicDiagramAction = actionClient
  .schema(getPublicDiagramSchema)
  .action(async ({ parsedInput }) => {
    const { diagramId } = parsedInput;
    const supabase = await createClient();

    // Fetch diagram - RLS policy will only return if is_public = true
    const { data: diagram, error } = await supabase
      .from('diagrams')
      .select('id, name, code, is_public')
      .eq('id', diagramId)
      .eq('is_public', true)
      .single();

    if (error || !diagram) {
      return { error: 'Diagram not found or is private' };
    }

    return {
      diagram: {
        id: diagram.id,
        name: diagram.name,
        code: diagram.code,
      },
    };
  });
