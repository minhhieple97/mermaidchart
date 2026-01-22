'use client';

/**
 * Split Pane Editor Component
 * Provides a resizable split view with code editor and preview pane
 *
 * Optimizations (vercel-react-best-practices):
 * - rerender-memo: Component wrapped in memo for re-render optimization
 * - rerender-functional-setstate: Using functional setState for stable callbacks
 * - rendering-hoist-jsx: Static JSX elements hoisted where possible
 * - client-event-listeners: Deduplicated event listeners in useEffect
 */

import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { GripVertical, Code, Eye } from 'lucide-react';
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

// Hook to detect mobile viewport (client-passive-event-listeners)
function useIsMobile(breakpoint = 768) {
  // Lazy state initialization (rerender-lazy-state-init)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    // Use passive listener for better scroll performance
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

export const SplitPaneEditor = memo(function SplitPaneEditor({
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

  const isMobile = useIsMobile();
  const [activePane, setActivePane] = useState<'code' | 'preview'>('code');
  const [originalCodeForFix, setOriginalCodeForFix] = useState('');
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive modal visibility from state
  const showFixModal = useMemo(() => {
    return Boolean(fixedCode && !isFixing && !modalDismissed);
  }, [fixedCode, isFixing, modalDismissed]);

  // Handle resize drag - use functional setState for stable callback
  // Optimized with passive event listeners (client-passive-event-listeners)
  // and batched CSS changes (js-batch-dom-css)
  useEffect(() => {
    if (!isDragging || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newRatio = Math.max(
        0.2,
        Math.min(0.8, (e.clientX - rect.left) / rect.width),
      );
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => setIsDragging(false);

    // Use passive listeners for better performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    // Batch CSS changes into single cssText assignment
    document.body.style.cssText = 'cursor: col-resize; user-select: none;';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cssText = '';
    };
  }, [isDragging, isMobile]);

  // Handle AI fix button click
  const handleFixClick = useCallback(() => {
    if (!error) return;
    setOriginalCodeForFix(code);
    setModalDismissed(false);
    fixSyntax({ code, errorMessage: error });
  }, [code, error, fixSyntax]);

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

  // Handle accepting the fix - use functional pattern for stable callback
  const handleAcceptFix = useCallback(() => {
    if (fixedCode) {
      onCodeChange(fixedCode);
      toast({
        title: 'Fix Applied',
        description: 'The AI-suggested fix has been applied to your code.',
      });
      setModalDismissed(true);
      reset();
    }
  }, [fixedCode, onCodeChange, toast, reset]);

  // Handle rejecting the fix
  const handleRejectFix = useCallback(() => {
    setModalDismissed(true);
    reset();
  }, [reset]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setModalDismissed(true);
  }, []);

  // Stable callback for drag start
  const handleDragStart = useCallback(() => setIsDragging(true), []);

  // Memoize style calculations to avoid object recreation
  const leftPaneStyle = useMemo(
    () => ({ width: `calc(${splitRatio * 100}% - 6px)`, height: '100%' }),
    [splitRatio],
  );

  const rightPaneStyle = useMemo(
    () => ({ width: `calc(${(1 - splitRatio) * 100}% - 6px)`, height: '100%' }),
    [splitRatio],
  );

  // Mobile layout with tab switching
  if (isMobile) {
    return (
      <>
        <div className="flex flex-col h-full">
          {/* Mobile Tab Bar */}
          <div className="flex border-b bg-gray-100 flex-shrink-0">
            <button
              onClick={() => setActivePane('code')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activePane === 'code'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="h-4 w-4" />
              Code
              {hasError && <span className="w-2 h-2 rounded-full bg-red-500" />}
            </button>
            <button
              onClick={() => setActivePane('preview')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activePane === 'preview'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-hidden">
            {activePane === 'code' ? (
              <div className="flex flex-col h-full">
                <div className="h-11 px-4 flex items-center justify-between border-b bg-gray-100 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700">
                    Code
                  </span>
                  <AIFixButton
                    visible={hasError}
                    onClick={handleFixClick}
                    isLoading={isFixing}
                  />
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  <CodeEditor
                    value={code}
                    onChange={onCodeChange}
                    disabled={disabled}
                  />
                </div>
              </div>
            ) : (
              <PreviewPane
                svg={svg}
                error={error}
                isRendering={isRendering}
                diagramName={diagramName}
              />
            )}
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

  // Desktop layout with resizable split pane
  return (
    <>
      <div
        ref={containerRef}
        className="flex w-full"
        style={{ height: '100%' }}
      >
        {/* Left: Code Editor */}
        <div className="flex flex-col" style={leftPaneStyle}>
          <div className="h-11 px-4 flex items-center justify-between border-b bg-gray-100 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-700">Code</span>
            <AIFixButton
              visible={hasError}
              onClick={handleFixClick}
              isLoading={isFixing}
            />
          </div>
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
          onMouseDown={handleDragStart}
          title="Drag to resize panels"
        >
          <div
            className={`flex flex-col gap-1 ${isDragging ? 'text-white' : 'text-gray-500'}`}
          >
            <GripVertical className="h-5 w-5" />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col" style={rightPaneStyle}>
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
});
