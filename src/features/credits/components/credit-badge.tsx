'use client';

import { Coins, Sparkles } from 'lucide-react';
import { useCredits } from '../hooks/use-credits';
import { cn } from '@/lib/utils';

interface CreditBadgeProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

export function CreditBadge({
  className,
  showIcon = true,
  variant = 'default',
}: CreditBadgeProps) {
  const { balance, isLoading } = useCredits();

  const isLow = balance <= 10;
  const isEmpty = balance === 0;

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 animate-pulse',
          variant === 'compact' && 'px-2 py-0.5',
          className,
        )}
      >
        <div className="h-3.5 w-3.5 rounded-full bg-gray-200" />
        <div className="h-3 w-6 rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-colors',
        isEmpty
          ? 'bg-red-50 text-red-700 border border-red-200'
          : isLow
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200',
        variant === 'compact' && 'px-2 py-0.5 text-xs',
        className,
      )}
      title={`${balance} AI credits remaining`}
    >
      {showIcon &&
        (isEmpty ? (
          <Sparkles className="h-3.5 w-3.5" />
        ) : (
          <Coins className="h-3.5 w-3.5" />
        ))}
      <span>{balance}</span>
      {variant === 'default' && (
        <span className="hidden sm:inline text-xs opacity-75">credits</span>
      )}
    </div>
  );
}
