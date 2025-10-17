# Min Code System Architecture

## 🏗️ Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dashboard → MinCode Link → MinCodeSection Component           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Subjects   │ →  │   Programs   │ →  │    Editor    │    │
│  │              │    │              │    │              │    │
│  │  🌐 CN       │    │ TCP Server   │    │  [Code]      │    │
│  │  🤖 AI       │    │ UDP Client   │    │  [Input]     │    │
│  │  💻 FSD      │    │ IP Validator │    │  [Output]    │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /api/mincode/subjects           ← Get all subjects            │
│  /api/mincode/subjects/:code     ← Get single subject          │
│  /api/mincode/programs           ← Get all programs            │
│  /api/mincode/programs/subject/:code ← Get programs by subject │
│  /api/mincode/programs/:id       ← Get single program          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────┐            │
│  │         mincode_subjects                       │            │
│  ├────────────────────────────────────────────────┤            │
│  │ id        │ code │ name        │ description   │            │
│  ├────────────────────────────────────────────────┤            │
│  │ mincode-1 │ CN   │ Networks    │ Network...    │            │
│  │ mincode-2 │ AI   │ AI          │ Algorithm...  │            │
│  │ mincode-3 │ FSD  │ Full Stack  │ Web dev...    │            │
│  └────────────────────────────────────────────────┘            │
│                          ↓                                      │
│  ┌────────────────────────────────────────────────┐            │
│  │         mincode_programs                       │            │
│  ├────────────────────────────────────────────────┤            │
│  │ id    │ subject_code │ program_name │ code     │            │
│  ├────────────────────────────────────────────────┤            │
│  │ cn-1  │ CN           │ TCP Server   │ import...│            │
│  │ cn-2  │ CN           │ UDP Client   │ import...│            │
│  │ ai-1  │ AI           │ Linear Search│ def...   │            │
│  └────────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin Dashboard → Min Code Modifier                            │
│                                                                 │
│  ┌─────────────────────┐   ┌─────────────────────┐            │
│  │    Subjects         │   │     Programs        │            │
│  ├─────────────────────┤   ├─────────────────────┤            │
│  │ CN - Networks   [X] │   │ TCP Server      [X] │            │
│  │ AI - Artificial [X] │   │ UDP Client      [X] │            │
│  │ FSD - Full Stack[X] │   │ IP Validator    [X] │            │
│  ├─────────────────────┤   ├─────────────────────┤            │
│  │ [+ New Subject]     │   │ [+ New Program]     │            │
│  └─────────────────────┘   └─────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Reading Data (User Flow):
```
User clicks "MinCode"
        ↓
MinCodeSection loads
        ↓
API: GET /api/mincode/subjects
        ↓
Supabase: SELECT * FROM mincode_subjects
        ↓
Returns: [{id, code, name, description, icon}, ...]
        ↓
Display subject grid
        ↓
User clicks subject (e.g., CN)
        ↓
API: GET /api/mincode/programs/subject/CN
        ↓
Supabase: SELECT * FROM mincode_programs WHERE subject_code = 'CN'
        ↓
Returns: [{id, program_name, code, language}, ...]
        ↓
Display programs list
        ↓
User clicks program
        ↓
Open code editor with pre-loaded code
        ↓
User clicks "Run"
        ↓
Send to Judge0 API
        ↓
Display output
```

### Writing Data (Admin Flow):
```
Admin clicks "Min Code Modifier"
        ↓
MinCodeModifier loads
        ↓
API: GET /api/mincode/subjects
        ↓
Display subjects list
        ↓
Admin clicks "+ New Subject"
        ↓
Fill form: Code, Name, Description, Icon
        ↓
Click "Create"
        ↓
API: POST /api/mincode/subjects {code, name, description, icon}
        ↓
Supabase: INSERT INTO mincode_subjects (...)
        ↓
Success → Reload subjects list
        ↓
Admin selects subject
        ↓
API: GET /api/mincode/programs/subject/:code
        ↓
Display programs for subject
        ↓
Admin clicks "+ New Program"
        ↓
Fill form: Name, Code, Sample Input, Language, Difficulty
        ↓
Click "Create"
        ↓
API: POST /api/mincode/programs {...}
        ↓
Supabase: INSERT INTO mincode_programs (...)
        ↓
Success → Reload programs list
```

