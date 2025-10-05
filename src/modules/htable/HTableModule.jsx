// HTableModule v9.8.5 — hotfix for stray backslash before .map
// HTableModule v9.8.3 (surgical build from v9.8.0) - SpecOp sync 9.8.0
// HTableModule — UG Math Tools v9.7.8 (replaces 9.7.6)
// SpecOp Sync: JSX-comment anchors hotfix; build error prevention; QA preflight checks
// src/modules/htable/HTableModule.jsx
//Ulmer-Goodrich Productions
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'

// Shared UI
import DraggableBase from '../../components/DraggableChip.jsx'
import DropSlotBase from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'

// Data
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

// ---- Safe problem wrapper (SpecOp 9.7.x): reject equal scale numbers (e.g., 20 ↔ 20) ----
function _violatesEqualScalePair(p) {
  try {
    // Interpret common shapes: p.scaleTop/Bottom OR p.sTop/sBottom OR p.headerNum/headerDen
    const a = (p && (p.scaleTop ?? p.sTop ?? p.headerNum));
    const b = (p && (p.scaleBottom ?? p.sBottom ?? p.headerDen));
    return (typeof a === 'number' && typeof b === 'number' && a === b);
  } catch(_) {
    return false;
  }
}

function genSafeProblem(rawGenFn, maxTries = 25) {
  if (typeof rawGenFn !== 'function') return rawGenFn;
  let last = null;
  for (let i = 0; i < maxTries; i++) {
    const cand = rawGenFn();
    last = cand;
    if (!_violatesEqualScalePair(cand)) return cand;
  }
  // Fallback: if generator kept producing equal pairs, nudge bottom by +1
  if (last && (last.scaleBottom ?? last.sBottom ?? last.headerDen) !== undefined) {
    if (last.scaleBottom !== undefined) last.scaleBottom += 1;
    else if (last.sBottom !== undefined) last.sBottom += 1;
    else if (last.headerDen !== undefined) last.headerDen += 1;
  }
  return last;
}
// ---- End wrapper ----


