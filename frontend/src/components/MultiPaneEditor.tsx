import React, { useState } from 'react';
import { Code, Palette, FileCode } from 'lucide-react';

interface MultiPaneEditorProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  onJsChange: (value: string) => void;
  darkMode?: boolean;
  readOnly?: boolean;
}

type PaneType = 'html' | 'css' | 'js';

const MultiPaneEditor: React.FC<MultiPaneEditorProps> = ({
  htmlCode,
  cssCode,
  jsCode,
  onHtmlChange,
  onCssChange,
  onJsChange,
  darkMode = false,
  readOnly = false
}) => {
  const [activePane, setActivePane] = useState<PaneType>('html');
  const [layoutMode, setLayoutMode] = useState<'tabs' | 'split'>('tabs');

  const panes = [
    {
      id: 'html' as PaneType,
      label: 'HTML',
      icon: Code,
      color: 'orange',
      value: htmlCode,
      onChange: onHtmlChange,
    },
    {
      id: 'css' as PaneType,
      label: 'CSS',
      icon: Palette,
      color: 'blue',
      value: cssCode,
      onChange: onCssChange,
    },
    {
      id: 'js' as PaneType,
      label: 'JavaScript',
      icon: FileCode,
      color: 'yellow',
      value: jsCode,
      onChange: onJsChange,
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      orange: isActive 
        ? 'bg-orange-500 text-white' 
        : 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20',
      blue: isActive 
        ? 'bg-blue-500 text-white' 
        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      yellow: isActive 
        ? 'bg-yellow-500 text-white' 
        : 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
    };
    return colors[color as keyof typeof colors];
  };

  // Tabs Layout (Mobile-friendly)
  const renderTabsLayout = () => (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        {panes.map((pane) => {
          const Icon = pane.icon;
          const isActive = activePane === pane.id;
          return (
            <button
              key={pane.id}
              onClick={() => setActivePane(pane.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                getColorClasses(pane.color, isActive)
              } ${isActive ? 'border-b-2' : ''}`}
              style={isActive ? { borderBottomColor: `var(--${pane.color}-500)` } : {}}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{pane.label}</span>
              <span className="sm:hidden">{pane.id.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Active Pane Content */}
      <div className="flex-1 overflow-hidden">
        {panes.map((pane) => (
          <div
            key={pane.id}
            className={`h-full ${activePane === pane.id ? 'block' : 'hidden'}`}
          >
            <textarea
              value={pane.value}
              onChange={(e) => pane.onChange(e.target.value)}
              readOnly={readOnly}
              className={`w-full h-full p-4 font-mono text-sm resize-none border-none focus:outline-none ${
                darkMode 
                  ? 'bg-gray-900 text-gray-100' 
                  : 'bg-white text-gray-900'
              }`}
              style={{
                tabSize: 2,
                lineHeight: '1.5',
              }}
              spellCheck={false}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Split Layout (Desktop)
  const renderSplitLayout = () => (
    <div className="flex flex-col lg:flex-row h-full gap-0.5 bg-gray-300 dark:bg-gray-700">
      {panes.map((pane) => {
        const Icon = pane.icon;
        return (
          <div
            key={pane.id}
            className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden"
          >
            {/* Pane Header */}
            <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${
              pane.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
              pane.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
              'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
            }`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{pane.label}</span>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
              <textarea
                value={pane.value}
                onChange={(e) => pane.onChange(e.target.value)}
                readOnly={readOnly}
                className={`w-full h-full p-3 font-mono text-xs resize-none border-none focus:outline-none ${
                  darkMode 
                    ? 'bg-gray-900 text-gray-100' 
                    : 'bg-white text-gray-900'
                }`}
                style={{
                  tabSize: 2,
                  lineHeight: '1.5',
                }}
                spellCheck={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="multi-pane-editor h-full flex flex-col">
      {/* Layout Toggle (Desktop only) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Layout:</span>
        <button
          onClick={() => setLayoutMode('tabs')}
          className={`px-3 py-1 text-xs rounded ${
            layoutMode === 'tabs'
              ? 'bg-primary-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Tabs
        </button>
        <button
          onClick={() => setLayoutMode('split')}
          className={`px-3 py-1 text-xs rounded ${
            layoutMode === 'split'
              ? 'bg-primary-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Split View
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {/* Always use tabs on mobile, respect layoutMode on desktop */}
        <div className="lg:hidden h-full">
          {renderTabsLayout()}
        </div>
        <div className="hidden lg:block h-full">
          {layoutMode === 'tabs' ? renderTabsLayout() : renderSplitLayout()}
        </div>
      </div>
    </div>
  );
};

export default MultiPaneEditor;
