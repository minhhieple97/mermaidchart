'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { CodeEditor } from './code-editor';
import { PreviewPane } from './preview-pane';
import { AIFixButton } from './ai-fix-button';
import { AIFixModal } from './ai-fix-modal';
import { useMermaidRenderer } from '../hooks/use-mermaid-renderer';
import { useAIFix } from '../hooks/use-ai-fix';
import { useToast } from '@/hooks/use-toast';

interface SplitPaneEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  disabled?: boolean;
  diagramName: string;
}

export function SplitPaneEditor({
  code,
  onCodeChange,
  disabled = false,
  diagramName,
}: SplitPaneEditorProps) {
  const { svg, error, isRendering, hasError } = useMermaidRenderer(code);
  const {
    fixSyntax,
    isLoading: isFixing,
    fixedCode,
    explanation,
    error: aiError,
    reset,
  } = useAIFix();
  const { toast } = useToast();

  const [showFixModal, setShowFixModal] = useState(false);
  const [originalCodeForFix, setOriginalCodeForFix] = useState('');
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resize drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = Math.max(
        0.2,
        Math.min(0.8, (e.clientX - rect.left) / rect.width),
      );
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Handle AI fix button click - call server action
  const handleFixClick = useCallback(() => {
    if (!error) return;
    setOriginalCodeForFix(code);
    fixSyntax({ code, errorMessage: error });
  }, [code, error, fixSyntax]);

  // Show modal when AI returns fixed code
  useEffect(() => {
    if (fixedCode && !isFixing) {
      setShowFixModal(true);
    }
  }, [fixedCode, isFixing]);

  // Show error toast if AI fix fails
  useEffect(() => {
    if (aiError) {
      toast({
        title: 'AI Fix Failed',
        description: aiError,
        variant: 'destructive',
      });
      reset();
    }
  }, [aiError, toast, reset]);

  // Handle accepting the fix - paste into editor
  const handleAcceptFix = useCallback(() => {
    if (fixedCode) {
      onCodeChange(fixedCode);
      toast({
        title: 'Fix Applied',
        description: 'The AI-suggested fix has been applied to your code.',
      });
      reset();
      setShowFixModal(false);
    }
  }, [fixedCode, onCodeChange, toast, reset]);

  // Handle rejecting the fix
  const handleRejectFix = useCallback(() => {
    reset();
    setShowFixModal(false);
  }, [reset]);

  return (
    <>
      <div
        ref={containerRef}
        className="flex w-full"
        style={{ height: '100%' }}
      >
        {/* Left: Code Editor */}
        <div
          className="flex flex-col"
          style={{ width: `calc(${splitRatio * 100}% - 6px)`, height: '100%' }}
        >
          {/* Editor Header */}
          <div className="h-11 px-4 flex items-center justify-between border-b bg-gray-100 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-700">Code</span>
            <AIFixButton
              visible={hasError}
              onClick={handleFixClick}
              isLoading={isFixing}
            />
          </div>
          {/* Editor Content */}
          <div className="flex-1 overflow-hidden bg-white">
            <CodeEditor
              value={code}
              onChange={onCodeChange}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-3 flex-shrink-0 flex items-center justify-center cursor-col-resize transition-all duration-150
            ${
              isDragging
                ? 'bg-blue-500'
                : 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 hover:from-blue-400 hover:via-blue-500 hover:to-blue-400'
            }`}
          style={{ height: '100%' }}
          onMouseDown={() => setIsDragging(true)}
          title="Drag to resize panels"
        >
          <div
            className={`flex flex-col gap-1 ${isDragging ? 'text-white' : 'text-gray-500'}`}
          >
            <GripVertical className="h-5 w-5" />
          </div>
        </div>

        {/* Right: Preview */}
        <div
          className="flex flex-col"
          style={{
            width: `calc(${(1 - splitRatio) * 100}% - 6px)`,
            height: '100%',
          }}
        >
          <PreviewPane
            svg={svg}
            error={error}
            isRendering={isRendering}
            diagramName={diagramName}
          />
        </div>
      </div>

      {/* AI Fix Modal - shows diff between original and fixed code */}
      <AIFixModal
        isOpen={showFixModal}
        onClose={() => setShowFixModal(false)}
        originalCode={originalCodeForFix}
        fixedCode={fixedCode || ''}
        explanation={explanation || ''}
        onAccept={handleAcceptFix}
        onReject={handleRejectFix}
      />
    </>
  );
}
