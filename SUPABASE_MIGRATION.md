# Supabase Migration Guide

This guide will help you migrate from static `subjectsData` to dynamic Supabase database.

## Step 1: Set up Supabase Database

1. **Create the tables**: Run the SQL script in your Supabase SQL editor:
   ```bash
   # Copy and paste the content of supabase-schema.sql into your Supabase SQL editor
   ```

2. **Get your Supabase credentials**:
   - Go to your Supabase dashboard
   - Navigate to Settings → API
   - Copy your "Project URL" and "anon public" key

## Step 2: Configure Environment Variables

1. **Create `.env` file** in your project root:
   ```bash
   cp .env.template .env
   ```

2. **Add your Supabase credentials** to `.env`:
   ```env
   VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key-here
   ```

## Step 3: Run Migration (One-time only)

1. **Temporarily add the migration route** to your `App.tsx`:
   ```tsx
   import MigrationPage from './pages/MigrationPage';
   
   // Add this route temporarily
   <Route path="/migration" element={<MigrationPage />} />
   ```

2. **Start your development server**:
   ```bash
   npm run dev
   ```

3. **Navigate to migration page**:
   ```
   http://localhost:5173/migration
   ```

4. **Run the migration**:
   - Click "Start Migration" to transfer all static data to Supabase
   - Click "Verify Data" to confirm migration was successful

5. **Remove the migration route** after successful migration

## Step 4: Update Your Components

### Components that need updating:

1. **Replace static imports** with the hook:
   ```tsx
   // OLD
   import { subjectsData } from '../utils/documentUtils';
   
   // NEW
   import { useSubjectsData } from '../hooks/useSubjectsData';
   
   function MyComponent() {
     const { subjects, loading, error } = useSubjectsData();
     
     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error}</div>;
     
     return (
       <div>
         {subjects.map(subject => (
           // Your existing code works the same
         ))}
       </div>
     );
   }
   ```

### Already Updated Components:
- ✅ `TheorySection.tsx` - Uses `useSubjectsData` hook with loading/error states
- ✅ `CacheManagement.tsx` - Uses `useSubjectsData` hook

### Files You May Need to Update:
- Check for other components using `subjectsData` import
- Update any direct references to the static array

## Step 5: Deploy

1. **Build your app**:
   ```bash
   npm run build
   ```

2. **Add environment variables to Render**:
   - Go to your Render dashboard
   - Navigate to your service → Environment
   - Add: `VITE_SUPABASE_ANON_KEY=your-key-here`

3. **Deploy**:
   ```bash
   git add .
   git commit -m "Migrate to Supabase dynamic data"
   git push origin main
   ```

## Benefits After Migration

✅ **Dynamic Content**: Add new PDFs without redeploying  
✅ **Admin Panel Ready**: Easy to build admin interface  
✅ **Scalable**: No hardcoded limits  
✅ **Real-time Updates**: Content updates instantly  
✅ **Version Control**: Track all content changes  

## Adding New Content (After Migration)

You can now add content via:

1. **Direct SQL inserts** in Supabase dashboard
2. **Admin API endpoints** (build these next)
3. **Admin web interface** (build this next)

## Troubleshooting

### Common Issues:

1. **"Cannot find name 'subjectsData'"**:
   - Make sure you've updated imports to use `useSubjectsData` hook

2. **"Failed to fetch subjects"**:
   - Check your `.env` file has correct `VITE_SUPABASE_ANON_KEY`
   - Verify tables exist in Supabase
   - Check RLS policies allow public read access

3. **Migration fails**:
   - Ensure tables are created first
   - Check browser console for detailed errors
   - Verify Supabase connection works

### Database Query Test:

You can test your setup by running this in Supabase SQL editor:
```sql
SELECT s.name, u.name as unit_name, d.title 
FROM subjects s
LEFT JOIN units u ON s.id = u.subject_id  
LEFT JOIN documents d ON u.id = d.unit_id
ORDER BY s.name, u.name, d.title;
```

## Next Steps (Optional)

1. **Build Admin Interface**: Create pages to manage content
2. **Add Authentication**: Secure admin operations  
3. **File Upload**: Direct upload to Supabase storage
4. **Search/Filter**: Add content search capabilities
5. **Analytics**: Track document usage
