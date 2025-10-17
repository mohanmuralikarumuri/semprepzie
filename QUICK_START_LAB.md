# Quick Start - Lab Subjects Setup

## 🚀 Quick Steps (5 Minutes)

### 1. Database Setup (2 min)

Open **Supabase SQL Editor** and run:

```sql
-- Step 1: Create table
CREATE TABLE IF NOT EXISTS lab_programs (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL CHECK (subject IN ('cn', 'ai', 'fsd')),
    program_name TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('c', 'cpp', 'python', 'java')),
    code TEXT NOT NULL,
    sample_input TEXT DEFAULT '',
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Indexes
CREATE INDEX IF NOT EXISTS idx_lab_programs_subject ON lab_programs(subject);
CREATE INDEX IF NOT EXISTS idx_lab_programs_language ON lab_programs(language);

-- Step 3: RLS
ALTER TABLE lab_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to lab_programs" ON lab_programs FOR SELECT USING (true);

-- Step 4: Trigger
CREATE TRIGGER update_lab_programs_updated_at BEFORE UPDATE ON lab_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Then run the **lab-programs-data.sql** file (copy-paste all contents).

### 2. Backend Setup (1 min)

```bash
cd backend

# Ensure .env has:
# SUPABASE_URL=your_url
# SUPABASE_ANON_KEY=your_key
# RAPIDAPI_KEY=62b692a97fmsh5e9e543204d9f15p191cafjsn97653ff7f4ae

npm run dev
```

### 3. Frontend Setup (1 min)

```bash
cd frontend

# Ensure .env has:
# VITE_API_URL=http://localhost:3001

npm run dev
```

### 4. Test (1 min)

1. Open http://localhost:5173
2. Go to **Lab** section
3. You should see 3 cards: CN 🌐, AI 🤖, FSD 💻
4. Click **Practice** button → Opens practice mode
5. Click **CN** → Shows network programs
6. Click a program → Opens editor with sample input
7. Click **Run Code** → Executes successfully

## ✅ What You Get

### Features
- ✨ 3 new lab subjects (CN, AI, FSD)
- ✨ 15 sample programs (5 per subject)
- ✨ Practice mode with language dropdown
- ✨ Java language support
- ✨ Auto-loading sample inputs
- ✨ Reset button for original code
- ✨ Dark mode with visible line numbers

### Subjects

**🌐 Computer Networks (CN)**
1. TCP Echo Server (Python)
2. UDP Client (Python)
3. IP Address Validator (Python)
4. Subnet Calculator (Python)
5. CRC Error Detection (C)

**🤖 Artificial Intelligence (AI)**
1. Linear Search (Python)
2. Binary Search (Python)
3. BFS Graph Traversal (Python)
4. DFS Graph Traversal (Python)
5. A* Pathfinding (Python)

**💻 Full Stack Development-2 (FSD)**
1. Simple HTTP Server (Python)
2. JSON API Response (Python)
3. Form Validation (Python)
4. JWT Token Generator (Python)
5. CRUD Operations Simulator (Python)

## 📊 API Endpoints

```
GET  /api/lab-programs                  → All programs
GET  /api/lab-programs/subject/cn       → CN programs
GET  /api/lab-programs/subject/ai       → AI programs
GET  /api/lab-programs/subject/fsd      → FSD programs
GET  /api/lab-programs/:id              → Single program
```

## 🐛 Common Issues

### "No programs available"
```bash
# Check if data exists in Supabase:
SELECT COUNT(*) FROM lab_programs;  # Should return 15

# If 0, re-run lab-programs-data.sql
```

### Backend API not working
```bash
# Test manually:
curl http://localhost:3001/api/lab-programs/subject/cn

# Check backend console for errors
```

### Frontend not fetching
```bash
# Check browser console (F12)
# Look for CORS or network errors
# Verify VITE_API_URL in .env
```

## 🎯 Next Steps

1. **Add More Programs**: Insert new rows in `lab_programs` table
2. **Customize Snippets**: Edit `PracticeEditor.tsx` CODE_SNIPPETS
3. **Add Subjects**: Update database constraint + frontend array
4. **Deploy**: Push changes and deploy to production

## 📚 Full Documentation

See `LAB_MIGRATION_GUIDE.md` for complete details.

---

**That's it! Your lab section is now fully upgraded! 🚀**
