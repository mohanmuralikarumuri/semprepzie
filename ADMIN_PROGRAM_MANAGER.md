# Admin Program Manager - Complete Guide

## 🎯 Overview

The **AdminProgramManager** is a comprehensive, mobile-responsive component for managing both **Lab Programs** and **MinCode Programs** directly from the admin dashboard. It fully supports the new Supabase database schema with all execution-related fields.

---

## ✨ Features

### 📱 **Fully Mobile Responsive**
- Collapsible filters on mobile
- Touch-optimized buttons and inputs
- Responsive grid layouts (1 col mobile → 4 cols desktop)
- Modal forms adapt to screen size
- Compact display on small screens

### 🔄 **Dual Program Type Support**
- Toggle between **Lab Programs** and **MinCode Programs**
- Single interface for both program types
- Shared UI/UX for consistency

### 🗃️ **Complete Database Field Support**
All fields from the Supabase schema:
- ✅ `id` - Auto-generated unique ID
- ✅ `subject_code` - Links to lab_subjects/mincode_subjects
- ✅ `program_name` - Display name
- ✅ `description` - Optional description
- ✅ `language` - 10 languages supported
- ✅ `code` - Main program code (JavaScript/Python/C/etc.)
- ✅ `execution_type` - Client (browser) or Server (backend)
- ✅ `html_code` - HTML for web programs
- ✅ `css_code` - CSS for web programs
- ✅ `dependencies` - JSON object of package dependencies
- ✅ `sample_input` - Test input data
- ✅ `difficulty` - Easy/Medium/Hard

### 🔍 **Advanced Filtering**
- **Search**: Full-text search in program name and description
- **Subject Filter**: Filter by subject code
- **Language Filter**: Filter by programming language
- **Difficulty Filter**: Filter by difficulty level
- **Clear All**: One-click reset

### ✏️ **CRUD Operations**
- **Create**: Add new programs with all fields
- **Read**: View programs in card layout
- **Update**: Edit existing programs
- **Delete**: Remove programs (with confirmation)

### 🎨 **Smart UI Features**
- **Auto-detection**: Execution type auto-sets based on language
- **Conditional Fields**: HTML/CSS fields only show for web languages
- **Color-coded Tags**: Language and difficulty badges with semantic colors
- **Icon Indicators**: Visual cues for client vs server execution
- **JSON Validation**: Dependencies field with JSON formatting

---

## 📋 Supported Languages

| Language   | Execution Type | Use Case |
|------------|----------------|----------|
| Python     | Server         | Backend scripts, algorithms |
| Java       | Server         | Object-oriented programs |
| C          | Server         | Systems programming |
| C++        | Server         | Performance-critical code |
| JavaScript | Client         | Web interactivity |
| HTML       | Client         | Web structure |
| CSS        | Client         | Web styling |
| React      | Client         | UI components |
| TypeScript | Client         | Type-safe web apps |
| Node.js    | Server         | Server-side JavaScript |

---

## 🗄️ Database Schema Compliance

### Lab Programs Table
```sql
CREATE TABLE lab_programs (
  id TEXT PRIMARY KEY,
  subject_code TEXT NOT NULL REFERENCES lab_subjects(code),
  program_name TEXT NOT NULL,
  description TEXT,
  language TEXT CHECK (language IN ('c', 'cpp', 'python', 'java', 'javascript', 'html', 'css', 'react', 'nodejs', 'typescript')),
  code TEXT NOT NULL,
  execution_type VARCHAR(20) DEFAULT 'client',
  html_code TEXT,
  css_code TEXT,
  dependencies JSONB DEFAULT '{}',
  sample_input TEXT DEFAULT '',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### MinCode Programs Table
Same schema as `lab_programs` but with different subject references.

---

## 🎯 Usage

### In Admin Dashboard (AdminDashboard.tsx)
```tsx
import AdminProgramManager from '../components/AdminProgramManager';

// Use for both Lab and Programs tabs
{(activeTab === 'lab' || activeTab === 'programs') && <AdminProgramManager />}
```

### In Admin Dashboard New (AdminDashboardNew.tsx)
```tsx
import AdminProgramManager from '../components/AdminProgramManager';

