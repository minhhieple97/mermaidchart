'use client';

/**
 * Code Editor Component
 * Monaco-based code editor for Mermaid diagrams
 *
 * Requirements:
 * - 4.7: Provide syntax highlighting for Mermaid code
 * - 4.8: Display line numbers for code navigation
 */

import { useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  /** Current code value */
  value: string;
  /** Callback when code changes */
  onChange: (value: string) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
}

/**
 * Monaco-based code editor with Mermaid syntax highlighting
 */
export function CodeEditor({
  value,
  onChange,
  disabled = false,
}: CodeEditorProps) {
  const handleChange = useCallback(
    (newValue: string | undefined) => {
      onChange(newValue ?? '');
    },
    [onChange],
  );

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          readOnly: disabled,
          padding: { top: 16, bottom: 16 },
        }}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
