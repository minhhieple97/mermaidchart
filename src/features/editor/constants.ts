/**
 * Editor Feature Constants
 * Centralized configuration for the diagram editor
 */

export const EDITOR_CONSTANTS = {
  /** Debounce time for Mermaid rendering (ms) */
  DEBOUNCE_RENDER_MS: 500,
  /** Auto-save delay after last change (ms) */
  AUTO_SAVE_DELAY_MS: 2000,
  /** Default split pane ratio (0-1) */
  DEFAULT_SPLIT_RATIO: 0.5,
  /** Maximum code length allowed */
  MAX_CODE_LENGTH: 100000,
  /** Minimum split pane width (px) */
  MIN_PANE_WIDTH: 200,
} as const;

/** Default Mermaid template for new diagrams */
export const MERMAID_DEFAULT_TEMPLATE = `graph TD
    A[Start] --> B[End]`;

/** AI system prompt for Mermaid syntax fixing */
export const AI_FIX_SYSTEM_PROMPT = `You are a Mermaid diagram syntax expert. Your task is to fix syntax errors in Mermaid diagram code.

Rules:
1. Only fix syntax errors, don't change the diagram's structure or meaning
2. Preserve all node labels and connections
3. Return only the corrected Mermaid code in a mermaid code block
4. If you cannot fix the error, explain why

Common Mermaid syntax issues:
- Missing or incorrect arrow syntax (-->, ---, -.->)
- Unbalanced brackets or quotes
- Invalid node IDs (must start with letter, no spaces)
- Missing subgraph end statements
- Incorrect flowchart direction (TB, BT, LR, RL)
- Missing semicolons or line breaks between statements`;
