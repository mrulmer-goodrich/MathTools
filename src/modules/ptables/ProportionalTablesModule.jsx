/* src/modules/ptables/ProportionalTablesModule.jsx — v7.4
   Ground rule: restore original 2‑pane feel, keep your global styles.
   This file is self-contained and *only* touches PTables behavior.
   - Chips are normalized: { type: "header"|"value", label: string, value?: number }
   - Headers accept only "header"; row slots accept only "value"
   - Tap‑first (tap chip → tap slot) with drag fallback preserved
   - Concept question appears only after header is correct AND all 3 k-values are computed & revealed
*/
import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import DraggableChip from "../../components/DraggableChip.jsx";
import DropSlot from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

// ------------------------------ persistence
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// ------------------------------ helpers
const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

function formatNumber(n){
  if (!Number.isFinite(n)) return "";
  const r = Math.round(n);
  if (Math.abs(n - r) < 1e-9) return String(r);
  // try small denom fractions → return mixed if denom <= 9
  for (let q=2; q<=9; q++){
    const p = Math.round(n*q);
    if (Math.abs(n - p/q) < 1e-6){
      const whole = Math.trunc(p/q);
      const num = Math.abs(p - whole*q);
      if (whole !== 0) return `${whole} ${num}/${q}`;
      return `${num}/${q}`;
    }
  }
  return (Math.round(n*10)/10).toFixed(1);
}

const shuffle = (arr) => { const a=[...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };

// ------------------------------ tap‑to‑place store
const pickStore = { v:null, set(x){this.v=x||null;}, peek(){return this.v;}, clear(){this.v=null;} };

// Wrap Draggable so tapping picks it up (desktop drag still works)
const Draggable = ({ data, children, onClick, ...rest }) => {
  const payload = data;
  const handleClick = (e) => { pickStore.set(payload); onClick?.(e); };
  return <DraggableChip data={payload} onClick={handleClick} role="button" tabIndex={0} {...rest}>{children}</DraggableChip>;
};

// Wrap DropSlot so tapping a slot places the picked chip if allowed
const Slot = ({ accept, onDropContent, validator, test, onClick, ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? "").toString();
    const okType = Array.isArray(accept) && accept.length ? accept.includes(t) : true;
    const okRule = typeof validator === "function" ? !!validator(d) : true;
    return okType && okRule;
  });
  const handleClick = (e) => {
    const picked = pickStore.peek();
    if (picked && testFn(picked)) { try{ onDropContent?.(picked); }catch{} pickStore.clear(); }
    onClick?.(e);
  };
  return <DropSlot test={testFn} onDropContent={onDropContent} onClick={handleClick} {...rest} />;
};

// ------------------------------ chip normalization
const ACCEPT_HEADER = ["header"];
const ACCEPT_VALUE  = ["value"];

const toChips = (problem) => {
  const sym = ["x","y","k"].map(s => ({ type:"header", label:s }));
  const vals = (problem?.values || []).map(n => ({ type:"value", label:String(n), value:Number(n) }));
  return [...sym, ...vals];
};

