# Lab Subjects Migration Guide - Complete Setup

## 🎯 Overview
This guide covers the complete migration from old lab subjects to new CN, AI, and FSD lab programs with database integration and practice mode.

## ✅ What's New

### 1. **New Lab Subjects**
- 🌐 **CN** - Computer Networks (Network programming, sockets, protocols)
- 🤖 **AI** - Artificial Intelligence (Search algorithms, BFS, DFS, A*)
- 💻 **FSD** - Full Stack Development-2 (Web dev, APIs, CRUD, JWT)

### 2. **Database-Driven Architecture**
- Programs stored in Supabase `lab_programs` table
- Fetched dynamically from backend API
- Sample inputs included in database

### 3. **Practice Mode**
- Free coding environment with language dropdown
- Supports: C, C++, Python, Java
- Auto-loads language-specific code snippets
- Accessible via "Practice" button on main lab page

### 4. **Java Language Support**
- Full Java execution support added
- All providers updated to support Java
- Syntax highlighting for Java code

### 5. **Sample Input Auto-Load**
- When selecting a program, sample input automatically loads
- Pre-filled input box with expected test data
- Can be modified or cleared by user

## 📁 Files Changed

### Backend Files

1. **supabase-schema.sql** - Added lab_programs table
   ```sql
   CREATE TABLE lab_programs (
     id TEXT PRIMARY KEY,
     subject TEXT NOT NULL CHECK (subject IN ('cn', 'ai', 'fsd')),
     program_name TEXT NOT NULL,
     language TEXT NOT NULL CHECK (language IN ('c', 'cpp', 'python', 'java')),
     code TEXT NOT NULL,
     sample_input TEXT DEFAULT '',
     description TEXT,
     difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'))
   );
   ```

2. **lab-programs-data.sql** - Sample programs for all 3 subjects
   - 5 programs for CN (TCP, UDP, IP validation, Subnet calc, CRC)
   - 5 programs for AI (Linear search, Binary search, BFS, DFS, A*)
   - 5 programs for FSD (HTTP server, JSON API, Form validation, JWT, CRUD)

3. **backend/src/routes/lab.routes.ts** - New API routes
   - `GET /api/lab-programs/subject/:subject` - Get programs by subject
   - `GET /api/lab-programs/:id` - Get single program
   - `GET /api/lab-programs/` - Get all programs

4. **backend/src/server.ts** - Added lab routes
   - Imported and mounted lab.routes.ts

5. **backend/src/controllers/execute.controller.ts**
   - Added Java to supported languages

6. **backend/src/services/execute.service.ts**
   - Added Java language mapping (judge0: 62, piston: java, etc.)
   - Java supported across all 15 providers

### Frontend Files

1. **frontend/src/components/LabSection.tsx** - Completely rewritten
   - Subjects view with CN, AI, FSD cards
   - Programs view (fetches from database)
   - Editor view with auto-loaded sample input
   - Practice button integration

2. **frontend/src/components/PracticeEditor.tsx** - NEW
   - Language dropdown (C, C++, Python, Java)
   - Auto-loads code snippets on language change
   - Full code execution capabilities

3. **frontend/src/components/NeoGlassEditorCodeMirror.tsx**
   - Added Java language support
   - Reset button now restores original template code

4. **frontend/src/components/SimpleCodeEditor.tsx**
   - Added Java language support (uses C++ syntax highlighting)
   - Fixed dark mode line numbers visibility

5. **frontend/src/services/codeExecution.ts**
   - Added Java to ExecutionRequest interface

## 🚀 Setup Instructions

### Step 1: Database Setup

1. **Run the schema update** in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase-schema.sql
   # Paste and run in Supabase SQL Editor
   ```

2. **Insert sample programs**:
   ```bash
   # Copy contents of lab-programs-data.sql
   # Paste and run in Supabase SQL Editor
   ```

3. **Verify tables**:
   ```sql
   SELECT * FROM lab_programs LIMIT 5;
   ```

### Step 2: Backend Setup

1. **Install dependencies** (if not already installed):
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables** - Ensure `.env` has:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   RAPIDAPI_KEY=62b692a97fmsh5e9e543204d9f15p191cafjsn97653ff7f4ae
   ```