// Use for both Lab Programs and MinCode sections
{(activeSection === 'lab-programs' || activeSection === 'min-code') && <AdminProgramManager />}
```

---

## 📝 Creating Programs

### Example 1: Simple Python Program
```tsx
Program Name: "Hello World in Python"
Description: "Your first Python program"
Subject: Select from dropdown (e.g., "Python Basics")
Language: python
Execution Type: Server (auto-selected)
Code:
print("Hello, World!")
print("Welcome to Python programming!")

Sample Input: (leave empty)
Difficulty: easy
```

### Example 2: Interactive Web Program
```tsx
Program Name: "Click Counter Button"
Description: "A button that counts clicks"
Subject: "Web Development"
Language: javascript
Execution Type: Client

HTML Code:
<div class="container">
  <h1>Click Counter</h1>
  <button id="btn">Click Me!</button>
  <p>Clicks: <span id="count">0</span></p>
</div>

CSS Code:
.container {
  text-align: center;
  padding: 40px;
}
button {
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
}

JavaScript Code:
let count = 0;
const btn = document.getElementById('btn');
const display = document.getElementById('count');

btn.addEventListener('click', () => {
  count++;
  display.textContent = count;
  console.log(`Clicked ${count} times`);
});

Dependencies: (leave empty or add {"some-lib": "^1.0.0"})
Difficulty: easy
```

### Example 3: React Component
```tsx
Program Name: "React Todo List"
Description: "Simple todo app with hooks"
Subject: "React Basics"
Language: react
Execution Type: Client

JavaScript Code:
function App() {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h1>My Todos</h1>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      {todos.map(todo => <div key={todo.id}>{todo.text}</div>)}
    </div>
  );
}

Dependencies:
{"react": "^18.0.0"}

Difficulty: medium
```

---

## 🎨 UI/UX Features

### Header
- **Title**: "Program Manager"
- **Subtitle**: "Manage lab and mincode programs"
- **Create Button**: Prominent "Create Program" button (blue)
- **Toggle Tabs**: Switch between Lab/MinCode programs

### Filters Section
- **4-column grid** on desktop (2 cols tablet, 1 col mobile)
- Search input with icon
- Subject dropdown (loads from database)
- Language dropdown (all 10 languages)
- Difficulty dropdown (easy/medium/hard)
- Results counter
- "Clear filters" link

### Program Cards
- **Card Layout**: Clean white cards with shadow
- **Badge System**: Color-coded language and difficulty tags
- **Metadata**: Execution type, subject name, dependency count
- **Actions**: Edit and Delete buttons
- **Hover Effects**: Cards lift on hover

### Create/Edit Modal
- **Full-screen modal** on mobile, centered on desktop
- **Sticky header**: Title and close button
- **Scrollable body**: All form fields
- **Sticky footer**: Cancel and Save buttons
- **Form sections**:
  1. Basic Info (name, description, subject, language, execution type, difficulty)
  2. Code Section (main code textarea)
  3. Web Fields (HTML/CSS - only for client execution)
  4. Dependencies (JSON editor)
  5. Sample Input

### Responsive Breakpoints
```css
Mobile: < 640px (sm)
- Single column layout
- Compact text sizes (text-sm)
- Full-width buttons
- Stacked filters

Tablet: 640px - 1024px (md/lg)
- 2-column grids
- Medium text sizes (text-base)
- Split button rows

