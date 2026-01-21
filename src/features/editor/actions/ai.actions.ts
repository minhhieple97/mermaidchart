'use server';

/**
 * AI Server Actions
 * Server actions for AI-powered Mermaid syntax fixing
 *
 * Requirements:
 * - 5.2: Analyze code and generate corrected version
 * - Credit deduction: 1 credit per AI fix request
 *
 * Uses scalable AI provider abstraction - defaults to Gemini 2.0 Flash
 * Can be switched to OpenAI or Anthropic via AI_PROVIDER env variable
 */

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { generateText } from 'ai';
import { getAIModel, isAIConfigured, getAIProvider } from '@/lib/ai';
import { AI_FIX_SYSTEM_PROMPT } from '../constants';
import { CREDIT_COSTS } from '@/features/credits';

const fixSyntaxSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  errorMessage: z.string().min(1, 'Error message is required'),
  diagramId: z.string().uuid().optional(),
});

/**
 * Fix Mermaid syntax using AI
 * Analyzes the code and error message to generate a corrected version
 * Deducts 1 credit per request
 *
 * Provider is determined by AI_PROVIDER env variable:
 * - "google" (default): Gemini 2.0 Flash
 * - "openai": GPT-4o-mini
 * - "anthropic": Claude 3 Haiku
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
          error: `AI provider "${provider}" is not configured. Please set the appropriate API key in your environment variables.`,
        };
      }

      // Deduct credits before AI call
      const { data: deductResult, error: deductError } = await supabase.rpc(
        'deduct_credits',
        {
          p_user_id: user.id,
          p_amount: CREDIT_COSTS.AI_FIX,
          p_transaction_type: 'ai_fix',
          p_reference_id: diagramId ?? null,
          p_metadata: { error_message: errorMessage.slice(0, 200) },
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
            p_metadata: { error_message: errorMessage.slice(0, 200) },
          });
          if (!retryResult?.[0]?.success) {
            return {
              success: false,
              error: 'Insufficient credits',
              creditsRemaining: 0,
            };
          }
        } else {
          return { success: false, error: 'Failed to process credits' };
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

        const { text } = await generateText({
          model,
          system: AI_FIX_SYSTEM_PROMPT,
          prompt: `Fix this Mermaid diagram code:

\`\`\`mermaid
${code}
\`\`\`

Error message: ${errorMessage}

Respond with:
1. The corrected code in a mermaid code block
2. A brief explanation of what was fixed`,
        });

        // Parse response to extract code and explanation
        const codeMatch = text.match(/```mermaid\n([\s\S]*?)\n```/);
        const fixedCode = codeMatch ? codeMatch[1].trim() : code;
        const explanation = text.replace(/```mermaid[\s\S]*?```/, '').trim();

        return {
          success: true,
          fixedCode,
          explanation: explanation || 'Code has been fixed.',
          creditsRemaining,
        };
      } catch (error) {
        // Note: Credits already deducted - no refund on AI failure
        // This prevents abuse of free retries
        const errorMsg =
          error instanceof Error ? error.message : 'Failed to fix syntax';
        return {
          success: false,
          error: errorMsg,
          creditsRemaining,
        };
      }
    },
  );
