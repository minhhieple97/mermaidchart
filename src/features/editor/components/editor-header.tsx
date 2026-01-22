'use client';

import Link from 'next/link';
import {
  Loader2,
  Save,
  Check,
  ChevronRight,
  Lock,
  Globe,
  Link2,
  User,
  LogOut,
  GitBranch,
  Menu,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditBadge } from '@/features/credits';

interface EditorHeaderProps {
  projectId: string;
  projectName?: string;
  diagramName: string;
  updatedAt: string;
  isSaving: boolean;
  lastSaved: Date | null;
  isPublic: boolean;
  isVisibilitySaving: boolean;
  copied: boolean;
  isSigningOut: boolean;
  onToggleVisibility: () => void;
  onCopyLink: () => void;
  onSignOut: () => void;
}

export function EditorHeader({
  projectId,
  projectName,
  diagramName,
  updatedAt,
  isSaving,
  lastSaved,
  isPublic,
  isVisibilitySaving,
  copied,
  isSigningOut,
  onToggleVisibility,
  onCopyLink,
  onSignOut,
}: EditorHeaderProps) {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-2 sm:px-4 flex-shrink-0">
      <HeaderLeft
        projectId={projectId}
        projectName={projectName}
        diagramName={diagramName}
      />
      <SaveStatus
        isSaving={isSaving}
        lastSaved={lastSaved}
        updatedAt={updatedAt}
      />
      <HeaderRight
        isPublic={isPublic}
        isVisibilitySaving={isVisibilitySaving}
        copied={copied}
        isSigningOut={isSigningOut}
        onToggleVisibility={onToggleVisibility}
        onCopyLink={onCopyLink}
        onSignOut={onSignOut}
      />
    </header>
  );
}

function HeaderLeft({
  projectId,
  projectName,
  diagramName,
}: {
  projectId: string;
  projectName?: string;
  diagramName: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-gray-900 hover:text-gray-700 transition-colors flex-shrink-0"
      >
        <GitBranch className="h-5 w-5 text-blue-600" />
        <span className="hidden md:inline">Mermaid Preview</span>
      </Link>
      <div className="h-6 w-px bg-gray-200 hidden sm:block" />
      <nav className="flex items-center gap-1 sm:gap-1.5 text-sm min-w-0">
        <Link
          href={`/projects/${projectId}`}
          className="text-gray-500 hover:text-gray-900 transition-colors max-w-[80px] sm:max-w-[150px] truncate hidden sm:inline"
        >
          {projectName || 'Project'}
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-300 hidden sm:block flex-shrink-0" />
        <span className="font-medium text-gray-900 max-w-[120px] sm:max-w-[200px] truncate">
          {diagramName}
        </span>
      </nav>
    </div>
  );
}

function SaveStatus({
  isSaving,
  lastSaved,
  updatedAt,
}: {
  isSaving: boolean;
  lastSaved: Date | null;
  updatedAt: string;
}) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
      {isSaving ? (
        <>
          <Save className="h-3.5 w-3.5 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span className="hidden md:inline">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
          <span className="md:hidden">Saved</span>
        </>
      ) : (
        <span className="hidden md:inline">
          Last saved {new Date(updatedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

function HeaderRight({
  isPublic,
  isVisibilitySaving,
  copied,
  isSigningOut,
  onToggleVisibility,
  onCopyLink,
  onSignOut,
}: {
  isPublic: boolean;
  isVisibilitySaving: boolean;
  copied: boolean;
  isSigningOut: boolean;
  onToggleVisibility: () => void;
  onCopyLink: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
      {/* Credits Badge */}
      <CreditBadge variant="compact" className="hidden sm:flex" />

      {/* Desktop: Individual buttons */}
      <div className="hidden sm:flex items-center gap-2">
        <VisibilityToggleButton
          isPublic={isPublic}
          isSaving={isVisibilitySaving}
          onClick={onToggleVisibility}
        />
        {isPublic && <CopyLinkButton copied={copied} onClick={onCopyLink} />}
      </div>

      {/* Mobile: Share dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={onToggleVisibility}
              disabled={isVisibilitySaving}
            >
              {isVisibilitySaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isPublic ? (
                <Globe className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {isPublic ? 'Make Private' : 'Make Public'}
            </DropdownMenuItem>
            {isPublic && (
              <DropdownMenuItem onClick={onCopyLink}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Link2 className="mr-2 h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UserMenu isSigningOut={isSigningOut} onSignOut={onSignOut} />
    </div>
  );
}

function VisibilityToggleButton({
  isPublic,
  isSaving,
  onClick,
}: {
  isPublic: boolean;
  isSaving: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isSaving}
      className="gap-1.5 h-8 cursor-pointer"
    >
      {isSaving ? (
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
  );
}

function CopyLinkButton({
  copied,
  onClick,
}: {
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1.5 h-8 cursor-pointer"
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
  );
}

function UserMenu({
  isSigningOut,
  onSignOut,
}: {
  isSigningOut: boolean;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full cursor-pointer"
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
          onClick={onSignOut}
          disabled={isSigningOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
