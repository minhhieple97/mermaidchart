'use server';

/**
 * AI Server Actions
 * Server actions for AI-powered Mermaid syntax fixing
 *
 * Requirements:
 * - 5.2: Analyze code and generate corrected version
 *
 * Uses scalable AI provider abstraction - defaults to Gemini 2.0 Flash
 * Can be switched to OpenAI or Anthropic via AI_PROVIDER env variable
 */

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { generateText } from 'ai';
import { getAIModel, isAIConfigured, getAIProvider } from '@/lib/ai';
import { AI_FIX_SYSTEM_PROMPT } from '../constants';

const fixSyntaxSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  errorMessage: z.string().min(1, 'Error message is required'),
});

/**
 * Fix Mermaid syntax using AI
 * Analyzes the code and error message to generate a corrected version
 *
 * Provider is determined by AI_PROVIDER env variable:
 * - "google" (default): Gemini 2.0 Flash
 * - "openai": GPT-4o-mini
 * - "anthropic": Claude 3 Haiku
 */
export const fixMermaidSyntaxAction = authActionClient
  .schema(fixSyntaxSchema)
  .action(async ({ parsedInput: { code, errorMessage } }) => {
    // Check if AI is configured
    if (!isAIConfigured()) {
      const provider = getAIProvider();
      return {
        success: false,
        error: `AI provider "${provider}" is not configured. Please set the appropriate API key in your environment variables.`,
      };
    }

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
      };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to fix syntax';
      return {
        success: false,
        error: errorMsg,
      };
    }
  });
