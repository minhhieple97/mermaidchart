'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserCreditsAction,
  deductCreditsAction,
} from '../actions/credits.actions';
import { useToast } from '@/hooks/use-toast';
import { CREDIT_COSTS } from '../types/credits.types';

const CREDITS_QUERY_KEY = ['user-credits'];

export function useCredits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: creditsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: CREDITS_QUERY_KEY,
    queryFn: async () => {
      const result = await getUserCreditsAction({});
      if (result?.serverError) {
        throw new Error(result.serverError);
      }
      if (!result?.data?.success) {
        throw new Error('Failed to fetch credits');
      }
      return result.data.credits;
    },
    staleTime: 30_000,
  });

  const deductMutation = useMutation({
    mutationFn: async (params: {
      transactionType: 'ai_fix';
      referenceId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const result = await deductCreditsAction(params);
      if (result?.serverError) {
        throw new Error(result.serverError);
      }
      if (!result?.data?.success) {
        throw new Error('Failed to deduct credits');
      }
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CREDITS_QUERY_KEY, (old: typeof creditsData) =>
        old ? { ...old, balance: data.balance } : old,
      );
    },
    onError: (error: Error) => {
      toast({
        title: 'Credit Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const balance = creditsData?.balance ?? 0;
  const hasCreditsForAiFix = balance >= CREDIT_COSTS.AI_FIX;

  return {
    balance,
    lifetimeUsed: creditsData?.lifetime_used ?? 0,
    isLoading,
    error,
    hasCreditsForAiFix,
    deductCredits: deductMutation.mutateAsync,
    isDeducting: deductMutation.isPending,
    invalidateCredits: () =>
      queryClient.invalidateQueries({ queryKey: CREDITS_QUERY_KEY }),
  };
}
