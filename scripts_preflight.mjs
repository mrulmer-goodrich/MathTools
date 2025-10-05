/**
 * UG Math Tools — Preflight (No-Dep) v1.0
 * Purpose: Catch the class of errors that slipped past manual 63‑point QA:
 * - Duplicate function/const names (e.g., duplicated onCalculate)
 * - Unbalanced (), {}, [] (common after merge conflicts)
 * - Lone bracket/brace lines inside JSX that render literally
 * - Multi-choice steps must render exactly 4 options (heuristic checks)
 * - Basic banned patterns (console logs, todo notes in release)
 *
 * Usage in CI: `node scripts_preflight.mjs`
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGETS = [
  'HTableModule v10.0.3.jsx',
  'HTableModule v10.0.2.jsx',
  'HTableModule v10.0.1..jsx',
  'generator.js',
  'generator_v10.0.2.js'
].filter(f => fs.existsSync(path.join(ROOT, f)));

const errors = [];
const warn = [];

function read(f){ return fs.readFileSync(f, 'utf8'); }

function balanceCheck(source, fname){
  const stack = [];
  const pairs = {')':'(', '}':'{', ']':'['};
  const openers = new Set(['(', '{', '[']);
  for (let i=0;i<source.length;i++){
    const ch = source[i];
    if (openers.has(ch)) stack.push({ch,pos:i});
    else if (pairs[ch]){
      const top = stack.pop();
      if (!top || top.ch !== pairs[ch]){
        errors.push(`${fname}: Unbalanced delimiter at index ${i} (${ch})`);
        return;
      }
    }
  }
  if (stack.length){
    const top = stack[stack.length-1];
    errors.push(`${fname}: Missing closing for ${top.ch} starting at index ${top.pos}`);
  }
}

function loneBracketLines(source, fname){
  const lines = source.split(/\r?\n/);
  for (let i=0;i<lines.length;i++){
    const L = lines[i].trim();
    if (L === ']' || L === '}'){
      // Allow brackets that close a block, but warn if visually alone
      warn.push(`${fname}:${i+1} lone bracket/brace line — may render literally in JSX`);
    }
  }
}

function duplicateNameCheck(source, fname){
  const nameCounts = {};
  const re = /\b(const|let|function)\s+([A-Za-z_$][\w$]*)\b/g;
  let m;
  while((m = re.exec(source))){
    const name = m[2];
    nameCounts[name] = (nameCounts[name]||0)+1;
  }
  for (const [k, v] of Object.entries(nameCounts)){
    if (v > 1){
      // Skip benign duplicates from different scopes if needed later.
      if (k === 'onCalculate' || k === 'otherValueChoices'){
        errors.push(`${fname}: Duplicate declaration of ${k}`);
      }
    }
  }
}

function fourChoiceHeuristic(source, fname){
  // Look for useMemo otherValueChoices and ensure final array has length 4
  // We can't evaluate, but we can check for a slice(0,4) or a fixed length path
  if (/\botherValueChoices\b/.test(source)){
    const hasSlice = /\.slice\s*\(\s*0\s*,\s*4\s*\)/.test(source);
    const hasGuard = /_assertFour\s*\(/.test(source);
    if (!hasSlice && !hasGuard){
      warn.push(`${fname}: otherValueChoices lacks explicit 4-choice enforcement (slice(0,4) or _assertFour())`);
    }
  }
}

function bannedPatterns(source, fname){
  if (/console\.log\(/.test(source)){
    warn.push(`${fname}: console.log present (remove for release)`);
  }
  if (/TODO|FIXME/.test(source)){
    warn.push(`${fname}: TODO/FIXME markers present`);
  }
}

for (const rel of TARGETS){
  const f = path.join(ROOT, rel);
  const src = read(f);
  balanceCheck(src, rel);
  loneBracketLines(src, rel);
  duplicateNameCheck(src, rel);
  fourChoiceHeuristic(src, rel);
  bannedPatterns(src, rel);
}

if (errors.length){
  console.error('❌ Preflight errors:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

if (warn.length){
  console.warn('⚠️  Preflight warnings:');
  for (const w of warn) console.warn(' -', w);
}

console.log('✅ Preflight passed (no blocking errors).');
