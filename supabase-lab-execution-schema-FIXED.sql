-- ========================================
-- Lab Programs Execution Enhancement - CORRECTED VERSION
-- ========================================
-- This migration adds execution-related columns to lab_programs table
-- IMPORTANT: Uses subject_code (not subject_id) to match existing schema

-- Add execution-related columns to lab_programs table
ALTER TABLE lab_programs
ADD COLUMN IF NOT EXISTS execution_type VARCHAR(20) DEFAULT 'client',
ADD COLUMN IF NOT EXISTS html_code TEXT,
ADD COLUMN IF NOT EXISTS css_code TEXT,
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '{}';

-- Update the language column to accept more values
ALTER TABLE lab_programs
DROP CONSTRAINT IF EXISTS lab_programs_language_check;

ALTER TABLE lab_programs
ADD CONSTRAINT lab_programs_language_check 
CHECK (language IN ('c', 'cpp', 'python', 'java', 'javascript', 'html', 'css', 'react', 'nodejs', 'typescript'));

-- Add comments for documentation
COMMENT ON COLUMN lab_programs.language IS 'Programming language: c, cpp, python, java, javascript, html, css, react, nodejs, typescript';
COMMENT ON COLUMN lab_programs.execution_type IS 'Execution environment: client (browser) or server (backend)';
COMMENT ON COLUMN lab_programs.html_code IS 'HTML code for web-based programs';
COMMENT ON COLUMN lab_programs.css_code IS 'CSS styles for web-based programs';
COMMENT ON COLUMN lab_programs.dependencies IS 'JSON object of package dependencies {package: version}';

-- Update existing records with sensible defaults based on current data
UPDATE lab_programs
SET execution_type = CASE
  WHEN language IN ('html', 'css', 'javascript', 'react', 'typescript') THEN 'client'
  WHEN language IN ('nodejs', 'python', 'java', 'cpp', 'c') THEN 'server'
  ELSE 'client'
END
WHERE execution_type IS NULL OR execution_type = '';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lab_programs_execution_type ON lab_programs(execution_type);

-- ========================================
-- MinCode Programs Table (Same Schema)
-- ========================================

-- Check if mincode_programs table exists and apply same changes
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mincode_programs') THEN
    -- Add columns to mincode_programs
    ALTER TABLE mincode_programs
    ADD COLUMN IF NOT EXISTS execution_type VARCHAR(20) DEFAULT 'client',
    ADD COLUMN IF NOT EXISTS html_code TEXT,
    ADD COLUMN IF NOT EXISTS css_code TEXT,
    ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '{}';

    -- Update the language column constraint
    ALTER TABLE mincode_programs
    DROP CONSTRAINT IF EXISTS mincode_programs_language_check;

    ALTER TABLE mincode_programs
    ADD CONSTRAINT mincode_programs_language_check 
    CHECK (language IN ('c', 'cpp', 'python', 'java', 'javascript', 'html', 'css', 'react', 'nodejs', 'typescript'));

    -- Add comments
    COMMENT ON COLUMN mincode_programs.language IS 'Programming language: c, cpp, python, java, javascript, html, css, react, nodejs, typescript';
    COMMENT ON COLUMN mincode_programs.execution_type IS 'Execution environment: client (browser) or server (backend)';
    COMMENT ON COLUMN mincode_programs.html_code IS 'HTML code for web-based programs';
    COMMENT ON COLUMN mincode_programs.css_code IS 'CSS styles for web-based programs';
    COMMENT ON COLUMN mincode_programs.dependencies IS 'JSON object of package dependencies {package: version}';

    -- Update existing records
    UPDATE mincode_programs
    SET execution_type = CASE
      WHEN language IN ('html', 'css', 'javascript', 'react', 'typescript') THEN 'client'
      WHEN language IN ('nodejs', 'python', 'java', 'cpp', 'c') THEN 'server'
      ELSE 'client'
    END
    WHERE execution_type IS NULL OR execution_type = '';

    -- Create index
    CREATE INDEX IF NOT EXISTS idx_mincode_programs_execution_type ON mincode_programs(execution_type);

    RAISE NOTICE 'MinCode programs table updated successfully';
  ELSE
    RAISE NOTICE 'MinCode programs table does not exist, skipping...';
  END IF;
END $$;

-- ========================================
-- Sample Data Examples (CORRECTED)
-- ========================================

-- Example 1: HTML/CSS/JavaScript Program
/*
INSERT INTO lab_programs (
  id,
  subject_code,
  program_name,
  description,
  language,
  execution_type,
  html_code,
  css_code,
  code,
  sample_input,
  difficulty
) VALUES (
  'web-counter-' || floor(random() * 1000000),
  'YOUR-SUBJECT-CODE-HERE',  -- ⚠️ Use subject_code NOT subject_id
  'Interactive Button Counter',
  'A simple button that counts clicks with visual feedback',
  'javascript',
  'client',
  -- HTML
  '<div class="container">
    <h1>Click Counter</h1>
    <button id="clickBtn">Click Me!</button>
    <p>Clicks: <span id="count">0</span></p>
  </div>',
  -- CSS
  '.container {
    text-align: center;
    padding: 40px;
    font-family: Arial, sans-serif;
  }
  button {
    padding: 15px 30px;
    font-size: 18px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  button:hover {
    transform: scale(1.05);
  }',
  -- JavaScript
  'let count = 0;
const btn = document.getElementById("clickBtn");
const countDisplay = document.getElementById("count");

btn.addEventListener("click", () => {
  count++;
  countDisplay.textContent = count;
  console.log(`Button clicked ${count} times`);
  
  if (count === 10) {
    console.log("🎉 Milestone: 10 clicks!");
  }
});',
  'Click the button multiple times',
  'easy'
);
*/

-- Example 2: React Component
/*
INSERT INTO lab_programs (
  id,
  subject_code,
  program_name,
  description,
  language,
  execution_type,
  code,
  dependencies,
  difficulty
) VALUES (
  'react-todo-' || floor(random() * 1000000),
  'YOUR-SUBJECT-CODE-HERE',  -- ⚠️ Use subject_code NOT subject_id
  'React Todo List',
  'A todo list app with React hooks',
  'react',
  'client',
  'function App() {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState("");

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput("");
      console.log("Added todo:", input);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <h1>Todo List</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && addTodo()}
        placeholder="What to do?"
      />
      <button onClick={addTodo}>Add</button>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}',
  '{"react": "^18.0.0"}',
  'medium'
);
*/

-- ========================================
-- Verification Queries
-- ========================================

-- Check the updated schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lab_programs'
  AND column_name IN ('subject_code', 'language', 'execution_type', 'html_code', 'css_code', 'dependencies')
ORDER BY ordinal_position;

-- Count programs by language
SELECT 
  language, 
  execution_type,
  COUNT(*) as program_count
FROM lab_programs
GROUP BY language, execution_type
ORDER BY program_count DESC;

-- Show all lab subjects with their codes (to use in INSERT statements)
SELECT 
  code as subject_code,
  name as subject_name,
  description
FROM lab_subjects
ORDER BY name;
