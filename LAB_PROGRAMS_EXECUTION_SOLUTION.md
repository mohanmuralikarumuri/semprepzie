# Lab Programs Execution Solution for Semprepzie 🚀

## Your Requirement

You have lab programs in **HTML, CSS, JS, React JS, and Node.js** for your FSD (Full Stack Development) subject, and you want users to be able to run them directly on the website.

---

## ✨ Proposed Solution: Multi-Runtime Code Executor

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Semprepzie App                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Code Editor Component              │    │
│  │  (Already exists: NeoGlassEditorCodeMirror)│    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │       Runtime Detector & Executor          │    │
│  │    - HTML/CSS/JS → iframe sandbox          │    │
│  │    - React → Babel + Runtime compilation   │    │
│  │    - Node.js → Backend API execution       │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │          Output Display Panel              │    │
│  │    - Console logs                          │    │
│  │    - Visual output                         │    │
│  │    - Errors                                │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Implementation Strategy

### 1. **HTML/CSS/JavaScript** ✅ (Easiest - Client-side)

**How it works:**
- Create an `<iframe>` sandbox
- Inject HTML, CSS, and JS code directly
- Run in isolated environment
- Capture console logs

**Implementation:**
```tsx
// Create: frontend/src/components/HtmlCssJsRunner.tsx

import React, { useRef, useEffect, useState } from 'react';

interface HtmlCssJsRunnerProps {
  html: string;
  css: string;
  js: string;
}

const HtmlCssJsRunner: React.FC<HtmlCssJsRunnerProps> = ({ html, css, js }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    // Create HTML document with injected code
    const fullCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            // Capture console.log
            (function() {
              const originalLog = console.log;
              console.log = function(...args) {
                window.parent.postMessage({
                  type: 'console',
                  data: args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                  ).join(' ')
                }, '*');
                originalLog.apply(console, args);
              };

              // Capture errors
              window.addEventListener('error', (e) => {
                window.parent.postMessage({
                  type: 'error',
                  data: e.message
                }, '*');
              });
            })();

            ${js}
          </script>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(fullCode);
    iframeDoc.close();
  }, [html, css, js]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console' || event.data.type === 'error') {
        setLogs(prev => [...prev, event.data.data]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="html-runner">
      <iframe
        ref={iframeRef}
        title="Code Output"
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />
      
      {/* Console Output */}
      <div className="console-output" style={{
        marginTop: '20px',
        padding: '15px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: '8px',
        maxHeight: '200px',
        overflow: 'auto',
        fontFamily: 'monospace'
      }}>
        <strong>Console:</strong>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default HtmlCssJsRunner;
```

---

### 2. **React Code** ✅ (Medium - Client-side with Babel)

**How it works:**
- Use Babel standalone to transpile JSX
- Create React component dynamically
- Render in isolated container

**Implementation:**
```tsx
// Create: frontend/src/components/ReactRunner.tsx

import React, { useState, useEffect } from 'react';
import * as Babel from '@babel/standalone';

interface ReactRunnerProps {
  code: string;
}

const ReactRunner: React.FC<ReactRunnerProps> = ({ code }) => {
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      // Transpile JSX to JavaScript
      const transformed = Babel.transform(code, {
        presets: ['react', 'es2015']
      }).code;

      // Create component from code
      const ComponentFunc = new Function('React', 'useState', 'useEffect', `
        ${transformed}
        return App; // Assuming component is named App
      `);

      const NewComponent = ComponentFunc(React, useState, useEffect);
      setComponent(() => NewComponent);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setComponent(null);
    }
  }, [code]);

  return (
    <div className="react-runner">
      <div style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        minHeight: '300px'
      }}>
        {error ? (
          <div style={{ color: 'red' }}>
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        ) : Component ? (
          <Component />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ReactRunner;
```

**Required Package:**
```bash
npm install @babel/standalone
```

---

### 3. **Node.js Code** ⚠️ (Complex - Backend execution)

**How it works:**
- Send code to backend API
- Execute in sandboxed Node.js environment
- Return output to frontend

**Backend Implementation:**
```typescript
// backend/src/routes/codeExecution.routes.ts

import express from 'express';
import { VM } from 'vm2'; // Sandboxed execution

const router = express.Router();

router.post('/execute/nodejs', async (req, res) => {
  const { code } = req.body;

  try {
    const vm = new VM({
      timeout: 5000, // 5 second timeout
      sandbox: {
        console: {
          log: (...args: any[]) => {
            // Capture console output
          }
        }
      }
    });

    const result = vm.run(code);
    
    res.json({
      success: true,
      output: result,
      logs: [] // Captured console logs
    });
  } catch (error: any) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

**Frontend Component:**
```tsx
// Create: frontend/src/components/NodeRunner.tsx

import React, { useState } from 'react';
import axios from 'axios';

interface NodeRunnerProps {
  code: string;
}

