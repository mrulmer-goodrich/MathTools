// UG Math Tools — Preflight (Recursive) v1.7
// - Removes any use of '/* ... */' in comments to avoid accidental closures
// - Regex literals use single backslashes (no invalid escapes)
// - Template/quote/comment-aware delimiter scan (CSS-in-JSX safe)
// - Recursively scans .js/.jsx/.ts/.tsx (excludes node_modules, .git, dist, build, coverage, .vercel)
// - CI-blocking: exits with code 1 on errors
// - Zero dependencies; Node >= 18 (tested on Node 20/22)

import fs from 'fs';
import path from 'path';

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.vercel', 'dist', 'build', 'coverage']);
const EXT = new Set(['.js', '.jsx', '.ts', '.tsx']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else {
      const ext = path.extname(entry.name);
      if (EXT.has(ext)) out.push(path.join(dir, entry.name));
    }
  }
}

const ROOT = process.cwd();
const files = [];
walk(ROOT, files);

if (!files.length) {
  console.log('No JS/TS files found to scan.');
  process.exit(0);
}

const errors = [];
const warn = [];

function read(f) { return fs.readFileSync(f, 'utf8'); }
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

function idxToLineCol(source, idx) {
  let line = 1, col = 1;
  for (let i = 0; i < idx && i < source.length; i++) {
    const ch = source[i];
    if (ch === '\n') { line++; col = 1; } else col++;
  }
  return { line, col };
}

function snippetAt(source, line, window = 2) {
  const lines = source.split(/\r?\n/);
  const start = Math.max(1, line - window);
  const end = Math.min(lines.length, line + window);
  const parts = [];
  for (let i = start; i <= end; i++) {
    const mark = i === line ? '>' : ' ';
    parts.push(`${mark} ${String(i).padStart(5, ' ')} | ${lines[i - 1]}`);
  }
  return parts.join('\n');
}

// Balance check that ignores content inside:
// - single quotes ('...'), double quotes ("..."), template literals (`...`) except inside ${ ... }
// - line comments (//) && block comments
function balanceCheck(source, fname) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  const openers = new Set(['(', '{', '[']);

  let inSingle = false, inDouble = false, inTemplate = false;
  let inLineComment = false, inBlockComment = false;
  let escape = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];
    const next = source[i + 1];

    // comment states
    if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
    if (inBlockComment) { if (prev === '*' && ch === '/') inBlockComment = false; continue; }

    // string/template states
    if (inSingle) { if (!escape && ch === "'") inSingle = false; escape = (!escape && ch === '\\'); continue; }
    if (inDouble) { if (!escape && ch === '"') inDouble = false; escape = (!escape && ch === '\\'); continue; }
    if (inTemplate) {
      if (ch === '`') { inTemplate = false; continue; }
      if (ch === '$' && next === '{') {
        stack.push(['TEMPLATE_EXPR', i]);
        i++; // let next loop see '{'
        continue;
      }
      continue; // ignore template body
    }

    // detect entries
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === "'") { inSingle = true; escape = false; continue; }
    if (ch === '"') { inDouble = true; escape = false; continue; }
    if (ch === '`') { inTemplate = true; continue; }

    // delimiter handling
    if (openers.has(ch)) { stack.push([ch, i]); continue; }
    if (pairs[ch]) {
      if (ch === '}' && stack.length && stack[stack.length - 1][0] === 'TEMPLATE_EXPR') { stack.pop(); continue; }
      const top = stack.pop();
      if (!top || top[0] !== pairs[ch]) {
        const lc = idxToLineCol(source, i);
        const snip = snippetAt(source, lc.line);
        errors.push(`${fname}: Unbalanced delimiter at ${lc.line}:${lc.col} (“${ch}”)\n${snip}`);
        return;
      }
    }
  }
  while (stack.length && stack[stack.length - 1][0] === 'TEMPLATE_EXPR') stack.pop();
  if (stack.length) {
    const [open, pos] = stack[stack.length - 1];
    const lc = idxToLineCol(source, pos);
    const snip = snippetAt(source, lc.line);
    errors.push(`${fname}: Missing closing for “${open}” opened at ${lc.line}:${lc.col}\n${snip}`);
  }
}

function duplicateNameCheck(source, fname) {
  const nameCounts = {};
  const re = /\b(const|let|function)\s+([A-Za-z_$][\w$]*)\b/g;
  let m;
  while ((m = re.exec(source))) {
    const name = m[2];
    nameCounts[name] = (nameCounts[name] || 0) + 1;
  }
  for (const [k, v] of Object.entries(nameCounts)) {
    if (v > 1) {
      if (k === 'onCalculate' || k === 'otherValueChoices') {
        errors.push(`${fname}: Duplicate declaration of ${k}`);
      }
    }
  }
}

function fourChoiceHeuristic(source, fname) {
  if (/\botherValueChoices\b/.test(source)) {
    const hasSlice = /\.slice\s*\(\s*0\s*,\s*4\s*\)/.test(source);
    const hasGuard = /_assertFour\s*\(/.test(source);
    if (!hasSlice && !hasGuard) {
      warn.push(`${fname}: otherValueChoices lacks explicit 4-choice enforcement (slice(0,4) or _assertFour())`);
    }
  }
}

function bannedPatterns(source, fname) {
  if (/console\.log\(/.test(source)) warn.push(`${fname}: console.log present (remove for release)`);
  if (/\b(?:TODO|FIXME)\b/.test(source)) warn.push(`${fname}: TODO/FIXME markers present`);
}

// Scan all files
for (const abs of files) {
  const src = read(abs);
  const fname = rel(abs);
  balanceCheck(src, fname);
  duplicateNameCheck(src, fname);
  fourChoiceHeuristic(src, fname);
  bannedPatterns(src, fname);
}

// vercel.json gate
const vercelPath = path.join(ROOT, 'vercel.json');
if (fs.existsSync(vercelPath)) {
  try {
    const raw = read(vercelPath).trim();
    const json = JSON.parse(raw);
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      errors.push('vercel.json: Must be a single JSON object.');
    } else {
      const bc = json.buildCommand || '';
      if (!/^node\s+scripts_preflight\.mjs\s*&&\s*/.test(bc)) {
        errors.push('vercel.json: buildCommand must start with "node scripts_preflight.mjs && " to gate Vercel builds.');
      }
    }
  } catch (e) {
    errors.push('vercel.json: Invalid JSON — ensure it contains a single object.');
  }
} else {
  warn.push('vercel.json not found — Vercel may build without preflight gating.');
}

if (errors.length) {
  console.error('❌ Preflight errors:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

if (warn.length) {
  console.warn('⚠️  Preflight warnings:');
  for (const w of warn) console.warn(' -', w);
}

console.log('✅ Preflight passed (no blocking errors). Files scanned:', files.length);
