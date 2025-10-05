// src/modules/htable/HTableModule.jsx — OpSpec v9.5.1.g aligned
// Update: Grid appears after Step 0 is answered correctly (step >= 1).
// Click-to-place fixed: Draggable supports both drag AND click-to-pick; Slot click drops picked chip.
// Blink-on-correct + auto-advance implemented at each placement choice.
//
// Scope: surgical, local to this module only.

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import DraggableBase from '../../components/DraggableChip.jsx'
import DropSlotBase from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

/** ---------------- Tap-to-place shared store ---------------- **/
const _pickStore = { data: null, set(d){this.data=d||null;}, peek(){return this.data;}, clear(){this.data=null;} };

const Draggable = ({ payload, data, onClick, ...rest }) => {
  const merged = data ?? payload ?? undefined;
  const handleClick = (e) => { _pickStore.set(merged); onClick?.(e); };
  // allow drag + click
  return <DraggableBase data={merged} onClick={handleClick} {...rest} />;
};

const Slot = ({ accept, test, validator, onDrop, onDropContent, onClick, children, className='', ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });
  const onDropFn = onDropContent ?? onDrop;
  const handleClick = (e) => {
    const picked = _pickStore.peek();
    if (picked && testFn(picked)) {
      try { onDropFn?.(picked); } catch {}
      _pickStore.clear();
    }
    onClick?.(e);
  };
  return (
    <div className={`slot-wrap ${className}`} onClick={handleClick}>
      <DropSlotBase test={testFn} onDropContent={onDropFn} {...rest}>{children}</DropSlotBase>
    </div>
  );
};

/** ---------------- Spec scaffolding ---------------- **/
const STEP_TITLES = [
  "What’s the first step to solve the problem?",
  "What goes in the first column?",
  "What goes in the next column?",
  "What are the two units in the problem? (click two)",
  "What value goes here? (top row scale)",
  "What value goes here? (bottom row scale)",
  "What’s the other value from the problem? (4 options)",
  "Where should this value go? (click cell in the table)",
  "What do we do now?",
  "Which numbers are we multiplying?",
  "What do we do next?",
  "Calculate",
];

const STEP1_CHOICES = [
  { id:'drawH', label:'Draw an H-Table', correct:true },
  { id:'proportion', label:'Make a Proportion' },
  { id:'convert', label:'Convert Units First' },
  { id:'guess', label:'Just Guess' },
];

/** ---------------- Unit categories ---------------- **/
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
  for (const [cat, list] of Object.entries(UNIT_CATS)) if (list.includes(s)) return cat;
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
  let tries = 0, p = genHProblem();
  while(!saneProblem(p) && tries<50){ p = genHProblem(); tries++; }
  return p;
};
const shuffle = (arr)=> arr.slice().sort(()=>Math.random()-0.5);

