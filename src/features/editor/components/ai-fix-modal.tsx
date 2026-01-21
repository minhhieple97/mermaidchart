'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { DiffMethod } from 'react-diff-viewer-continued';

// Dynamic import react-diff-viewer to reduce initial bundle (~100KB savings)
const ReactDiffViewer = dynamic(
  () => import('react-diff-viewer-continued').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    ),
  },
);

interface AIFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  onAccept: () => void;
  onReject: () => void;
}

// Hoist static styles outside component to avoid recreation on each render
const diffStyles = {
  variables: {
    light: {
      diffViewerBackground: '#ffffff',
      addedBackground: '#dcfce7',
      addedColor: '#166534',
      removedBackground: '#fee2e2',
      removedColor: '#991b1b',
      wordAddedBackground: '#86efac',
      wordRemovedBackground: '#fca5a5',
      addedGutterBackground: '#bbf7d0',
      removedGutterBackground: '#fecaca',
      gutterBackground: '#f9fafb',
      gutterBackgroundDark: '#f3f4f6',
      highlightBackground: '#fef9c3',
      highlightGutterBackground: '#fef08a',
    },
  },
  contentText: {
    fontFamily:
      'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '13px',
    lineHeight: '1.7',
  },
  titleBlock: {
    fontWeight: 600,
    fontSize: '13px',
    padding: '10px 14px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  line: {
    padding: '2px 10px',
  },
  gutter: {
    padding: '0 10px',
    minWidth: '40px',
  },
} as const;

export const AIFixModal = memo(function AIFixModal({
  isOpen,
  onClose,
  originalCode,
  fixedCode,
  explanation,
  onAccept,
  onReject,
}: AIFixModalProps) {
  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="p-5 pb-4">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-violet-500" />
              AI Suggested Fix
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Review the proposed changes. Accept to apply or cancel to keep
              your original code.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-5 pb-5 space-y-4">
          {/* Explanation */}
          {explanation && (
            <div className="rounded-lg bg-violet-50 border border-violet-100 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-violet-900 mb-0.5">
                    What was fixed
                  </p>
                  <p className="text-sm text-violet-700 leading-relaxed">
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Diff View */}
          <div className="border rounded-lg overflow-hidden">
            <ReactDiffViewer
              oldValue={originalCode}
              newValue={fixedCode}
              splitView={true}
              useDarkTheme={false}
              leftTitle="Original (with error)"
              rightTitle="Fixed (AI suggestion)"
              compareMethod={DiffMethod.LINES}
              styles={diffStyles}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 pt-3 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={handleReject}
            className="gap-1.5 h-9 px-4"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            className="gap-1.5 h-9 px-4 bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-4 w-4" />
            Apply Fix
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
