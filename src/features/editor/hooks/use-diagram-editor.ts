'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useDiagram, useUpdateDiagram } from '@/hooks/use-diagrams';
import { useProjects } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from './use-auto-save';
import { useVisibility } from '@/features/sharing';
import { signOutAction } from '@/actions/auth';

interface UseDiagramEditorOptions {
  diagramId: string;
  projectId: string;
}

export function useDiagramEditor({
  diagramId,
  projectId,
}: UseDiagramEditorOptions) {
  const router = useRouter();
  const { toast } = useToast();

  // Data fetching
  const { data: diagram, isLoading, error } = useDiagram(diagramId);
  const { data: projects } = useProjects();
  const { updateDiagram } = useUpdateDiagram();

  const currentProject = projects?.find((p) => p.id === projectId);

  // Track user edits separately from initial diagram code
  const [userCode, setUserCode] = useState<string | null>(null);

  // Derive the actual code to display
  const code = useMemo(() => {
    // If user has made edits, use their code
    if (userCode !== null) return userCode;
    // Otherwise use diagram code (or empty string while loading)
    return diagram?.code ?? '';
  }, [userCode, diagram?.code]);

  // Handler that marks code as user-edited
  const setCode = useCallback((newCode: string) => {
    setUserCode(newCode);
  }, []);

  // Auto-save is enabled once diagram is loaded
  const isReady = !!diagram;

  // Auto-save
  const handleSave = useCallback(
    async (codeToSave: string) =>
      updateDiagram({ id: diagramId, code: codeToSave }),
    [diagramId, updateDiagram],
  );

  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave(code, {
    onSave: handleSave,
    enabled: isReady && userCode !== null,
  });

  // Show save error toast
  useEffect(() => {
    if (saveError) {
      toast({
        title: 'Failed to save',
        description: saveError,
        variant: 'destructive',
      });
    }
  }, [saveError, toast]);

  // Visibility
  const {
    isPublic,
    toggleVisibility,
    isSaving: isVisibilitySaving,
  } = useVisibility({
    initialIsPublic: diagram?.is_public ?? false,
    diagramId,
    onSuccess: (newIsPublic) => {
      toast({
        title: newIsPublic ? 'Diagram is now public' : 'Diagram is now private',
        description: newIsPublic
          ? 'Anyone with the link can view'
          : 'Only you can view',
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update',
        description: err,
        variant: 'destructive',
      });
    },
  });

  // Sign out
  const { execute: signOut, status: signOutStatus } = useAction(signOutAction, {
    onSuccess: () => router.push('/login'),
  });

  // Copy link
  const [copied, setCopied] = useState(false);
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${diagramId}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }, [diagramId]);

  return {
    // Data
    diagram,
    isLoading,
    error,
    currentProject,

    // Code
    code,
    setCode,

    // Save status
    isSaving,
    lastSaved,

    // Visibility
    isPublic,
    toggleVisibility,
    isVisibilitySaving,

    // Copy link
    copied,
    copyLink,

    // Auth
    signOut,
    isSigningOut: signOutStatus === 'executing',
  };
}
