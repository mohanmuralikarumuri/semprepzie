import axios from 'axios';
import { logger } from '../utils/logger';

type Provider = 'oracle-judge0' | 'piston' | 'jdoodle' | 'glot' | 'wandbox' | 'judge0' | 'judge0-extra' | 'judge029' | 'paiza' | 'rextester' | 'onecompiler' | 'onecompiler-rapid' | 'online-code-compiler' | 'jdoodle-rapid' | 'codex';

interface ExecRequest {
  provider?: Provider;
  language: 'c' | 'cpp' | 'python' | 'java';
  code: string;
  stdin?: string;
}

interface ExecResult {
  output: string;
  error?: string;
  provider: string;
}

const languageMap: Record<string, { 
  piston: string; 
  version: string; 
  jdoodle: string;
  judge0: number;
  rextester: number;
  onecompiler: string;
}> = {
  c:      { piston: 'c',     version: '10.2.0', jdoodle: 'c', judge0: 50, rextester: 6, onecompiler: 'c' },
  cpp:    { piston: 'cpp',   version: '10.2.0', jdoodle: 'cpp17', judge0: 54, rextester: 7, onecompiler: 'cpp' },
  python: { piston: 'python',version: '3.10.0', jdoodle: 'python3', judge0: 71, rextester: 24, onecompiler: 'python' },
  java:   { piston: 'java',  version: '15.0.2', jdoodle: 'java', judge0: 62, rextester: 4, onecompiler: 'java' },
};

export async function runWithProvider(req: ExecRequest): Promise<ExecResult> {
  // Priority order: Oracle Cloud Judge0 (future) -> Free providers with highest limits -> RapidAPI providers
  const providers: Provider[] = req.provider ? [req.provider] : [
    'oracle-judge0',         // Your future Oracle Cloud + Judge0 Docker API (placeholder)
    'piston',                // Free, unlimited (community rate limit) - fastest
    'wandbox',               // Free C/C++ - no key needed
    'onecompiler',           // 100/day free - no key needed
    'glot',                  // 100/day free with token
    'online-code-compiler',  // RapidAPI - Good for all languages
    'onecompiler-rapid',     // RapidAPI OneCompiler version
    'judge0',                // 50/day free with RapidAPI
    'judge0-extra',          // RapidAPI Judge0 Extra CE
    'judge029',              // RapidAPI Judge0 v29
    'jdoodle-rapid',         // RapidAPI JDoodle
    'rextester',             // Free, no key needed
    'codex',                 // Free tier available
    'paiza',                 // 10/day free
    'jdoodle'                // 200/day free (use as backup since has best quota)
  ];
  
  let lastError: any;
  for (const p of providers) {
    try {
      logger.info(`Trying provider: ${p}`);
      
      if (p === 'oracle-judge0') return await runOracleJudge0(req);
      if (p === 'piston') return await runPiston(req);
      if (p === 'glot') return await runGlot(req);
      if (p === 'wandbox') return await runWandbox(req);
      if (p === 'jdoodle') return await runJDoodle(req);
      if (p === 'judge0') return await runJudge0(req);
      if (p === 'judge0-extra') return await runJudge0Extra(req);
      if (p === 'judge029') return await runJudge029(req);
      if (p === 'paiza') return await runPaiza(req);
      if (p === 'rextester') return await runRextester(req);
      if (p === 'onecompiler') return await runOneCompiler(req);
      if (p === 'onecompiler-rapid') return await runOneCompilerRapid(req);
      if (p === 'online-code-compiler') return await runOnlineCodeCompiler(req);
      if (p === 'jdoodle-rapid') return await runJDoodleRapid(req);
      if (p === 'codex') return await runCodex(req);
    } catch (e) {
      const errorMsg = (e as Error).message;
      logger.warn(`Provider ${p} failed: ${errorMsg}`);
      lastError = e;
      continue;
    }
  }
  throw lastError || new Error('All providers failed');
}

// ============================================
// FUTURE: Oracle Cloud + Judge0 Docker
// ============================================
async function runOracleJudge0({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiUrl = process.env.ORACLE_JUDGE0_URL;
  const apiKey = process.env.ORACLE_JUDGE0_KEY;
  
  // Placeholder: Skip if not configured yet
  if (!apiUrl || !apiKey) {
    throw new Error('Oracle Judge0 not configured yet (future feature)');
  }
  
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const resp = await axios.post(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
    source_code: code,
    language_id: map.judge0,
    stdin: stdin || '',
    cpu_time_limit: 5,
    memory_limit: 256000
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': apiKey
    },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.stdout || '';
  const err = [r.stderr, r.compile_output].filter(Boolean).join('') || undefined;
  logger.info('Oracle Judge0 execution successful');
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'oracle-judge0' };
}

