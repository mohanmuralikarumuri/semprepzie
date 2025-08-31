-- Supabase SQL script to fix table structure for Semprepzie
-- Run this in your Supabase SQL editor to fix the UUID issue

-- First, drop existing tables if they exist (with CASCADE to handle foreign keys)
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;

-- Recreate subjects table with TEXT IDs (matching your data structure)
CREATE TABLE subjects (
    id TEXT PRIMARY KEY, -- TEXT to match your IDs like "ooad", "ai", "cn"
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate units table with TEXT IDs
CREATE TABLE units (
    id TEXT PRIMARY KEY, -- TEXT to match your IDs like "ooad-unit1", "ai-unit1"
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate documents table with TEXT IDs
CREATE TABLE documents (
    id TEXT PRIMARY KEY, -- TEXT to match your IDs like "ooad-unit1-doc1"
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    original_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_units_subject_id ON units(subject_id);
CREATE INDEX idx_documents_unit_id ON documents(unit_id);
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_units_name ON units(name);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC); -- For latest updates

-- Enable RLS (Row Level Security)
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

-- Allow public insert access for migration (you can restrict this later if needed)
CREATE POLICY "Allow public insert to subjects" ON subjects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert to units" ON units
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert to documents" ON documents
    FOR INSERT WITH CHECK (true);

-- Optional: Create policies for authenticated users to update/delete
-- Uncomment these if you want authenticated users to be able to edit content

-- CREATE POLICY "Allow authenticated users to update subjects" ON subjects
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to delete subjects" ON subjects
--     FOR DELETE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update units" ON units
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to delete units" ON units
--     FOR DELETE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update documents" ON documents
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to delete documents" ON documents
--     FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update the updated_at timestamp
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

-- Insert sample data to test (optional - you can remove this section)
-- INSERT INTO subjects (id, name, icon) VALUES 
-- ('test', 'Test Subject', '🧪');

-- INSERT INTO units (id, subject_id, name) VALUES 
-- ('test-unit1', 'test', 'Test Unit 1');

-- INSERT INTO documents (id, unit_id, title, type, url, original_url) VALUES 
-- ('test-unit1-doc1', 'test-unit1', 'Test Document', 'pdf', 'https://example.com/test.pdf', 'https://example.com/test.pdf');

-- Verify the structure
SELECT 'subjects' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subjects' AND table_schema = 'public'
UNION ALL
SELECT 'units' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'units' AND table_schema = 'public'
UNION ALL
SELECT 'documents' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY table_name, column_name;
