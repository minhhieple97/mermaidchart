'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Save,
  Check,
  Home,
  ChevronRight,
  Lock,
  Globe,
  Link2,
  User,
  LogOut,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDiagram, useUpdateDiagram } from '@/hooks/use-diagrams';
import { useProjects } from '@/hooks/use-projects';
import { useToast } from '@/hooks/use-toast';
import { SplitPaneEditor, useAutoSave } from '@/features/editor';
import { useVisibility } from '@/features/sharing';
import { signOutAction } from '@/actions/auth';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';

export default function DiagramEditorPage() {
  const params = useParams();
  const { toast } = useToast();
  const diagramId = params.diagramId as string;
  const projectId = params.projectId as string;

  const { data: diagram, isLoading, error } = useDiagram(diagramId);
  const { data: projects } = useProjects();
  const { updateDiagram } = useUpdateDiagram();
  const currentProject = projects?.find((p) => p.id === projectId);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-600 font-medium">Failed to load diagram</p>
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}`}>Back to Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <EditorContent
      diagram={diagram}
      projectId={projectId}
      diagramId={diagramId}
      projectName={currentProject?.name}
      updateDiagram={updateDiagram}
      toast={toast}
    />
  );
}

function EditorContent({
  diagram,
  projectId,
  diagramId,
  projectName,
  updateDiagram,
  toast,
}: {
  diagram: {
    code: string;
    name: string;
    updated_at: string;
    is_public: boolean;
  };
  projectId: string;
  diagramId: string;
  projectName?: string;
  updateDiagram: (data: { id: string; code: string }) => void;
  toast: (opts: {
    title: string;
    description: string;
    variant?: 'destructive';
  }) => void;
}) {
  const router = useRouter();
  const [code, setCode] = useState(diagram.code);
  const [copied, setCopied] = useState(false);

  const { execute: signOut, status: signOutStatus } = useAction(signOutAction, {
    onSuccess: () => router.push('/login'),
  });

  const {
    isPublic,
    toggleVisibility,
    isSaving: isVisibilitySaving,
  } = useVisibility({
    initialIsPublic: diagram.is_public ?? false,
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
    enabled: true,
  });

  useEffect(() => {
    if (saveError) {
      toast({
        title: 'Failed to save',
        description: saveError,
        variant: 'destructive',
      });
    }
  }, [saveError, toast]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${diagramId}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 flex-shrink-0">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            <GitBranch className="h-5 w-5 text-blue-600" />
            <span className="hidden sm:inline">Mermaid Preview</span>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200" />

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm">
            <Link
              href={`/projects/${projectId}`}
              className="text-gray-500 hover:text-gray-900 transition-colors max-w-[150px] truncate"
            >
              {projectName || 'Project'}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="font-medium text-gray-900 max-w-[200px] truncate">
              {diagram.name}
            </span>
          </nav>
        </div>

        {/* Center: Save status */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {isSaving ? (
            <>
              <Save className="h-3.5 w-3.5 animate-pulse" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </>
          ) : (
            <span>
              Last saved {new Date(diagram.updated_at).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Right: Actions + User Menu */}
        <div className="flex items-center gap-3">
          {/* Visibility Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVisibility}
            disabled={isVisibilitySaving}
            className="gap-1.5 h-8"
          >
            {isVisibilitySaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPublic ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isPublic ? 'Public' : 'Private'}
            </span>
          </Button>

          {/* Copy Link */}
          {isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 h-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
              >
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="text-gray-500">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                disabled={signOutStatus === 'executing'}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {signOutStatus === 'executing' ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Editor - fills all remaining height */}
      <main className="flex-1 overflow-hidden">
        <SplitPaneEditor
          code={code}
          onCodeChange={setCode}
          diagramName={diagram.name}
        />
      </main>
    </div>
  );
}
