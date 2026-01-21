'use server';

/**
 * AI Server Actions
 * Server actions for AI-powered Mermaid syntax fixing
 *
 * Security measures:
 * - Input validation with strict length limits
 * - Input sanitization to prevent prompt injection
 * - Credit-based rate limiting
 * - Hardened system prompt
 * - Safe error handling (no internal details leaked)
 */

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { generateText } from 'ai';
import { getAIModel, isAIConfigured, getAIProvider } from '@/lib/ai';
import { AI_FIX_SYSTEM_PROMPT, EDITOR_CONSTANTS } from '../constants';
import { CREDIT_COSTS } from '@/features/credits';

/**
 * Sanitize user input to prevent prompt injection attacks
 * Removes or escapes potentially dangerous patterns
 */
function sanitizeInput(input: string): string {
  return (
    input
      // Remove null bytes
      .replace(/\0/g, '')
      // Escape markdown code fence attempts that could break out of context
      .replace(/```/g, '` ` `')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Limit consecutive newlines to prevent layout attacks
      .replace(/\n{4,}/g, '\n\n\n')
      // Trim excessive whitespace
      .trim()
  );
}

/**
 * Validate that input looks like Mermaid code (basic check)
 * This is a first-line defense, not comprehensive validation
 */
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

  const trimmedCode = code.trim();
  return mermaidPatterns.some((pattern) => pattern.test(trimmedCode));
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
 * Analyzes the code and error message to generate a corrected version
 * Deducts 1 credit per request
 */
export const fixMermaidSyntaxAction = authActionClient
  .schema(fixSyntaxSchema)
  .action(
    async ({
      ctx: { user, supabase },
      parsedInput: { code, errorMessage, diagramId },
    }) => {
      // Check if AI is configured
      if (!isAIConfigured()) {
        const provider = getAIProvider();
        return {
          success: false,
          error: `AI provider "${provider}" is not configured. Please contact support.`,
        };
      }

      // Sanitize inputs before processing
      const sanitizedCode = sanitizeInput(code);
      const sanitizedError = sanitizeInput(errorMessage);

      // Deduct credits before AI call
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
        // Initialize credits if not exists
        if (
          deductError.code === 'PGRST116' ||
          deductError.message?.includes('not initialized')
        ) {
          await supabase.rpc('initialize_user_credits', { p_user_id: user.id });
          // Retry deduction
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
            return {
              success: false,
              error: 'Insufficient credits',
              creditsRemaining: 0,
            };
          }
        } else {
          return { success: false, error: 'Unable to process request' };
        }
      } else if (!deductResult?.[0]?.success) {
        return {
          success: false,
          error: deductResult?.[0]?.error_message ?? 'Insufficient credits',
          creditsRemaining: deductResult?.[0]?.new_balance ?? 0,
        };
      }

      const creditsRemaining = deductResult?.[0]?.new_balance ?? 0;

      try {
        const model = await getAIModel('fast');

        // Construct prompt with clear boundaries
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

        // Parse response to extract code and explanation
        const codeMatch = text.match(/```mermaid\n([\s\S]*?)\n```/);

        // Validate that we got valid output
        if (!codeMatch) {
          // Check if AI refused (security measure worked)
          if (text.includes('ERROR:') || text.includes('Invalid input')) {
            return {
              success: false,
              error:
                'Unable to process the provided code. Please ensure it is valid Mermaid syntax.',
              creditsRemaining,
            };
          }
          // Fallback - return original code
          return {
            success: false,
            error:
              'Unable to generate a fix. Please check your diagram syntax manually.',
            creditsRemaining,
          };
        }

        const fixedCode = codeMatch[1].trim();
        const explanation = text
          .replace(/```mermaid[\s\S]*?```/, '')
          .trim()
          .slice(0, 500); // Limit explanation length

        return {
          success: true,
          fixedCode,
          explanation: explanation || 'Syntax has been corrected.',
          creditsRemaining,
        };
      } catch (error) {
        // Log error server-side for debugging (not exposed to client)
        console.error(
          '[AI Fix Error]',
          error instanceof Error ? error.message : 'Unknown error',
        );

        return {
          success: false,
          error:
            'An error occurred while processing your request. Please try again.',
          creditsRemaining,
        };
      }
    },
  );

/**
 * Simple hash function for logging (not cryptographic)
 * Used to track error patterns without storing raw user content
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}