const NodeRunner: React.FC<NodeRunnerProps> = ({ code }) => {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/execute/nodejs', { code });
      setOutput(response.data.output || response.data.error);
    } catch (error) {
      setOutput('Execution failed');
    }
    setLoading(false);
  };

  return (
    <div className="node-runner">
      <button onClick={runCode} disabled={loading}>
        {loading ? 'Running...' : 'Run Node.js Code'}
      </button>
      
      <pre style={{
        marginTop: '20px',
        padding: '15px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: '8px'
      }}>
        {output || 'Click "Run" to execute'}
      </pre>
    </div>
  );
};

export default NodeRunner;
```

**Required Backend Package:**
```bash
npm install vm2
```

---

## 🛠️ Unified Code Execution Component

Create a smart component that auto-detects language and uses appropriate runner:

```tsx
// Create: frontend/src/components/CodeExecutor.tsx

import React from 'react';
import HtmlCssJsRunner from './HtmlCssJsRunner';
import ReactRunner from './ReactRunner';
import NodeRunner from './NodeRunner';

interface CodeExecutorProps {
  language: 'html' | 'react' | 'nodejs';
  code: string;
  cssCode?: string;
  htmlCode?: string;
}

const CodeExecutor: React.FC<CodeExecutorProps> = ({ 
  language, 
  code, 
  cssCode = '', 
  htmlCode = '' 
}) => {
  switch (language) {
    case 'html':
      return <HtmlCssJsRunner html={htmlCode} css={cssCode} js={code} />;
    
    case 'react':
      return <ReactRunner code={code} />;
    
    case 'nodejs':
      return <NodeRunner code={code} />;
    
    default:
      return <div>Unsupported language</div>;
  }
};

export default CodeExecutor;
```

---

## 🎨 Integration with Your Lab Programs

### Update LabSection to Include Executor

```tsx
// In LabSection.tsx, add execution panel

import CodeExecutor from './CodeExecutor';

// When a program is selected
<div className="program-viewer">
  <div className="code-editor">
    <NeoGlassEditorCodeMirror
      initialCode={selectedProgram.code}
      language={selectedProgram.language}
    />
  </div>
  
  <div className="execution-panel">
    <CodeExecutor
      language={selectedProgram.language as 'html' | 'react' | 'nodejs'}
      code={selectedProgram.code}
      htmlCode={selectedProgram.html}
      cssCode={selectedProgram.css}
    />
  </div>
</div>
```

---

## 📊 Database Schema Update

Add execution metadata to lab programs:

```sql
ALTER TABLE lab_programs 
ADD COLUMN language VARCHAR(20), -- 'html', 'react', 'nodejs'
ADD COLUMN execution_type VARCHAR(20), -- 'client', 'server'
ADD COLUMN html_code TEXT,
ADD COLUMN css_code TEXT,
ADD COLUMN dependencies JSON; -- For React/Node packages
```

---

## 🚀 Implementation Steps

### Phase 1: HTML/CSS/JS (Immediate) ✅
1. Create `HtmlCssJsRunner.tsx` component
2. Add to lab program viewer
3. Test with existing HTML programs
4. **Time**: 2-3 hours

### Phase 2: React Support (Next) ✅
1. Install `@babel/standalone`
2. Create `ReactRunner.tsx`
3. Add React program detection
4. **Time**: 4-5 hours

### Phase 3: Node.js Support (Advanced) ⚠️
1. Set up backend execution API
2. Install `vm2` for sandboxing
3. Add security measures
4. Create `NodeRunner.tsx`
5. **Time**: 6-8 hours

### Phase 4: Integration & Polish ✨
1. Create unified `CodeExecutor`
2. Add UI controls (run, stop, clear)
3. Add console output display
4. Add error handling
5. **Time**: 3-4 hours

---

## ⚡ Quick Start (HTML/CSS/JS Only)

For immediate implementation, just add the HTML/CSS/JS runner:

1. **Create the component** (copy `HtmlCssJsRunner.tsx` from above)
2. **Add to lab viewer**:
```tsx
{selectedProgram && (
  <HtmlCssJsRunner
    html={selectedProgram.html || ''}
    css={selectedProgram.css || ''}
    js={selectedProgram.code}
  />
)}
```
3. **Done!** Users can now run HTML/CSS/JS programs

---

## 🔒 Security Considerations

1. **Sandbox iframes**: Use `sandbox` attribute
2. **Execution timeout**: Limit to 5 seconds
3. **Resource limits**: Restrict memory/CPU
4. **No file system access**: VM2 prevents this
5. **Rate limiting**: Prevent abuse

---

## 📝 Summary

**What You Can Do:**
- ✅ HTML/CSS/JavaScript: **Run directly in browser** (easiest)
- ✅ React: **Compile and run in browser** with Babel
- ⚠️ Node.js: **Execute on backend** with security sandbox

**Recommended Approach:**
Start with HTML/CSS/JS runner (quick win), then add React support, and finally Node.js if needed.

**Would you like me to:**
1. Create the HTML/CSS/JS runner component now?
2. Set up the complete execution system?
3. Just add it to your lab programs viewer?

Let me know and I'll implement it! 🚀
