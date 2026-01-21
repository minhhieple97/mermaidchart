/**
 * Credit system types
 */

export interface UserCredits {
  user_id: string;
  balance: number;
  lifetime_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: CreditTransactionType;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type CreditTransactionType =
  | 'ai_fix'
  | 'purchase'
  | 'bonus'
  | 'refund'
  | 'initial';

export interface DeductCreditsResult {
  success: boolean;
  new_balance: number;
  error_message: string | null;
}

export interface AddCreditsResult {
  success: boolean;
  new_balance: number;
}

/** Credit costs for different AI operations */
export const CREDIT_COSTS = {
  AI_FIX: 1,
} as const;

/** Initial credits for new users */
export const INITIAL_CREDITS = 50;
