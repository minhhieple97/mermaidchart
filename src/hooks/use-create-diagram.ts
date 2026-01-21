'use client';

/**
 * Custom hook for create diagram form
 * Handles form state, validation, and submission
 */

import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { createDiagramAction } from '@/actions/diagrams';
import { useToast } from '@/hooks/use-toast';
import { diagramKeys } from '@/hooks/use-diagrams';
import { createDiagramSchema } from '@/lib/validations';
import { z } from 'zod';

// Form only needs name field (projectId comes from options)
const formSchema = createDiagramSchema.pick({ name: true });
type FormValues = z.infer<typeof formSchema>;

interface UseCreateDiagramOptions {
  projectId: string;
  onSuccess?: (diagramId: string) => void;
  onOpenChange?: (open: boolean) => void;
}

export function useCreateDiagramForm(options: UseCreateDiagramOptions) {
  const { projectId, onSuccess, onOpenChange } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
  } = useAction(createDiagramAction, {
    onSuccess: (data) => {
      if (data?.data?.diagram) {
        queryClient.invalidateQueries({
          queryKey: diagramKeys.list(data.data.diagram.project_id),
        });
      }
    },
  });

  const isLoading = status === 'executing';

  // Handle result
  useEffect(() => {
    if (result?.data?.success && result.data.diagram) {
      toast({
        title: 'Diagram created',
        description: 'Your diagram has been created successfully.',
      });
      form.reset();
      resetAction();
      onOpenChange?.(false);
      onSuccess?.(result.data.diagram.id);
    } else if (result?.serverError) {
      toast({
        title: 'Failed to create diagram',
        description: result.serverError,
        variant: 'destructive',
      });
    }
  }, [result, toast, form, resetAction, onOpenChange, onSuccess]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      execute({
        projectId,
        name: values.name,
      });
    },
    [execute, projectId],
  );

  const handleClose = useCallback(() => {
    form.reset();
    resetAction();
    onOpenChange?.(false);
  }, [form, resetAction, onOpenChange]);

  return {
    form,
    isLoading,
    onSubmit,
    handleClose,
  };
}
