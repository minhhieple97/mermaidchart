'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
    lineHeight: '1.6',
  },
  titleBlock: {
    fontWeight: 600,
    fontSize: '13px',
    padding: '10px 16px',
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
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Suggested Fix
          </DialogTitle>
          <DialogDescription>
            Review the changes below. Green highlights show additions, red shows
            removals.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* Explanation */}
          {explanation && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-1">
                What was fixed:
              </h4>
              <p className="text-sm text-blue-800">{explanation}</p>
            </div>
          )}

          {/* Diff View */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <ReactDiffViewer
              oldValue={originalCode}
              newValue={fixedCode}
              splitView={true}
              useDarkTheme={false}
              leftTitle="❌ Original (with error)"
              rightTitle="✅ Fixed (AI suggestion)"
              compareMethod={DiffMethod.LINES}
              styles={diffStyles}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleReject} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
            Apply Fix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
