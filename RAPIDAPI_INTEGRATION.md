
# RapidAPI Code Execution Integration

## Overview
Added 5 new RapidAPI-hosted code execution providers to increase reliability and redundancy of the code execution service.

## API Key Required
All RapidAPI providers use a single key stored in environment variable:
```
RAPIDAPI_KEY=62b692a97fmsh5e9e543204d9f15p191cafjsn97653ff7f4ae
```

**Important:** Add this to your `.env` file in the backend directory:
```bash
# backend/.env
RAPIDAPI_KEY=62b692a97fmsh5e9e543204d9f15p191cafjsn97653ff7f4ae
```

## New Providers Added

### 1. Judge0 Extra CE (`judge0-extra`)
- **Endpoint:** `https://judge0-extra-ce.p.rapidapi.com/submissions`
- **Features:** Extended Judge0 Community Edition with more language support
- **Execution:** Synchronous (wait=true parameter)
- **Response:** stdout, stderr, compile_output

### 2. Judge029 (`judge029`)
- **Endpoint:** `https://judge029.p.rapidapi.com/submissions`
- **Features:** Judge0 v2.9 with async submission pattern
- **Execution:** Asynchronous (create → poll → get result)
- **Polling Delay:** 2 seconds
- **Response:** stdout, stderr, compile_output

### 3. OneCompiler Rapid (`onecompiler-rapid`)
- **Endpoint:** `https://onecompiler-apis.p.rapidapi.com/api/v1/run`
- **Features:** RapidAPI-hosted version of OneCompiler
- **Execution:** Synchronous
- **Payload:** Files-based structure with language + stdin
- **Response:** stdout, stderr

### 4. Online Code Compiler (`online-code-compiler`)
- **Endpoint:** `https://online-code-compiler.p.rapidapi.com/v1/`
- **Features:** Simple execution with latest versions
- **Languages:** c, cpp, python3
- **Execution:** Synchronous
- **Response:** output, error

### 5. JDoodle2 Rapid (`jdoodle-rapid`)
- **Endpoint:** `https://jdoodle2.p.rapidapi.com/v1/execute`
- **Features:** RapidAPI-hosted JDoodle with version control
- **Languages:** 
  - c (versionIndex: 5)
  - cpp17 (versionIndex: 1)
  - python3 (versionIndex: 4)
- **Execution:** Synchronous
- **Response:** output, error

## Provider Priority Order

The execution service now tries providers in this order:

1. **oracle-judge0** - Future Oracle Cloud deployment (placeholder)
2. **piston** - Free, unlimited, fastest
3. **wandbox** - Free C/C++, no key needed
4. **onecompiler** - 100/day free, no key needed
5. **glot** - 100/day free with token
6. **online-code-compiler** ⭐ NEW - RapidAPI, good for all languages
7. **onecompiler-rapid** ⭐ NEW - RapidAPI OneCompiler
8. **judge0** - 50/day free with RapidAPI
9. **judge0-extra** ⭐ NEW - RapidAPI Judge0 Extra CE
10. **judge029** ⭐ NEW - RapidAPI Judge0 v29
11. **jdoodle-rapid** ⭐ NEW - RapidAPI JDoodle
12. **rextester** - Free, no key needed
13. **codex** - Free tier available
14. **paiza** - 10/day free
15. **jdoodle** - 200/day free (backup)

## Language Support

All new providers support:
- ✅ C
- ✅ C++
- ✅ Python

Language mapping handled automatically through `languageMap` object in `execute.service.ts`.

## Implementation Details

### Function Pattern
Each RapidAPI provider function follows this structure:

```typescript
async function runProviderName({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  // 1. Check for RAPIDAPI_KEY
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RapidAPI key missing');
  
  // 2. Map language to API-specific format
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  // 3. Make axios request with RapidAPI headers
  const resp = await axios.post(url, payload, {
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'api-host.p.rapidapi.com'
    },
    timeout: 20000
  });
  
  // 4. Parse response
  const r = resp.data;
  const out = r.stdout || r.output || '';
  const err = r.stderr || r.error || undefined;
  
  // 5. Return standardized result
  return { 
    output: out || (err ? '' : 'Program executed successfully'), 
    error: err, 
    provider: 'provider-name' 
  };
}
```

### Error Handling
- If RapidAPI key is missing, provider throws error and next provider is tried
- Language support is validated before API call
- 20-second timeout on all requests
- All errors are logged and service falls back to next provider

## Testing

To test the new providers:

1. Add RAPIDAPI_KEY to `.env` file
2. Restart backend server
3. Try executing code through the frontend
4. Check logs to see which provider is being used:
   ```
   [INFO] Trying provider: online-code-compiler
   ```

## API Usage & Limits

**RapidAPI Free Tier Limits:**
- Check your RapidAPI dashboard for exact quotas
- All 5 providers share the same API key
- Automatic fallback ensures execution even if quota is exceeded on one provider

## Files Modified

- ✅ `backend/src/services/execute.service.ts`
  - Updated `Provider` type to include 5 new providers
  - Added 5 new provider functions (200+ lines)
  - Updated `runWithProvider()` priority list
  - All functions tested with TypeScript compiler - **no errors**

## Next Steps

1. **Add RAPIDAPI_KEY to .env file**
   ```bash
   cd backend
   echo "RAPIDAPI_KEY=62b692a97fmsh5e9e543204d9f15p191cafjsn97653ff7f4ae" >> .env
   ```

2. **Restart backend server**
   ```bash
   npm run dev
   ```

3. **Test with sample code**
   - Open frontend code editor
   - Write a simple program
   - Click "Run Code"
   - Check which provider executes successfully

## Benefits

✅ **Increased Reliability** - 5 more fallback options if primary providers fail  
✅ **Better Performance** - Multiple RapidAPI hosts for faster response  
✅ **Single API Key** - All RapidAPI providers use same key  
✅ **Automatic Fallback** - Seamless provider switching on failure  
✅ **Extended Language Support** - Judge0 Extra CE supports 60+ languages  
✅ **Consistent Response Format** - All providers return standardized output  

## Troubleshooting

**Error: "RapidAPI key missing"**
- Solution: Add RAPIDAPI_KEY to backend/.env file

**Error: "Language not supported"**
- Check if language is in languageMap (c, cpp, python currently supported)
- Update languageMap if needed

**All providers failing**
- Check RapidAPI dashboard for quota limits
- Verify API key is correct
- Check network connectivity
- Review logs for specific error messages

## API Documentation Links

- [Judge0 Extra CE](https://rapidapi.com/judge0-official/api/judge0-extra-ce)
- [Judge029](https://rapidapi.com/hermanzdosilovic/api/judge029)
- [OneCompiler APIs](https://rapidapi.com/onecompiler-onecompiler-default/api/onecompiler-apis)
- [JDoodle2](https://rapidapi.com/jdoodle-jdoodle-default/api/jdoodle2)
- [Online Code Compiler](https://rapidapi.com/Glavier/api/online-code-compiler)