// ============================================
// FREE PROVIDER: Piston (~50/day, no key)
// ============================================
async function runPiston({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';
  const resp = await axios.post(url, {
    language: map.piston,
    version: map.version,
    files: [{ name: `main.${language === 'cpp' ? 'cpp' : language}`, content: code }],
    stdin: stdin || ''
  }, { timeout: 20000 });

  const r = resp.data;
  const out = [r?.compile?.stdout, r?.run?.stdout].filter(Boolean).join('');
  const err = [r?.compile?.stderr, r?.run?.stderr].filter(Boolean).join('') || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'piston' };
}

// ============================================
// FREE PROVIDER: Glot.io (100/day with token)
// ============================================
async function runGlot({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const token = process.env.GLOT_TOKEN;
  if (!token) throw new Error('Glot.io token missing');
  
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = `https://glot.io/api/run/${map.piston}/latest`;
  const resp = await axios.post(url, {
    files: [{ name: `main.${language === 'cpp' ? 'cpp' : language}`, content: code }],
    stdin: stdin || ''
  }, {
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.stdout || '';
  const err = r.stderr ? String(r.stderr) : undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'glot' };
}

// ============================================
// FREE PROVIDER: Wandbox (C/C++ only, no key)
// ============================================
async function runWandbox({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  if (language !== 'c' && language !== 'cpp') {
    throw new Error('Wandbox supports C/C++ only');
  }
  
  const url = 'https://wandbox.org/api/compile.json';
  const compiler = language === 'cpp' ? 'gcc-head' : 'gcc-head';
  
  const resp = await axios.post(url, {
    code,
    stdin: stdin || '',
    compiler,
    options: 'warning,gnu++17'
  }, { timeout: 20000 });

  const r = resp.data;
  const out = [r.program_output, r.compiler_output].filter(Boolean).join('');
  const err = [r.program_error, r.compiler_error].filter(Boolean).join('') || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'wandbox' };
}

// ============================================
// FREE PROVIDER: JDoodle (200/day with credentials)
// ============================================
async function runJDoodle({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('JDoodle credentials missing');
  
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://api.jdoodle.com/v1/execute';
  const resp = await axios.post(url, {
    clientId,
    clientSecret,
    script: code,
    stdin: stdin || '',
    language: map.jdoodle,
    versionIndex: '0'
  }, { timeout: 20000 });

  const r = resp.data;
  return { output: r.output || '', error: r.error || undefined, provider: 'jdoodle' };
}

// ============================================
// FREE PROVIDER: Judge0 via RapidAPI (50/day)
// ============================================
async function runJudge0({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) throw new Error('RapidAPI key missing for Judge0');
  
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
  const resp = await axios.post(url, {
    source_code: code,
    language_id: map.judge0,
    stdin: stdin || ''
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.stdout || '';
  const err = [r.stderr, r.compile_output].filter(Boolean).join('') || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'judge0' };
}

// ============================================
// FREE PROVIDER: Paiza.io (10/day with key)
// ============================================
async function runPaiza({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiKey = process.env.PAIZA_API_KEY;
  if (!apiKey) throw new Error('Paiza.io API key missing');
  
  const langMap: Record<string, string> = {
    c: 'c',
    cpp: 'cpp',
    python: 'python3'
  };
  
  const url = 'https://api.paiza.io/runners/create';
  const resp = await axios.post(url, {
    source_code: code,
    language: langMap[language],
    input: stdin || '',
    api_key: apiKey
  }, { timeout: 20000 });

  const sessionId = resp.data.id;
  
  // Poll for result
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const resultResp = await axios.get(`https://api.paiza.io/runners/get_details?id=${sessionId}&api_key=${apiKey}`, {
    timeout: 10000
  });

  const r = resultResp.data;
  const out = r.stdout || '';
  const err = [r.stderr, r.build_stderr].filter(Boolean).join('') || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'paiza' };
}

// ============================================
// FREE PROVIDER: Rextester (free, no key)
// ============================================
async function runRextester({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://rextester.com/rundotnet/api';
  const resp = await axios.post(url, 
    `LanguageChoice=${map.rextester}&Program=${encodeURIComponent(code)}&Input=${encodeURIComponent(stdin || '')}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 20000
    }
  );

  const r = resp.data;
  const out = r.Result || '';
  const err = [r.Errors, r.Warnings].filter(Boolean).join('') || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'rextester' };
}

// ============================================
// FREE PROVIDER: OneCompiler (100/day, no key)
// ============================================
async function runOneCompiler({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://onecompiler.com/api/code/exec';
  const resp = await axios.post(url, {
    language: map.onecompiler,
    stdin: stdin || '',
    files: [{
      name: `main.${language === 'cpp' ? 'cpp' : language}`,
      content: code
    }]
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.stdout || '';
  const err = r.stderr || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'onecompiler' };
}

// ============================================
// FREE PROVIDER: Codex (free tier)
// ============================================
async function runCodex({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiKey = process.env.CODEX_API_KEY;
  if (!apiKey) throw new Error('Codex API key missing');
  
  const langMap: Record<string, string> = {
    c: 'c',
    cpp: 'cpp',
    python: 'python'
  };
  
  const url = 'https://api.codex.jaagrav.in';
  const resp = await axios.post(url, {
    code,
    language: langMap[language],
    input: stdin || ''
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.output || '';
  const err = r.error || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'codex' };
}

// ============================================
// RAPIDAPI: Judge0 Extra CE
// ============================================
async function runJudge0Extra({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RapidAPI key missing');
  
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://judge0-extra-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
  const resp = await axios.post(url, {
    source_code: code,
    language_id: map.judge0,
    stdin: stdin || ''
  }, {
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'judge0-extra-ce.p.rapidapi.com'
    },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.stdout || '';
  const err = [r.stderr, r.compile_output].filter(Boolean).join('') || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'judge0-extra' };
}

// ============================================
// RAPIDAPI: Judge029
// ============================================
async function runJudge029({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RapidAPI key missing');
  
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  // Create submission
  const createUrl = 'https://judge029.p.rapidapi.com/submissions?base64_encoded=false';
  const createResp = await axios.post(createUrl, {
    source_code: code,
    language_id: map.judge0,
    stdin: stdin || ''
  }, {
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'judge029.p.rapidapi.com'
    },
    timeout: 20000
  });

  const token = createResp.data.token;
  
  // Poll for result
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const resultUrl = `https://judge029.p.rapidapi.com/submissions/${token}?base64_encoded=false&fields=*`;
  const resultResp = await axios.get(resultUrl, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'judge029.p.rapidapi.com'
    },
    timeout: 10000
  });

  const r = resultResp.data;
  const out = r.stdout || '';
  const err = [r.stderr, r.compile_output].filter(Boolean).join('') || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'judge029' };
}

// ============================================
// RAPIDAPI: OneCompiler APIs
// ============================================
async function runOneCompilerRapid({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RapidAPI key missing');
  
  const map = languageMap[language];
  if (!map) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://onecompiler-apis.p.rapidapi.com/api/v1/run';
  const resp = await axios.post(url, {
    language: map.onecompiler,
    stdin: stdin || '',
    files: [{
      name: `main.${language === 'cpp' ? 'cpp' : language}`,
      content: code
    }]
  }, {
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com'
    },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.stdout || '';
  const err = r.stderr || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'onecompiler-rapid' };
}

// ============================================
// RAPIDAPI: Online Code Compiler
// ============================================
async function runOnlineCodeCompiler({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RapidAPI key missing');
  
  const langMap: Record<string, string> = {
    c: 'c',
    cpp: 'cpp',
    python: 'python3'
  };
  
  if (!langMap[language]) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://online-code-compiler.p.rapidapi.com/v1/';
  const resp = await axios.post(url, {
    language: langMap[language],
    version: 'latest',
    code: code,
    input: stdin || ''
  }, {
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'online-code-compiler.p.rapidapi.com'
    },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.output || '';
  const err = r.error || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'online-code-compiler' };
}

// ============================================
// RAPIDAPI: JDoodle2
// ============================================
async function runJDoodleRapid({ language, code, stdin }: ExecRequest): Promise<ExecResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RapidAPI key missing');
  
  const langMap: Record<string, { language: string, versionIndex: string }> = {
    c: { language: 'c', versionIndex: '5' },
    cpp: { language: 'cpp17', versionIndex: '1' },
    python: { language: 'python3', versionIndex: '4' }
  };
  
  const langConfig = langMap[language];
  if (!langConfig) throw new Error(`Language not supported: ${language}`);
  
  const url = 'https://jdoodle2.p.rapidapi.com/v1/execute';
  const resp = await axios.post(url, {
    script: code,
    language: langConfig.language,
    versionIndex: langConfig.versionIndex,
    stdin: stdin || ''
  }, {
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'jdoodle2.p.rapidapi.com'
    },
    timeout: 20000
  });

  const r = resp.data;
  const out = r.output || '';
  const err = r.error || undefined;
  return { output: out || (err ? '' : 'Program executed successfully'), error: err, provider: 'jdoodle-rapid' };
}
