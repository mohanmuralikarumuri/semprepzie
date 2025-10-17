import React, { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'c' | 'cpp' | 'python' | 'java';
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  fontSize?: number;
}

// Enhanced light theme with syntax highlighting
const lightTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
    backgroundColor: '#ffffff',
    height: '100%',
  },
  '.cm-content': {
    padding: '16px',
    minHeight: '100%',
    color: '#1a202c',
    backgroundColor: '#ffffff',
  },
  '.cm-editor': {
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#ffffff',
    height: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    maxHeight: '100%',
  },
  '.cm-focused': {
    outline: '2px solid #3b82f6',
    outlineOffset: '-2px',
  },
  '.cm-gutters': {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: 'none',
    borderRight: '1px solid #e2e8f0',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f1f5f9',
  },
  '.cm-activeLine': {
    backgroundColor: '#f8fafc',
  },
  // Syntax highlighting colors for light mode
  '.cm-keyword': {
    color: '#d73a49',
    fontWeight: 'bold',
  },
  '.cm-operator': {
    color: '#d73a49',
  },
  '.cm-variableName': {
    color: '#24292e',
  },
  '.cm-typeName': {
    color: '#6f42c1',
  },
  '.cm-function': {
    color: '#6f42c1',
  },
  '.cm-string': {
    color: '#032f62',
  },
  '.cm-number': {
    color: '#005cc5',
  },
  '.cm-comment': {
    color: '#6a737d',
    fontStyle: 'italic',
  },
  '.cm-meta': {
    color: '#005cc5',
  },
  '.cm-bracket': {
    color: '#24292e',
  },
  '.cm-punctuation': {
    color: '#24292e',
  },
  '.cm-definition': {
    color: '#6f42c1',
  },
  '.cm-propertyName': {
    color: '#005cc5',
  },
  '.cm-operator, .cm-punctuation': {
    color: '#d73a49',
  },
});

// Enhanced dark theme with proper scrollbar and visible line numbers
const darkThemeExtension = EditorView.theme({
  '&': {
    height: '100%',
  },
  '.cm-editor': {
    height: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    maxHeight: '100%',
  },
  '.cm-gutters': {
    backgroundColor: '#1e1e1e',
    color: '#858585', // Light gray for line numbers - much more visible
    border: 'none',
    borderRight: '1px solid #3e3e3e',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#2d2d2d',
    color: '#c6c6c6', // Even brighter for active line number
  },
  '.cm-lineNumbers .cm-gutterElement': {
    color: '#858585', // Ensure all line numbers are visible
    minWidth: '3ch',
  },
}, { dark: true });

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  theme = 'light',
  readOnly = false,
  fontSize = 14,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const getLanguageExtension = () => {
      switch (language) {
        case 'cpp':
        case 'c':
          return cpp();
        case 'python':
          return python();
        case 'java':
          return cpp(); // Use C++ syntax for Java temporarily (similar syntax)
        default:
          return [];
      }
    };

    // Dynamic font size theme
    const fontSizeTheme = EditorView.theme({
      '&': {
        fontSize: `${fontSize}px`,
      },
      '.cm-content': {
        fontSize: `${fontSize}px`,
      },
    });

    const extensions = [
      lineNumbers(),
      keymap.of(defaultKeymap),
      getLanguageExtension(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !readOnly) {
          onChange(update.state.doc.toString());
        }
      }),
      theme === 'dark' 
        ? [oneDark, darkThemeExtension, fontSizeTheme] 
        : [lightTheme, syntaxHighlighting(defaultHighlightStyle), fontSizeTheme],
      EditorState.readOnly.of(readOnly),
    ];

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, theme, readOnly, fontSize]); // Added fontSize to deps

  // Update content when value changes externally
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className="code-editor-container" style={{ height: '100%', width: '100%' }}>
      <div ref={editorRef} className="code-editor" style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default CodeEditor;