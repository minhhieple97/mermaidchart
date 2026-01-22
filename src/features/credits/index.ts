/**
 * Credits feature module
 * Manages user AI credits for usage-based billing
 */

// Actions
export {
  getUserCreditsAction,
  deductCreditsAction,
  checkCreditsAction,
} from './actions/credits.actions';

// Components
export { CreditBadge } from './components/credit-badge';

// Hooks
export { useCredits } from './hooks/use-credits';

// Types
export type {
  UserCredits,
  CreditTransaction,
  CreditTransactionType,
  DeductCreditsResult,
  AddCreditsResult,
} from './types/credits.types';

export { CREDIT_COSTS, INITIAL_CREDITS } from './types/credits.types';
