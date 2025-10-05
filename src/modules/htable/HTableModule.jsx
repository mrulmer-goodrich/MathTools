// src/modules/htable/HTableModule.jsx
// OpSpec v9.6.2 – Tap-only, prompts on RIGHT, problem+H-table on LEFT
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef, useState } from 'react'

// Shared UI (read-only per OpSpec)
import DraggableBase from '../../components/DraggableChip.jsx'
import DropSlotBase from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'

// Data (read-only per OpSpec)
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

// ────────────────────────────────────────────────────────────────────────────────
// Tap-only wrappers (OpSpec §1, §5)
// ────────────────────────────────────────────────────────────────────────────────
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

const Slot = ({ accept, children, className='', onClick, validator, test, onDropContent, ...rest }) => {
  const handleClick = (e) => { onClick?.(e); };
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });
  const onDropContentFn = onDropContent ?? (()=>{});
  return (
    <div
      className={`slot-wrap ${className}`}
      onClick={handleClick}
      onDragOver={(e)=>e.preventDefault()}
    >
      <DropSlotBase test={testFn} onDropContent={onDropContentFn} {...rest}>
        {children}
      </DropSlotBase>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// Spec scaffolding & helpers
// ────────────────────────────────────────────────────────────────────────────────
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
  const [confettiOn, setConfettiOn] = useState(false);

  // Blink management (2s standard)
  const [blinkKey, setBlinkKey] = useState(null);
  const flash = (key, onAfter=null, delay=2000) => {
    setBlinkKey(key);
    setTimeout(()=>{ setBlinkKey(null); if (typeof onAfter==='function') onAfter(); }, delay);
  };

  // Persist
  useEffect(()=>{
    const nextState = { ...(session||{}), hSnap:{ version:H_SNAP_VERSION, problem, table, step, steps } };
    saveSession(nextState); setSession(nextState);
  },[problem, table, step, steps]);

  // Helpers
  const miss = (idx)=>setSteps(s=>{ const c=[...s]; if(c[idx]) c[idx].misses++; return c; });
  const setDone = (idx)=>setSteps(s=>{ const c=[...s]; if(c[idx]) c[idx].done=true; return c; });
  const next = ()=>setStep(s=>Math.min(s+1, STEP_TITLES.length-1));

  const toLower = (s)=> (s||'').toLowerCase();
  const canonicalTopUnit    = toLower(problem?.units?.[0] || '');
  const canonicalBottomUnit = toLower(problem?.units?.[1] || '');
  const givenUnitLabel = (problem?.given?.row === 'top' ? problem?.units?.[0] : problem?.units?.[1]) || '';

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

  // Step 1
  const tapHeader1 = (d) => {
    if (step !== 1) return;
    if (d?.v !== 'Units'){ miss(1); return; }
    setTable(t => ({ ...t, head1: 'Units' }));
    setDone(1); next();
  };

  // Step 2
  const tapHeader2 = (d) => {
    if (step !== 2) return;
    if (d?.v !== 'ScaleNumbers'){ miss(2); return; }
    setTable(t => ({ ...t, head2: 'Scale Numbers' }));
    setDone(2); next();
  };

  // Step 3
  const [pickedUnits, setPickedUnits] = useState([]);
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

  const tapUnit = (d)=>{
    if (step !== 3) return;
    const label = d?.label ?? d?.u ?? '';
    if (!isCanonicalUnit(label)) { miss(3); return; }
    setPickedUnits(prev=>{
      const exists = prev.find(x=> (x?.label||x?.u||'').toLowerCase() === toLower(label));
      if (exists) return prev;
      const nextSel = [...prev, d];
      if (nextSel.length===2){
        const topObj = nextSel.find(x=> toLower(x.label||x.u||'') === canonicalTopUnit);
        const botObj = nextSel.find(x=> toLower(x.label||x.u||'') === canonicalBottomUnit);
        setTable(t=>({ ...t, uTop:(topObj?.label||topObj?.u||''), uBottom:(botObj?.label||botObj?.u||'') }));
        flash('unitsBlink', ()=>{ setDone(3); next(); }, 2000);
      }
      return nextSel;
    });
  };

  // Steps 4 & 5 — scales (dual-completion)
  const numbersTopScale = useMemo(()=>{
    const v = Number(problem?.scale?.[0]);
    const set = new Set([v]);
    let i=0; while(set.size<6 && i<40){ set.add(Math.max(1, v + Math.round((Math.random()*6)-3))); i++; }
    return shuffle([...set]).map((n,i)=>({ id:'nt_'+i, label:String(n), kind:'num', value:Number(n) }));
  },[problem?.id]);

  const numbersBottomScale = useMemo(()=>{
    const v = Number(problem?.scale?.[1]);
    const set = new Set([v]);
    let i=0; while(set.size<6 && i<40){ set.add(Math.max(1, v + Math.round((Math.random()*6)-3))); i++; }
    return shuffle([...set]).map((n,i)=>({ id:'nb_'+i, label:String(n), kind:'num', value:Number(n) }));
  },[problem?.id]);

  const onPickTopScale = (d)=>{
    if (step !== 4 && step !== 5) return;
    setTable(t=>{
      const expected = expectedScaleForRowUnit(t.uTop);
      if (expected == null || Number(d?.value) !== Number(expected)) { miss(4); return t; }
      const t2 = { ...t, sTop: Number(d.value) };
      if (t2.sBottom!=null){
        setDone(4); setDone(5); next();
      } else if (step===4){
        setDone(4); next();
      }
      return t2;
    });
  };

  const onPickBottomScale = (d)=>{
    if (step !== 4 && step !== 5) return;
    setTable(t=>{
      const expected = expectedScaleForRowUnit(t.uBottom);
      if (expected == null || Number(d?.value) !== Number(expected)) { miss(5); return t; }
      const t2 = { ...t, sBottom: Number(d.value) };
      if (t2.sTop!=null){
        setDone(4); setDone(5); next();
      } else if (step===5){
        setDone(5); next();
      }
      return t2;
    });
  };

  // Step 6: other value choices
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
    setTable(t=>({ ...t, pickedOther: Number(choice.value) }));
    setDone(6); next();
  };

  // Step 7: place other value in the correct row
  const placeOtherInTop = () => {
    if (step!==7) return;
    setTable(t => {
      const ok = rowIsGivenUnit(t.uTop);
      if (!ok){ miss(7); return t; }
      const t2 = { ...t, vTop: Number(t.pickedOther) };
      flash('vTop', ()=>{ setDone(7); next(); });
      return t2;
    });
  };
  const placeOtherInBottom = () => {
    if (step!==7) return;
    setTable(t => {
      const ok = rowIsGivenUnit(t.uBottom);
      if (!ok){ miss(7); return t; }
      const t2 = { ...t, vBottom: Number(t.pickedOther) };
      flash('vBottom', ()=>{ setDone(7); next(); });
      return t2;
    });
  };

  // Step 8: cross multiply selection
  const STEP8_CHOICES = useMemo(()=>[
    { id:'cm', label:'Cross Multiply', correct:true },
    { id:'add', label:'Add the numbers' },
    { id:'sub', label:'Subtract the numbers' },
    { id:'avg', label:'Average the numbers' },
  ],[]);
  const chooseStep8 = (c)=>{
    if (step!==8){ return; }
    if (!c?.correct){ miss(8); return; }
    setDone(8); next();
  };

  // Step 9: which numbers multiply (cross pair)
  const productPairs = useMemo(()=>{
    const pairs = [];
    if (table.vTop!=null && table.sBottom!=null){
      pairs.push({ id:'p1', a: table.vTop, b: table.sBottom, correct:true });
    }
    if (table.vBottom!=null && table.sTop!=null){
      pairs.push({ id:'p2', a: table.vBottom, b: table.sTop, correct:true });
    }
    // Wrong pairs (same-row or scale×scale)
    if (table.vTop!=null && table.sTop!=null){ pairs.push({ id:'w1', a: table.vTop, b: table.sTop }); }
    if (table.vBottom!=null && table.sBottom!=null){ pairs.push({ id:'w2', a: table.vBottom, b: table.sBottom }); }
    if (table.sTop!=null && table.sBottom!=null){ pairs.push({ id:'w3', a: table.sTop, b: table.sBottom }); }
    // Limit to 4; shuffle
    return shuffle(pairs).slice(0,4);
  },[table.vTop, table.vBottom, table.sTop, table.sBottom]);

  const chooseProductPair = (pair)=>{
    if (step!==9){ return; }
    if (!pair?.correct){ miss(9); return; }
    const t2 = { ...table, product: Number(pair.a) * Number(pair.b) };
    setTable(t2);
    flash('pairBlink', ()=>{ setDone(9); next(); });
  };

  // Step 10: divide by remaining scale
  const divideChoices = useMemo(()=>{
    let correctLabel = '';
    if (table.vTop!=null && table.sBottom!=null){ correctLabel = `Divide by ${table.sTop}`; } // used sBottom => divide by sTop
    if (table.vBottom!=null && table.sTop!=null){ correctLabel = `Divide by ${table.sBottom}`; } // used sTop => divide by sBottom
    const wrong = [
      'Divide by reciprocal',
      'Multiply by another value',
      'Multiply by another value (2)'
    ];
    const arr = [{ id:'d0', label: correctLabel, correct:true },
                 { id:'d1', label: wrong[0] },
                 { id:'d2', label: wrong[1] },
                 { id:'d3', label: wrong[2] }];
    return shuffle(arr);
  },[table.vTop, table.vBottom, table.sTop, table.sBottom]);

  const chooseDivide = (c)=>{
    if (step!==10){ return; }
    if (!c?.correct){ miss(10); return; }
    let divisor = null;
    if (table.vTop!=null && table.sBottom!=null){ divisor = table.sTop; }
    if (table.vBottom!=null && table.sTop!=null){ divisor = table.sBottom; }
    if (!divisor){ miss(10); return; }
    const result = Number(table.product) / Number(divisor);
    setTable(t=>({ ...t, divisor, result }));
    setDone(10); next();
  };

  // Step 11: calculate (finalize)
  const doCalculate = ()=>{
    if (step!==11){ return; }
    // Fill unknown cell based on which row had the given
    if (rowIsGivenUnit(table.uTop)){
      setTable(t=>({ ...t, vBottom: t.result, solvedRow: 'bottom' }));
    } else {
      setTable(t=>({ ...t, vTop: t.result, solvedRow: 'top' }));
    }
    setDone(11);
    setOpenSum(true);
    setConfettiOn(true);
    setTimeout(()=>setConfettiOn(false), 3500);
  };

  const newProblem = ()=>{
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
    setOpenSum(false);
    setConfettiOn(false);
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // UI
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <div className="container">
      <div className="panes">
        {/* LEFT: Problem + H-table */}
        <div className="card">
          <div className="section">
            <div className="step-title"><strong>Problem</strong></div>
            <div className="muted bigger">
              Given {String(problem?.given?.value)} {String(problem?.given?.row==='top' ? problem?.units?.[0] : problem?.units?.[1])}.
              Scale: {String(problem?.scale?.[0])} : {String(problem?.scale?.[1])}
            </div>
          </div>

          {step>=1 && (
            <div className="hwrap">
              <div className="hgrid">
                <div className="hhead">{table.head1 || <button className={`chip ${step===1 ? 'ptable-blink-hard blink-bg' : ''}`} onClick={()=>tapHeader1({v:'Units'})}>Units</button>}</div>
                <div className="hhead">{table.head2 || <button className={`chip ${step===2 ? 'ptable-blink-hard blink-bg' : ''}`} onClick={()=>tapHeader2({v:'ScaleNumbers'})}>Scale Numbers</button>}</div>
                <div className="hhead"><div className="hhead-text">Values</div></div>

                <div className={`hcell ${blinkKey==='unitsBlink' ? 'ptable-blink-hard blink-bg' : ''}`}>{table.uTop || '—'}</div>
                <div className={`hcell ${step===4 ? 'ptable-blink-hard blink-bg' : ''}`}>{table.sTop ?? '—'}</div>
                <div className="hcell">
                  {table.vTop ?? (step===7 ? <button className="button sm" onClick={placeOtherInTop}>Tap here</button> : '—')}
                </div>

                <div className={`hcell ${blinkKey==='unitsBlink' ? 'ptable-blink-hard blink-bg' : ''}`}>{table.uBottom || '—'}</div>
                <div className={`hcell ${step===5 ? 'ptable-blink-hard blink-bg' : ''}`}>{table.sBottom ?? '—'}</div>
                <div className="hcell">
                  {table.vBottom ?? (step===7 ? <button className="button sm" onClick={placeOtherInBottom}>Tap here</button> : '—')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Prompts */}
        <div className="card right-steps">
          <div className="step-title question-xl">{STEP_TITLES[step]}</div>

          {/* RIGHT-PANEL: STEP 0 – START */}
          {step===0 && (
            <div className="chips with-borders center mt-8">
              {STEP1_CHOICES.map((o, idx) => (
                <button key={o.id ?? idx} className="chip" onClick={()=>handleStep0(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 0 – END */}

          {/* RIGHT-PANEL: STEP 3 – START */}
          {step===3 && (
            <div className="chips with-borders center mt-8">
              {unitChoices.map((o, idx) => (
                <button key={o.id ?? idx} className="chip" onClick={()=>tapUnit(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 3 – END */}

          {/* RIGHT-PANEL: STEP 4 – START */}
          {step===4 && (
            <div className="chips with-borders center mt-8">
              {numbersTopScale.map((o, idx) => (
                <button key={o.id ?? idx} className="chip" onClick={()=>onPickTopScale(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 4 – END */}

          {/* RIGHT-PANEL: STEP 5 – START */}
          {step===5 && (
            <div className="chips with-borders center mt-8">
              {numbersBottomScale.map((o, idx) => (
                <button key={o.id ?? idx} className="chip" onClick={()=>onPickBottomScale(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 5 – END */}

          {/* RIGHT-PANEL: STEP 6 – START */}
          {step===6 && (
            <div className="chips with-borders center mt-8">
              {otherValueChoices.map((o, idx) => (
                <button key={o.id ?? idx} className="chip" onClick={()=>chooseOtherValue(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 6 – END */}

          {/* RIGHT-PANEL: STEP 8 – START */}
          {step===8 && (
            <div className="chips with-borders center mt-8">
              {STEP8_CHOICES.map((o, idx) => (
                <button key={o.id ?? idx} className="chip" onClick={()=>chooseStep8(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 8 – END */}

          {/* RIGHT-PANEL: STEP 9 – START */}
          {step===9 && (
            <div className="chips with-borders center mt-8">
              {productPairs.map((p, idx) => (
                <button key={p.id ?? idx} className="chip" onClick={()=>chooseProductPair(p)}>
                  {String(p.a)} × {String(p.b)}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 9 – END */}

          {/* RIGHT-PANEL: STEP 10 – START */}
          {step===10 && (
            <div className="chips with-borders center mt-8">
              {divideChoices.map((o, idx) => (
                <button key={o.id ?? idx} className="chip" onClick={()=>chooseDivide(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {/* RIGHT-PANEL: STEP 10 – END */}

          {/* RIGHT-PANEL: STEP 11 – START */}
          {step>=11 && (
            <div className="center mt-8">
              <button className="big-button" onClick={doCalculate}>Calculate</button>
            </div>
          )}
          {/* RIGHT-PANEL: STEP 11 – END */}
        </div>
      </div>

      {openSum && (
        <SummaryOverlay onClose={()=>setOpenSum(false)}>
          <div className="center mt-8">
            <button className="big-button" onClick={newProblem}>New Problem</button>
          </div>
        </SummaryOverlay>
      )}

      {confettiOn && (
        <div className="sf-confetti" aria-hidden="true"></div>
      )}
    </div>
  );
}
