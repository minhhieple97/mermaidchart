'use client';

/**
 * Create Diagram Dialog Component
 * Modal dialog for creating a new diagram within a project
 *
 * Requirements:
 * - 3.1: Create diagram with default template code
 * - 3.2: Create diagram with valid name
 * - 3.3: Display validation error for empty name
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateDiagram } from '@/hooks/use-diagrams';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Diagram name is required')
    .max(255, 'Diagram name must be less than 255 characters')
    .trim(),
});

type FormValues = z.infer<typeof formSchema>;

export interface CreateDiagramDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (diagramId: string) => void;
}

export function CreateDiagramDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: CreateDiagramDialogProps) {
  const { createDiagram, isLoading, result } = useCreateDiagram();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  // Handle result
  useEffect(() => {
    if (result?.data?.success && result.data.diagram) {
      toast({
        title: 'Diagram created',
        description: 'Your diagram has been created successfully.',
      });
      form.reset();
      onOpenChange(false);
      onSuccess?.(result.data.diagram.id);
    } else if (result?.data?.error) {
      toast({
        title: 'Failed to create diagram',
        description: result.data.error,
        variant: 'destructive',
      });
    }
  }, [result, toast, form, onOpenChange, onSuccess]);

  const onSubmit = (values: FormValues) => {
    createDiagram({
      projectId,
      name: values.name,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Diagram</DialogTitle>
          <DialogDescription>
            Enter a name for your new diagram. It will be created with a default
            template.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagram Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Flow Chart"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Diagram'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
