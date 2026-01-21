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
import { useCreateDiagramForm } from '@/hooks/use-create-diagram';

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
  const { form, isLoading, onSubmit, handleClose } = useCreateDiagramForm({
    projectId,
    onSuccess,
    onOpenChange,
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
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
                      className="h-11 sm:h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                {isLoading ? 'Creating...' : 'Create Diagram'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