Desktop: > 1024px (xl)
- 4-column filter grid
- Full text sizes
- Side-by-side layouts
```

---

## 🔧 Technical Details

### State Management
```tsx
const [programType, setProgramType] = useState<'lab' | 'mincode'>('lab');
const [programs, setPrograms] = useState<LabProgram[]>([]);
const [subjects, setSubjects] = useState<Subject[]>([]);
const [showCreateForm, setShowCreateForm] = useState(false);
const [editingProgram, setEditingProgram] = useState<LabProgram | null>(null);
const [formData, setFormData] = useState<Partial<LabProgram>>({ ... });
```

### Data Loading
```tsx
// Loads from correct table based on programType
const tableName = programType === 'lab' ? 'lab_programs' : 'mincode_programs';
const { data, error } = await supabase.from(tableName).select('*');
```

### Smart Defaults
- **Execution Type**: Auto-set based on language
  - Web languages (html, css, js, react, ts) → 'client'
  - Backend languages (python, java, c, cpp, nodejs) → 'server'
- **ID Generation**: `${programType}-${timestamp}-${random}`
- **Dependencies**: Empty object `{}` by default

### Validation
- **Required Fields**: program_name, subject_code, code
- **JSON Validation**: Dependencies field checked for valid JSON
- **Confirmation**: Delete action requires confirmation

---

## 🚀 Deployment Checklist

✅ **Database Setup**
- Run `supabase-lab-execution-schema-FIXED.sql` to add new columns
- Verify both `lab_programs` and `mincode_programs` tables updated

✅ **Component Integration**
- AdminProgramManager created (✅ Done)
- Integrated into AdminDashboard (✅ Done)
- Integrated into AdminDashboardNew (✅ Done)

✅ **Testing**
- [ ] Create a Python program
- [ ] Create a JavaScript web program with HTML/CSS
- [ ] Create a React component
- [ ] Edit an existing program
- [ ] Delete a program
- [ ] Test all filters
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop

---

## 📱 Mobile Responsiveness

### Mobile (< 640px)
```tsx
// Text sizes
text-xs sm:text-sm → 12px mobile, 14px desktop
text-sm sm:text-base → 14px mobile, 16px desktop
text-lg sm:text-xl → 18px mobile, 20px desktop

// Icon sizes
w-4 h-4 sm:w-5 sm:h-5 → 16px mobile, 20px desktop

// Layout
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
flex-col sm:flex-row → Stack on mobile, row on desktop

// Spacing
gap-2 sm:gap-4 → Less space on mobile
px-4 sm:px-6 → Tighter padding on mobile

// Buttons
w-full sm:w-auto → Full width on mobile
```

### Testing Checklist
- [ ] All buttons accessible with fingers (44x44px minimum)
- [ ] Modal scrolls properly on small screens
- [ ] No horizontal scrolling
- [ ] Text remains readable (not too small)
- [ ] Forms easy to fill on phone
- [ ] Dropdowns work properly
- [ ] Cards stack vertically
- [ ] Actions remain visible

---

## 🎓 Best Practices

### When Creating Programs
1. **Use Clear Names**: "Interactive Button Counter" not "btn1"
2. **Add Descriptions**: Help students understand the goal
3. **Set Correct Language**: Ensures proper execution
4. **Include Sample Input**: For programs that need input
5. **Set Difficulty**: Helps with progression
6. **Test Dependencies**: Verify JSON format before saving

### Code Quality
1. **Format Code**: Use proper indentation
2. **Add Comments**: Explain complex logic
3. **Use Console.log**: Help with debugging
4. **Provide Examples**: Show expected output

### Organization
1. **Group by Subject**: Keep related programs together
2. **Use Consistent Naming**: Follow a naming convention
3. **Version Programs**: "Button Counter v1", "Button Counter v2"
4. **Clean Up**: Delete outdated programs

---

## 🔄 Migration from Old System

If you have programs in the old JSON format (`programs.json`), you'll need to:

1. **Export existing programs** from JSON
2. **Use the Create form** to add each program
3. **Set new fields**:
   - execution_type (client or server)
   - html_code (for web programs)
   - css_code (for web programs)
   - dependencies (if needed)
4. **Verify** all programs work correctly
5. **Delete** old JSON file (optional)

---

## 📞 Support

For issues or questions:
1. Check database schema matches the SQL file
2. Verify Supabase connection in `config/supabase.ts`
3. Check browser console for errors
4. Review toast notifications for error messages

---

## 🎉 Summary

The **AdminProgramManager** provides:
- ✅ Full mobile responsiveness
- ✅ Complete Supabase schema support
- ✅ Both Lab and MinCode program management
- ✅ All 10 programming languages
- ✅ Web program fields (HTML/CSS)
- ✅ Server program support
- ✅ Advanced filtering
- ✅ Beautiful, modern UI
- ✅ Easy to use for admins

**Result**: A production-ready admin interface for managing programming exercises! 🚀
