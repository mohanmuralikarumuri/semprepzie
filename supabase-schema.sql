-- Supabase SQL script to create tables for Semprepzie
-- Run this in your Supabase SQL editor

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY, -- Changed from UUID to TEXT to match your data structure
    name TEXT NOT NULL,
    icon TEXT NOT NULL, -- e.g. "🤖"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY, -- Changed from UUID to TEXT
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY, -- Changed from UUID to TEXT
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g. "pdf"
    url TEXT NOT NULL, -- Supabase storage public URL
    original_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_units_subject_id ON units(subject_id);
CREATE INDEX IF NOT EXISTS idx_documents_unit_id ON documents(unit_id);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);
CREATE INDEX IF NOT EXISTS idx_units_name ON units(name);

-- Add RLS (Row Level Security) policies for public read access
-- Note: This allows public read access - adjust according to your security needs

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access to subjects" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to units" ON units
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to documents" ON documents
    FOR SELECT USING (true);

-- Optional: Create policies for authenticated users to insert/update
-- Uncomment these if you want authenticated users to be able to add/edit content

-- CREATE POLICY "Allow authenticated users to insert subjects" ON subjects
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update subjects" ON subjects
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to insert units" ON units
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update units" ON units
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to insert documents" ON documents
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update documents" ON documents
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
