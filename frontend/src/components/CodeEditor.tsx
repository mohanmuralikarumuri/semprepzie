import React, { useEffect, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import type { ViewUpdate } from '@codemirror/view';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'c' | 'cpp' | 'python';
  theme?: 'light' | 'dark';
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  theme = 'light',
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Get language extension
    const getLanguageExtension = () => {
      switch (language) {
        case 'c':
        case 'cpp':
          return cpp();
        case 'python':
          return python();
        default:
          return [];
      }
    };

    // Create editor extensions
    const extensions = [
      basicSetup,
      getLanguageExtension(),
      EditorView.updateListener.of((update: any) => {
        if (update.docChanged && !readOnly) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
        },
        '.cm-content': {
          padding: '16px',
          minHeight: '300px',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        },
        '.cm-scroller': {
          lineHeight: '1.5',
        },
      }),
    ];

    // Add dark theme if needed
    if (theme === 'dark') {
      extensions.push(oneDark);
    }

    // Set read-only if needed
    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions,
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    setIsReady(true);

    return () => {
      view.destroy();
      viewRef.current = null;
      setIsReady(false);
    };
  }, [language, theme, readOnly]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (viewRef.current && isReady) {
      const currentValue = viewRef.current.state.doc.toString();
      if (currentValue !== value) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value, isReady]);

  return (
    <div className="code-editor-container">
      <div 
        ref={editorRef} 
        className="code-editor"
        style={{ minHeight: '300px' }}
      />
      {!isReady && (
        <div className="editor-loading flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
