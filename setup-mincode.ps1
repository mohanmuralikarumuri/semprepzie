# Min Code Setup Script
# Run this after setting up the database tables

Write-Host "🚀 Min Code Setup" -ForegroundColor Cyan
Write-Host "==================`n" -ForegroundColor Cyan

Write-Host "📋 Setup Checklist:" -ForegroundColor Yellow
Write-Host "1. Open Supabase SQL Editor (https://supabase.com/dashboard)" -ForegroundColor White
Write-Host "2. Run mincode-schema.sql (creates tables)" -ForegroundColor White
Write-Host "3. Run mincode-data.sql (adds sample data)" -ForegroundColor White
Write-Host "4. Verify SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env`n" -ForegroundColor White

Write-Host "📂 SQL Files Location:" -ForegroundColor Yellow
Write-Host "   - Schema: $PWD\mincode-schema.sql" -ForegroundColor Green
Write-Host "   - Data:   $PWD\mincode-data.sql`n" -ForegroundColor Green

$continue = Read-Host "Have you run the SQL files in Supabase? (y/n)"

if ($continue -ne 'y') {
    Write-Host "`n⚠️  Please run the SQL files first, then re-run this script." -ForegroundColor Red
    exit
}

Write-Host "`n🧪 Testing API Endpoints..." -ForegroundColor Cyan

# Test if backend is running
$backendUrl = "http://localhost:3001"

try {
    Write-Host "`n1. Testing Min Code Subjects endpoint..." -ForegroundColor Yellow
    $subjects = Invoke-RestMethod -Uri "$backendUrl/api/mincode/subjects" -Method Get
    
    if ($subjects.success) {
        Write-Host "   ✅ Subjects API working!" -ForegroundColor Green
        Write-Host "   Found $($subjects.data.Count) subjects" -ForegroundColor Green
        $subjects.data | ForEach-Object {
            Write-Host "      - $($_.code): $($_.name)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n2. Testing Min Code Programs endpoint..." -ForegroundColor Yellow
    $programs = Invoke-RestMethod -Uri "$backendUrl/api/mincode/programs" -Method Get
    
    if ($programs.success) {
        Write-Host "   ✅ Programs API working!" -ForegroundColor Green
        Write-Host "   Found $($programs.data.Count) programs" -ForegroundColor Green
    }
    
    Write-Host "`n3. Testing CN Programs endpoint..." -ForegroundColor Yellow
    $cnPrograms = Invoke-RestMethod -Uri "$backendUrl/api/mincode/programs/subject/CN" -Method Get
    
    if ($cnPrograms.success) {
        Write-Host "   ✅ Subject Programs API working!" -ForegroundColor Green
        Write-Host "   Found $($cnPrograms.data.Count) programs for CN" -ForegroundColor Green
        $cnPrograms.data | ForEach-Object {
            Write-Host "      - $($_.program_name) [$($_.language)]" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n✅ All API Tests Passed!" -ForegroundColor Green
    Write-Host "`n📱 Frontend Integration:" -ForegroundColor Cyan
    Write-Host "   1. Navigate to dashboard" -ForegroundColor White
    Write-Host "   2. Click 'MinCode' in navigation" -ForegroundColor White
    Write-Host "   3. You should see min code subjects!" -ForegroundColor White
    
    Write-Host "`n🎉 Min Code Setup Complete!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error: Cannot connect to backend at $backendUrl" -ForegroundColor Red
    Write-Host "   Make sure backend server is running:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm run dev`n" -ForegroundColor Gray
    Write-Host "   Error details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📚 Documentation: See MINCODE_IMPLEMENTATION.md for full details`n" -ForegroundColor Cyan
