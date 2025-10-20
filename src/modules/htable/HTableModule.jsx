///This is now controlling authority as v.11.0.1 with Stats Integration//
// HTableModule – UG Math Tools v11.0.1
// src/modules/htable/HTableModule.jsx
//Ulmer-Goodrich Productions

/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'

// Shared UI
import DraggableBase from '../../components/DraggableChip.jsx'
import DropSlotBase from '../../components/DropSlot.jsx'
import { ErrorOverlay } from '../../components/StatsSystem.jsx'
import ugConfetti from '../../lib/confetti.js'
// Data
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

// ---- Safe problem wrapper (SpecOp 9.7.x): reject equal scale numbers (e.g., 20 ↔ 20) ----
function _violatesEqualScalePair(p) {
  try {
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
  if (last && (last.scaleBottom ?? last.sBottom ?? last.headerDen) !== undefined) {
    if (last.scaleBottom !== undefined) last.scaleBottom += 1;
    else if (last.sBottom !== undefined) last.sBottom += 1;
    else if (last.headerDen !== undefined) last.headerDen += 1;
  }
  return last;
}
// ---- End wrapper ----

// ────────────────────────────────────────────────────────────────────────────
// TAP-ONLY WRAPPERS
// ────────────────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────────────────
// Spec scaffolding & helpers
// ────────────────────────────────────────────────────────────────────────────
const STEP_TITLES = [
  "What's the first step to solve the problem?",
  "What always goes in the first column?",
  "What always goes in the second column?",
  "What are the two units in the problem?",
  "What value goes here?",
  "What value goes here?",
  "What's the other value from the problem?",
  "Tap the cell where you should place the <value>",
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
  const uniqueTriple = (q)=>{
    try{
      const a = Number(q?.scale?.[0]);
      const b = Number(q?.scale?.[1]);
      const c = Number(q?.given?.value);
      if([a,b,c].some(n=>Number.isNaN(n))) return false;
      const set = new Set([a,b,c]);
      return set.size===3;
    }catch{ return false }
  };
  while(tries<50 && (!saneProblem(p) || !uniqueTriple(p))){ p = genHProblem(); tries++; }
  return p;
};

const shuffle = (arr)=> arr.slice().sort(()=>Math.random()-0.5);

const _assertFour = (arr, tag) => {
  try {
    if (!Array.isArray(arr) || arr.length !== 4) {
      console.warn('Choice count not 4 for', tag, Array.isArray(arr)?arr.length:arr);
    }
  } catch {}
  return arr;
};

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────
export default function HTableModule({ onProblemComplete, registerReset, updateStats }){
  const H_SNAP_VERSION = 22;

  const persisted = loadSession() || {};
  const snap = (persisted.hSnap && persisted.hSnap.version===H_SNAP_VERSION) ? persisted.hSnap : null;

  // Stats tracking state
  const [showError, setShowError] = useState(false);
  const [currentProblemErrors, setCurrentProblemErrors] = useState(0);

  // Error handler
  const handleError = () => {
    setShowError(true);
    setCurrentProblemErrors(prev => prev + 1);
    setTimeout(() => setShowError(false), 1000);
  };

  const STEP8_CHOICES = [
    { id: 'cm', label: 'Cross Multiply', correct: true },
    { id: 'add', label: 'Add the numbers', correct: false },
    { id: 'avg', label: 'Find the average', correct: false },
    { id: 'sub', label: 'Subtract the numbers', correct: false },
  ];

  const chooseNext8 = (choice) => {
    if (!choice || !choice.correct) { miss(8); handleError(); return; }
    setDone(8);
    next();
  };

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
  const [mathStrip, setMathStrip] = useState({ a:null, b:null, divisor:null, result:null, showResult:false });
  const [confettiOn, setConfettiOn] = useState(false);
  const confettiInterval = useRef(null);
  const [rotLang, setRotLang] = useState('English');
  const [rotationOrder, setRotationOrder] = useState([]);
  const rotationOrderFull = useMemo(()=> ['XXXX', ...rotationOrder], [rotationOrder])
  const [isHoldingEnglish, setIsHoldingEnglish] = useState(false);
  const [isOverEnglish, setIsOverEnglish] = useState(false);
  const [rotationId, setRotationId] = useState(null);
  const [npBlink, setNpBlink] = useState(false);
  const npBlinkRef = useRef(null);
  const postCalcAppliedRef = useRef(false);

  const [shuffleSeed, setShuffleSeed] = useState(()=>Math.random());
  useEffect(()=>{ setShuffleSeed(Math.random()); }, [step, problem?.id]);
  const seededShuffle = (arr) => {
    const a = Array.isArray(arr) ? arr.slice() : [];
    let seed = Math.floor((shuffleSeed || 1)*1e6) || 1;
    const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for(let i=a.length-1;i>0;i--){ const j = Math.floor(rng()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
    return a;
  };

  const [blinkKey, setBlinkKey] = useState(null);
  const [blinkUnits, setBlinkUnits] = useState(false);

  useEffect(()=>{
    const nextState = { ...(session||{}), hSnap:{ version:H_SNAP_VERSION, problem, table, step, steps } };
    saveSession(nextState); setSession(nextState);
  },[problem, table, step, steps]);

  useEffect(() => {
    try {
      const altsObj = (problem?.text?.alts) || {};
      const keys = Object.keys(altsObj).filter(k => typeof altsObj[k] === 'string' && altsObj[k].trim().length > 0);
      const pool = keys.filter(l => l !== 'English' && l !== 'XXXX');
      setRotationOrder(pool);
      setRotLang('English');
      setIsHoldingEnglish(false);
    } catch {}
  }, [problem?.id, JSON.stringify(problem?.text?.alts)]);

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

  const handleStep0 = (choice) => {
    if (!choice?.correct) { miss(0); handleError(); return; }
    setDone(0); next();
  };

  const tapHeader1 = (d) => {
    if (step !== 1) return;
    if (d?.v !== 'Units'){ miss(1); handleError(); return; }
    setTable(t => ({ ...t, head1: 'Units' }));
    setDone(1); next();
  };

  const tapHeader2 = (d) => {
    if (step !== 2) return;
    if (d?.v !== 'GivenRatio'){ miss(2); handleError(); return; }
    setTable(t => ({ ...t, head2: 'Given Ratio' }));
    setDone(2); next();
  };

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
    return seededShuffle(full.map((u,i)=>({ id:'u'+i, label:u, kind:'unit' })));
  },[problem]);

  const numbersTopScale = useMemo(()=>{
    const v = Number(problem?.scale?.[0]);
    const set = new Set([v, ...allProblemNumbers]);
    let i=0; while(set.size<4 && i<40){ set.add(Math.max(1, v + Math.round((Math.random()*6)-3))); i++; }
    return seededShuffle([...set]).slice(0,4).map((n,i)=>({ id:'nt_'+i, label:String(n), kind:'num', value:Number(n) }));
  },[problem?.id, allProblemNumbers]);

  const numbersBottomScale = useMemo(()=>{
    const v = Number(problem?.scale?.[1]);
    const set = new Set([v, ...allProblemNumbers]);
    let i=0; while(set.size<4 && i<40){ set.add(Math.max(1, v + Math.round((Math.random()*6)-3))); i++; }
    return seededShuffle([...set]).slice(0,4).map((n,i)=>({ id:'nb_'+i, label:String(n), kind:'num', value:Number(n) }));
  },[problem?.id, allProblemNumbers]);

  const [pickedUnits, setPickedUnits] = useState([]);
  const tapUnit = (d)=>{
    const label = d?.label ?? d?.u ?? '';
    if (!isCanonicalUnit(label)) { miss(3); handleError(); return; }
    setPickedUnits(prev=>{
      const exists = prev.find(x=> (x?.label||x?.u||'').toLowerCase() === (label||'').toLowerCase());
      if (exists) return prev;
      const nextSel = [...prev, d];

      const isTopUnit = toLower(label) === canonicalTopUnit;
      const isBotUnit = toLower(label) === canonicalBottomUnit;

      if (nextSel.length === 1) {
        if (isTopUnit) {
          setTable(t => ({ ...t, uTop: label }));
        } else if (isBotUnit) {
          setTable(t => ({ ...t, uBottom: label }));
        }
        setBlinkUnits(true);
        setTimeout(() => setBlinkUnits(false), 2000);
      } else if (nextSel.length === 2) {
        if (isTopUnit) {
          setTable(t => ({ ...t, uTop: label }));
        } else if (isBotUnit) {
          setTable(t => ({ ...t, uBottom: label }));
        }
        setBlinkUnits(true);
        setTimeout(() => { 
          setBlinkUnits(false); 
          setDone(3); 
          next(); 
        }, 2000);
      }

      return nextSel;
    });
  };    

  const tapScaleTop = (d)=>{
    setTable(t=>{
      const expected = expectedScaleForRowUnit(t.uTop);
      if (expected == null || Number(d?.value) !== Number(expected)) { miss(4); handleError(); return t; }
      const t2 = { ...t, sTop: Number(d.value) };
      if (t2.sBottom!=null){ setDone(4); setDone(5); next(); } else { setDone(4); next(); }
      return t2;
    });
  };
  const tapScaleBottom = (d)=>{
    setTable(t=>{
      const expected = expectedScaleForRowUnit(t.uBottom);
      if (expected == null || Number(d?.value) !== Number(expected)) { miss(5); handleError(); return t; }
      const t2 = { ...t, sBottom: Number(d.value) };
      if (t2.sTop!=null){ setDone(4); setDone(5); next(); } else { setDone(5); next(); }
      return t2;
    });
  };

  const [pickedOther, setPickedOther] = useState(null);
  const otherValueChoices = useMemo(()=>{
    const correct = Number(problem?.given?.value);
    const sTop = Number(problem?.scale?.[0]);
    const sBottom = Number(problem?.scale?.[1]);

    const pool = new Set();
    if (Number.isFinite(correct)) pool.add(correct);
    if (Number.isFinite(sTop) && sTop !== correct) pool.add(sTop);
    if (Number.isFinite(sBottom) && sBottom !== correct) pool.add(sBottom);

    const base = Number.isFinite(correct) ? correct : 5;
    let tries = 0;
    while (pool.size < 4 && tries < 60) {
      const distractor = Math.max(1, base + Math.round((Math.random() * 8) - 4));
      if (distractor !== correct && distractor !== sTop && distractor !== sBottom) {
        pool.add(distractor);
      }
      tries++;
    }

    const arr = Array.from(pool).slice(0, 4).map((v, i) => ({
      id: `ov${i}`,
      value: v,
      label: String(v),
      correct: v === correct
    }));

    return seededShuffle(_assertFour(arr, "Step6-OtherValue"));
  }, [problem?.id, problem?.scale, problem?.given]);

  const chooseOtherValue = (choice) => {
    if (step!==6) return;
    if (!choice?.correct){ miss(6); handleError(); return; }
    setPickedOther(choice);
    setDone(6);
    next();
  };
  const displayStep7Value = pickedOther?.value ?? problem?.given?.value ?? "";

  const tapPlaceValueTop = () => {
    if (step!==7) return;
    const ok = pickedOther && rowIsGivenUnit(table.uTop);
    if (!ok){ miss(7); handleError(); return; }
    setTable(t => ({ ...t, vTop: Number(pickedOther.value) }));
    setDone(7); next();
  };
  const tapPlaceValueBottom = () => {
    if (step!==7) return;
    const ok = pickedOther && rowIsGivenUnit(table.uBottom);
    if (!ok){ miss(7); handleError(); return; }
    setTable(t => ({ ...t, vBottom: Number(pickedOther.value) }));
    setDone(7); next();
  };

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
  useEffect(()=>{ const onResize = ()=>measure(); window.addEventListener('resize', onResize); return ()=>window.removeEventListener('resize', onResize); },[]);
  
  useEffect(() => {
    const id = setInterval(() => {
      if (isHoldingEnglish || isOverEnglish) return;
      if (!rotationOrderFull || rotationOrderFull.length === 0) return;
      setRotLang(prev => {
        if (prev === 'English') return rotationOrderFull[0];
        const i = rotationOrderFull.indexOf(prev);
        return (i < 0 || i === rotationOrderFull.length - 1) ? rotationOrderFull[0] : rotationOrderFull[i + 1];
      });
    }, 15000);
    setRotationId(id);
    return () => {
      clearInterval(id);
      setRotationId(null);
    };
  }, [rotationOrderFull, isHoldingEnglish, isOverEnglish]);

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
    if (table.sTop!=null && v!=null) list.push({ a:v, b:1, label:`${v} × 1`, keys: [] });
    const seen=new Set(); const uniq=[]; for(const p of list){ if(!p) continue; const k=`${p.a}×${p.b}`; if(seen.has(k)) continue; if(crossPair && p.a===crossPair.a && p.b===crossPair.b) continue; seen.add(k); uniq.push(p);} return seededShuffle(uniq).slice(0,4);
  },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom]);

  const chooseMultiply = (pair)=>{
    if(!pair || !crossPair){ miss(9); handleError(); return; }
    const correct = (pair.a===crossPair.a && pair.b===crossPair.b);
    setHighlightKeys(pair.keys || []);
    if(!correct){ miss(9); handleError(); return; }
    const product = pair.a * pair.b;
    setTable(t=>({ ...t, product }));
    setMathStrip(s=>({ ...s, a: pair.a, b: pair.b }));
    setDone(9); next();
  };

  const divideChoices = useMemo(()=>{
    if (table.sTop==null || table.sBottom==null) return [];
    const correctScale = (givenRow==='top') ? table.sTop : table.sBottom;
    const wrongScale   = (givenRow==='top') ? table.sBottom : table.sTop;
    return seededShuffle([
      { label: `Divide by ${correctScale}`, value: correctScale, correct: true },
      { label: `Divide by ${wrongScale}`, value: wrongScale, correct: false },
      { label: `Multiply by ${correctScale}`, value: null, correct: false },
      { label: `Multiply by ${wrongScale}`, value: null, correct: false },
    ]);
  },[givenRow, table.sTop, table.sBottom]);

  const chooseDivideByNumber = (choice)=>{
    if (!choice.correct) { miss(10); handleError(); return; }
    const div = Number(choice.value);
    if (table.product==null || !Number.isFinite(div) || div===0) { miss(10); handleError(); return; }
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
    setMathStrip(s=>({ ...s, divisor: div, result, showResult: false }));
    setDone(10); next();
  };

  const holdEnglishDown = () => { 
    setIsHoldingEnglish(true); 
    setRotLang('English'); 
  };
  
  const holdEnglishUp = () => { 
    setIsHoldingEnglish(false); 
  };

  // Global mouse/touch up handler to ensure we always release
  useEffect(() => {
    const globalUp = () => {
      if (isHoldingEnglish) {
        setIsHoldingEnglish(false);
      }
    };
    
    window.addEventListener('mouseup', globalUp);
    window.addEventListener('touchend', globalUp);
    window.addEventListener('pointerup', globalUp);
    
    return () => {
      window.removeEventListener('mouseup', globalUp);
      window.removeEventListener('touchend', globalUp);
      window.removeEventListener('pointerup', globalUp);
    };
  }, [isHoldingEnglish]);

  function applyPostCalculateEffects() {
    if (postCalcAppliedRef.current) return;
    postCalcAppliedRef.current = true;

    setBlinkUnits(false);
    setBlinkKey(null);
    if (typeof setHighlightKeys === 'function') setHighlightKeys([]);
    setOval(null);
    setTripleUL(null);

    setMathStrip(s => ({ ...s, showResult: true }));

    const rGlobal = Number(mathStrip?.result);
    const unknownTop = table.vTop==null && table.sTop!=null && table.sBottom!=null && table.vBottom!=null;
    const unknownBottom = table.vBottom==null && table.sTop!=null && table.sBottom!=null && table.vTop!=null;
    let solvedKey = null;
    setTable(t => {
      const r = Number.isFinite(rGlobal) ? rGlobal : Number(t?.result);
      if (unknownTop){ solvedKey = 'vTop';    return { ...t, vTop: Number(r), solvedRow: 'top' }; }
      if (unknownBottom){ solvedKey = 'vBottom'; return { ...t, vBottom: Number(r), solvedRow: 'bottom' }; }
      return t;
    });

    if (solvedKey) { 
      setBlinkKey(solvedKey);
      setTimeout(() => {
        setBlinkKey(null);
        setNpBlink(true);
      }, 2000);
    }

    // Start continuous confetti
    setConfettiOn(true);
    try { ugConfetti.burst(); } catch {}
    confettiInterval.current = setInterval(() => {
      try { ugConfetti.burst(); } catch {}
    }, 2000);

    setDone(11);

    // Report stats and mark complete - MUST happen before setting up confetti interval
    updateStats?.(currentProblemErrors, true);
    onProblemComplete?.();

    if (npBlinkRef.current) clearTimeout(npBlinkRef.current);
    setNpBlink(false);
    npBlinkRef.current = setTimeout(() => setNpBlink(true), 3000);
  }

  const onCalculate = () => {
    applyPostCalculateEffects();
  };

  const resetProblem = ()=>{
    postCalcAppliedRef.current = false; 
    setNpBlink(false);
    
    // Stop confetti
    if (confettiInterval.current) {
      clearInterval(confettiInterval.current);
      confettiInterval.current = null;
    }
    setConfettiOn(false);
    
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
    setBlinkKey(null); setBlinkUnits(false);
    setPickedOther(null);
    setPickedUnits([]);
    setCurrentProblemErrors(0);
  };

  useEffect(() => {
    registerReset?.(resetProblem)
  }, [])

  // Cleanup confetti on unmount or route change
  useEffect(() => {
    return () => {
      if (confettiInterval.current) {
        clearInterval(confettiInterval.current);
        confettiInterval.current = null;
      }
    };
  }, []);

  const ROW_H = 88;
  const lineColor = '#0f172a';
  const isBlink = (k)=> blinkKey === k;

  const needWildBlink = (key)=> {
    if (step===4 && key==='sTop'    && table.sTop==null) return true;
    if (step===5 && key==='sBottom' && table.sBottom==null) return true;
    if (step===9 && Array.isArray(highlightKeys) && highlightKeys.includes(key)) return true;
    return false;
  };

  const isFinalBlinkKey = (k)=> (blinkKey && k===blinkKey && step>=11);
  
  const cellCls = (key)=> [
    (highlightKeys.includes(key) ? 'hl' : ''),
    (isBlink(key) ? 'final-blink-2s' : ''),
    (needWildBlink(key) ? 'ptable-blink-hard blink-bg' : ''),
  ].filter(Boolean).join(' ');

  const langLabel = rotLang;

  function maskToXXXX(str) {
    if (!str) return str;
    const [u1, u2] = problem?.units || [];
    const [a, b] = problem?.scale || [];
    const givenVal = problem?.given?.value;
    const otherUnit = (problem?.given?.row === 'top' ? u2 : u1) || (problem?.other?.unit || '');
    const tokens = [String(a), String(b), '=', u1, u2, otherUnit, String(givenVal)].filter(Boolean);
    const pre='\uE000', post='\uE001';
    const placeholders = {};
    let s = String(str);
    tokens.forEach((tok, i) => { const key = pre+i+post; placeholders[key]=tok; s = s.split(tok).join(key); });
    s = Array.from(s).map(ch => {
      try { return (ch.toLowerCase() !== ch.toUpperCase()) ? 'X' : ch; } catch { return ch; }
    }).join('');
    Object.keys(placeholders).forEach(k => { s = s.split(k).join(placeholders[k]); });
    return s;
  }

  function narrativeFor(lang) {
    const english = problem?.text?.english || '';
    if (lang === 'English') return english;
    if (lang === 'XXXX') return maskToXXXX(english);
    const alt = problem?.text?.alts?.[lang];
    return (typeof alt === 'string') ? alt : english;
  }

  function enforceEquals(s){ return (s||'').replace(/↔/g,'='); }
  const displayText = enforceEquals(narrativeFor(rotLang));

  return (
    <>
      <ErrorOverlay show={showError} />
      
      <div className="container" style={{position:'relative'}}>
        <style>{`
          .problem-banner { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 10px; }
          .problem-title { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
          .problem-body { font-size: 20px; color: inherit; }

          .ptable-blink { animation: ptable-blink-kf 2s ease-out 0s 1; }
          .final-blink-2s { 
            animation: ptable-blink-kf 2s ease-out 0s 1; 
            background: rgba(250, 204, 21, 0.3) !important;
          }

          .hl { border: none !important; background: radial-gradient(circle at 50% 50%, rgba(59,130,246,.18), rgba(59,130,246,0) 60%); outline: none !important; }

          .hcell .empty, .hcell .slot, .hcell .slot.empty, .hhead .empty {
            min-height: ${ROW_H}px !important;
            height: ${ROW_H}px !important;
          }

          .hcell, .hhead { display:flex; align-items:center; justify-content:center; text-align:center; }
          .hcell .slot, .hcell .empty, .hhead .empty { display:flex; align-items:center; justify-content:center; text-align:center; }
          .hcell, .hhead, .hcell .slot, .hhead .empty { font-family: inherit; font-weight: 700; font-size: 1.75rem; }
          
          .hcell span, .hhead span, .hhead-text {
            font-size: 1.75rem !important;
            font-weight: 700 !important;
          }

          .right-footer { position: sticky; bottom: 0; background: #fff; padding: 8px 0 0; display: flex; gap: 8px; justify-content: center; }
          .button.secondary { background: #e2e8f0; color: #0f172a; }
          
          .panes { display: flex; gap: 24px; align-items: flex-start; }
          .left-col { flex: 1 1 0; display: flex; flex-direction: column; gap: 12px; }
          .right-col { flex: 1 1 0; display: flex; flex-direction: column; gap: 12px; }
          
          @media (max-width: 720px) {
            .panes { flex-direction: column; }
          }
          
          .card { min-width: 0; }
          .card.steps-card { font-size: 1.06rem; }
          .card.steps-card .answer-btn { font-size: 1.06rem; }
          .right-footer { margin-top: 12px; }

          .ptable-blink-hard.blink-bg { background: transparent !important; }
          .ptable-blink-hard.blink-bg::before,
          .ptable-blink-hard.blink-bg::after { display: none !important; }
          
          .hcell, .hhead {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .hcell > *, .hhead > * {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .eq-display {
            font-size: 1.6rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            padding: 0.5rem 0;
          }
          .eq-display .frac {
            display: inline-grid;
            grid-template-rows: auto 2px auto;
            align-items: center;
            justify-items: center;
          }
          .eq-display .frac .bar {
            width: 100%;
            height: 2px;
            background: #0f172a;
            margin: 0.15rem 0;
          }
          .eq-display .eq { font-weight: 800; }
          .eq-display .res { font-weight: 900; }

          .eq-display .button {
            margin: 0;
            min-height: auto;
            line-height: 1.2;
          }

          .hgrid > *:nth-child(3n) { font-size: inherit; }

          .action-blink { animation: ptable-blink-kf 2s ease-out 0s infinite; }
          .action-blink-strong { 
            animation: np-strong 1.2s ease-in-out 0s infinite;
          }
          @keyframes np-strong {
            0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,.4); }
            50%  { transform: scale(1.08); box-shadow: 0 0 0 20px rgba(59,130,246,.25); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,.4); }
          }

          .answer-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 20px;
            border-radius: 12px;
            font-weight: 900;
            font-size: 20px;
            line-height: 1.3;
            border: 0;
            color: #ffffff;
            background: linear-gradient(135deg, #0B4B8C, #0C6B4D);
            box-shadow: 0 8px 16px rgba(11, 75, 140, 0.18);
            transition: transform 150ms ease, filter 150ms ease, box-shadow 150ms ease;
            cursor: pointer;
            text-align: center;
            min-height: 64px;
          }
          .answer-btn:hover {
            transform: translateY(-1px);
            filter: brightness(1.05);
          }
          .answer-btn:active {
            transform: translateY(0);
            filter: brightness(0.98);
          }
          .answer-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .answers-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 12px;
          }

          @media (max-width: 600px) {
            .answers-grid {
              grid-template-columns: 1fr;
            }
          }

          .step-title {
            font-size: 22px;
            font-weight: 900;
            line-height: 1.3;
            color: #0f172a;
            margin-bottom: 12px;
          }
        `}</style>

        <div className="panes">
          <div className="left-col">
            <div className="card steps-card">
              <div className="section">
                <div className="step-title">{step>=11 ? "" : (step===7 ? STEP_TITLES[7].replace("<value>", String(displayStep7Value ?? "")) : STEP_TITLES[step])}</div>

                {step===0 && (
                  <div className="answers-grid">
                    {seededShuffle(STEP1_CHOICES).map(c => (
                      <button key={c.id} className="answer-btn" onClick={()=>handleStep0(c)}>{c.label}</button>
                    ))}
                  </div>
                )}

                {step===1 && (
                  <div className="answers-grid">
                    {seededShuffle([
                      { id:'col_units', label:'Units', kind:'col', v:'Units' },
                      { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
                      { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
                      { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
                    ]).map((h, idx) => (
                      <button key={h.id ?? idx} className="answer-btn" onClick={()=>tapHeader1(h)}>{h.label}</button>
                    ))}
                  </div>
                )}

                {step===2 && (
                  <div className="answers-grid">
                    {seededShuffle([
                      { id:'col_units', label:'Units', kind:'col', v:'Units' },
                      { id:'col_given', label:'Given Ratio', kind:'col', v:'GivenRatio' },
                      { id:'col_answer', label:'Answer', kind:'col', v:'Answer' },
                      { id:'col_cm', label:'Cross Multiply', kind:'col', v:'CrossMultiply' },
                    ]).map((h, idx) => (
                      <button key={h.id ?? idx} className="answer-btn" onClick={()=>tapHeader2(h)}>{h.label}</button>
                    ))}
                  </div>
                )}

                {step===3 && (
                  <div className="answers-grid">
                    {unitChoices.map(c => (
                      <button key={c.id} className="answer-btn" onClick={()=>tapUnit(c)}>{c.label}</button>
                    ))}
                  </div>
                )}

                {step===4 && (
                  <div className="answers-grid">
                    {seededShuffle(numbersTopScale).map(c => 
                      <button key={c.id} className="answer-btn" onClick={()=>tapScaleTop(c)}>{c.label}</button>
                    )}
                  </div>
                )}

                {step===5 && (
                  <div className="answers-grid">
                    {seededShuffle(numbersBottomScale).map(c => 
                      <button key={c.id} className="answer-btn" onClick={()=>tapScaleBottom(c)}>{c.label}</button>
                    )}
                  </div>
                )}

                {step===6 && (
                  <div className="answers-grid">
                    {seededShuffle(otherValueChoices).map(c => (
                      <button key={c.id} className="answer-btn" onClick={() => chooseOtherValue(c)}>{c.label}</button>
                    ))}
                  </div>
                )}

                {step===7 && (<div className="problem-body"> </div>)} 

                {step===8 && (
                  <div className="answers-grid">
                    {seededShuffle(_assertFour(STEP8_CHOICES, "Step8")).map((opt,idx)=>(
                      <button key={opt.id || idx} className="answer-btn" onClick={()=>chooseNext8(opt)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {step===9 && (
                  <div className="answers-grid">
                    {seededShuffle([crossPair, ...wrongPairs].filter(Boolean)).slice(0,4).map((pair,idx)=>(
                      <button key={idx} className="answer-btn" onClick={()=>chooseMultiply(pair)}>{pair.label}</button>
                    ))}
                  </div>
                )}

                {step===10 && (
                  <div className="answers-grid">
                    {seededShuffle(divideChoices).map((c,idx)=>(
                      <button key={idx} className="answer-btn" onClick={()=>chooseDivideByNumber(c)}>{c.label}</button>
                    ))}
                  </div>
                )}

                {step>=11 && (
                  <div className="problem-body"> </div>
                )}
              </div>
            </div>

            {step>=0 && (
              <div className="card">
                <div className="section">
                  <div className="problem-banner">
                    <div className="problem-title">Problem <span className="lang-badge" style={{float:"right", fontWeight:600}}>Language: {langLabel}</span></div>
                    <div className="problem-body" style={{whiteSpace:'pre-wrap'}}>
                      {displayText}
                    </div>
                    <div className="problem-controls" style={{display:'flex', justifyContent:'center', marginTop:8}}>
                      <button
                        type="button"
                        className="button button-contrast"
                        onMouseDown={holdEnglishDown}
                        onTouchStart={holdEnglishDown}
                        onPointerDown={holdEnglishDown}>
                        Press for English
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="right-col">
            {step>=1 && (
              <div className="card">
                <div className="section">
                  <div className="hwrap" style={{position:'relative'}}>
                    <div ref={gridRef} className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, position:'relative'}}>
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

                      <div ref={refs.uTop} className="hcell" style={{height:ROW_H}}>
                        <Slot blinkWrap={blinkUnits} className={`${!table.uTop ? "empty" : ""}`}>
                          <span className={cellCls('uTop')}>{table.uTop || ''}</span>
                        </Slot>
                      </div>
                      <div ref={refs.sTop} className="hcell" style={{height:ROW_H}}>
                        <Slot blinkWrap={needWildBlink('sTop') || highlightKeys.includes('sTop')} className={`${table.sTop==null ? "empty" : ""}`}>
                          <span className={cellCls('sTop')}>{table.sTop ?? ''}</span>
                        </Slot>
                      </div>
                      <div ref={refs.vTop} className="hcell" style={{height:ROW_H}}>
                        <Slot blinkWrap={highlightKeys.includes('vTop') || isFinalBlinkKey('vTop')} className={`${table.vTop==null ? "empty" : ""}`} onClick={tapPlaceValueTop}>
                          <span className={cellCls('vTop')}>{table.vTop ?? ''}</span>
                        </Slot>
                      </div>

                      <div style={{gridColumn:'1 / span 3', height:0, margin:'6px 0'}} />

                      <div ref={refs.uBottom} className="hcell" style={{height:ROW_H}}>
                        <Slot blinkWrap={blinkUnits} className={`${!table.uBottom ? "empty" : ""}`}>
                          <span className={cellCls('uBottom')}>{table.uBottom || ''}</span>
                        </Slot>
                      </div>
                      <div ref={refs.sBottom} className="hcell" style={{height:ROW_H}}>
                        <Slot blinkWrap={needWildBlink('sBottom') || highlightKeys.includes('sBottom')} className={`${table.sBottom==null ? "empty" : ""}`}>
                          <span className={cellCls('sBottom')}>{table.sBottom ?? ''}</span>
                        </Slot>
                      </div>
                      <div ref={refs.vBottom} className="hcell" style={{height:ROW_H}}>
                        <Slot blinkWrap={highlightKeys.includes('vBottom') || isFinalBlinkKey('vBottom')} className={`${table.vBottom==null ? "empty" : ""}`} onClick={tapPlaceValueBottom}>
                          <span className={cellCls('vBottom')}>{table.vBottom ?? ''}</span>
                        </Slot>
                      </div>

                      <div style={{position:'absolute', pointerEvents:'none', left:0, top:(lines.hTop||0), width:(lines.gridW||0), borderTop:`5px solid ${lineColor}`}} />
                      <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v1Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />
                      <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v2Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />

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
                      {tripleUL && (
                        <div style={{position:'absolute', left: tripleUL.left, top: tripleUL.top, width: tripleUL.width, height:18, pointerEvents:'none'}}>
                          <div style={{borderTop:'3px solid #ef4444', marginTop:0}} />
                          <div style={{borderTop:'3px solid #ef4444', marginTop:4}} />
                          <div style={{borderTop:'3px solid #ef4444', marginTop:4}} />
                        </div>
                      )}
                    </div>
                    
                    {(step >= 10 && (mathStrip?.a!=null && mathStrip?.b!=null && mathStrip?.divisor!=null)) && (
                      <div className="eq-display" style={{marginTop: 16}}>
                        <span className="frac">
                          <span className="num">{String(mathStrip?.a ?? '')} × {String(mathStrip?.b ?? '')}</span>
                          <span className="bar"></span>
                          <span className="den">{String(mathStrip?.divisor ?? '')}</span>
                        </span>
                        <span className="eq"> = </span>
                        {!mathStrip?.showResult ? (
                          <button 
                            className="button action-blink-strong" 
                            onClick={onCalculate} 
                            disabled={((table?.vTop == null) === (table?.vBottom == null))}
                            style={{fontSize:'1.3rem', padding:'0.4rem 1rem', fontWeight:700, minHeight:'auto', lineHeight:1.2}}
                          >
                            Calculate
                          </button>
                        ) : (
                          <span className="res">{String(mathStrip?.result ?? '')}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