// ────────────────────────────────────────────────────────────────────────────────
// TAP-ONLY WRAPPERS
// ────────────────────────────────────────────────────────────────────────────────
// TAP-ONLY WRAPPERS — SLOT/DRAG
const Draggable = ({ payload, data, label, onClick, tapAction, ...rest }) => {
  const merged = data ?? payload ?? undefined;
  const handleClick = (e) => {
    if (typeof tapAction === 'function') { tapAction(e, merged); return; }
    onClick?.(e);
  };
  return (
    <DraggableBase
      data={merged}
      label={label ?? merged?.label}
      draggable={false}
      onDragStart={(e)=>{ e.preventDefault(); return false; }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      {...rest}
    />
  );
};

// blinkWrap default prevents No-Undef
const Slot = ({ accept, children, className='', blinkWrap=false, onClick, validator, test, ...rest }) => {
  const handleClick = (e) => { onClick?.(e); };
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });
  return (
    <div
      className={`slot-wrap ${blinkWrap ? 'ptable-blink-wrap' : ''} ${className}`}
      onClick={handleClick}
      onDragOver={(e)=>e.preventDefault()}
    >
      <DropSlotBase test={testFn} onDropContent={()=>{}} {...rest}>
        {children}
      </DropSlotBase>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// Spec scaffolding & helpers
// ────────────────────────────────────────────────────────────────────────────────
// STEP TITLES
const STEP_TITLES = [
  "What's the first step to solve the problem?",
  "What always goes in the first column?",
  "What always goes in the second column?",
  "What are the two units in the problem? (tap two)",
  "What value goes here?",
  "What value goes here?",
  "What’s the other value from the problem?",
  "Where should this value go? (tap a cell)",
"What do we do next?",
  "Pick the two numbers we multiply",
  "What do we do next?",
  "Calculate",
];

const STEP1_CHOICES = [
  { id:'drawH',   label:'Draw an H Table', correct:true },
  { id:'proportion', label:'Make a Proportion' },
  { id:'convert',    label:'Convert Units First' },
  { id:'guess',      label:'Just Guess' },
];

const UNIT_CATS = {
  length: ['mm','millimeter','millimeters','cm','centimeter','centimeters','m','meter','meters','km','kilometer','kilometers','in','inch','inches','ft','foot','feet','yd','yard','yards','mi','mile','miles'],
  time: ['sec','secs','second','seconds','min','mins','minute','minutes','hour','hours','day','days','week','weeks','year','years'],
  volume: ['tsp','tsps','teaspoon','teaspoons','tbsp','tbsps','tablespoon','tablespoons','cup','cups','quart','quarts','qt','qts','gallon','gallons','liter','liters','l','milliliter','milliliters','ml'],
  mass: ['gram','grams','g','kilogram','kilograms','kg','pound','pounds','lb','lbs'],
  count: ['item','items','page','pages','point','points'],
  money: ['dollar','dollars','$','euro','euros']
};
const unitCategory = (u='') => {
  const s = (u||'').toLowerCase();
  for (const [cat, list] of Object.entries(UNIT_CATS)) { if (list.includes(s)) return cat; }
  return null;
};

const saneProblem = (p) => {
  try{
    const [u1,u2] = p.units || [];
    const c1 = unitCategory(u1), c2 = unitCategory(u2);
    return !!(c1 && c2 && c1===c2);
  }catch{ return false }
};

const genSaneHProblem = () => {
  let tries = 0;
  let p = genHProblem();
  while(!saneProblem(p) && tries<50){ p = genHProblem(); tries++; }
  return p;
};

const shuffle = (arr)=> arr.slice().sort(()=>Math.random()-0.5);

// ────────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────────
// STEP LOGIC (0–11)
export default function HTableModule(){
  const H_SNAP_VERSION = 22;

  const persisted = loadSession() || {};
  const snap = (persisted.hSnap && persisted.hSnap.version===H_SNAP_VERSION) ? persisted.hSnap : null;

  const [session, setSession] = useState(persisted || { attempts: [] });
  const [problem, setProblem] = useState(() => (snap?.problem) || genSaneHProblem());
  const [table, setTable] = useState(() => (snap?.table) || {
    head1:'', head2:'',
    uTop:'', uBottom:'',
    sTop:null, sBottom:null,
    vTop:null, vBottom:null,
    product:null, divisor:null, result:null, solvedRow:null
  });

  const [step, setStep] = useState(snap?.step ?? 0);
  const [steps, setSteps] = useState(
    snap?.steps || STEP_TITLES.map(()=>({misses:0,done:false}))
  );

  const [openSum, setOpenSum] = useState(false);
  const [mathStrip, setMathStrip] = useState({ a:null, b:null, divisor:null, result:null, showResult:false });
  const [confettiOn, setConfettiOn] = useState(false);

  // 2s blink
  const [blinkKey, setBlinkKey] = useState(null);
  const [blinkUnits, setBlinkUnits] = useState(false);

  // Persist
  useEffect(()=>{
    const nextState = { ...(session||{}), hSnap:{ version:H_SNAP_VERSION, problem, table, step, steps } };
    saveSession(nextState); setSession(nextState);
  },[problem, table, step, steps]);

  // Helpers
  const miss = (idx)=>setSteps(s=>{ const c=[...s]; if(c[idx]) c[idx].misses++; return c; });
  const setDone = (idx)=>setSteps(s=>{ const c=[...s]; if(c[idx]) c[idx].done=true; return c; });
  const next = ()=>setStep(s=>Math.min(s+1, STEP_TITLES.length-1));

  const canonicalTopUnit    = (problem?.units?.[0] || '').toLowerCase();
  const canonicalBottomUnit = (problem?.units?.[1] || '').toLowerCase();
  const givenUnitLabel = (problem?.given?.row === 'top' ? problem?.units?.[0] : problem?.units?.[1]) || '';
  const toLower = (s)=> (s||'').toLowerCase();

  const allProblemNumbers = useMemo(()=>{
    const all = new Set();
    if (problem?.scale?.[0] != null) all.add(Number(problem.scale[0]));
    if (problem?.scale?.[1] != null) all.add(Number(problem.scale[1]));
    if (problem?.given?.value != null) all.add(Number(problem.given.value));
    return Array.from(all);
  },[problem?.id]);

  const expectedScaleForRowUnit = (rowUnitLabel) => {
    const u = toLower(rowUnitLabel);
    if (!u) return null;
    if (u === canonicalTopUnit)    return problem?.scale?.[0] ?? null;
    if (u === canonicalBottomUnit) return problem?.scale?.[1] ?? null;
    return null;
  };
  const rowIsGivenUnit = (rowUnitLabel) => toLower(rowUnitLabel) === toLower(givenUnitLabel);
  const isCanonicalUnit = (uLabel) => {
    const s = (uLabel||'').toLowerCase();
    return s===canonicalTopUnit || s===canonicalBottomUnit;
  };

  // Step 0
  const handleStep0 = (choice) => {
    if (!choice?.correct) { miss(0); return; }
    setDone(0); next();
  };

  // Step 1: first column must be Units
  const tapHeader1 = (d) => {
    if (step !== 1) return;
    if (d?.v !== 'Units'){ miss(1); return; }
    setTable(t => ({ ...t, head1: 'Units' }));
    setDone(1); next();
  };

  // Step 2: second column must be Scale Numbers
  const tapHeader2 = (d) => {
    if (step !== 2) return;
    if (d?.v !== 'ScaleNumbers'){ miss(2); return; }
    setTable(t => ({ ...t, head2: 'Scale Numbers' }));
    setDone(2); next();
  };

  // Choice pools
  const unitChoices = useMemo(()=>{
    const correct = Array.from(new Set(problem.units || [])).slice(0,2);
    const cat = unitCategory(correct[0] || '');
    const allUnitsFlat = Object.entries(UNIT_CATS).flatMap(([k,v]) => v.map(u=>({u,cat:k})));
    const pool = allUnitsFlat.filter(x => x.cat !== cat && !correct.includes(x.u));
    const picks = [];
    while(picks.length<2 && pool.length){
      const candidate = pool[Math.floor(Math.random()*pool.length)];
      if (!picks.find(p=>p.u===candidate.u)) picks.push(candidate);
    }
    const full = [...correct, ...picks.map(p=>p.u)].slice(0,4);
    return shuffle(full.map((u,i)=>({ id:'u'+i, label:u, kind:'unit' })));
  },[problem]);

  // Include all problem numbers in choices (as requested), plus a few distractors
  const numbersTopScale = useMemo(()=>{
    const v = Number(problem?.scale?.[0]);
    const set = new Set([v, ...allProblemNumbers]);
    let i=0; while(set.size<4 && i<40){ set.add(Math.max(1, v + Math.round((Math.random()*6)-3))); i++; }
    return shuffle([...set]).slice(0,4).map((n,i)=>({ id:'nt_'+i, label:String(n), kind:'num', value:Number(n) }));
  },[problem?.id, allProblemNumbers]);

  const numbersBottomScale = useMemo(()=>{
    const v = Number(problem?.scale?.[1]);
    const set = new Set([v, ...allProblemNumbers]);
    let i=0; while(set.size<4 && i<40){ set.add(Math.max(1, v + Math.round((Math.random()*6)-3))); i++; }
    return shuffle([...set]).slice(0,4).map((n,i)=>({ id:'nb_'+i, label:String(n), kind:'num', value:Number(n) }));
  },[problem?.id, allProblemNumbers]);

  const [pickedUnits, setPickedUnits] = useState([]);
  const tapUnit = (d)=>{
    const label = d?.label ?? d?.u ?? '';
    if (!isCanonicalUnit(label)) { miss(3); return; }
    setPickedUnits(prev=>{
      const exists = prev.find(x=> (x?.label||x?.u||'').toLowerCase() === (label||'').toLowerCase());
      if (exists) return prev;
      const nextSel = [...prev, d];

      // Immediate feedback on each correct selection (brief blink)
      setBlinkUnits(true);
      setTimeout(()=>setBlinkUnits(false), 800);

      if (nextSel.length===2){
        const topObj = nextSel.find(x=> (x.label||x.u||'').toLowerCase() === canonicalTopUnit);
        const botObj = nextSel.find(x=> (x.label||x.u||'').toLowerCase() === canonicalBottomUnit);
        setTable(t=>({ ...t, uTop:(topObj?.label||topObj?.u||''), uBottom:(botObj?.label||botObj?.u||'') }));

        // Full 2s blink once both are chosen
        setBlinkUnits(true);
        setTimeout(()=>{ setBlinkUnits(false); setDone(3); next(); }, 2000);
      }
      return nextSel;
    });
  };

  const tapScaleTop = (d)=>{
    setTable(t=>{
      const expected = expectedScaleForRowUnit(t.uTop);
      if (expected == null || Number(d?.value) !== Number(expected)) { miss(4); return t; }
      const t2 = { ...t, sTop: Number(d.value) };
      if (t2.sBottom!=null){ setDone(4); setDone(5); next(); } else { setDone(4); next(); }
      return t2;
    });
  };
  const tapScaleBottom = (d)=>{
    setTable(t=>{
      const expected = expectedScaleForRowUnit(t.uBottom);
      if (expected == null || Number(d?.value) !== Number(expected)) { miss(5); return t; }
      const t2 = { ...t, sBottom: Number(d.value) };
      if (t2.sTop!=null){ setDone(4); setDone(5); next(); } else { setDone(5); next(); }
      return t2;
    });
  };

  // Step 6/7 flow: other value from problem (choices include all problem numbers but only the correct is accepted)
  const [pickedOther, setPickedOther] = useState(null);
  const otherValueChoices = useMemo(()=>{
    const set = new Set(allProblemNumbers);
    // add a couple distractors near the range
    const base = Number(problem?.given?.value) || 3;
    let tries = 0;
    while (set.size < Math.max(3, allProblemNumbers.length + 2) && tries < 50){
      set.add(Math.max(1, Math.round(base + (Math.random()*6 - 3))));
      tries++;
    }
    const arr = Array.from(set).map((v,i)=>({ id:'ov'+i, value:v, label:String(v), correct: v===Number(problem?.given?.value) }));
    return shuffle(arr);
  },[problem?.id, allProblemNumbers]);

  const chooseOtherValue = (choice) => {
    if (step!==6) return;
    if (!choice?.correct){ miss(6); return; }
    setPickedOther(choice);
    setDone(6);
    next();
  };

  const tapPlaceValueTop = () => {
    if (step!==7) return;
    const ok = pickedOther && rowIsGivenUnit(table.uTop);
    if (!ok){ miss(7); return; }
    setTable(t => ({ ...t, vTop: Number(pickedOther.value) }));
    // No pre/post blink here per request; go straight ahead
    setDone(7); next();
  };
  const tapPlaceValueBottom = () => {
    if (step!==7) return;
    const ok = pickedOther && rowIsGivenUnit(table.uBottom);
    if (!ok){ miss(7); return; }
    setTable(t => ({ ...t, vBottom: Number(pickedOther.value) }));
    // No pre/post blink here per request; go straight ahead
    setDone(7); next();
  };

  // Geometry for overlays
  const gridRef = useRef(null);
  const refs = {
    uTop: useRef(null), sTop: useRef(null), vTop: useRef(null),
    uBottom: useRef(null), sBottom: useRef(null), vBottom: useRef(null)
  };
  const [lines, setLines] = useState({ v1Left:0, v2Left:0, vTop:0, vHeight:0, hTop:0, gridW:0 });
  const [oval, setOval] = useState(null);
  const [tripleUL, setTripleUL] = useState(null);
  const measure = ()=>{
    const g = gridRef.current;
    if(!g) return;
    const gr = g.getBoundingClientRect();
    const r_uTop    = refs.uTop.current?.getBoundingClientRect();
    const r_sTop    = refs.sTop.current?.getBoundingClientRect();
    const r_vTop    = refs.vTop.current?.getBoundingClientRect();
    const r_uBottom = refs.uBottom.current?.getBoundingClientRect();
    const r_sBottom = refs.sBottom.current?.getBoundingClientRect();
    const r_vBottom = refs.vBottom.current?.getBoundingClientRect();
    if(!(r_sTop && r_vTop && r_uTop && r_uBottom && r_sBottom && r_vBottom)) {
      setLines(l=>({ ...l, gridW: gr.width }));
      return;
    }
    const v1 = (r_uTop.right + r_sTop.left)/2 - gr.left;
    const v2 = (r_sTop.right + r_vTop.left)/2 - gr.left;
    const vTop = r_vTop.top - gr.top;
    const vBottom = r_vBottom.bottom - gr.top;
    const vHeight = (vBottom - vTop);
    const hTop = (r_vTop.bottom + r_vBottom.top)/2 - gr.top;
    setLines({ v1Left: v1, v2Left: v2, vTop: r_vTop.top - gr.top, vHeight, hTop, gridW: gr.width });
    if (tripleUL && tripleUL.key){
      const target = refs[tripleUL.key]?.current?.getBoundingClientRect();
      if(target){
        setTripleUL({ key: tripleUL.key, left: target.left - gr.left + 8, top: target.bottom - gr.top - 18, width: Math.max(24, target.width - 16) });
      }
    }
  };
  useLayoutEffect(()=>{ measure() },[step, table.uTop, table.uBottom, table.sTop, table.sBottom, table.vTop, table.vBottom]);
  useEffect(()=>{ const onResize = ()=>measure(); window.addEventListener('resize', onResize); 

// STEP 8 data: conceptual next step (Cross multiply is correct)
const next8Choices = [
  { id: 'cm', label: 'Cross Multiply', correct: true },
  { id: 'add', label: 'Add all the numbers', correct: false },
  { id: 'avg', label: 'Find the average', correct: false },
  { id: 'sub', label: 'Subtract the smaller from the larger', correct: false },
];
const chooseNext8 = (choice)=>{
  if (choice?.correct) {
    setDone?.(8, true);
    typeof next === 'function' && next();
  } else {
    incMiss?.(8);
  }
};

  

return ()=>window.removeEventListener('resize', onResize); },[]);

  const [highlightKeys, setHighlightKeys] = useState([]);
  useLayoutEffect(()=>{
    if(!highlightKeys.length){ setOval(null); return }
    const g = gridRef.current; if(!g) return;
    const gr = g.getBoundingClientRect();
    const centers = highlightKeys.map(k=>{
      const r = refs[k].current?.getBoundingClientRect();
      if(!r) return null;
      return { x: (r.left + r.right)/2 - gr.left, y: (r.top + r.bottom)/2 - gr.top };
    }).filter(Boolean);
    if(centers.length!==2){ setOval(null); return }
    const [a,b] = centers;
    const midX = (a.x + b.x)/2;
    const midY = (a.y + b.y)/2;
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx*dx + dy*dy) + 140;
    const rot = Math.atan2(dy, dx) * 180/Math.PI;
    setOval({ left: midX, top: midY, len, rot });
  },[highlightKeys]);

  const givenRow = (table.vBottom!=null) ? 'bottom' : (table.vTop!=null ? 'top' : null);

  // Options for step 9 tile selection (explicit tiles like "17 × 6")
  const crossPair = useMemo(()=>{
    if(!givenRow || table.sTop==null || table.sBottom==null) return null;
    const v = (givenRow==='top') ? table.vTop : table.vBottom;
    const sOpp = (givenRow==='top') ? table.sBottom : table.sTop;
    if (v==null || sOpp==null) return null;
    return { a:v, b:sOpp, label:`${v} × ${sOpp}`, keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sBottom':'sTop'] };
  },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom]);

  const wrongPairs = useMemo(()=>{
    const list = [];
    const v = (givenRow==='top') ? table.vTop : table.vBottom;
    const sSame = (givenRow==='top') ? table.sTop : table.sBottom;
    if (v!=null && sSame!=null) list.push({ a:v, b:sSame, label:`${v} × ${sSame}`, keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sTop':'sBottom'] });
    if (table.sTop!=null && table.sBottom!=null) list.push({ a:table.sTop, b:table.sBottom, label:`${table.sTop} × ${table.sBottom}`, keys:['sTop','sBottom'] });
    const vOpp = (givenRow==='top') ? table.vBottom : table.vTop;
    if (vOpp!=null && sSame!=null) list.push({ a:vOpp, b:sSame, label:`${vOpp} × ${sSame}`, keys: [(givenRow==='top')?'vBottom':'vTop', (givenRow==='top')?'sTop':'sBottom'] });
    // ensure a "random multiple combo"
    if (table.sTop!=null && v!=null) list.push({ a:v, b:1, label:`${v} × 1`, keys: [] });
    return shuffle(list).slice(0,4);
  },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom]);

  const chooseMultiply = (pair)=>{
    if(!pair || !crossPair){ miss(9); return; }
    const correct = (pair.a===crossPair.a && pair.b===crossPair.b);
    setHighlightKeys(pair.keys || []);
    if(!correct){ miss(9); return; }
    const product = pair.a * pair.b;
    setTable(t=>({ ...t, product }));
    setMathStrip(s=>({ ...s, a: pair.a, b: pair.b }));
    setDone(9); next();
  };

  const divideChoices = useMemo(()=>{
    if (table.sTop==null || table.sBottom==null) return [];
    const correctScale = (givenRow==='top') ? table.sTop : table.sBottom;   // same-row scale
    const wrongScale   = (givenRow==='top') ? table.sBottom : table.sTop;   // opposite-row scale
    return shuffle([
      { label: `Divide by ${correctScale}`, value: correctScale, correct: true },
      { label: `Divide by ${wrongScale}`, value: wrongScale, correct: false },
      { label: `Multiply by ${correctScale}`, value: null, correct: false },
      { label: `Multiply by ${wrongScale}`, value: null, correct: false },
    ]);
  },[givenRow, table.sTop, table.sBottom]);

  const chooseDivideByNumber = (choice)=>{
    if (!choice.correct) { miss(10); return; }
    const div = Number(choice.value);
    if (table.product==null || !Number.isFinite(div) || div===0) { miss(10); return; }
    const key = (div === table.sTop) ? 'sTop' : (div === table.sBottom ? 'sBottom' : null);
    const g = gridRef.current;
    if (g && key){
      const gr = g.getBoundingClientRect();
      const r = refs[key].current?.getBoundingClientRect();
      if (r){
        setTripleUL({ key, left: r.left - gr.left + 8, top: r.bottom - gr.top - 18, width: Math.max(24, r.width - 16) });
      }
    }
    const result = table.product / div;
    setTable(t=>({ ...t, divisor: div, result }));
    setMathStrip(s=>({ ...s, divisor: div, result }));
    setDone(10); next();
  };

  const onCalculate = ()=>{
    setTable(t=>{
      const r = t.result;
      if (r == null) return t;
      const unknownTop    = t.vTop == null  && t.vBottom != null;
      const unknownBottom = t.vBottom == null && t.vTop != null;
      if (unknownTop)    return { ...t, vTop: Number(r),   solvedRow:'top' };
      if (unknownBottom) return { ...t, vBottom: Number(r), solvedRow:'bottom' };
      return t;
    });
    setMathStrip(s=>({ ...s, showResult: true }));
    setDone(11);
    setOpenSum(true);
    setConfettiOn(true);
    setTimeout(()=>setConfettiOn(false), 3500);
  };

  const resetProblem = ()=>{
    setProblem(genSaneHProblem());
    setTable({
      head1:'', head2:'',
      uTop:'', uBottom:'',
      sTop:null, sBottom:null,
      vTop:null, vBottom:null,
      product:null, divisor:null, result:null, solvedRow:null
    });
    setStep(0);
    setSteps(STEP_TITLES.map(()=>({misses:0,done:false})));
    setHighlightKeys([]); setOval(null); setTripleUL(null);
    setMathStrip({ a:null, b:null, divisor:null, result:null, showResult:false });
    setConfettiOn(false); setOpenSum(false);
    setBlinkKey(null); setBlinkUnits(false);
    setPickedOther(null);
    setPickedUnits([]);
  };

  const ROW_H = 88;
  const lineColor = '#0f172a';
  const isBlink = (k)=> blinkKey === k;

  // Blink cue logic: align to spec classes/hooks
  const needWildBlink = (key)=> {
    if (step===4 && key==='sTop'    && table.sTop==null) return true;
    if (step===5 && key==='sBottom' && table.sBottom==null) return true;
    // DO NOT pre-blink target cells on step 7 (user should choose without hints)
    // if (step===7) { ... }  // removed per request
    if (step===9 && Array.isArray(highlightKeys) && highlightKeys.includes(key)) return true;
    return false;
  };
  const cellCls = (key)=> [
    (highlightKeys.includes(key) ? 'hl' : ''),
    (isBlink(key) ? 'ptable-blink' : ''),
    (needWildBlink(key) ? 'ptable-blink-hard blink-bg' : ''),
  ].filter(Boolean).join(' ');

  // ──────────────────────────────────────────────────────────────────────────────
  // UI + RIGHT PANEL
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{position:'relative'}}>
      <style>{`
        .problem-banner { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 10px; }
        .problem-title { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
        .problem-body { font-size: inherit; color: inherit; }

        /* removed inline @keyframes ptable-blink-kf (SpecOp contract only) */
          10%, 30%, 50%, 70%, 90%    { box-shadow: 0 0 0 4px rgba(59,130,246,.35); }
        }
        .ptable-blink { animation: ptable-blink-kf 2s ease-out 0s 1; }

        .hl { border: none !important; background: radial-gradient(circle at 50% 50%, rgba(59,130,246,.18), rgba(59,130,246,0) 60%); outline: none !important; }

        .hcell .empty, .hcell .slot, .hcell .slot.empty, .hhead .empty {
          min-height: ${ROW_H}px !important;
          height: ${ROW_H}px !important;
        }

        .right-footer { position: sticky; bottom: 0; background: #fff; padding: 8px 0 0; display: flex; gap: 8px; justify-content: center; }
        .button.secondary { background: #e2e8f0; color: #0f172a; }
        /* === v9.7.2 panel swap (module-local, no global changes) === */
        .panes { display: flex; gap: 12px; align-items: flex-start; }
        .card { flex: 1 1 0; min-width: 0; }
        .card.right-steps { order: 1; } /* prompts appear visually on the LEFT */
        .card.hgrid-card  { order: 2; } /* H-table appears visually on the RIGHT */

        @media (max-width: 720px) {
          .panes { flex-direction: column; }
          .card.right-steps, .card.hgrid-card { order: initial; }
        }
        /* === v9.7.3 visual tweaks === */
        .panes { gap: 24px; } /* more space between cards */
        .card.right-steps { font-size: 1.06rem; } /* match P-Table right card feel */
        .card.right-steps .chip,
        .card.right-steps .button { font-size: 1.06rem; }
        .right-footer { margin-top: 12px; }

        /* Lock blink look to the first-step style; remove stray center stripes */
        .ptable-blink-hard.blink-bg { background: transparent !important; }
        .ptable-blink-hard.blink-bg::before,
        .ptable-blink-hard.blink-bg::after { display: none !important; }
    `}</style>

      <div className="panes">
        {/* H-GRID RENDER */}
{/* LEFT CARD: Problem + H-table */}
        <div className="card hgrid-card">
          <div className="section">

            {/* Problem (natural text only) */}
            <div className="problem-banner">
              <div className="problem-title">Problem</div>
              <div className="problem-body" style={{whiteSpace:'pre-wrap'}}>
                {problem?.text?.english ?? ''}
              </div>
            </div>

            {/* H-table visible AFTER step 0 */}
            {step>=1 && (
              <div className="hwrap" style={{position:'relative', marginTop:12}}>
                <div ref={gridRef} className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, position:'relative'}}>
                  {/* Headers */}
                  <div className="hhead" style={{height:ROW_H}}>
                    <Slot accept={["header"]} blinkWrap={step===1 && !table.head1} className={`${!table.head1 ? "empty" : ""}`}>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', height:ROW_H}}>
                        <span className="hhead-text">{table.head1 || ''}</span>
                      </div>
                    </Slot>
                  </div>
                  <div className="hhead" style={{height:ROW_H}}>
                    <Slot accept={["header"]} blinkWrap={step===2 && !table.head2} className={`${!table.head2 ? "empty" : ""}`}>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', height:ROW_H}}>
                        <span className="hhead-text">{table.head2 || ''}</span>
                      </div>
                    </Slot>
                  </div>
                  <div className="hhead" style={{height:ROW_H}}>{/* blank */}</div>

                  {/* Row 1 */}
                  <div ref={refs.uTop} className="hcell" style={{height:ROW_H}}>
                    <Slot blinkWrap={blinkUnits} className={`${!table.uTop ? "empty" : ""}`}>
                      <span className={cellCls('uTop')} style={{fontSize:18}}>{table.uTop || ''}</span>
                    </Slot>
                  </div>
                  <div ref={refs.sTop} className="hcell" style={{height:ROW_H}}>
                    <Slot blinkWrap={needWildBlink('sTop') || highlightKeys.includes('sTop')} className={`${table.sTop==null ? "empty" : ""}`}>
                      <span className={cellCls('sTop')} style={{fontSize:22}}>{table.sTop ?? ''}</span>
                    </Slot>
                  </div>
                  <div ref={refs.vTop} className="hcell" style={{height:ROW_H}}>
                    <Slot blinkWrap={highlightKeys.includes('vTop')} className={`${table.vTop==null ? "empty" : ""}`} onClick={tapPlaceValueTop}>
                      <span className={cellCls('vTop')}>{table.vTop ?? ''}</span>
                    </Slot>
                  </div>

                  <div style={{gridColumn:'1 / span 3', height:0, margin:'6px 0'}} />

                  {/* Row 2 */}
                  <div ref={refs.uBottom} className="hcell" style={{height:ROW_H}}>
                    <Slot blinkWrap={blinkUnits} className={`${!table.uBottom ? "empty" : ""}`}>
                      <span className={cellCls('uBottom')} style={{fontSize:18}}>{table.uBottom || ''}</span>
                    </Slot>
                  </div>
                  <div ref={refs.sBottom} className="hcell" style={{height:ROW_H}}>
                    <Slot blinkWrap={needWildBlink('sBottom') || highlightKeys.includes('sBottom')} className={`${table.sBottom==null ? "empty" : ""}`}>
                      <span className={cellCls('sBottom')} style={{fontSize:22}}>{table.sBottom ?? ''}</span>
                    </Slot>
                  </div>
                  <div ref={refs.vBottom} className="hcell" style={{height:ROW_H}}>
                    <Slot blinkWrap={highlightKeys.includes('vBottom')} className={`${table.vBottom==null ? "empty" : ""}`} onClick={tapPlaceValueBottom}>
                      <span className={cellCls('vBottom')}>{table.vBottom ?? ''}</span>
                    </Slot>
                  </div>

                  {/* H lines */}
                  <div style={{position:'absolute', pointerEvents:'none', left:0, top:(lines.hTop||0), width:(lines.gridW||0), borderTop:`5px solid ${lineColor}`}} />
                  <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v1Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />
                  <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v2Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />

                  {/* Red oval (Step 9) */}
                  {oval && (
                    <div
                      style={{
                        position:'absolute',
                        left: oval.left, top: oval.top, width: oval.len, height: 62,
                        transform: `translate(-50%, -50%) rotate(${oval.rot}deg)`,
                        border: '5px solid #ef4444', borderRadius: 9999,
                        pointerEvents:'none', boxShadow:'0 0 10px rgba(239,68,68,0.6)'
                      }}
                    />
                  )}
                  {/* Red triple underline (Step 10) */}
                  {tripleUL && (
                    <div style={{position:'absolute', left: tripleUL.left, top: tripleUL.top, width: tripleUL.width, height:18, pointerEvents:'none'}}>
                      <div style={{borderTop:'3px solid #ef4444', marginTop:0}} />
                      <div style={{borderTop:'3px solid #ef4444', marginTop:4}} />
                      <div style={{borderTop:'3px solid #ef4444', marginTop:4}} />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT SIDE – prompts only */}
        <div className="card right-steps">
          <div className="section">
            <div className="step-title">{STEP_TITLES[step]}</div>

            {/* RIGHT-PANEL: STEP 0 — START */}
            {step===0 && (
              <div className="chips with-borders center">
                {shuffle(_assertFour(STEP1_CHOICES,"Step0")).map(c => (
                  <button key={c.id} className="chip" onClick={()=>handleStep0(c)}>{c.label}</button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 0 — END */}

            {/* RIGHT-PANEL: STEP 1 — START */}
            {step===1 && (
              <div className="chips with-borders center" style={{marginTop:8}}>
                {[
                  { id:'col_units', label:'Units', kind:'col', v:'Units' },
                  { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
                  { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
                  { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
                ].map((h, idx) => (
                  <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} tapAction={(e,d)=>tapHeader1(d)} />
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 1 — END */}

            {/* RIGHT-PANEL: STEP 2 — START */}
            {step===2 && (
              <div className="chips with-borders center" style={{marginTop:8}}>
                {[
                  { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
                  { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
                  { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
                ].map((h, idx) => (
                  <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} tapAction={(e,d)=>tapHeader2(d)} />
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 2 — END */}

            {/* RIGHT-PANEL: STEP 3 — START */}
            {step===3 && (
              <div className="chips center mt-8">
                {unitChoices.map(c => (
                  <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapUnit(d)} />
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 3 — END */}

            {/* RIGHT-PANEL: STEP 4 — START */}
            {step===4 && (
              <div className="chips center mt-8">
                {numbersTopScale.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleTop(d)} />)}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 4 — END */}

            {/* RIGHT-PANEL: STEP 5 — START */}
            {step===5 && (
              <div className="chips center mt-8">
                {numbersBottomScale.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleBottom(d)} />)}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 5 — END */}

            {/* RIGHT-PANEL: STEP 6 — START */}
            {step===6 && (
              <div className="chips with-borders center mt-8">
                {shuffle(_assertFour(otherValueChoices,"Step0")).map(c => (
                  <button key={c.id} className="chip" onClick={() => { chooseOtherValue(c); }}>{c.label}</button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 6 — END */}

            {/* RIGHT-PANEL: STEP 7 — START (user taps a cell on left; no pre-blink) */}
            {step===7 && (<div className="problem-body">Tap the correct cell in the table.</div>)}
            {/* RIGHT-PANEL: STEP 7 — END */}

            {/* RIGHT-PANEL: STEP 8 — START */}
            {step===8 && (
              <div className="problem-body">What do we do next?</div>
            )}
            {/* RIGHT-PANEL: STEP 8 — END */}

            {/* RIGHT-PANEL: STEP 9 — START */}
            {step===9 && (
              <div className="chips with-borders center mt-8">
                {[crossPair, ...wrongPairs].filter(Boolean).slice(0,4).map((pair,idx)=>(
                  <button key={idx} className="chip" onClick={()=>chooseMultiply(pair)}>{pair.label}</button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 9 — END */}

            {/* RIGHT-PANEL: STEP 10 — START */}
            {step===10 && (
              <div className="chips with-borders center mt-8">
                {divideChoices.map((c,idx)=>(
                  <button key={idx} className="chip" onClick={()=>chooseDivideByNumber(c)}>{c.label}</button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 10 — END */}

            {/* RIGHT-PANEL: STEP 11 — START */}
            {step>=11 && (
              <div className="center" style={{marginTop:12}}>
                <button className="button" onClick={onCalculate}>Calculate</button>
              </div>
            )}
            {/* RIGHT-PANEL: STEP 11 — END */}

            {/* Sticky footer controls */}
            <div className="right-footer">
              <button className="button secondary" onClick={resetProblem}>New Problem</button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary overlay + confetti (single burst per summary) */}
      {openSum && (
        <SummaryOverlay
          open={openSum}
          onClose={()=>setOpenSum(false)}
          problem={problem}
          table={table}
          mathStrip={mathStrip}
          confettiOn={confettiOn}
          onNewProblem={resetProblem}
        />
      )}
    </div>
  );
}