3. **Restart backend server**:
   ```bash
   npm run dev
   ```

4. **Test API endpoints**:
   ```bash
   # Test CN programs
   curl http://localhost:3001/api/lab-programs/subject/cn

   # Test AI programs
   curl http://localhost:3001/api/lab-programs/subject/ai

   # Test FSD programs
   curl http://localhost:3001/api/lab-programs/subject/fsd
   ```

### Step 3: Frontend Setup

1. **Install dependencies** (if not already):
   ```bash
   cd frontend
   npm install
   ```

2. **Update environment** - Ensure `.env` has:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Restart frontend dev server**:
   ```bash
   npm run dev
   ```

### Step 4: Verification

1. **Navigate to Lab Section** in your app

2. **You should see:**
   - 3 subject cards: CN 🌐, AI 🤖, FSD 💻
   - "Practice" button in top-right corner

3. **Click a subject (e.g., AI):**
   - Should load 5 programs from database
   - Each card shows: program name, language, difficulty, description

4. **Click a program:**
   - Code editor opens
   - Sample input auto-loads in input box
   - Click "Run Code" to test

5. **Click "Practice" button:**
   - Opens practice mode editor
   - Language dropdown shows: C, C++, Python, Java
   - Change language → code snippet updates automatically

## 🎨 UI/UX Features

### Main Lab Page
- **Clean card layout** with icons and descriptions
- **Difficulty badges** (easy/medium/hard) color-coded
- **Sample input indicator** shows which programs have test data
- **Responsive design** works on mobile and desktop

### Programs View
- **Grid layout** for easy browsing
- **Filter by language** (badge shows language)
- **Difficulty levels** clearly marked
- **Hover effects** for better interaction

### Editor View
- **Auto-loaded sample input** - saves time
- **Reset button** - restores original template code
- **Dark mode support** - line numbers visible
- **Syntax highlighting** - for all 4 languages

### Practice Mode
- **Language dropdown** - smooth switching
- **Code snippets** - Hello World templates
- **Full execution** - same as regular editor
- **No distractions** - clean interface

## 📊 Database Structure

### lab_programs Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique identifier (e.g., 'cn-1-tcp-server') |
| subject | TEXT | 'cn', 'ai', or 'fsd' |
| program_name | TEXT | Display name of program |
| language | TEXT | 'c', 'cpp', 'python', or 'java' |
| code | TEXT | Full program source code |
| sample_input | TEXT | Test input data (can be empty) |
| description | TEXT | What the program does |
| difficulty | TEXT | 'easy', 'medium', or 'hard' |

### Sample Query Examples

```sql
-- Get all CN programs
SELECT * FROM lab_programs WHERE subject = 'cn' ORDER BY program_name;

-- Get all Python programs
SELECT * FROM lab_programs WHERE language = 'python';

-- Get easy difficulty programs
SELECT * FROM lab_programs WHERE difficulty = 'easy';

-- Get programs with sample input
SELECT * FROM lab_programs WHERE sample_input != '';
```

## 🔧 Customization

### Adding New Programs

1. **Insert into database**:
   ```sql
   INSERT INTO lab_programs (
     id, subject, program_name, language, 
     code, sample_input, description, difficulty
   ) VALUES (
     'ai-6-minimax',
     'ai',
     'Minimax Algorithm',
     'python',
     'def minimax(...)...',
     '3',
     'Game tree search algorithm',
     'hard'
   );
   ```

2. **Programs appear automatically** in UI (no frontend changes needed)

### Modifying Code Snippets (Practice Mode)

Edit `frontend/src/components/PracticeEditor.tsx`:

```typescript
const CODE_SNIPPETS: Record<'c' | 'cpp' | 'python' | 'java', string> = {
  python: `# Your custom Python snippet
print("Modified template")`,
  // ... other languages
};
```

### Adding New Subject