---

## 🗂️ File Organization

```
semprepzie/
│
├── SQL Files (Database)
│   ├── mincode-schema.sql          ← Create tables
│   └── mincode-data.sql            ← Sample data
│
├── Backend (API)
│   └── src/
│       ├── routes/
│       │   └── mincode.routes.ts   ← API endpoints
│       └── server.ts               ← Route registration
│
├── Frontend (UI)
│   └── src/
│       ├── components/
│       │   ├── MinCodeSection.tsx  ← Main component
│       │   └── admin/
│       │       └── MinCodeModifier.tsx ← Admin management
│       └── pages/
│           └── DashboardPage.tsx   ← Integration
│
└── Documentation
    ├── MINCODE_IMPLEMENTATION.md   ← Full guide
    ├── MINCODE_SETUP_COMPLETE.md   ← Quick start
    ├── MINCODE_ARCHITECTURE.md     ← This file
    └── setup-mincode.ps1           ← Test script
```

---

## 🔄 Component Lifecycle

### MinCodeSection Component:
```typescript
1. Mount
   ↓
2. useEffect → loadSubjects()
   ↓
3. Fetch from API
   ↓
4. Display subjects grid
   ↓
5. User selects subject
   ↓
6. useEffect → loadPrograms(subjectCode)
   ↓
7. Fetch programs from API
   ↓
8. Display programs list
   ↓
9. User selects program
   ↓
10. Set currentCode, input, view='editor'
    ↓
11. NeoGlassEditorCodeMirror renders
    ↓
12. User clicks "Run"
    ↓
13. executeCode() → Judge0 API
    ↓
14. Display output
```

---

## 🔐 Security Flow

```
Public Access (No Auth):
  GET /api/mincode/subjects        ✅ Allowed
  GET /api/mincode/programs         ✅ Allowed
  
Admin Access (Auth Required):
  POST /api/mincode/subjects        ❌ → authenticateToken() → ✅
  PUT /api/mincode/subjects/:code   ❌ → authenticateToken() → ✅
  DELETE /api/mincode/subjects      ❌ → authenticateToken() → ✅
  POST /api/mincode/programs        ❌ → authenticateToken() → ✅
  PUT /api/mincode/programs/:id     ❌ → authenticateToken() → ✅
  DELETE /api/mincode/programs      ❌ → authenticateToken() → ✅
```

---

## 🎨 UI Component Tree

```
Dashboard
└── MinCodeSection
    ├── Header
    │   ├── Back Button
    │   ├── Title
    │   └── Practice Button
    │
    ├── View: Subjects
    │   └── Subject Grid
    │       └── Subject Card × N
    │           ├── Icon
    │           ├── Name
    │           ├── Code
    │           └── Description
    │
    ├── View: Programs
    │   └── Program List
    │       └── Program Card × N
    │           ├── Name
    │           ├── Language Tag
    │           ├── Description
    │           └── Difficulty Badge
    │
    ├── View: Editor
    │   └── NeoGlassEditorCodeMirror
    │       ├── Title
    │       ├── Back Button
    │       ├── Code Editor (CodeMirror)
    │       ├── Input Panel
    │       ├── Run Button
    │       └── Output Panel
    │
    └── View: Practice
        └── PracticeEditor
            ├── Blank Code Editor
            ├── Language Selector
            ├── Input Panel
            ├── Run Button
            └── Output Panel
```

---

## 📡 API Response Structure

### GET /api/mincode/subjects
```json
{
  "success": true,
  "data": [
    {
      "id": "mincode-subject-cn",
      "name": "Computer Networks",
      "code": "CN",
      "description": "Network programming examples",
      "icon": "🌐",
      "created_at": "2025-10-17T...",
      "updated_at": "2025-10-17T..."
    }
  ]
}
```

### GET /api/mincode/programs/subject/CN
```json
{
  "success": true,
  "data": [
    {
      "id": "mincode-cn-1-tcp-server",
      "subject_code": "CN",
      "program_name": "TCP Echo Server",
      "language": "python",
      "code": "import socket\n...",
      "sample_input": "",
      "description": "Simple TCP echo server",
      "difficulty": "easy",
      "created_at": "2025-10-17T...",
      "updated_at": "2025-10-17T..."
    }
  ]
}
```

