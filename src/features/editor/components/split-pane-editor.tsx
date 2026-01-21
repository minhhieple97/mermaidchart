'use client';

/**
 * Split Pane Editor Component
 * Main editor component with code editor on left and preview on right
 *
 * Requirements:
 * - 4.1: Display Editor on left and Preview_Pane on right
 * - 4.2: Update preview within 500ms of last keystroke
 * - 4.5: Resize split pane divider to adjust widths proportionally
 * - 5.1: Display "Fix with AI" button when syntax error exists
 */

import { useState, useCallback } from 'react';
import { CodeEditor } from './code-editor';
import { PreviewPane } from './preview-pane';
import { AIFixButton } from './ai-fix-button';
import { AIFixModal } from './ai-fix-modal';
import { useMermaidRenderer } from '../hooks/use-mermaid-renderer';
import { useSplitPane } from '../hooks/use-split-pane';
import { useAIFix } from '../hooks/use-ai-fix';
import { cn } from '@/lib/utils';

interface SplitPaneEditorProps {
  /** Current code value */
  code: string;
  /** Callback when code changes */
  onCodeChange: (code: string) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Diagram name for export filename */
  diagramName: string;
}

/**
 * Split pane editor with code editor, preview, and AI fix functionality
 */
export function SplitPaneEditor({
  code,
  onCodeChange,
  disabled = false,
  diagramName,
}: SplitPaneEditorProps) {
  const { svg, error, isRendering, hasError } = useMermaidRenderer(code);
  const { ratio, isDragging, handleMouseDown, containerRef } = useSplitPane();
  const {
    fixSyntax,
    isLoading: isFixing,
    fixedCode,
    explanation,
    reset,
  } = useAIFix();

  const [showFixModal, setShowFixModal] = useState(false);
  const [originalCodeForFix, setOriginalCodeForFix] = useState('');

  // Handle AI fix button click
  const handleFixClick = useCallback(() => {
    if (!error) return;

    setOriginalCodeForFix(code);
    fixSyntax({ code, errorMessage: error });
  }, [code, error, fixSyntax]);

  // Show modal when fix is ready
  const handleShowModal = useCallback(() => {
    if (fixedCode && !showFixModal) {
      setShowFixModal(true);
    }
  }, [fixedCode, showFixModal]);

  // Check if we should show the modal
  if (fixedCode && !showFixModal && !isFixing) {
    handleShowModal();
  }

  // Handle accepting the fix
  const handleAcceptFix = useCallback(() => {
    if (fixedCode) {
      onCodeChange(fixedCode);
      reset();
    }
  }, [fixedCode, onCodeChange, reset]);

  // Handle rejecting the fix
  const handleRejectFix = useCallback(() => {
    reset();
  }, [reset]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setShowFixModal(false);
  }, []);

  return (
    <>
      <div ref={containerRef} className="flex h-full w-full overflow-hidden">
        {/* Code Editor Pane */}
        <div
          className="h-full overflow-hidden border-r"
          style={{ width: `${ratio * 100}%` }}
        >
          <div className="flex flex-col h-full">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
              <span className="text-sm font-medium">Code</span>
              <AIFixButton
                visible={hasError}
                onClick={handleFixClick}
                isLoading={isFixing}
              />
            </div>
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={onCodeChange}
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={cn(
            'w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors',
            isDragging && 'bg-primary',
          )}
          onMouseDown={handleMouseDown}
        />

        {/* Preview Pane */}
        <div
          className="h-full overflow-hidden"
          style={{ width: `${(1 - ratio) * 100}%` }}
        >
          <PreviewPane
            svg={svg}
            error={error}
            isRendering={isRendering}
            diagramName={diagramName}
          />
        </div>
      </div>

      {/* AI Fix Modal */}
      <AIFixModal
        isOpen={showFixModal}
        onClose={handleCloseModal}
        originalCode={originalCodeForFix}
        fixedCode={fixedCode || ''}
        explanation={explanation || ''}
        onAccept={handleAcceptFix}
        onReject={handleRejectFix}
      />
    </>
  );
}
