'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';
import { generateText } from 'ai';
import { getAIModel, isAIConfigured, getAIProvider } from '@/lib/ai';
import { AI_FIX_SYSTEM_PROMPT, EDITOR_CONSTANTS } from '../constants';
import { CREDIT_COSTS } from '@/features/credits';

function sanitizeInput(input: string): string {
  return input
    .replace(/\0/g, '')
    .replace(/```/g, '` ` `')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function looksLikeMermaidCode(code: string): boolean {
  const mermaidPatterns = [
    /^(graph|flowchart)\s+(TB|BT|LR|RL|TD)/im,
    /^sequenceDiagram/im,
    /^classDiagram/im,
    /^stateDiagram/im,
    /^erDiagram/im,
    /^gantt/im,
    /^pie/im,
    /^mindmap/im,
    /^timeline/im,
    /^gitGraph/im,
    /^journey/im,
    /^quadrantChart/im,
    /^requirementDiagram/im,
    /^C4Context/im,
  ];

  return mermaidPatterns.some((pattern) => pattern.test(code.trim()));
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

const fixSyntaxSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(
      EDITOR_CONSTANTS.MAX_CODE_LENGTH,
      `Code must be less than ${EDITOR_CONSTANTS.MAX_CODE_LENGTH} characters`,
    )
    .refine(
      (code) => looksLikeMermaidCode(code),
      'Input does not appear to be valid Mermaid diagram code',
    ),
  errorMessage: z
    .string()
    .min(1, 'Error message is required')
    .max(
      EDITOR_CONSTANTS.MAX_ERROR_MESSAGE_LENGTH,
      `Error message must be less than ${EDITOR_CONSTANTS.MAX_ERROR_MESSAGE_LENGTH} characters`,
    ),
  diagramId: z.string().uuid().optional(),
});

/**
 * Fix Mermaid syntax using AI
 */
export const fixMermaidSyntaxAction = authAction
  .inputSchema(fixSyntaxSchema)
  .action(
    async ({
      ctx: { user, supabase },
      parsedInput: { code, errorMessage, diagramId },
    }) => {
      if (!isAIConfigured()) {
        const provider = getAIProvider();
        throw new ActionError(
          `AI provider "${provider}" is not configured. Please contact support.`,
        );
      }

      const sanitizedCode = sanitizeInput(code);
      const sanitizedError = sanitizeInput(errorMessage);

      const { data: deductResult, error: deductError } = await supabase.rpc(
        'deduct_credits',
        {
          p_user_id: user.id,
          p_amount: CREDIT_COSTS.AI_FIX,
          p_transaction_type: 'ai_fix',
          p_reference_id: diagramId ?? null,
          p_metadata: { error_hash: hashString(sanitizedError.slice(0, 100)) },
        },
      );

      if (deductError) {
        if (
          deductError.code === 'PGRST116' ||
          deductError.message?.includes('not initialized')
        ) {
          await supabase.rpc('initialize_user_credits', { p_user_id: user.id });
          const { data: retryResult } = await supabase.rpc('deduct_credits', {
            p_user_id: user.id,
            p_amount: CREDIT_COSTS.AI_FIX,
            p_transaction_type: 'ai_fix',
            p_reference_id: diagramId ?? null,
            p_metadata: {
              error_hash: hashString(sanitizedError.slice(0, 100)),
            },
          });
          if (!retryResult?.[0]?.success) {
            throw new ActionError('Insufficient credits');
          }
        } else {
          throw new ActionError('Unable to process request');
        }
      } else if (!deductResult?.[0]?.success) {
        throw new ActionError(
          deductResult?.[0]?.error_message ?? 'Insufficient credits',
        );
      }

      const creditsRemaining = deductResult?.[0]?.new_balance ?? 0;

      try {
        const model = await getAIModel('fast');

        const userPrompt = `<mermaid_code>
${sanitizedCode}
</mermaid_code>

<error_message>
${sanitizedError}
</error_message>

Fix the syntax error in the Mermaid code above.`;

        const { text } = await generateText({
          model,
          system: AI_FIX_SYSTEM_PROMPT,
          prompt: userPrompt,
        });

        const codeMatch = text.match(/```mermaid\n([\s\S]*?)\n```/);

        if (!codeMatch) {
          if (text.includes('ERROR:') || text.includes('Invalid input')) {
            throw new ActionError(
              'Unable to process the provided code. Please ensure it is valid Mermaid syntax.',
            );
          }
          throw new ActionError(
            'Unable to generate a fix. Please check your diagram syntax manually.',
          );
        }

        const fixedCode = codeMatch[1].trim();
        const explanation = text
          .replace(/```mermaid[\s\S]*?```/, '')
          .trim()
          .slice(0, 500);

        return {
          success: true,
          fixedCode,
          explanation: explanation || 'Syntax has been corrected.',
          creditsRemaining,
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }
        console.error(
          '[AI Fix Error]',
          error instanceof Error ? error.message : 'Unknown error',
        );
        throw new ActionError(
          'An error occurred while processing your request. Please try again.',
        );
      }
    },
  );
