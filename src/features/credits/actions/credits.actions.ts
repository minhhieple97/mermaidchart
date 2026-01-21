'use server';

/**
 * Credit System Server Actions
 * Handles credit balance queries and deductions for AI usage
 */

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';
import type { DeductCreditsResult, UserCredits } from '../types/credits.types';
import { CREDIT_COSTS } from '../types/credits.types';

/**
 * Get or initialize user credits
 * Creates credit record with 50 initial credits if not exists
 */
export const getUserCreditsAction = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx: { user, supabase } }) => {
    // Try to get existing credits
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (credits) {
      return { success: true, credits: credits as UserCredits };
    }

    // Initialize credits for new user
    if (error?.code === 'PGRST116') {
      const { data: newCredits, error: initError } = await supabase.rpc(
        'initialize_user_credits',
        { p_user_id: user.id },
      );

      if (initError) {
        return { success: false, error: 'Failed to initialize credits' };
      }

      return { success: true, credits: newCredits as UserCredits };
    }

    return { success: false, error: 'Failed to fetch credits' };
  });

const deductCreditsSchema = z.object({
  transactionType: z.enum(['ai_fix']),
  referenceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Deduct credits for AI usage
 * Uses database function for atomic operation (prevents race conditions)
 */
export const deductCreditsAction = authActionClient
  .schema(deductCreditsSchema)
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
        return { success: false, error: 'Failed to deduct credits' };
      }

      const result = data?.[0] as DeductCreditsResult | undefined;

      if (!result?.success) {
        return {
          success: false,
          error: result?.error_message ?? 'Insufficient credits',
          balance: result?.new_balance ?? 0,
        };
      }

      return {
        success: true,
        balance: result.new_balance,
      };
    },
  );

/**
 * Check if user has sufficient credits for an operation
 */
export const checkCreditsAction = authActionClient
  .schema(z.object({ requiredAmount: z.number().min(1) }))
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
