/**
 * Editor Feature Types
 * TypeScript types for the diagram editor
 */

/** Result from Mermaid rendering hook */
export interface MermaidRenderResult {
  /** Rendered SVG string or null if error */
  svg: string | null;
  /** Error message if rendering failed */
  error: string | null;
  /** Whether rendering is in progress */
  isRendering: boolean;
  /** Boolean flag indicating if there's an error (for AI fix button visibility) */
  hasError: boolean;
}

/** Result from AI syntax fix */
export interface AIFixResult {
  /** The corrected Mermaid code */
  fixedCode: string;
  /** Explanation of what was fixed */
  explanation: string;
}

/** Auto-save state */
export interface AutoSaveState {
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Timestamp of last successful save */
  lastSaved: Date | null;
  /** Error message if save failed */
  error: string | null;
}

/** Split pane state */
export interface SplitPaneState {
  /** Current ratio (0-1) of left pane width */
  ratio: number;
  /** Whether user is currently dragging the divider */
  isDragging: boolean;
}
