// src/modules/ptables/ProportionalTablesModule.jsx — TAP-first full replace (v4.0)
/*
  Goals from product owner (Sept 29, 2025):
  - TAP-first UX with drag fallback (Chromebooks/iPad friendly)
  - Lowercase x/y/k everywhere (no sneaky auto-caps)
  - Clear “What goes here?” prompts; blinking targets
  - Keep stacked fractions; no "/" displays; consistent bar width
  - Numbers: format nicely (whole → 6; small-denom fraction → mixed number; else → one decimal)
  - Hide old summary/checkmark logic
  - Concept question 2×2 layout; allow non-proportional sometimes (target ~33%)
  - Keep module self-contained, do not break shared components (DraggableChip, DropSlot)
*/

import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import DraggableBase from "../../components/DraggableChip.jsx";
import DropSlotBase from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

// ============ Persistence for difficulty only ============
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// ============ Helpers ============
const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const nameOf = (d) => d?.name ?? d?.label ?? d?.value;

// Number formatting per spec:
// - If whole: show integer "6"
// - If reducible small fraction with denominator < 10: show as mixed number "1 3/4"
// - Else: round to 1 decimal place
function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a||1; }
function toMixed(n){
  if (!Number.isFinite(n)) return "";
  // whole number
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  // try small fraction fit
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  const whole = Math.floor(abs);
  const frac = abs - whole;
  // approximate denominator up to 9
  let best = {num: Math.round(frac*10), den: 10, err: 1e9};
  for(let den=2; den<=9; den++){
    const num = Math.round(frac * den);
    const err = Math.abs(frac - num/den);
    if (err < best.err){ best = {num, den, err}; }
  }
  if (best.den < 10){
    // reduce fraction
    const g = gcd(best.num, best.den);
    const rn = best.num/g, rd = best.den/g;
    if (rn === 0) return String(sign*whole);
    if (whole === 0) return (sign<0? "-": "") + `${rn}/${rd}`;
    return (sign<0? "-": "") + `${whole} ${rn}/${rd}`;
  }
  // fallback: 1 decimal
  return (Math.round(n*10)/10).toFixed(1);
}
const fmt = (n) => toMixed(n);

// Shuffle
function shuffle(a){ const arr=[...a]; for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]} return arr; }

// Tap-pick store (module-local) for drag fallback compatibility
const _pickStore = {
  data: null,
  set(d){ this.data = d || null; },
  peek(){ return this.data; },
  clear(){ this.data = null; }
};

// Draggable wrapper: keep drag for desktop; onClick = pick for fallback
const Draggable = ({ payload, data, onClick, ...rest }) => {
  const merged = data ?? payload ?? undefined;
  const handleClick = (e) => { _pickStore.set(merged); onClick?.(e); };
  return <DraggableBase data={merged} onClick={handleClick} role="button" tabIndex={0} {...rest} />;
};

// DropSlot wrapper: keep test/validator; also let slot handle a tap-drop of picked chip
const Slot = ({ accept, onDrop, validator, test, onDropContent, onClick, ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length>0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });
  const onDropContentFn = onDropContent ?? onDrop;
  const handleClick = (e) => {
    const picked = _pickStore.peek();
    if (picked && testFn(picked)) {
      try { onDropContentFn?.(picked); } catch {}
      _pickStore.clear();
    }
    onClick?.(e);
  };
  return <DropSlotBase test={testFn} onDropContent={onDropContentFn} onClick={handleClick} {...rest} />;
};

// Accept types
const ACCEPT_HEADER = ["chip","sym","symbol","header"];
const ACCEPT_VALUE  = ["value","number"];

