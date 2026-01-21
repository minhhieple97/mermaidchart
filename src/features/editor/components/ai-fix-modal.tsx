'use client';

/**
 * AI Fix Modal Component
 * Modal showing the AI-suggested fix with diff view highlighting changes
 *
 * Requirements:
 * - 5.3: Display diff view comparing original and fixed code with additions in green and deletions in red
 * - 5.4: Accept AI fix to replace editor content
 * - 5.5: Reject AI fix to retain original code
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface AIFixModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Original code before fix */
  originalCode: string;
  /** AI-suggested fixed code */
  fixedCode: string;
  /** Explanation of what was fixed */
  explanation: string;
  /** Callback when user accepts the fix */
  onAccept: () => void;
  /** Callback when user rejects the fix */
  onReject: () => void;
}

/**
 * Modal for reviewing and accepting/rejecting AI-suggested fixes
 * Uses react-diff-viewer-continued for side-by-side diff with highlighting
 */
export function AIFixModal({
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Suggested Fix</DialogTitle>
          <DialogDescription>
            Review the suggested changes below. Accept to apply the fix or
            reject to keep your original code.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* Explanation */}
          {explanation && (
            <div className="rounded-lg bg-muted p-3">
              <h4 className="font-medium text-sm mb-1">What was fixed:</h4>
              <p className="text-sm text-muted-foreground">{explanation}</p>
            </div>
          )}

          {/* Diff View */}
          <div className="border rounded-md overflow-auto">
            <ReactDiffViewer
              oldValue={originalCode}
              newValue={fixedCode}
              splitView={true}
              useDarkTheme={false}
              leftTitle="Original Code"
              rightTitle="Fixed Code"
              compareMethod={DiffMethod.LINES}
              styles={{
                variables: {
                  light: {
                    diffViewerBackground: '#ffffff',
                    addedBackground: '#e6ffec',
                    addedColor: '#24292f',
                    removedBackground: '#ffebe9',
                    removedColor: '#24292f',
                    wordAddedBackground: '#abf2bc',
                    wordRemovedBackground: '#ff818266',
                    addedGutterBackground: '#ccffd8',
                    removedGutterBackground: '#ffd7d5',
                    gutterBackground: '#f6f8fa',
                    gutterBackgroundDark: '#f0f1f2',
                    highlightBackground: '#fffbdd',
                    highlightGutterBackground: '#fff5b1',
                  },
                },
                contentText: {
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '13px',
                },
                titleBlock: {
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderBottom: '1px solid #e1e4e8',
                  background: '#f6f8fa',
                },
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReject}>
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button onClick={handleAccept}>
            <Check className="mr-2 h-4 w-4" />
            Apply Fix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
