import React from 'react';

interface SyntaxHighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  language: 'c' | 'cpp' | 'python';
  darkMode?: boolean;
  className?: string;
}

const SyntaxHighlightedTextarea: React.FC<SyntaxHighlightedTextareaProps> = ({
  value,
  onChange,
  language,
  darkMode = false,
  className = ''
}) => {
  // Keywords for different languages
  const keywords = {
    c: ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', 'include', 'define', 'ifdef', 'ifndef', 'endif'],
    cpp: ['alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char16_t', 'char32_t', 'class', 'compl', 'const', 'constexpr', 'const_cast', 'continue', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'register', 'reinterpret_cast', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'cout', 'cin', 'endl', 'std', 'string', 'vector', 'map', 'set', 'iostream'],
    python: ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield', 'print', 'input', 'range', 'len', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple']
  };

  const highlightCode = (code: string) => {
    const langKeywords = keywords[language] || [];
    let highlighted = code;

    // Escape HTML
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight strings (both single and double quotes)
    const stringColor = darkMode ? '#ce9178' : '#a31515';
    highlighted = highlighted.replace(
      /(["'])(?:(?=(\\?))\2.)*?\1/g,
      `<span style="color: ${stringColor}">$&</span>`
    );

    // Highlight comments
    const commentColor = darkMode ? '#6a9955' : '#008000';
    if (language === 'python') {
      // Python comments
      highlighted = highlighted.replace(
        /#.*$/gm,
        `<span style="color: ${commentColor}; font-style: italic">$&</span>`
      );
    } else {
      // C/C++ comments
      highlighted = highlighted.replace(
        /\/\/.*$/gm,
        `<span style="color: ${commentColor}; font-style: italic">$&</span>`
      );
      highlighted = highlighted.replace(
        /\/\*[\s\S]*?\*\//g,
        `<span style="color: ${commentColor}; font-style: italic">$&</span>`
      );
    }

    // Highlight numbers
    const numberColor = darkMode ? '#b5cea8' : '#098658';
    highlighted = highlighted.replace(
      /\b\d+\.?\d*\b/g,
      `<span style="color: ${numberColor}">$&</span>`
    );

    // Highlight keywords
    const keywordColor = darkMode ? '#569cd6' : '#0000ff';
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(
        regex,
        `<span style="color: ${keywordColor}; font-weight: bold">$&</span>`
      );
    });

    return highlighted;
  };

  return (
    <div className="relative">
      {/* Highlighted overlay (background) */}
      <pre
        className={`absolute inset-0 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-auto pointer-events-none ${className}`}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          color: 'transparent',
          caretColor: darkMode ? '#ffffff' : '#000000'
        }}
        dangerouslySetInnerHTML={{ __html: highlightCode(value) }}
      />
      
      {/* Actual textarea (foreground, transparent text) */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`relative w-full p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-auto bg-transparent ${className}`}
        style={{
          color: 'transparent',
          caretColor: darkMode ? '#ffffff' : '#000000',
          resize: 'none'
        }}
        spellCheck={false}
      />
    </div>
  );
};

export default SyntaxHighlightedTextarea;
