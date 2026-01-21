'use client';

import { memo } from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthErrorAlertProps {
  message: string | null;
}

export const AuthErrorAlert = memo(function AuthErrorAlert({
  message,
}: AuthErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
});