1. **Update database constraint**:
   ```sql
   ALTER TABLE lab_programs 
   DROP CONSTRAINT lab_programs_subject_check;
   
   ALTER TABLE lab_programs 
   ADD CONSTRAINT lab_programs_subject_check 
   CHECK (subject IN ('cn', 'ai', 'fsd', 'ml')); -- Add 'ml'
   ```

2. **Add to frontend** `LabSection.tsx`:
   ```typescript
   const labSubjects: LabSubject[] = [
     // ... existing
     {
       id: 'ml',
       name: 'Machine Learning',
       description: 'ML algorithms and implementations',
       icon: '🧠'
     }
   ];
   ```

3. **Insert programs** for new subject

## 🐛 Troubleshooting

### "No programs available"
- **Check:** Is Supabase connected?
- **Verify:** Run SQL query to see if data exists
- **Check:** Browser console for API errors
- **Fix:** Ensure backend API route is mounted correctly

### "Failed to fetch programs"
- **Check:** Backend server running?
- **Check:** VITE_API_URL set correctly?
- **Check:** CORS configuration in server.ts?
- **Fix:** Check browser network tab for 404/500 errors

### Java programs not executing
- **Check:** Language map has Java entry?
- **Check:** Providers support Java (most do)?
- **Check:** Backend logs for provider errors?
- **Fix:** Verify judge0 language ID = 62 for Java

### Sample input not loading
- **Check:** Database has sample_input value?
- **Check:** Auto-load effect in LabSection?
- **Fix:** Add `console.log` to verify data fetch

### Practice mode not appearing
- **Check:** Practice button visible on subjects view?
- **Check:** PracticeEditor component imported?
- **Fix:** Verify view state logic in LabSection

## 📈 Future Enhancements

1. **Search/Filter** - Search programs by name or tag
2. **Favorites** - Mark favorite programs for quick access
3. **Code Templates** - More starter templates per language
4. **Difficulty Filter** - Filter programs by difficulty
5. **Language Filter** - Show only programs in selected language
6. **Export Code** - Download code as file
7. **Share Programs** - Share via link
8. **Leaderboard** - Track completion/execution stats
9. **Code Comments** - Add hints/explanations in code
10. **Video Tutorials** - Link to explanation videos

## ✅ Testing Checklist

- [ ] Supabase lab_programs table created
- [ ] 15 sample programs inserted (5 per subject)
- [ ] Backend /api/lab-programs routes working
- [ ] Frontend displays 3 subject cards
- [ ] Click CN → Shows CN programs
- [ ] Click AI → Shows AI programs
- [ ] Click FSD → Shows FSD programs
- [ ] Click program → Editor opens with code
- [ ] Sample input auto-loads in input box
- [ ] Run code button executes successfully
- [ ] Reset button restores original code
- [ ] Practice button opens practice mode
- [ ] Language dropdown switches languages
- [ ] Code snippets update on language change
- [ ] Java code executes successfully
- [ ] Dark mode works correctly
- [ ] Responsive design on mobile
- [ ] Back button navigation works
- [ ] All 4 languages supported (C, C++, Python, Java)

## 🎉 Summary

### What Was Achieved

✅ **Database Integration** - Lab programs stored in Supabase  
✅ **Dynamic Loading** - Programs fetched from API  
✅ **New Subjects** - CN, AI, FSD with 15 sample programs  
✅ **Practice Mode** - Free coding environment with language selector  
✅ **Java Support** - Full language support across all providers  
✅ **Sample Input** - Auto-loads test data  
✅ **Better UX** - Reset button, difficulty badges, clean UI  
✅ **Dark Mode** - Fixed line number visibility  
✅ **Scalability** - Easy to add new programs via database  

### Migration Path

**Old System:**
- Hardcoded lab subjects in frontend
- Static program data
- Limited to C, C++, Python
- No sample inputs

**New System:**
- Database-driven architecture
- Dynamic program loading
- 4 languages (added Java)
- Sample inputs included
- Practice mode for free coding
- Better organized by subject (CN, AI, FSD)

Your lab section is now fully modernized! 🚀
