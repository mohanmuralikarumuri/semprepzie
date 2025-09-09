import React, { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, highlightActiveLine, highlightActiveLineGutter, lineNumbers, drawSelection, dropCursor, rectangularSelection, Decoration, DecorationSet } from '@codemirror/view';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
import { highlightSpecialChars } from '@codemirror/view';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { tags as t } from '@lezer/highlight';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'c' | 'cpp' | 'python';
  theme?: 'light' | 'dark';
  readOnly?: boolean;
}

// Custom light theme with better visibility
const lightTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
    backgroundColor: '#ffffff',
  },
  '.cm-content': {
    padding: '16px',
    minHeight: '300px',
    color: '#1a202c',
    backgroundColor: '#ffffff',
  },
  '.cm-focused': {
    outline: '2px solid #3b82f6',
    outlineOffset: '-2px',
  },
  '.cm-editor': {
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  '.cm-scroller': {
    lineHeight: '1.6',
    backgroundColor: '#ffffff',
  },
  '.cm-line': {
    backgroundColor: 'transparent',
  },
  '.cm-activeLine': {
    backgroundColor: '#f8fafc',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f1f5f9',
  },
  '.cm-gutters': {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: 'none',
    borderRight: '1px solid #e2e8f0',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    color: '#64748b',
    fontSize: '13px',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#bfdbfe !important',
  },
  '.cm-searchMatch': {
    backgroundColor: '#fef3c7',
    outline: '1px solid #f59e0b',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#fbbf24',
  },
});

// Enhanced syntax highlighting for light theme
const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#7c3aed', fontWeight: 'bold' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#dc2626' },
  { tag: [t.function(t.variableName), t.labelName], color: '#0ea5e9' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#059669' },
  { tag: [t.definition(t.name), t.separator], color: '#374151' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#ea580c' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#be185d' },
  { tag: [t.meta, t.comment], color: '#6b7280', fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: '#2563eb', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: '#1f2937' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#7c2d12' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#166534' },
  { tag: t.invalid, color: '#dc2626', backgroundColor: '#fef2f2' },
]);

// Enhanced dark theme
const darkTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
    backgroundColor: '#1e293b',
  },
  '.cm-content': {
    padding: '16px',
    minHeight: '300px',
    color: '#e2e8f0',
    backgroundColor: '#1e293b',
  },
  '.cm-focused': {
    outline: '2px solid #60a5fa',
    outlineOffset: '-2px',
  },
  '.cm-editor': {
    borderRadius: '8px',
    border: '2px solid #475569',
    backgroundColor: '#1e293b',
  },
  '.cm-scroller': {
    lineHeight: '1.6',
    backgroundColor: '#1e293b',
  },
  '.cm-line': {
    backgroundColor: 'transparent',
  },
  '.cm-activeLine': {
    backgroundColor: '#334155',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#334155',
  },
  '.cm-gutters': {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    border: 'none',
    borderRight: '1px solid #475569',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    color: '#94a3b8',
    fontSize: '13px',
  },
  '.cm-cursor': {
    borderLeftColor: '#60a5fa',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#1e40af !important',
  },
});

// Copy highlight effect
const addCopyHighlight = StateEffect.define<{from: number, to: number}>();
const removeCopyHighlight = StateEffect.define<void>();

let globalViewRef: EditorView | null = null;

const copyHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);
    for (let effect of tr.effects) {
      if (effect.is(addCopyHighlight)) {
        // Clear previous highlights
        highlights = Decoration.none;
        
        const decoration = Decoration.mark({
          class: 'cm-copy-highlight'
        }).range(effect.value.from, effect.value.to);
        highlights = highlights.update({
          add: [decoration]
        });
        
        // Remove highlight after 2.5 seconds
        setTimeout(() => {
          if (globalViewRef) {
            globalViewRef.dispatch({
              effects: removeCopyHighlight.of()
            });
          }
        }, 2500);
      } else if (effect.is(removeCopyHighlight)) {
        highlights = Decoration.none;
      }
    }
    return highlights;
  },
  provide: f => EditorView.decorations.from(f)
});

// Copy highlight theme with more visible styling
const copyHighlightTheme = EditorView.theme({
  '.cm-copy-highlight': {
    backgroundColor: '#3b82f6 !important',
    opacity: '0.6 !important',
    borderRadius: '4px',
    padding: '1px 2px',
    border: '1px solid #1d4ed8',
    animation: 'copyHighlightPulse 2s ease-out',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
  },
  '&light .cm-copy-highlight': {
    backgroundColor: '#dbeafe !important',
    border: '1px solid #3b82f6',
    color: '#1e40af !important',
  },
  '&dark .cm-copy-highlight': {
    backgroundColor: '#1e40af !important',
    border: '1px solid #60a5fa',
    color: '#dbeafe !important',
  },
  '@keyframes copyHighlightPulse': {
    '0%': {
      backgroundColor: '#60a5fa',
      opacity: '0.8',
      transform: 'scale(1.02)',
      boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)',
    },
    '25%': {
      backgroundColor: '#3b82f6',
      opacity: '0.7',
    },
    '50%': {
      backgroundColor: '#2563eb',
      opacity: '0.6',
    },
    '75%': {
      backgroundColor: '#3b82f6',
      opacity: '0.4',
    },
    '100%': {
      backgroundColor: '#3b82f6',
      opacity: '0.2',
      transform: 'scale(1)',
      boxShadow: '0 0 4px rgba(59, 130, 246, 0.2)',
    }
  }
});

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

    // Create basic setup extensions
    const basicExtensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
      ]),
    ];

    // Create editor extensions
    const extensions = [
      ...basicExtensions,
      getLanguageExtension(),
      copyHighlightField,
      copyHighlightTheme,
      EditorView.updateListener.of((update: any) => {
        if (update.docChanged && !readOnly) {
          onChange(update.state.doc.toString());
        }
      }),
    ];

    // Add theme and syntax highlighting
    if (theme === 'dark') {
      extensions.push(oneDark, darkTheme);
    } else {
      extensions.push(lightTheme, syntaxHighlighting(lightHighlightStyle));
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
    globalViewRef = view;
    setIsReady(true);

    // Add copy event listener with debug logs
    const handleCopy = (e: Event) => {
      console.log('Copy event detected', e.type);
      if (view.hasFocus) {
        const selection = view.state.selection.main;
        console.log('Selection:', selection);
        if (!selection.empty) {
          console.log('Highlighting copy from', selection.from, 'to', selection.to);
          // Highlight the copied text
          view.dispatch({
            effects: addCopyHighlight.of({
              from: selection.from,
              to: selection.to
            })
          });
        }
      }
    };

    // Add multiple event listeners for copy detection
    document.addEventListener('copy', handleCopy);
    editorRef.current.addEventListener('copy', handleCopy);
    
    // Also listen for Ctrl+C keydown
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        console.log('Ctrl+C detected');
        setTimeout(() => handleCopy(e), 10); // Small delay to ensure selection is available
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      if (editorRef.current) {
        editorRef.current.removeEventListener('copy', handleCopy);
      }
      view.destroy();
      viewRef.current = null;
      globalViewRef = null;
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <div className="text-gray-500">Loading editor...</div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
