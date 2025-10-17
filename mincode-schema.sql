-- Min Code Database Schema
-- Separate tables for minimum code examples (independent from lab programs)

-- Create mincode_subjects table for min code subject metadata
CREATE TABLE IF NOT EXISTS mincode_subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- e.g. 'PYTHON', 'JAVASCRIPT', 'REACT'
    description TEXT NOT NULL,
    icon TEXT DEFAULT '💻',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mincode_programs table for minimum code examples
CREATE TABLE IF NOT EXISTS mincode_programs (
    id TEXT PRIMARY KEY,
    subject_code TEXT NOT NULL REFERENCES mincode_subjects(code) ON DELETE CASCADE,
    program_name TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('c', 'cpp', 'python', 'java', 'javascript', 'typescript')),
    code TEXT NOT NULL,
    sample_input TEXT DEFAULT '',
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for mincode tables
CREATE INDEX IF NOT EXISTS idx_mincode_subjects_code ON mincode_subjects(code);
CREATE INDEX IF NOT EXISTS idx_mincode_programs_subject_code ON mincode_programs(subject_code);
CREATE INDEX IF NOT EXISTS idx_mincode_programs_language ON mincode_programs(language);

-- Enable RLS for mincode tables
ALTER TABLE mincode_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mincode_programs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to mincode tables
CREATE POLICY "Allow public read access to mincode_subjects" ON mincode_subjects
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to mincode_programs" ON mincode_programs
    FOR SELECT USING (true);

-- Create triggers for mincode tables
CREATE TRIGGER update_mincode_subjects_updated_at BEFORE UPDATE ON mincode_subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mincode_programs_updated_at BEFORE UPDATE ON mincode_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
