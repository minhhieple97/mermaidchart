'use server';

/**
 * AI Actions for Mermaid syntax fixing
 *
 * Optimizations (vercel-react-best-practices):
 * - server-auth-actions: Authentication verified inside action
 * - async-defer-await: Deferred awaits until needed
 * - js-hoist-regexp: Hoisted RegExp patterns outside functions
 */

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';
import { generateText } from 'ai';
import { getAIModel, isAIConfigured, getAIProvider } from '@/lib/ai';
import { AI_FIX_SYSTEM_PROMPT, EDITOR_CONSTANTS } from '../constants';
import { CREDIT_COSTS } from '@/features/credits';
import { deductCredits } from '@/queries';

// Hoisted RegExp patterns (js-hoist-regexp)
const NULL_CHAR_REGEX = /\0/g;
const BACKTICKS_REGEX = /```/g;
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const EXCESSIVE_NEWLINES_REGEX = /\n{4,}/g;
const MERMAID_CODE_BLOCK_REGEX = /```mermaid\n([\s\S]*?)\n```/;

function sanitizeInput(input: string): string {
  return input
    .replace(NULL_CHAR_REGEX, '')
    .replace(BACKTICKS_REGEX, '` ` `')
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(EXCESSIVE_NEWLINES_REGEX, '\n\n\n')
    .trim();
}

// Hoisted mermaid validation patterns (js-hoist-regexp)
const MERMAID_PATTERNS = [
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

function looksLikeMermaidCode(code: string): boolean {
  const trimmed = code.trim();
  return MERMAID_PATTERNS.some((pattern) => pattern.test(trimmed));
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
  diagramId: z.string().optional(),
});

/**
 * Fix Mermaid syntax using AI
 */
export const fixMermaidSyntaxAction = authAction
  .inputSchema(fixSyntaxSchema)
  .action(
    async ({
      ctx: { user },
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

      let creditsRemaining = 0;

      try {
        const result = await deductCredits(
          user.id,
          CREDIT_COSTS.AI_FIX,
          'ai_fix',
          diagramId,
          { error_hash: hashString(sanitizedError.slice(0, 100)) },
        );
        creditsRemaining = result.new_balance;
      } catch (error) {
        throw new ActionError(
          error instanceof Error ? error.message : 'Insufficient credits',
        );
      }

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

        const codeMatch = text.match(MERMAID_CODE_BLOCK_REGEX);

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
