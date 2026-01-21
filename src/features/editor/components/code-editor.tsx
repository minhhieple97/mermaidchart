'use client';

import { useCallback, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';

// Dynamic import Monaco to reduce initial bundle size (~300KB savings)
const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Loading editor...
      </div>
    ),
  },
);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CodeEditor = memo(function CodeEditor({
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
    />
  );
});
