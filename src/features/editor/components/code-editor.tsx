'use client';

import { useCallback, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  disabled = false,
}: CodeEditorProps) {
  const editorRef = useRef<unknown>(null);

  const handleChange = useCallback(
    (newValue: string | undefined) => onChange(newValue ?? ''),
    [onChange],
  );

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      value={value}
      onChange={handleChange}
      onMount={handleMount}
      theme="light"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 22,
        fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        readOnly: disabled,
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        smoothScrolling: true,
      }}
      loading={
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
          Loading editor...
        </div>
      }
    />
  );
}
