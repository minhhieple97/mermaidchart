import { createClient } from '@/lib/supabase/server';
import type {
  UserCredits,
  DeductCreditsResult,
} from '@/features/credits/types/credits.types';

/**
 * Get user credits, initialize if not exists
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  const supabase = await createClient();

  const { data: credits, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (credits) {
    return credits as UserCredits;
  }

  // Initialize if not found
  if (error?.code === 'PGRST116') {
    const { data: newCredits, error: initError } = await supabase.rpc(
      'initialize_user_credits',
      { p_user_id: userId },
    );

    if (initError) {
      throw new Error('Failed to initialize credits');
    }

    return newCredits as UserCredits;
  }

  throw new Error('Failed to fetch credits');
}

/**
 * Deduct credits atomically
 */
export async function deductCredits(
  userId: string,
  amount: number,
  transactionType: string,
  referenceId?: string,
  metadata?: Record<string, unknown>,
): Promise<DeductCreditsResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: transactionType,
    p_reference_id: referenceId ?? null,
    p_metadata: metadata ?? {},
  });

  if (error) {
    // Try to initialize if credits not found
    if (
      error.code === 'PGRST116' ||
      error.message?.includes('not initialized')
    ) {
      await supabase.rpc('initialize_user_credits', { p_user_id: userId });

      // Retry deduction
      const { data: retryData, error: retryError } = await supabase.rpc(
        'deduct_credits',
        {
          p_user_id: userId,
          p_amount: amount,
          p_transaction_type: transactionType,
          p_reference_id: referenceId ?? null,
          p_metadata: metadata ?? {},
        },
      );

      if (retryError || !retryData?.[0]?.success) {
        throw new Error('Insufficient credits');
      }

      return retryData[0] as DeductCreditsResult;
    }

    throw new Error('Failed to deduct credits');
  }

  const result = data?.[0] as DeductCreditsResult | undefined;

  if (!result?.success) {
    throw new Error(result?.error_message ?? 'Insufficient credits');
  }

  return result;
}

/**
 * Check if user has sufficient credits
 */
export async function checkCredits(
  userId: string,
  requiredAmount: number,
): Promise<boolean> {
  const supabase = await createClient();

  const { data: credits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const balance = credits?.balance ?? 0;
  return balance >= requiredAmount;
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string,
  amount: number,
  transactionType: string,
  referenceId?: string,
  metadata?: Record<string, unknown>,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: transactionType,
    p_reference_id: referenceId ?? null,
    p_metadata: metadata ?? {},
  });

  if (error) {
    throw new Error('Failed to add credits');
  }

  return data;
}
