/**
 * Credit system types
 * Derived from database.types.ts as single source of truth
 */

import type { Tables, Database } from '@/types/database.types';

/** User credits row from database */
export type UserCredits = Tables<'user_credits'>;

/** Credit transaction row from database */
export type CreditTransaction = Tables<'credit_transactions'>;

/** Transaction type values */
export type CreditTransactionType =
  | 'ai_fix'
  | 'purchase'
  | 'bonus'
  | 'refund'
  | 'initial';

/** Result from deduct_credits database function */
export type DeductCreditsResult =
  Database['public']['Functions']['deduct_credits']['Returns'][number];

/** Result from add_credits database function */
export type AddCreditsResult =
  Database['public']['Functions']['add_credits']['Returns'][number];

/** Credit costs for different AI operations */
export const CREDIT_COSTS = {
  AI_FIX: 1,
} as const;

/** Initial credits for new users */
export const INITIAL_CREDITS = 50;
