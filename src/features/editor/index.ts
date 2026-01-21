/**
 * Editor Feature Exports
 * Re-export all editor components, hooks, and types
 */

// Components
export { SplitPaneEditor } from './components/split-pane-editor';
export { CodeEditor } from './components/code-editor';
export { PreviewPane } from './components/preview-pane';
export { AIFixButton } from './components/ai-fix-button';
export { AIFixModal } from './components/ai-fix-modal';
export { ExportToolbar } from './components/export-toolbar';
export { EditorHeader } from './components/editor-header';

// Hooks
export { useMermaidRenderer } from './hooks/use-mermaid-renderer';
export { useAutoSave } from './hooks/use-auto-save';
export { useSplitPane } from './hooks/use-split-pane';
export { useAIFix } from './hooks/use-ai-fix';
export { useExport } from './hooks/use-export';
export { useDiagramEditor } from './hooks/use-diagram-editor';

// Types
export type {
  MermaidRenderResult,
  AIFixResult,
  AutoSaveState,
  SplitPaneState,
} from './types/editor.types';
export type { ExportFormat, ExportOptions } from './types/export.types';

// Utils
export {
  sanitizeFilename,
  triggerDownload,
  getExportFilename,
} from './utils/export.utils';

// Constants
export {
  EDITOR_CONSTANTS,
  MERMAID_DEFAULT_TEMPLATE,
  AI_FIX_SYSTEM_PROMPT,
} from './constants';