---

## 🔄 State Management

### MinCodeSection State:
```typescript
State:
  - minCodeSubjects: MinCodeSubject[]      // All subjects
  - selectedSubject: MinCodeSubject | null // Currently selected
  - programs: MinCodeProgram[]             // Programs for selected subject
  - selectedProgram: MinCodeProgram | null // Currently selected program
  - currentCode: string                    // Code in editor
  - input: string                          // Input for code execution
  - output: string                         // Execution result
  - isExecuting: boolean                   // Loading state
  - loading: boolean                       // Data fetching state
  - loadingSubjects: boolean               // Initial load state
  - view: 'subjects'|'programs'|'editor'|'practice' // Current view

Effects:
  1. On mount → loadSubjects()
  2. On selectedSubject change → loadPrograms()
  3. On selectedProgram change → setInput(sample_input)
  4. On view change → notify parent (onEditorStateChange)
```

---

## 🎯 Comparison Matrix

| Feature | Lab Programs | Min Code |
|---------|-------------|----------|
| **Database** | | |
| Subjects Table | `lab_subjects` | `mincode_subjects` |
| Programs Table | `lab_programs` | `mincode_programs` |
| **API** | | |
| Base Route | `/api/lab` | `/api/mincode` |
| **Frontend** | | |
| Component | `LabSection.tsx` | `MinCodeSection.tsx` |
| Section Name | "Programming Lab" | "Minimum Code Examples" |
| Icon | Terminal (📚) | Code (💻) |
| Color Theme | Blue | Purple |
| **Admin** | | |
| Modifier | Lab Programs Modifier | Min Code Modifier |
| **Functionality** | | |
| Subject Grid | ✅ | ✅ |
| Program List | ✅ | ✅ |
| Code Editor | ✅ | ✅ |
| Code Execution | ✅ | ✅ |
| Practice Mode | ✅ | ✅ |
| Dark/Light Theme | ✅ | ✅ |
| Responsive Design | ✅ | ✅ |
| Admin Management | ✅ | ✅ |

**Everything identical except database tables and names!**

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Production Environment             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend (Vite Build)                          │
│  ├── Static files served by Express            │
│  └── SPA routing handled                        │
│                                                 │
│  Backend (Express Server)                       │
│  ├── Port: 3001                                 │
│  ├── Routes: /api/mincode/*                     │
│  └── Middleware: CORS, Auth, Rate Limit        │
│                                                 │
│  Database (Supabase Cloud)                      │
│  ├── Tables: mincode_subjects, mincode_programs │
│  ├── RLS Policies: Public read, Admin write    │
│  └── Auto-backup enabled                        │
│                                                 │
│  External Services                              │
│  ├── Judge0 API (code execution)               │
│  └── Firebase (optional auth)                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Database:
- **Indexes**: Added on subject_code, language, code
- **Cascade Delete**: Deleting subject removes all programs
- **Pagination**: Ready for large datasets
- **Search**: Can add full-text search on descriptions

### API:
- **Caching**: Can add Redis for frequent queries
- **Rate Limiting**: Configured in middleware
- **Error Handling**: Comprehensive error responses
- **Validation**: Input validation on all POST/PUT

### Frontend:
- **Lazy Loading**: Can implement for large lists
- **Virtual Scrolling**: For 100+ programs
- **Code Splitting**: Separate bundles for editor
- **PWA Ready**: Service worker support

---

## 🔧 Customization Points

### Easy Customizations:
1. **Icons**: Change subject icons (emoji or custom)
2. **Colors**: Adjust theme colors in Tailwind config
3. **Languages**: Add more programming languages
4. **Difficulty**: Add more levels (beginner, expert, etc.)

### Advanced Customizations:
1. **Filters**: Add language/difficulty filters
2. **Search**: Implement program search
3. **Favorites**: User favorite programs
4. **History**: Track execution history
5. **Comments**: Add program comments/notes
6. **Ratings**: User ratings for programs

---

This architecture ensures:
- ✅ Complete separation from Lab Programs
- ✅ Identical user experience
- ✅ Easy to maintain
- ✅ Scalable to 1000s of programs
- ✅ Secure and performant

---

**Date**: October 17, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
