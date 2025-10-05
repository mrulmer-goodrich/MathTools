// src/modules/htable/HTableModule.jsx
// Build: v9.6.0-compliant
// -----------------------------------------------------------------------------
// OpSpec v9.6.0 compliant implementation with tap-only interaction.
// All 11 blockers from audit fixed.
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'

import DraggableBase from '../../components/DraggableChip.jsx'
import DropSlotBase from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'

import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

// =============================================================================
//  Tap-Only Chip Wrapper (OpSpec §3)
// =============================================================================

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

// =============================================================================
//  Slot Wrapper (OpSpec §3 + §7.4: includes accept handling)
// =============================================================================

const Slot = ({ accept, children, className='', onClick, validator, test, ...rest }) => {
  const handleClick = (e) => { onClick?.(e); };
  
  // OpSpec §7.4: Header slots must validate 'header' in accept array
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });
  
  return (
    <div
      className={`slot-wrap ${className}`}
      onClick={handleClick}
      onDragOver={(e)=>e.preventDefault()}
    >
      <DropSlotBase test={testFn} onDropContent={()=>{}} {...rest}>
        {children}
      </DropSlotBase>
    </div>
  );
};

// =============================================================================
//  Spec Scaffolding
// =============================================================================

const STEP_TITLES = [
  "What's the first step to solve the problem?",
  "What goes in the first column?",
  "What goes in the next column?",
  "What are the two units in the problem? (tap two)",
  "What value goes here? (top row scale)",
  "What value goes here? (bottom row scale)",
  "What's the other value from the problem? (4 options)",
  "Where should this value go? (tap a cell)",
  "What do we do now?",
  "Which numbers are we multiplying?",
  "What do we do next?",
  "Calculate",
];

const STEP1_CHOICES = [
  { id:'drawH',   label:'Draw an H Table', correct:true },
  { id:'proportion', label:'Make a Proportion' },
  { id:'convert',    label:'Convert Units First' },
  { id:'guess',      label:'Just Guess' },
];

// =============================================================================
//  Units / Categories
// =============================================================================

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
  for (const [cat, list] of Object.entries(UNIT_CATS)) {
    if (list.includes(s)) return cat;
  }
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
  while(!saneProblem(p) && tries<50){
    p = genHProblem(); tries++;
  }
  return p;
};

const shuffle = (arr)=> arr.slice().sort(()=>Math.random()-0.5);

// =============================================================================
//  Component
// =============================================================================

