const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'Not set');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Supabase credentials are missing!');
  process.exit(1);
}

console.log('\nCreating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client created successfully');

console.log('\nTesting query to lab_subjects table...');
supabase
  .from('lab_subjects')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      console.error('ERROR:', error);
    } else {
      console.log('SUCCESS! Found', data ? data.length : 0, 'subjects');
      console.log('Data:', JSON.stringify(data, null, 2));
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('EXCEPTION:', err);
    process.exit(1);
  });