// ============ Component ============
export default function ProportionalTablesModule(){
  // difficulty & problem
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));

  // Lowercase controls (enforce x/y/k)
  const labelX = "x";
  const labelY = "y";
  const labelK = "k";

  // header placements
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  // header fraction (k = y/x)
  const [numIsY, setNumIsY] = useState(false);
  const [denIsX, setDenIsX] = useState(false);
  const headerEqCorrect = kPlaced && numIsY && denIsX;

  // per-row fraction inputs & computed k values
  const [fractions, setFractions] = useState({}); // {rowIndex:{num,den}}
  const [kValues, setKValues] = useState({});     // {rowIndex:number}
  const [reveal, setReveal] = useState({});       // {rowIndex:boolean}
  const revealTimers = useRef({});

  // concept MCQ
  const [conceptAnswer, setConceptAnswer] = useState(null);

  // fourth row
  const [row4Answer, setRow4Answer] = useState(null);

  // TAP prompts
  const [prompt, setPrompt] = useState(null); // { target:'header-x'|'header-y'|'header-k'|'frac-num'|'frac-den'|'row-num'|'row-den'|'concept'|'solve', idx?:number, choices:[{key,label,action}] }

  // persist difficulty only
  useEffect(()=>{ saveDifficulty(difficulty); },[difficulty]);

  // teardown timers
  useEffect(()=>()=>{
    Object.values(revealTimers.current).forEach((t)=>clearTimeout(t));
    revealTimers.current = {};
  },[]);

  // reset
  const resetAll = (nextDiff = difficulty) => {
    const next = genPTable(nextDiff);
    setProblem(next);
    setXPlaced(false); setYPlaced(false); setKPlaced(false);
    setNumIsY(false); setDenIsX(false);
    setFractions({}); setKValues({}); setReveal({});
    setConceptAnswer(null); setRow4Answer(null);
    Object.values(revealTimers.current).forEach((t)=>clearTimeout(t));
    revealTimers.current = {};
    // Start TAP flow at header x
    queuePromptHeaderX();
  };

  // ---------- helpers: TAP prompts ----------
  const queuePrompt = (cfg)=> setPrompt(cfg);

  const queuePromptHeaderX = ()=>{
    queuePrompt({
      target:'header-x',
      choices: shuffle([
        { key:'x',    label:'x',    action: ()=> setXPlaced(true) },
        { key:'y',    label:'y',    action: ()=> {/*wrong*/} },
        { key:'k',    label:'k',    action: ()=> {/*wrong*/} },
        { key:'mis',  label:'m',    action: ()=> {/*wrong*/} },
      ])
    });
  };
  const queuePromptHeaderY = ()=>{
    queuePrompt({
      target:'header-y',
      choices: shuffle([
        { key:'y',    label:'y',    action: ()=> setYPlaced(true) },
        { key:'x',    label:'x',    action: ()=> {} },
        { key:'k',    label:'k',    action: ()=> {} },
        { key:'z',    label:'z',    action: ()=> {} },
      ])
    });
  };
  const queuePromptHeaderK = ()=>{
    queuePrompt({
      target:'header-k',
      choices: shuffle([
        { key:'k',    label:'k',    action: ()=> setKPlaced(true) },
        { key:'x',    label:'x',    action: ()=> {} },
        { key:'y',    label:'y',    action: ()=> {} },
        { key:'g',    label:'g',    action: ()=> {} },
      ])
    });
  };

  const queuePromptHeaderEqNum = ()=>{
    queuePrompt({
      target:'eq-num',
      choices: shuffle([
        { key:'y', label:'y', action: ()=> setNumIsY(true) },
        { key:'x', label:'x', action: ()=> {} },
        { key:'k', label:'k', action: ()=> {} },
        { key:'d', label:'7', action: ()=> {} },
      ])
    });
  };
  const queuePromptHeaderEqDen = ()=>{
    queuePrompt({
      target:'eq-den',
      choices: shuffle([
        { key:'x', label:'x', action: ()=> setDenIsX(true) },
        { key:'y', label:'y', action: ()=> {} },
        { key:'k', label:'k', action: ()=> {} },
        { key:'d', label:'9', action: ()=> {} },
      ])
    });
  };

  // ---------- effects to advance TAP flow ----------
  useEffect(()=>{
    // on first mount, start prompts if empty
    if (!xPlaced && !yPlaced && !kPlaced && !prompt) queuePromptHeaderX();
  },[]);

  useEffect(()=>{
    if (prompt?.target==='header-x' && xPlaced){ queuePromptHeaderY(); }
  },[xPlaced]);
  useEffect(()=>{
    if (prompt?.target==='header-y' && yPlaced){ queuePromptHeaderK(); }
  },[yPlaced]);
  useEffect(()=>{
    if (prompt?.target==='header-k' && kPlaced){ queuePromptHeaderEqNum(); }
  },[kPlaced]);
  useEffect(()=>{
    if (prompt?.target==='eq-num' && numIsY){ queuePromptHeaderEqDen(); }
  },[numIsY]);
  useEffect(()=>{
    if (prompt?.target==='eq-den' && denIsX){ setPrompt(null); }
  },[denIsX]);

  // ---------- compute row k when both numerator & denominator exist ----------
  useEffect(()=>{
    [0,1,2].forEach((i)=>{
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0){
        const kv = f.num / f.den;
        setKValues((prev)=> (prev[i]===kv ? prev : { ...prev, [i]: kv }));
      }
    });
  },[fractions]);

  // reveal "= value" after 1.2s once both present
  useEffect(()=>{
    [0,1,2].forEach((i)=>{
      const f = fractions[i];
      if (f?.num != null && f?.den != null && Number.isFinite(kValues[i]) && !reveal[i]){
        if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
        revealTimers.current[i] = setTimeout(()=>{
          setReveal((prev)=> ({ ...prev, [i]: true }));
        }, 1200);
      }
    });
  },[fractions, kValues, reveal]);

  const calcRow = (i)=>{
    const f = fractions[i];
    if (!f || f.den == null || f.num == null || f.den === 0) return;
    setKValues((prev)=> ({ ...prev, [i]: f.num / f.den }));
  };
  const calcAll = ()=> [0,1,2].forEach(calcRow);

  // row drop handler with strict validation (row + axis)
  const onRowDrop = (i, part, d)=>{
    if (!d || !ACCEPT_VALUE.includes(d.type)) return;
    if (d.row !== i) return;
    if (part === "num" && d.axis !== "y") return;
    if (part === "den" && d.axis !== "x") return;
    const val = Number(d.value ?? nameOf(d));
    if (!Number.isFinite(val)) return;

    if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
    setReveal((prev)=>({ ...prev, [i]: false }));

    setFractions((prev)=> ({ ...prev, [i]: { ...(prev[i]||{}), [part]: val } }));
  };

  // TAP helper to place numbers without drag
  const tapPlaceRow = (i, part, val)=>{
    if (!Number.isFinite(val)) return;
    if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
    setReveal((prev)=>({ ...prev, [i]: false }));
    setFractions((prev)=> ({ ...prev, [i]: { ...(prev[i]||{}), [part]: val } }));
  };

  const allRowsComputed = useMemo(()=> [0,1,2].every(i=> {
    const f = fractions[i];
    return f?.num != null && f?.den != null && Number.isFinite(kValues[i]);
  }),[fractions,kValues]);

  const allRowsRevealed = useMemo(()=> [0,1,2].every(i=> Number.isFinite(kValues[i]) && reveal[i]===true),[kValues,reveal]);

  const ksEqual = useMemo(()=>{
    const vals = [kValues[0], kValues[1], kValues[2]];
    if (vals.some(v=> typeof v !== "number")) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  },[kValues]);

  const conceptChoices = useMemo(()=> shuffle([
    { key:"yes_same", label:"Yes, because k is the same" },
    { key:"no_diff",  label:"No, because k is NOT the same" },
    { key:"yes_diff", label:"Yes, because k is NOT the same" },
    { key:"no_same",  label:"No, because k is the same" },
  ]),[problem]);

  const conceptCorrect = useMemo(()=>{
    if (!allRowsComputed || ksEqual == null || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  },[allRowsComputed, ksEqual, conceptAnswer]);

  // fourth row (only if proportional & concept correct)
  const revealFourthRow = conceptCorrect && ksEqual === true;
  const solveRow4 = ()=>{
    if (!revealFourthRow || !problem.revealRow4) return;
    setRow4Answer(kValues[0] * problem.revealRow4.x);
  };

  // step gating
  const currentStep = useMemo(()=>{
    if (!xPlaced || !yPlaced || !kPlaced) return "label";
    if (!headerEqCorrect) return "build";
    if (!allRowsRevealed) return "fill";
    if (!conceptCorrect) return "concept";
    return "solve";
  },[xPlaced,yPlaced,kPlaced,headerEqCorrect,allRowsRevealed,conceptCorrect]);

  // Header drops — lower-case compare
  const HeaderDrop = ({ placed, label, expectName, onPlaced }) => (
    <Slot
      accept={ACCEPT_HEADER}
      onDrop={(d)=>{
        const got = (nameOf(d) ?? "").toString().trim().toLowerCase();
        const want = (expectName ?? "").toString().trim().toLowerCase();
        if (got === want) onPlaced(true);
      }}
      className={`ptable-thslot ${placed ? "placed" : "empty"} ${prompt?.target===`header-${expectName}` ? "blink" : ""}`}
    >
      {placed ? label : ""}
    </Slot>
  );

  const HeaderEqArea = ()=>{
    if (!kPlaced) return null;
    return (
      <div className="ptable-header-eq">
        <div className="ptable-eq-row nowrap">
          <div className="badge">{labelK}</div>
          <span>=</span>
          <div className="fraction mini-frac" aria-label="k equals y over x">
            <Slot
              accept={ACCEPT_HEADER}
              onDrop={(d)=>{ const got=(nameOf(d)||"").toString().trim().toLowerCase(); if (got === labelY) setNumIsY(true); }}
              className={`slot ptable-fracslot tiny ${numIsY ? "filled" : ""} ${prompt?.target==='eq-num' ? 'blink':''}`}
            >
              {numIsY ? <span className="chip chip-tiny">{labelY}</span> : <span className="muted">—</span>}
            </Slot>
            <div className="frac-bar narrow" />
            <Slot
              accept={ACCEPT_HEADER}
              onDrop={(d)=>{ const got=(nameOf(d)||"").toString().trim().toLowerCase(); if (got === labelX) setDenIsX(true); }}
              className={`slot ptable-fracslot tiny ${denIsX ? "filled" : ""} ${prompt?.target==='eq-den' ? 'blink':''}`}
            >
              {denIsX ? <span className="chip chip-tiny">{labelX}</span> : <span className="muted">—</span>}
            </Slot>
          </div>
        </div>
      </div>
    );
  };

  const RowFrac = ({i})=>{
    const f = fractions[i] || {};
    return (
      <div className="fraction mini-frac">
        <Slot
          test={(d)=> d?.type==='value' && d.row===i && d.axis==='y'}
          onDropContent={(d)=> onRowDrop(i,'num',d)}
          className={`slot ptable-fracslot tiny ${f.num!=null ? 'filled':''} ${currentStep==='fill' && !f.num ? 'blink':''}`}
        >
          {f.num!=null ? <span className="chip chip-tiny">{String(f.num)}</span> : <span className="muted">—</span>}
        </Slot>
        <div className="frac-bar narrow" />
        <Slot
          test={(d)=> d?.type==='value' && d.row===i && d.axis==='x'}
          onDropContent={(d)=> onRowDrop(i,'den',d)}
          className={`slot ptable-fracslot tiny ${f.den!=null ? 'filled':''} ${currentStep==='fill' && !f.den ? 'blink':''}`}
        >
          {f.den!=null ? <span className="chip chip-tiny">{String(f.den)}</span> : <span className="muted">—</span>}
        </Slot>
        <span className="ml-8 muted">=</span>
        <span className="ml-8">{ Number.isFinite(kValues[i]) && reveal[i] ? <b>{fmt(kValues[i])}</b> : <span className="muted">…</span> }</span>
      </div>
    );
  };

  // ---------- UI ----------
  return (
    <div className="module ptable-module">
      {/* Top bar minimal (home + difficulty + new) */}
      <div className="topbar slim">
        <a className="button" href="/">Home</a>
        <div className="spacer" />
        <div className="row gap-8">
          <label className="muted small">Difficulty</label>
          <select value={difficulty} onChange={(e)=> resetAll(e.target.value)}>
            <option value="easy">easy</option>
            <option value="med">med</option>
            <option value="hard">hard</option>
          </select>
          <BigButton onClick={()=> resetAll()} className="big-button">New Problem</BigButton>
        </div>
      </div>

      {/* Single card layout (exec decision): one wide card to reduce cramped dual-pane */}
      <div className="card ptable-card">
        {/* Headers row */}
        <div className="ptable-grid header">
          <HeaderDrop placed={xPlaced} label={labelX} expectName={labelX} onPlaced={()=> setXPlaced(true)} />
          <HeaderDrop placed={yPlaced} label={labelY} expectName={labelY} onPlaced={()=> setYPlaced(true)} />
          <HeaderDrop placed={kPlaced} label={labelK} expectName={labelK} onPlaced={()=> setKPlaced(true)} />
        </div>

        {/* Equation under K */}
        <HeaderEqArea />

        {/* Data rows (3) */}
        <div className="ptable-rows">
          {[0,1,2].map((i)=>(
            <div className="ptable-row" key={i}>
              <div className="ptable-row-label muted small">row {i+1}</div>
              <RowFrac i={i} />
            </div>
          ))}
        </div>

        {/* Concept */}
        {currentStep!=="solve" && (
          <div className="ptable-concept">
            <div className="muted">Is the table proportional?</div>
            <div className="grid-2x2">
              {conceptChoices.map((c)=>(
                <button
                  key={c.key}
                  className={`choice ${conceptAnswer===c.key?'selected':''}`}
                  onClick={()=> setConceptAnswer(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {!conceptCorrect && conceptAnswer && <div className="muted small mt-8">Try again.</div>}
          </div>
        )}

        {/* Solve 4th row (visual arrow + ×k) */}
        {currentStep==="solve" && (
          <div className="ptable-solve">
            <div className="muted">Use k to find the missing value:</div>
            <div className="solve-strip">
              <span>multiply by</span>
              <span className="pill kpill">{labelK} = {fmt(kValues[0] ?? 0)}</span>
              <button className="button primary" onClick={solveRow4}>Compute</button>
              {Number.isFinite(row4Answer) && <span className="result"><b>{fmt(row4Answer)}</b></span>}
            </div>
          </div>
        )}
      </div>

      {/* TAP choice panel (appears only during prompts) */}
      {prompt && (
        <div className="tap-panel card">
          <div className="muted">What goes here?</div>
          <div className="choices-row">
            {prompt.choices.map((ch,i)=>(
              <button key={i} className="chip chip-lg" onClick={()=>{
                ch.action?.();
                // After a correct pick, clear prompt (the step effects will queue next)
                setTimeout(()=> setPrompt(null), 120);
              }}>{ch.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