export default function HTableModule(){
  const H_SNAP_VERSION = 19; // bumped for v9.6.0 compliance

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
  const [mathStrip, setMathStrip] = useState({
    a:null, b:null, divisor:null, result:null, showResult:false
  });
  const [confettiOn, setConfettiOn] = useState(false);

  // Blink helpers (OpSpec §6: 2s duration)
  const [blinkKey, setBlinkKey] = useState(null);

  const flashCell = (key, nextStepIdx=null, delay=2000) => {
    setBlinkKey(key);
    setTimeout(()=>{
      setBlinkKey(null);
      if (nextStepIdx!==null){
        setDone(nextStepIdx);
        next();
      }
    }, delay);
  };

  const [blinkUnits, setBlinkUnits] = useState(false);

  // Persist
  useEffect(()=>{
    const nextState = { ...(session||{}), hSnap:{ version:H_SNAP_VERSION, problem, table, step, steps } };
    saveSession(nextState); setSession(nextState);
  },[problem, table, step, steps]);

  // Step helpers
  const miss = (idx)=>setSteps(s=>{
    const c=[...s]; if(c[idx]) c[idx].misses++; return c;
  });

  const setDone = (idx)=>setSteps(s=>{
    const c=[...s]; if(c[idx]) c[idx].done=true; return c;
  });

  const next = ()=>setStep(s=>Math.min(s+1, STEP_TITLES.length-1));

  // Problem helpers
  const canonicalTopUnit    = (problem?.units?.[0] || '').toLowerCase();
  const canonicalBottomUnit = (problem?.units?.[1] || '').toLowerCase();

  const givenUnitLabel = (problem?.given?.row === 'top'
    ? problem?.units?.[0]
    : problem?.units?.[1]) || '';

  const toLower = (s)=> (s||'').toLowerCase();

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

  const makeNumberSet = (baseNums, needCount=6)=>{
    const set = new Set(baseNums.filter(x=>Number.isFinite(Number(x))).map(Number));
    const approx = [...set];
    const base = approx.length ? approx : [5,10,12,15,18,20];
    const min = Math.max(1, Math.min(...base)-5);
    const max = Math.max(...base)+10;
    while(set.size < needCount){
      set.add(Math.floor(Math.random()*(max-min+1))+min);
    }
    return Array.from(set);
  };

  const numbersStep5 = useMemo(()=>{
    const base = [problem.scale?.[0], problem.scale?.[1], problem.given?.value];
    return shuffle(makeNumberSet(base, 7).map((n,i)=>({ id:'n5_'+i, label:String(n), kind:'num', value:Number(n) })));
  },[problem]);

  const numbersStep6 = useMemo(()=>{
    const base = [problem.given?.value];
    return shuffle(makeNumberSet(base, 4).map((n,i)=>({ id:'n6_'+i, label:String(n), kind:'num', value:Number(n) })));
  },[problem]);

  const headerChoicesCol1 = useMemo(()=>shuffle([
    { id:'col_units', label:'Units', kind:'col', v:'Units' },
    { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
    { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
    { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
  ]),[problem?.id]);

  const headerChoicesCol2 = useMemo(()=>shuffle([
    { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
    { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
    { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
  ]),[problem?.id]);

  // Step 6 / 7 flow
  const [pickedOther, setPickedOther] = useState(null);

  const otherValueChoices = useMemo(()=>{
    const correct = Number(problem?.given?.value);
    const pool = new Set([correct]);
    const sA = Number(problem?.scale?.[0]); const sB = Number(problem?.scale?.[1]);
    let tries = 0;
    while (pool.size < 4 && tries < 50){
      const cand = Math.max(1, Math.round(correct + (Math.random()*6 - 3)));
      if (cand!==sA && cand!==sB) pool.add(cand);
      tries++;
    }
    const arr = Array.from(pool).map((v,i)=>({ id:'ov'+i, value:v, label:String(v), correct: v===correct }));
    return shuffle(arr);
  },[problem?.id]);

  const chooseOtherValue = (choice) => {
    if (step!==6) return;
    if (!choice?.correct){ miss(6); return; }
    setPickedOther(choice);
    setDone(6);
    next(); // OpSpec §7.15: use next() not setStep()
  };

  const tapPlaceValueTop = () => {
    if (step!==7) return;
    const ok = pickedOther && rowIsGivenUnit(table.uTop);
    if (!ok){ miss(7); return; }
    setTable(t => ({ ...t, vTop: Number(pickedOther.value) }));
    flashCell('vTop', 7);
  };

  const tapPlaceValueBottom = () => {
    if (step!==7) return;
    const ok = pickedOther && rowIsGivenUnit(table.uBottom);
    if (!ok){ miss(7); return; }
    setTable(t => ({ ...t, vBottom: Number(pickedOther.value) }));
    flashCell('vBottom', 7);
  };

  // Geometry
  const gridRef = useRef(null);

  const refs = {
    uTop: useRef(null),
    sTop: useRef(null),
    vTop: useRef(null),
    uBottom: useRef(null),
    sBottom: useRef(null),
    vBottom: useRef(null)
  };

  const [lines, setLines] = useState({
    v1Left:0, v2Left:0, vTop:0, vHeight:0, hTop:0, gridW:0
  });

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

    setLines({
      v1Left: v1,
      v2Left: v2,
      vTop: r_vTop.top - gr.top,
      vHeight,
      hTop,
      gridW: gr.width
    });

    if (tripleUL && tripleUL.key){
      const target = refs[tripleUL.key]?.current?.getBoundingClientRect();
      if(target){
        setTripleUL({
          key: tripleUL.key,
          left: target.left - gr.left + 8,
          top: target.bottom - gr.top - 18,
          width: Math.max(24, target.width - 16)
        });
      }
    }
  };

  useLayoutEffect(()=>{ measure() },[step, table.uTop, table.uBottom, table.sTop, table.sBottom, table.vTop, table.vBottom]);
  useEffect(()=>{
    const onResize = ()=>measure();
    window.addEventListener('resize', onResize);
    return ()=>window.removeEventListener('resize', onResize);
  },[]);

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
    return {
      a:v, b:sOpp,
      label:`${v} × ${sOpp}`,
      keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sBottom':'sTop']
    };
  },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom]);

  // OpSpec §7.21: Need 4 total options (1 correct + 3 wrong)
  const wrongPairs = useMemo(()=>{
    const list = [];
    const v = (givenRow==='top') ? table.vTop : table.vBottom;
    const sSame = (givenRow==='top') ? table.sTop : table.sBottom;
    
    // Wrong pair 1: same-row multiply
    if (v!=null && sSame!=null) list.push({
      a:v, b:sSame, label:`${v} × ${sSame}`,
      keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sTop':'sBottom']
    });
    
    // Wrong pair 2: scale × scale
    if (table.sTop!=null && table.sBottom!=null) list.push({
      a:table.sTop, b:table.sBottom, label:`${table.sTop} × ${table.sBottom}`,
      keys:['sTop','sBottom']
    });
    
    // Wrong pair 3: opposite value × same scale (if exists)
    const vOpp = (givenRow==='top') ? table.vBottom : table.vTop;
    if (vOpp!=null && sSame!=null) list.push({
      a:vOpp, b:sSame, label:`${vOpp} × ${sSame}`,
      keys: [(givenRow==='top')?'vBottom':'vTop', (givenRow==='top')?'sTop':'sBottom']
    });
    
    return shuffle(list).slice(0, 3); // Ensure exactly 3 wrong options
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

  // OpSpec §7.22: Need 4 options for Step 10
  const divideChoices = useMemo(()=>{
    if (table.sTop==null || table.sBottom==null) return [];
    
    const correctScale = (givenRow==='top') ? table.sBottom : table.sTop;
    const wrongScale = (givenRow==='top') ? table.sTop : table.sBottom;
    
    return shuffle([
      { label: `Divide by ${correctScale}`, value: correctScale, correct: true },
      { label: `Divide by ${wrongScale}`, value: wrongScale, correct: false },
      { label: `Multiply by ${correctScale}`, value: null, correct: false },
      { label: `Multiply by ${wrongScale}`, value: null, correct: false },
    ]);
  }, [givenRow, table.sTop, table.sBottom]);

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
        setTripleUL({
          key,
          left: r.left - gr.left + 8,
          top: r.bottom - gr.top - 18,
          width: Math.max(24, r.width - 16)
        });
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
  };

  const handleStep0 = (choice)=>{
    if(choice?.correct){
      setDone(0);
      setStep(1);
    } else {
      miss(0);
    }
  };

  // Tap handlers
  const tapHeader1 = (d)=>{
    if (d?.v==='Units'){
      setTable(t=>({...t, head1:'Units'}));
      setDone(1); next();
    } else {
      miss(1);
    }
  };

  const tapHeader2 = (d)=>{
    if (d?.v==='ScaleNumbers'){
      setTable(t=>({...t, head2:'Scale Numbers'}));
      setDone(2); next();
    } else {
      miss(2);
    }
  };

  const [pickedUnits, setPickedUnits] = useState([]);

  const tapUnit = (d)=>{
    const label = d?.label ?? d?.u ?? '';
    if (!isCanonicalUnit(label)) { miss(3); return; }

    setPickedUnits(prev=>{
      const exists = prev.find(x=> (x?.label||x?.u||'').toLowerCase() === (label||'').toLowerCase());
      if (exists) return prev;

      const nextSel = [...prev, d];

      if (nextSel.length===2){
        const topObj = nextSel.find(x=> (x.label||x.u||'').toLowerCase() === canonicalTopUnit);
        const botObj = nextSel.find(x=> (x.label||x.u||'').toLowerCase() === canonicalBottomUnit);

        setTable(t=>({
          ...t,
          uTop:    (topObj?.label||topObj?.u||''),
          uBottom: (botObj?.label||botObj?.u||'')
        }));

        setBlinkUnits(true);
        setTimeout(()=>{
          setBlinkUnits(false);
          setDone(3); next();
        }, 2000); // OpSpec §6: 2s blink
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

  // UI
  const ROW_H = 88;
  const lineColor = '#0f172a';

  const isBlink = (k)=> blinkKey === k;
  const cellCls = (key)=> `${highlightKeys.includes(key) ? 'hl' : ''} ${isBlink(key) ? 'ptable-blink' : ''}`;

  return (
    <div className="container" style={{position:'relative'}}>
      <style>{`
        .problem-banner { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 10px; }
        .problem-title { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
        .problem-body { font-size: 14px; color: #0f172a; }
    
        @keyframes ptable-blink-kf { 0%, 49% { filter: none; } 50%, 100% { filter: brightness(1.35); } }
        .ptable-blink { animation: ptable-blink-kf 0.9s linear 0s 1; }
        
        /* OpSpec §6: highlight class for multiplied cells */
        .hl { background: rgba(59, 130, 246, 0.1); border: 2px solid #3b82f6 !important; border-radius: 8px; }

        @keyframes confettiFall {
          0%   { transform: translateY(-120vh) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg);  opacity: 1; }
        }
        .htable-confetti { position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; }
        .htable-confetti .piece { position: absolute; width: 10px; height: 14px; opacity: 0.9; animation: confettiFall linear infinite; border-radius: 2px; }

        .hcell .empty, .hcell .slot, .hcell .slot.empty, .hhead .empty {
          min-height: ${ROW_H}px !important;
          height: ${ROW_H}px !important;
        }
      `}</style>

      
      <div className="panes">
        <div className="card">
          <div className="section">
            <div className="problem-banner">
              <div className="problem-title">Problem</div>
              <div className="problem-body">
                {(() => {
                  const en = (problem && problem.text && (typeof problem.text.english === 'string')) ? problem.text.english : null;
                  return (
                    <div>
                      <div style={{whiteSpace:'pre-wrap'}}>{en || ''}</div>
                    </div>
                  );
                })()}
              </div>
            </div>
    
            <div className="step-title">{STEP_TITLES[step]}</div>

            {step===0 && (
              <div className="chips with-borders center">
                {STEP1_CHOICES.map(c => (
                  <button key={c.id} className="chip" onClick={()=>handleStep0(c)}>{c.label}</button>
                ))}
              </div>
            )}

            {step===1 && (
              <div className="chips with-borders center" style={{marginTop:8}}>
                {headerChoicesCol1.map((h, idx) => (
                  <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} tapAction={(e,d)=>tapHeader1(d)} />
                ))}
              </div>
            )}

            {step===2 && (
              <div className="chips with-borders center" style={{marginTop:8}}>
                {headerChoicesCol2.map((h, idx) => (
                  <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} tapAction={(e,d)=>tapHeader2(d)} />
                ))}
              </div>
            )}

            {step===3 && (
              <div className="chips center mt-8">
                {unitChoices.map(c => (
                  <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapUnit(d)} />
                ))}
              </div>
            )}

            {step===4 && (
              <div className="chips center mt-8">
                {(numbersStep5 && numbersStep5.length
                  ? numbersStep5
                  : [3,5,7,9,12,18].map((n,i)=>({id:"nf5_"+i,label:String(n),kind:"num",value:n}))
                ).map(c => (
                  <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleTop(d)} />
                ))}
              </div>
            )}

            {step===5 && (
              <div className="chips center mt-8">
                {(numbersStep6 && numbersStep6.length
                  ? numbersStep6
                  : [4,6,8,10].map((n,i)=>({id:"nf6_"+i,label:String(n),kind:"num",value:n}))
                ).map(c => (
                  <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleBottom(d)} />
                ))}
              </div>
            )}

            {/* RIGHT-PANEL: STEP 6 – START */}
            {step===6 && (
              <div className="chips with-borders center mt-8">
                {otherValueChoices.map(c => (
                  <button 
                    key={c.id} 
                    className="chip" 
                    onClick={() => { 
                      chooseOtherValue(c); 
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 6 – END */}

            {/* RIGHT-PANEL: STEP 7 – START */}
            {step===7 && (
              <div className="section">
                <div className="muted bigger">Tap the correct cell in the table to place the value.</div>
              </div>
            )}
            {/* RIGHT-PANEL: STEP 7 – END */}

            {/* RIGHT-PANEL: STEP 8 – START */}
            {step===8 && (
              <div className="chips with-borders center mt-8">
                {[
                  { id:'op_x', label:'Cross Multiply', good:true },
                  { id:'op_add', label:'Add the numbers', good:false },
                  { id:'op_sub', label:'Subtract the numbers', good:false },
                  { id:'op_avg', label:'Average the numbers', good:false },
                ].map(o => (
                  <button 
                    key={o.id} 
                    className="chip" 
                    onClick={() => { 
                      if (o.good) {
                        setDone(8);
                        next();
                      } else {
                        miss(8);
                      }
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 8 – END */}

            {/* RIGHT-PANEL: STEP 9 – START */}
            {step===9 && (
              <div className="chips with-borders center mt-8">
                {[crossPair, ...wrongPairs].filter(Boolean).map((p, idx) => (
                  <button 
                    key={idx} 
                    className="chip" 
                    onClick={() => { 
                      chooseMultiply(p); 
                      setTripleUL(null); 
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 9 – END */}

            {/* RIGHT-PANEL: STEP 10 – START */}
            {step===10 && (
              <div className="chips with-borders center mt-8">
                {divideChoices.map((choice, idx) => (
                  <button 
                    key={idx} 
                    className="chip" 
                    onClick={() => {
                      chooseDivideByNumber(choice);
                    }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            )}
            {/* RIGHT-PANEL: STEP 10 – END */}

            {/* RIGHT-PANEL: STEP 11 – START */}
            {step>=11 && (
              <div className="toolbar mt-10 center">
                <button className="button success" disabled={table.result==null} onClick={onCalculate}>Calculate</button>
              </div>
            )}
            {/* RIGHT-PANEL: STEP 11 – END */}
          </div>

          {/* H-table visible AFTER step 0 */}
          {step>=1 && (
            <div className="hwrap" style={{position:'relative', marginTop:12}}>
              <div ref={gridRef} className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, position:'relative'}}>
                {/* Headers */}
                <div className="hhead" style={{height:ROW_H}}>
                  <Slot accept={["header"]} className={`${!table.head1 ? "empty" : ""}`}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', height:ROW_H}}>
                      <span className="hhead-text">{table.head1 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead" style={{height:ROW_H}}>
                  <Slot accept={["header"]} className={`${!table.head2 ? "empty" : ""}`}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', height:ROW_H}}>
                      <span className="hhead-text">{table.head2 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead" style={{height:ROW_H}}>{/* blank */}</div>

                {/* Row 1 */}
                <div ref={refs.uTop} className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${!table.uTop ? "empty" : ""} ${blinkUnits ? 'ptable-blink' : ''}`}>
                    <span className={cellCls('uTop')} style={{fontSize:18}}>{table.uTop || ''}</span>
                  </Slot>
                </div>
                <div ref={refs.sTop} className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.sTop==null ? "empty" : ""}`}>
                    <span className={cellCls('sTop')} style={{fontSize:22}}>{table.sTop ?? ''}</span>
                  </Slot>
                </div>
                <div ref={refs.vTop} className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.vTop==null ? "empty" : ""}`} onClick={tapPlaceValueTop}>
                    <span className={cellCls('vTop')}>{table.vTop ?? ''}</span>
                  </Slot>
                </div>

                <div style={{gridColumn:'1 / span 3', height:0, margin:'6px 0'}} />

                {/* Row 2 */}
                <div ref={refs.uBottom} className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${!table.uBottom ? "empty" : ""} ${blinkUnits ? 'ptable-blink' : ''}`}>
                    <span className={cellCls('uBottom')} style={{fontSize:18}}>{table.uBottom || ''}</span>
                  </Slot>
                </div>
                <div ref={refs.sBottom} className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.sBottom==null ? "empty" : ""}`}>
                    <span className={cellCls('sBottom')} style={{fontSize:22}}>{table.sBottom ?? ''}</span>
                  </Slot>
                </div>
                <div ref={refs.vBottom} className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.vBottom==null ? "empty" : ""}`} onClick={tapPlaceValueBottom}>
                    <span className={cellCls('vBottom')}>{table.vBottom ?? ''}</span>
                  </Slot>
                </div>

                {/* H lines */}
                <div style={{position:'absolute', pointerEvents:'none', left:0, top:(lines.hTop||0), width:(lines.gridW||0), borderTop:`5px solid ${lineColor}`}} />
                <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v1Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />
                <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v2Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />

                {/* Red oval */}
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
                {/* Red triple underline */}
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

        {/* RIGHT SIDE */}
        <div className="card right-steps">
          <div className="section">
            <div className="muted">Follow the prompts on the left. Tap to interact.</div>
          </div>
        </div>
      </div>

      {/* Confetti */}
      {confettiOn && (
        <div className="htable-confetti">
          {Array.from({length:120}).map((_,i)=>{
            const left = Math.random()*100;
            const dur = 5 + Math.random()*4;
            const delay = Math.random()*2;
            const bg = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#06b6d4'][i%6];
            return (
              <div
                key={i}
                className="piece"
                style={{
                  left: `${left}%`,
                  background: bg,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Summary overlay */}
      {openSum && (
        <SummaryOverlay
          open={openSum}
          onClose={()=>setOpenSum(false)}
          table={table}
          problem={problem}
        />
      )}
    </div>
  );
}
