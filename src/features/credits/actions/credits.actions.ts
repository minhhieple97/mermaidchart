'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { z } from 'zod';
import { CREDIT_COSTS } from '../types/credits.types';
import type { DeductCreditsResult, UserCredits } from '../types/credits.types';

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
  .action(async ({ ctx: { user, supabase } }) => {
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (credits) {
      return { success: true, credits: credits as UserCredits };
    }

    if (error?.code === 'PGRST116') {
      const { data: newCredits, error: initError } = await supabase.rpc(
        'initialize_user_credits',
        { p_user_id: user.id },
      );

      if (initError) {
        throw new ActionError('Failed to initialize credits');
      }

      return { success: true, credits: newCredits as UserCredits };
    }

    throw new ActionError('Failed to fetch credits');
  });

/**
 * Deduct credits for AI usage
 */
export const deductCreditsAction = authAction
  .inputSchema(deductCreditsSchema)
  .action(
    async ({
      ctx: { user, supabase },
      parsedInput: { transactionType, referenceId, metadata },
    }) => {
      const amount = CREDIT_COSTS.AI_FIX;

      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_transaction_type: transactionType,
        p_reference_id: referenceId ?? null,
        p_metadata: metadata ?? {},
      });

      if (error) {
        throw new ActionError('Failed to deduct credits');
      }

      const result = data?.[0] as DeductCreditsResult | undefined;

      if (!result?.success) {
        throw new ActionError(result?.error_message ?? 'Insufficient credits');
      }

      return {
        success: true,
        balance: result.new_balance,
      };
    },
  );

/**
 * Check if user has sufficient credits
 */
export const checkCreditsAction = authAction
  .inputSchema(checkCreditsSchema)
  .action(
    async ({ ctx: { user, supabase }, parsedInput: { requiredAmount } }) => {
      const { data: credits } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      const balance = credits?.balance ?? 0;

      return {
        success: true,
        hasCredits: balance >= requiredAmount,
        balance,
      };
    },
  );
