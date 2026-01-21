'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';
import { CREDIT_COSTS } from '../types/credits.types';
import { getUserCredits, deductCredits, checkCredits } from '@/queries';

const emptySchema = z.object({});

const deductCreditsSchema = z.object({
  transactionType: z.enum(['ai_fix']),
  referenceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const checkCreditsSchema = z.object({
  requiredAmount: z.number().min(1),
});

/**
 * Get or initialize user credits
 */
export const getUserCreditsAction = authAction
  .inputSchema(emptySchema)
  .action(async ({ ctx: { user } }) => {
    try {
      const credits = await getUserCredits(user.id);
      return { success: true, credits };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to fetch credits',
      );
    }
  });

/**
 * Deduct credits for AI usage
 */
export const deductCreditsAction = authAction
  .inputSchema(deductCreditsSchema)
  .action(
    async ({
      ctx: { user },
      parsedInput: { transactionType, referenceId, metadata },
    }) => {
      try {
        const amount = CREDIT_COSTS.AI_FIX;
        const result = await deductCredits(
          user.id,
          amount,
          transactionType,
          referenceId,
          metadata,
        );

        return {
          success: true,
          balance: result.new_balance,
        };
      } catch (error) {
        throw new ActionError(
          error instanceof Error ? error.message : 'Failed to deduct credits',
        );
      }
    },
  );

/**
 * Check if user has sufficient credits
 */
export const checkCreditsAction = authAction
  .inputSchema(checkCreditsSchema)
  .action(async ({ ctx: { user }, parsedInput: { requiredAmount } }) => {
    try {
      const hasCredits = await checkCredits(user.id, requiredAmount);
      const credits = await getUserCredits(user.id);

      return {
        success: true,
        hasCredits,
        balance: credits.balance,
      };
    } catch (error) {
      throw new ActionError(
        error instanceof Error ? error.message : 'Failed to check credits',
      );
    }
  });
