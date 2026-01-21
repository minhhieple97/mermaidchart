'use client';

/**
 * Custom hook for create project form
 * Handles form state, validation, and submission
 */

import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { createProjectAction } from '@/actions/projects';
import { useToast } from '@/hooks/use-toast';
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from '@/lib/validations';
import { projectKeys } from '@/hooks/use-projects';

interface UseCreateProjectOptions {
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function useCreateProject(options?: UseCreateProjectOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onBlur',
  });

  const {
    execute,
    status,
    result,
    reset: resetAction,
  } = useAction(createProjectAction, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  const isLoading = status === 'executing';

  // Handle result
  useEffect(() => {
    if (result?.data?.success) {
      toast({
        title: 'Project created',
        description: 'Your project has been created successfully.',
      });
      form.reset();
      resetAction();
      options?.onSuccess?.();
      options?.onOpenChange?.(false);
    } else if (result?.serverError) {
      toast({
        title: 'Failed to create project',
        description: result.serverError,
        variant: 'destructive',
      });
    }
  }, [result, toast, form, resetAction, options]);

  const onSubmit = useCallback(
    (values: CreateProjectFormValues) => {
      execute(values);
    },
    [execute],
  );

  const handleClose = useCallback(() => {
    form.reset();
    resetAction();
    options?.onOpenChange?.(false);
  }, [form, resetAction, options]);

  return {
    form,
    isLoading,
    onSubmit,
    handleClose,
  };
}