export default function ProportionalTablesModule(){
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));
  const [chips, setChips]     = useState(() => toChips(genPTable(difficulty)));

  // header state
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  // k = y/x scaffold
  const [numIsY, setNumIsY] = useState(false);
  const [denIsX, setDenIsX] = useState(false);
  const headerEqCorrect = kPlaced && numIsY && denIsX;

  // rows
  const [fractions, setFractions] = useState({}); // {i:{num,den}}
  const [kValues, setKValues]     = useState({}); // {i:number}
  const [reveal, setReveal]       = useState({}); // {i:boolean}
  const timersRef = useRef({});

  // persist difficulty
  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  // compute each row's k
  useEffect(() => {
    [0,1,2].forEach(i => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0){
        const kv = f.num / f.den;
        setKValues(prev => (prev[i] === kv ? prev : { ...prev, [i]: kv }));
      }
    });
  }, [fractions]);

  // reveal after short delay
  useEffect(() => {
    [0,1,2].forEach(i => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && Number.isFinite(kValues[i]) && !reveal[i]){
        if (timersRef.current[i]) clearTimeout(timersRef.current[i]);
        timersRef.current[i] = setTimeout(() => setReveal(prev => ({ ...prev, [i]: true })), 900);
      }
    });
  }, [fractions, kValues, reveal]);

  // cleanup
  useEffect(() => () => {
    Object.values(timersRef.current).forEach(t => clearTimeout(t));
    timersRef.current = {};
  }, []);

  const allRowsComputed = useMemo(() => [0,1,2].every(i => Number.isFinite(kValues[i])), [kValues]);
  const allRowsRevealed = useMemo(() => [0,1,2].every(i => Number.isFinite(kValues[i]) && reveal[i] === true), [kValues, reveal]);
  const ksEqual = useMemo(() => {
    const vals = [kValues[0], kValues[1], kValues[2]];
    if (vals.some(v => typeof v !== "number")) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  }, [kValues]);

  const randomizedConcept = useMemo(() =>
    shuffle([
      { key:"yes_same", label:"Yes, because k is the same" },
      { key:"no_diff",  label:"No, because k is NOT the same" },
      { key:"no_same",  label:"No, because k is the same" },
      { key:"yes_diff", label:"Yes, because k is NOT the same" },
    ])
  , [problem]);

  const [conceptAnswer, setConceptAnswer] = useState(null);
  const conceptEligible = headerEqCorrect && allRowsComputed && allRowsRevealed;
  const conceptCorrect = useMemo(() => {
    if (!conceptEligible || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  }, [conceptEligible, ksEqual, conceptAnswer]);

  const revealFourthRow = conceptCorrect && ksEqual === true;
  const [row4Answer, setRow4Answer] = useState(null);

  const resetAll = (next = difficulty) => {
    const p = genPTable(next);
    setProblem(p);
    setChips(toChips(p));
    setXPlaced(false); setYPlaced(false); setKPlaced(false);
    setNumIsY(false); setDenIsX(false);
    setFractions({}); setKValues({}); setReveal({});
    setConceptAnswer(null); setRow4Answer(null);
    Object.values(timersRef.current).forEach(t => clearTimeout(t));
    timersRef.current = {};
    pickStore.clear();
  };

  // ------------- UI Blocks
  const HeaderDrop = ({ placed, label, expect, onPlaced }) => (
    <Slot
      accept={ACCEPT_HEADER}
      onDropContent={(d) => {
        const got = (d?.label ?? "").toString().trim().toLowerCase();
        if (got === expect) onPlaced(true);
      }}
      className={`ptable-thslot ${placed ? "placed" : "empty"}`}
      aria-label={placed ? label : `place ${expect}`}
    >
      {placed ? label : <span className="visually-hidden">slot</span>}
    </Slot>
  );

  const HeaderEqArea = () => {
    if (!kPlaced) return null;
    return (
      <div className="ptable-header-eq">
        <div className="ptable-eq-row nowrap">
          <div className="badge">k</div>
          <span className="calc-inline">=</span>
          <div className="fraction mini-frac" aria-label="k equals y over x">
            <Slot accept={ACCEPT_HEADER} onDropContent={(d)=>{ if ((d?.label||'').toLowerCase()==='y') setNumIsY(true); }} className={`slot ptable-fracslot tiny ${numIsY?'filled':''}`}>
              {numIsY ? <span className="chip chip-tiny">y</span> : <span className="muted">—</span>}
            </Slot>
            <div className="frac-bar narrow" />
            <Slot accept={ACCEPT_HEADER} onDropContent={(d)=>{ if ((d?.label||'').toLowerCase()==='x') setDenIsX(true); }} className={`slot ptable-fracslot tiny ${denIsX?'filled':''}`}>
              {denIsX ? <span className="chip chip-tiny">x</span> : <span className="muted">—</span>}
            </Slot>
          </div>
        </div>
      </div>
    );
  };

  const KRevealOverlay = () => {
    if (kPlaced) return null;
    return (
      <div className="ptable-k-overlay" aria-hidden="true">
        <Slot accept={ACCEPT_HEADER} onDropContent={(d)=>{ if ((d?.label||'').toLowerCase()==='k') setKPlaced(true); }} className="ptable-k-target" />
      </div>
    );
  };

  const Table = useMemo(() => {
    const invis = !kPlaced ? "col3-invisible" : "";
    return (
      <div className="ptable-wrap">
        <div className={`ptable-rel ptable-table ${invis}`}>
          <KRevealOverlay />
          <table className="ptable" style={{ tableLayout:"fixed" }}>
            <colgroup>
              <col style={{ width:"25%" }}/>
              <col style={{ width:"25%" }}/>
              <col style={{ width:"50%" }}/>
            </colgroup>
            <thead>
              <tr>
                <th><HeaderDrop placed={xPlaced} label="x" expect="x" onPlaced={setXPlaced} /></th>
                <th><HeaderDrop placed={yPlaced} label="y" expect="y" onPlaced={setYPlaced} /></th>
                <th>
                  <div className="hhead-text">k</div>
                  <HeaderEqArea />
                </th>
              </tr>
            </thead>
            <tbody>
              {[0,1,2].map(i => (
                <tr key={i}>
                  <td>
                    <Slot accept={ACCEPT_VALUE} onDropContent={(d)=> setFractions(prev => ({ ...prev, [i]: { ...(prev[i]||{}), num: Number(d?.value ?? d?.label) } }))} className="slot ptable-fracslot">
                      {fractions[i]?.num ?? <span className="muted">—</span>}
                    </Slot>
                  </td>
                  <td>
                    <Slot accept={ACCEPT_VALUE} onDropContent={(d)=> setFractions(prev => ({ ...prev, [i]: { ...(prev[i]||{}), den: Number(d?.value ?? d?.label) } }))} className="slot ptable-fracslot">
                      {fractions[i]?.den ?? <span className="muted">—</span>}
                    </Slot>
                  </td>
                  <td>
                    {reveal[i] && Number.isFinite(kValues[i]) ? (
                      <div className="calc-inline">= <b>{formatNumber(kValues[i])}</b></div>
                    ) : <span className="muted">…</span>}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  {revealFourthRow ? <div className="calc-inline">Use k to find the missing value.</div> : <span className="muted">—</span>}
                </td>
                <td>
                  {revealFourthRow ? (
                    <div className="row" style={{ justifyContent:"center", gap:10 }}>
                      {["× k","÷ k"].map((label,idx)=>{
                        const val = idx===0 ? "mul" : "div";
                        return <button key={val} className={`button ${row4Answer===val?"active":""}`} onClick={()=> setRow4Answer(val)}>{label}</button>;
                      })}
                    </div>
                  ) : <span className="muted">—</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [kPlaced, xPlaced, yPlaced, fractions, kValues, reveal, revealFourthRow, row4Answer]);

  const ChipsLeft = () => (
    <div className="row" style={{ justifyContent:"center", flexWrap:"wrap", gap:12 }}>
      {chips.map((c, idx) => (
        <Draggable key={idx} data={c} className="chip">{c.label}</Draggable>
      ))}
    </div>
  );

  const Concept = () => {
    if (!conceptEligible) return null;
    return (
      <div className="section">
        <div className="step-title">Is the table proportional?</div>
        <div className="row" style={{ justifyContent:"center", gap:12, flexWrap:"wrap", maxWidth:520, margin:"0 auto" }}>
          {randomizedConcept.map((opt) => (
            <button key={opt.key} className={`button ${conceptAnswer===opt.key?"active":""}`} onClick={() => setConceptAnswer(opt.key)} style={{ width: 240 }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const Controls = () => (
    <div className="row" style={{ justifyContent:"center", gap:12 }}>
      <div className="press">
        <BigButton onClick={() => resetAll(difficulty)} label="New Problem" />
      </div>
      <select aria-label="difficulty" value={difficulty} onChange={(e)=> resetAll(e.target.value)} className="button">
        <option value="easy">easy</option>
        <option value="medium">medium</option>
        <option value="hard">hard</option>
      </select>
    </div>
  );

  return (
    <div className="ptables">
      <div className="container">
        <Controls />
        <div className="panes">
          <div className="card">
            <div className="step-title">Chips</div>
            <ChipsLeft />
          </div>
          <div className="card">
            {Table}
            <Concept />
          </div>
        </div>
      </div>
    </div>
  );
}
