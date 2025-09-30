// src/modules/ptables/ProportionalTablesModule.jsx — TAP-first full replace (v5)
/*
  Changes vs v4:
  - Remove module-level topbar; rely on global nav from App.jsx
  - Strict CSS scoping to `.ptable-module` to avoid collisions
  - Stronger visual targets for header slots; clearer fraction sizing/alignment
  - Keep tap-first with drag fallback; lowercase x/y/k enforced
  - Concept answers always 2×2; value formatting per spec
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

// Number formatting per spec
function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a||1; }
function toMixed(n){
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  const whole = Math.floor(abs);
  const frac = abs - whole;
  let best = {num: round(frac*10), den: 10, err: 1e9};
  for(let den=2; den<=9; den++){
    const num = round(frac * den);
    const err = Math.abs(frac - num/den);
    if (err < best.err){ best = {num, den, err}; }
  }
  if (best.den < 10){
    const g = gcd(best.num, best.den);
    const rn = best.num/g, rd = best.den/g;
    if (rn === 0) return String(sign*whole);
    if (whole === 0) return (sign<0? "-": "") + `${rn}/${rd}`;
    return (sign<0? "-": "") + `${whole} ${rn}/${rd}`;
  }
  return (Math.round(n*10)/10).toFixed(1);
}
const round = (n)=> Math.round(n);
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

// DropSlot wrapper: keep validator; also support tap-drop of picked chip
const Slot = ({ accept, onDrop, validator, test, onDropContent, onClick, className="", ...rest }) => {
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
  return <DropSlotBase test={testFn} onDropContent={onDropContentFn} onClick={handleClick} className={className} {...rest} />;
};

// Accept types
const ACCEPT_HEADER = ["chip","sym","symbol","header"];
const ACCEPT_VALUE  = ["value","number"];

// ============ Component ============
export default function ProportionalTablesModule(){
  // difficulty & problem
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));

  // controls
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
  const [prompt, setPrompt] = useState(null);

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
    queuePromptHeaderX();
  };

  // ---------- prompts ----------
  const queuePrompt = (cfg)=> setPrompt(cfg);

  const queuePromptHeaderX = ()=>{
    queuePrompt({
      target:'header-x',
      choices: shuffle([
        { key:'x',    label:'x',    action: ()=> setXPlaced(true) },
        { key:'y',    label:'y',    action: ()=> {} },
        { key:'k',    label:'k',    action: ()=> {} },
        { key:'m',    label:'m',    action: ()=> {} },
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
        { key:'7', label:'7', action: ()=> {} },
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
        { key:'9', label:'9', action: ()=> {} },
      ])
    });
  };

  // advance flow
  useEffect(()=>{ if (!xPlaced && !yPlaced && !kPlaced && !prompt) queuePromptHeaderX(); },[]);
  useEffect(()=>{ if (prompt?.target==='header-x' && xPlaced){ queuePromptHeaderY(); } },[xPlaced]);
  useEffect(()=>{ if (prompt?.target==='header-y' && yPlaced){ queuePromptHeaderK(); } },[yPlaced]);
  useEffect(()=>{ if (prompt?.target==='header-k' && kPlaced){ queuePromptHeaderEqNum(); } },[kPlaced]);
  useEffect(()=>{ if (prompt?.target==='eq-num' && numIsY){ queuePromptHeaderEqDen(); } },[numIsY]);
  useEffect(()=>{ if (prompt?.target==='eq-den' && denIsX){ setPrompt(null); } },[denIsX]);

  // compute k per row
  useEffect(()=>{
    [0,1,2].forEach((i)=>{
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0){
        const kv = f.num / f.den;
        setKValues((prev)=> (prev[i]===kv ? prev : { ...prev, [i]: kv }));
      }
    });
  },[fractions]);

  // reveal "= value" after short delay
  useEffect(()=>{
    [0,1,2].forEach((i)=>{
      const f = fractions[i];
      if (f?.num != null && f?.den != null && Number.isFinite(kValues[i]) && !reveal[i]){
        if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
        revealTimers.current[i] = setTimeout(()=>{
          setReveal((prev)=> ({ ...prev, [i]: true }));
        }, 900);
      }
    });
  },[fractions, kValues, reveal]);

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

  const revealFourthRow = conceptCorrect && ksEqual === true;
  const row4k = kValues[0];

  // ---------- UI ----------
  return (
    <div className="module ptable-module">
      {/* Use global top nav; keep only module content here */}

      <div className="card ptable-card">
        {/* Headers */}
        <div className="ptable-grid header">
          <Slot
            accept={ACCEPT_HEADER}
            onDrop={(d)=>{ const got=(nameOf(d)||"").toString().trim().toLowerCase(); if (got === labelX) setXPlaced(true); }}
            className={`ptable-thslot ${xPlaced ? "placed" : "empty"} ${(!xPlaced && !yPlaced && !kPlaced) ? "blink": ""}`}
          >{xPlaced ? labelX : ""}</Slot>

          <Slot
            accept={ACCEPT_HEADER}
            onDrop={(d)=>{ const got=(nameOf(d)||"").toString().trim().toLowerCase(); if (got === labelY) setYPlaced(true); }}
            className={`ptable-thslot ${yPlaced ? "placed" : "empty"} ${xPlaced && !yPlaced ? "blink": ""}`}
          >{yPlaced ? labelY : ""}</Slot>

          <Slot
            accept={ACCEPT_HEADER}
            onDrop={(d)=>{ const got=(nameOf(d)||"").toString().trim().toLowerCase(); if (got === labelK) setKPlaced(true); }}
            className={`ptable-thslot ${kPlaced ? "placed" : "empty"} ${xPlaced && yPlaced && !kPlaced ? "blink": ""}`}
          >{kPlaced ? labelK : ""}</Slot>
        </div>

        {/* Equation under K */}
        {kPlaced && (
          <div className="ptable-header-eq">
            <div className="ptable-eq-row nowrap">
              <div className="badge">{labelK}</div>
              <span className="eq">=</span>
              <div className="fraction mini-frac" aria-label="k equals y over x">
                <Slot
                  accept={ACCEPT_HEADER}
                  onDrop={(d)=>{ const got=(nameOf(d)||"").toString().trim().toLowerCase(); if (got === labelY) setNumIsY(true); }}
                  className={`slot ptable-fracslot tiny ${numIsY ? "filled" : ""} ${(!numIsY) ? 'blink':''}`}
                >
                  {numIsY ? <span className="chip chip-tiny">{labelY}</span> : <span className="muted">—</span>}
                </Slot>
                <div className="frac-bar narrow" />
                <Slot
                  accept={ACCEPT_HEADER}
                  onDrop={(d)=>{ const got=(nameOf(d)||"").toString().trim().toLowerCase(); if (got === labelX) setDenIsX(true); }}
                  className={`slot ptable-fracslot tiny ${denIsX ? "filled" : ""} ${numIsY && !denIsX ? 'blink':''}`}
                >
                  {denIsX ? <span className="chip chip-tiny">{labelX}</span> : <span className="muted">—</span>}
                </Slot>
              </div>
            </div>
          </div>
        )}

        {/* Data rows */}
        <div className="ptable-rows">
          {[0,1,2].map((i)=>(
            <div className="ptable-row" key={i}>
              <div className="ptable-row-label">row {i+1}</div>
              <div className="fraction mini-frac">
                <Slot
                  test={(d)=> d?.type==='value' && d.row===i && d.axis==='y'}
                  onDropContent={(d)=> onRowDrop(i,'num',d)}
                  className={`slot ptable-fracslot tiny ${fractions[i]?.num!=null ? 'filled':''} ${headerEqCorrect && !fractions[i]?.num ? 'blink':''}`}
                >
                  {fractions[i]?.num!=null ? <span className="chip chip-tiny">{String(fractions[i].num)}</span> : <span className="muted">—</span>}
                </Slot>
                <div className="frac-bar narrow" />
                <Slot
                  test={(d)=> d?.type==='value' && d.row===i && d.axis==='x'}
                  onDropContent={(d)=> onRowDrop(i,'den',d)}
                  className={`slot ptable-fracslot tiny ${fractions[i]?.den!=null ? 'filled':''} ${fractions[i]?.num!=null && !fractions[i]?.den ? 'blink':''}`}
                >
                  {fractions[i]?.den!=null ? <span className="chip chip-tiny">{String(fractions[i].den)}</span> : <span className="muted">—</span>}
                </Slot>
                <span className="eq ml-8">=</span>
                <span className="ml-8">{ Number.isFinite(kValues[i]) && reveal[i] ? <b>{fmt(kValues[i])}</b> : <span className="muted">…</span> }</span>
              </div>
            </div>
          ))}
        </div>

        {/* Concept */}
        {allRowsRevealed && (
          <div className="ptable-concept">
            <div className="muted">Is the table proportional?</div>
            <div className="ptable-grid-2x2">
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

        {/* Solve 4th row (only if concept correct and proportional) */}
        {conceptCorrect && ksEqual && (
          <div className="ptable-solve">
            <div className="muted">Use k to find the missing value:</div>
            <div className="solve-strip">
              <span>multiply by</span>
              <span className="pill kpill">{labelK} = {fmt(row4k ?? 0)}</span>
              <BigButton onClick={()=> setRow4Answer((row4k ?? 0) * (problem?.revealRow4?.x ?? 0))}>Compute</BigButton>
              {Number.isFinite(row4Answer) && <span className="result"><b>{fmt(row4Answer)}</b></span>}
            </div>
          </div>
        )}
      </div>

      {/* TAP choice panel */}
      {prompt && (
        <div className="tap-panel card">
          <div className="muted">What goes here?</div>
          <div className="choices-row">
            {prompt.choices.map((ch,i)=>(
              <button key={i} className="chip chip-lg" onClick={()=>{
                ch.action?.();
                setTimeout(()=> setPrompt(null), 120);
              }}>{ch.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