/** ---------------- Component ---------------- **/
export default function HTableModule(){
  const H_SNAP_VERSION = 15;

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
  const [steps, setSteps] = useState(snap?.steps || STEP_TITLES.map(()=>({misses:0,done:false})));
  const [openSum, setOpenSum] = useState(false);
  const [mathStrip, setMathStrip] = useState({ a:null, b:null, divisor:null, result:null, showResult:false });
  const [confettiOn, setConfettiOn] = useState(false);

  // blink-on-correct for any single cell key
  const [blinkKey, setBlinkKey] = useState(null);
  const flashCell = (key, nextStepIdx=null, delay=700) => {
    setBlinkKey(key);
    setTimeout(()=>{
      setBlinkKey(null);
      if (nextStepIdx!==null){
        setDone(nextStepIdx);
        next();
      }
    }, delay);
  };

  // unit blink when both selected
  const [blinkUnits, setBlinkUnits] = useState(false);

  // language / story
  const FALLBACK_LANGS = ['Spanish','Vietnamese','French','Chinese','Arabic','Korean'];
  const [showEnglish,setShowEnglish]=useState(true);
  const [mode,setMode]=useState('English');
  const timerRef = useRef(null);
  const allowedModes = useMemo(()=>{
    const altKeys = Object.keys(problem?.text?.alts || {}).filter(k=>k!=='BlackOut' && k!=='FadeOut');
    const base = altKeys.length ? altKeys : FALLBACK_LANGS;
    return [...base, 'XXXX XXXX XX'];
  },[problem?.id]);
  const redactText = (txt, units)=>{
    if(!txt) return '';
    const unitList = Array.isArray(units) ? units.slice() : [];
    unitList.sort((a,b)=> (b||'').length - (a||'').length);
    const placeholders = new Map();
    let out = txt;
    unitList.forEach((u, idx)=>{
      if(!u) return;
      const ph = `__UNIT_${idx}__`;
      placeholders.set(ph, u);
      const re = new RegExp(`\\b${u.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&')}\\b`, 'gi');
      out = out.replace(re, ph);
    });
    out = out.replace(/[A-Za-z]/g, 'X');
    placeholders.forEach((u, ph)=>{
      const re = new RegExp(ph, 'g');
      out = out.replace(re, u);
    });
    return out;
  };
  const stopTimer = ()=>{ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null } };
  const startTimer = ()=>{
    stopTimer();
    timerRef.current = setInterval(()=>{
      if(!showEnglish && allowedModes.length>0){
        const pick = allowedModes[Math.floor(Math.random()*allowedModes.length)];
        setMode(pick);
      }
    },15000);
  };
  useEffect(()=>{
    startTimer();
    const t = setTimeout(()=>{
      setShowEnglish(false);
      if (allowedModes.length>0){
        const pick = allowedModes[Math.floor(Math.random()*allowedModes.length)];
        setMode(pick);
      }
    }, 10000);
    return ()=>{ stopTimer(); clearTimeout(t) };
  },[problem?.id, allowedModes.length]);

  // persist
  useEffect(()=>{
    const nextState = { ...(session||{}), hSnap:{ version:H_SNAP_VERSION, problem, table, step, steps } };
    saveSession(nextState); setSession(nextState);
  },[problem, table, step, steps]);

  const miss = (idx)=>setSteps(s=>{const c=[...s]; if(c[idx]) c[idx].misses++; return c});
  const setDone = (idx)=>setSteps(s=>{const c=[...s]; if(c[idx]) c[idx].done=true; return c});
  const next = ()=>setStep(s=>Math.min(s+1, STEP_TITLES.length-1));

  /** ---------- helpers based on problem ---------- */
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

  /** ---------- pools ---------- */
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

  /** ---------- accept tests ---------- */
  const acceptCol1 = d => step===1 && d.kind==='col' && d.v==='Units';
  const acceptCol2 = d => step===2 && d.kind==='col' && d.v==='ScaleNumbers';
  const acceptUnitTop    = d => step===3 && d.kind==='unit';
  const acceptUnitBottom = d => step===3 && d.kind==='unit';
  const acceptScaleTop    = d => step===4 && d.kind==='num';
  const acceptScaleBottom = d => step===5 && d.kind==='num';
  const acceptValueTop    = d => step===7 && d.kind==='num';
  const acceptValueBottom = d => step===7 && d.kind==='num';

  /** ---------- step 6/7 other-value flow ---------- */
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
    setStep(7);
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

  /** ---------- geometry for H lines & highlights ---------- */
  const gridRef = useRef(null);
  const refs = { uTop: useRef(null), sTop: useRef(null), vTop: useRef(null), uBottom: useRef(null), sBottom: useRef(null), vBottom: useRef(null) };
  const [lines, setLines] = useState({ v1Left:0, v2Left:0, vTop:0, vHeight:0, hTop:0, gridW:0 });
  const [oval, setOval] = useState(null);
  const [tripleUL, setTripleUL] = useState(null);

  const measure = ()=>{
    const g = gridRef.current;
    if(!g) return;
    const gr = g.getBoundingClientRect();
    const r_uTop = refs.uTop.current?.getBoundingClientRect();
    const r_sTop = refs.sTop.current?.getBoundingClientRect();
    const r_vTop = refs.vTop.current?.getBoundingClientRect();
    const r_uBottom = refs.uBottom.current?.getBoundingClientRect();
    const r_sBottom = refs.sBottom.current?.getBoundingClientRect();
    const r_vBottom = refs.vBottom.current?.getBoundingClientRect();
    if(!(r_sTop && r_vTop && r_uTop && r_uBottom && r_sBottom && r_vBottom)) { setLines(l=>({ ...l, gridW: gr.width })); return }
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
  useEffect(()=>{ const onResize = ()=>measure(); window.addEventListener('resize', onResize); return ()=>window.removeEventListener('resize', onResize) },[]);

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
    return shuffle(list);
  },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom]);

  const chooseMultiply = (pair)=>{
    if(!pair || !crossPair){ miss(9); return; }
    const correct = (pair.a===crossPair.a && pair.b===crossPair.b);
    setHighlightKeys(pair.keys || []);
    if(!correct){ miss(9); return; }
    const product = pair.a * pair.b;
    setTable(t=>({ ...t, product }));
    setMathStrip(s=>({ ...s, a: pair.a, b: pair.b }));
    flashCell(pair.keys?.[0] || 'vTop', 9); // blink then advance
  };

  const chooseDivideByNumber = (num)=>{
    const div = Number(num);
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
    flashCell(key || 'sTop', 10);
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
    setTable({ head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null, product:null, divisor:null, result:null, solvedRow:null });
    setStep(0);
    setSteps(STEP_TITLES.map(()=>({misses:0,done:false})));
    setShowEnglish(true); setMode('English');
    setHighlightKeys([]); setOval(null); setTripleUL(null);
    setMathStrip({ a:null, b:null, divisor:null, result:null, showResult:false });
    setConfettiOn(false); setOpenSum(false);
    setBlinkKey(null); setBlinkUnits(false);
    setPickedOther(null);
  };

  const handleStep0 = (choice)=>{
    if(choice?.correct){
      setDone(0);
      setStep(1); // now grid will render
    } else {
      miss(0);
    }
  };

  const Story = ()=>{
    const p = problem;
    let txt = p?.text?.english || '';
    if (!showEnglish){
      if (mode === 'XXXX XXXX XX'){
        txt = redactText(p?.text?.english || '', problem.units);
      } else {
        const alt = p?.text?.alts?.[mode];
        txt = alt || redactText(p?.text?.english || '', problem.units);
      }
    }
    return (
      <>
        <div className="problem">{txt}</div>
        <div style={{textAlign:'center', marginBottom:8}}>
          <div className="lang-badge" style={{display:'inline-block'}}>Language: {showEnglish ? 'English' : mode}</div>
        </div>
        <div className="toolbar" style={{justifyContent:'center', marginTop:4, gap:12, display:'flex'}}>
          <button
            className="button big-under"
            onPointerDown={()=>{ setShowEnglish(true) }}
            onPointerUp={()=>{ setShowEnglish(false) }}
            aria-label="Hold English"
          >Hold: English</button>
          <button className="button primary big-under" onClick={resetProblem}>New Problem</button>
        </div>
      </>
    );
  };

  const ROW_H = 88;
  const lineColor = '#0f172a';
  const isBlink = (k)=> blinkKey === k;
  const cellCls = (key)=> `${highlightKeys.includes(key) ? 'hl' : ''} ${isBlink(key) ? 'ptable-blink' : ''}`;

  return (
    <div className="container" style={{position:'relative'}}>
      <style>{`
        @keyframes ptable-blink-kf { 0%, 49% { filter: none; } 50%, 100% { filter: brightness(1.35); } }
        .ptable-blink { animation: ptable-blink-kf 0.9s linear 0s 1; }
        @keyframes confettiFall { 0% { transform: translateY(-120vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(120vh) rotate(720deg); opacity: 1; } }
        .htable-confetti { position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; }
        .htable-confetti .piece { position: absolute; width: 10px; height: 14px; opacity: 0.9; animation: confettiFall linear infinite; border-radius: 2px; }
        .math-strip { margin-top: 14px; text-align: center; }
        .math-strip .big { font-size: 26px; font-weight: 700; }
        /* Ensure large dropzones */
        .hcell .empty, .hcell .slot, .hcell .slot.empty, .hhead .empty {
          min-height: ${ROW_H}px !important;
          height: ${ROW_H}px !important;
        }
      `}</style>

      <div className="panes">
        <div className="card">
          <Story />

          {/* H-table graphic is visible AFTER step 0 is correct */}
          {step>=1 && (
            <div className="hwrap" style={{position:'relative', marginTop:12}}>
              <div ref={gridRef} className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, position:'relative'}}>
                {/* Headers */}
                <div ref={refs.uTop} className="hhead" style={{height:ROW_H}}>
                  <Slot className={`${!table.head1 ? "empty" : ""}`}
                    test={acceptCol1}
                    onDropContent={(d)=>{
                      if(d.v==='Units'){ setTable(t=>({...t, head1:'Units'})); flashCell('uTop', 1); }
                      else miss(1);
                    }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', height:ROW_H}}>
                      <span className="hhead-text">{table.head1 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div ref={refs.sTop} className="hhead" style={{height:ROW_H}}>
                  <Slot className={`${!table.head2 ? "empty" : ""}`}
                    test={acceptCol2}
                    onDropContent={(d)=>{
                      if(d.v==='ScaleNumbers'){ setTable(t=>({...t, head2:'Scale Numbers'})); flashCell('sTop', 2); }
                      else miss(2);
                    }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', height:ROW_H}}>
                      <span className="hhead-text">{table.head2 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead" style={{height:ROW_H}}>{/* blank */}</div>

                {/* Row 1 */}
                <div className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${!table.uTop ? "empty" : ""} ${blinkUnits ? 'ptable-blink' : ''}`}
                    test={acceptUnitTop}
                    onDropContent={(d)=>setTable(t=>{
                      const isRight = isCanonicalUnit(d.label);
                      if(!isRight){ miss(3); return t; }
                      const t2={...t,uTop:d.label};
                      const placed=new Set([t2.uTop,t2.uBottom].filter(Boolean));
                      if(placed.size===2){ setBlinkUnits(true); setTimeout(()=>{ setBlinkUnits(false); setDone(3); next(); }, 900); }
                      return t2;
                    })}>
                    <span className={cellCls('uTop')} style={{fontSize:18}}>{table.uTop || ''}</span>
                  </Slot>
                </div>
                <div className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.sTop==null ? "empty" : ""}`}
                    test={acceptScaleTop}
                    onDropContent={(d)=>setTable(t=>{
                      const expected = expectedScaleForRowUnit(t.uTop);
                      if (expected == null || Number(d.value) !== Number(expected)) { miss(4); return t; }
                      const t2 = { ...t, sTop: Number(d.value) };
                      const both = (t2.sTop!=null && t2.sBottom!=null);
                      if (both) { setDone(4); setDone(5); flashCell('sTop', 5); }
                      return t2;
                    })}>
                    <span className={cellCls('sTop')} style={{fontSize:22}}>{table.sTop ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.vTop==null ? "empty" : ""}`}
                    test={acceptValueTop}
                    onDropContent={(d)=>setTable(t=>{
                      const isRightRow = rowIsGivenUnit(t.uTop);
                      const isRightNumber = Number(d.value) === Number(problem?.given?.value);
                      if (!isRightRow || !isRightNumber) { miss(7); return t; }
                      const t2 = { ...t, vTop: Number(d.value) };
                      flashCell('vTop', 7);
                      return t2;
                    })}
                    onClick={tapPlaceValueTop}>
                    <span className={cellCls('vTop')}>{table.vTop ?? ''}</span>
                  </Slot>
                </div>

                <div style={{gridColumn:'1 / span 3', height:0, margin:'6px 0'}} />

                {/* Row 2 */}
                <div className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${!table.uBottom ? "empty" : ""} ${blinkUnits ? 'ptable-blink' : ''}`}
                    test={acceptUnitBottom}
                    onDropContent={(d)=>setTable(t=>{
                      const isRight = isCanonicalUnit(d.label);
                      if(!isRight){ miss(3); return t; }
                      const t2={...t,uBottom:d.label};
                      const placed=new Set([t2.uTop,t2.uBottom].filter(Boolean));
                      if(placed.size===2){ setBlinkUnits(true); setTimeout(()=>{ setBlinkUnits(false); setDone(3); next(); }, 900); }
                      return t2;
                    })}>
                    <span className={cellCls('uBottom')} style={{fontSize:18}}>{table.uBottom || ''}</span>
                  </Slot>
                </div>
                <div className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.sBottom==null ? "empty" : ""}`}
                    test={acceptScaleBottom}
                    onDropContent={(d)=>setTable(t=>{
                      const expected = expectedScaleForRowUnit(t.uBottom);
                      if (expected == null || Number(d.value) !== Number(expected)) { miss(5); return t; }
                      const t2 = { ...t, sBottom: Number(d.value) };
                      const both = (t2.sTop!=null && t2.sBottom!=null);
                      if (both) { setDone(4); setDone(5); flashCell('sBottom', 5); }
                      return t2;
                    })}>
                    <span className={cellCls('sBottom')} style={{fontSize:22}}>{table.sBottom ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell" style={{height:ROW_H}}>
                  <Slot className={`${table.vBottom==null ? "empty" : ""}`}
                    test={acceptValueBottom}
                    onDropContent={(d)=>setTable(t=>{
                      const isRightRow = rowIsGivenUnit(t.uBottom);
                      const isRightNumber = Number(d.value) === Number(problem?.given?.value);
                      if (!isRightRow || !isRightNumber) { miss(7); return t; }
                      const t2 = { ...t, vBottom: Number(d.value) };
                      flashCell('vBottom', 7);
                      return t2;
                    })}
                    onClick={tapPlaceValueBottom}>
                    <span className={cellCls('vBottom')}>{table.vBottom ?? ''}</span>
                  </Slot>
                </div>

                {/* Solid H lines */}
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
                {headerChoicesCol1.map((h, idx) => <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} />)}
              </div>
            )}
            {step===2 && (
              <div className="chips with-borders center" style={{marginTop:8}}>
                {headerChoicesCol2.map((h, idx) => <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} />)}
              </div>
            )}
            {step===3 && (
              <div className="chips center mt-8">
                {unitChoices.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
              </div>
            )}
            {step===4 && (
              <div className="chips center mt-8">
                {(numbersStep5 && numbersStep5.length ? numbersStep5 : [3,5,7,9,12,18].map((n,i)=>({id:"nf5_"+i,label:String(n),kind:"num",value:n}))).map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
              </div>
            )}
            {step===5 && (
              <div className="chips center mt-8">
                {(numbersStep6 && numbersStep6.length ? numbersStep6 : [4,6,8,10].map((n,i)=>({id:"nf6_"+i,label:String(n),kind:"num",value:n}))).map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
              </div>
            )}
            {/* step 6 options */}
            {step===6 && (
              <div className="chips with-borders center mt-8">
                {otherValueChoices.map(c => (
                  <button key={c.id} className="chip" onClick={() => { chooseOtherValue(c); }}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {/* step 8 fence */}
            {step===8 && (
              <div className="chips with-borders center mt-8">
                {[
                  { id:'op_x', label:'Cross Multiply', good:true },
                  { id:'op_add', label:'Add the numbers' },
                  { id:'op_sub', label:'Subtract the numbers' },
                  { id:'op_avg', label:'Average the numbers' },
                ].map(o => (
                  <button
                    key={o.id}
                    className="chip"
                    onClick={() => { o.good ? (setDone(8), next()) : miss(8); }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {/* step 9 fence */}
            {step===9 && (
              <div className="chips with-borders center mt-8">
                {[crossPair, ...wrongPairs].filter(Boolean).map((p, idx) => (
                  <button key={idx} className="chip" onClick={() => { chooseMultiply(p); setTripleUL(null); }}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            {/* step 10 fence */}
            {step===10 && (
              <div className="chips with-borders center mt-8">
                <button className="chip" onClick={() => chooseDivideByNumber(Number(table.sTop))}>
                  Divide by {table.sTop ?? '—'}
                </button>
                <button className="chip" onClick={() => chooseDivideByNumber(Number(table.sBottom))}>
                  Divide by {table.sBottom ?? '—'}
                </button>
              </div>
            )}
            {/* step 11 Calculate */}
            {step>=11 && (
              <div className="toolbar mt-10 center">
                <button className="button success" disabled={table.result==null} onClick={onCalculate}>Calculate</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confetti on Summary open (auto-clean ~3.5s) */}
      {confettiOn && (
        <div className="htable-confetti">
          {Array.from({length:120}).map((_,i)=>{
            const left = Math.random()*100;
            const dur = 5 + Math.random()*4;
            const delay = Math.random()*2;
            const bg = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#06b6d4'][i%6];
            return (
              <div key={i} className="piece" style={{
                left: `${left}%`,
                background: bg,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`
              }} />
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
