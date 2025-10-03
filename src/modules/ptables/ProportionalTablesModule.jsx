// src/modules/ptables/ProportionalTablesModule.jsx — v8.2.7
// Changes vs 8.2.6:
// - Confetti: add singleton guard + cooldown to prevent double/continuous drops across modules.
// - No logic flow changes for steps. Blink wrapper kept as in 8.2.6.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import DraggableBase from "../../components/DraggableChip.jsx";
import DropSlotBase from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);
const nameOf = (d) => d?.name ?? d?.label ?? d?.value;
const fmt = (n) => (Number.isFinite(n) ? (Math.round(n * 1000) / 1000).toString() : "");
const shuffle = (arr) => { const a = [...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ⬇️ Guarded confetti to avoid duplicates from parallel modules
function multiBurstConfetti() {

// v8.3.0: auto-stop PTables confetti after a short celebration
if (!window.__ptableConfettiStopper) {
  window.__ptableConfettiStopper = true;
  setTimeout(() => {
    const host = document.querySelector('.sf-confetti,.confetti-fullpage');
    if (host && host.parentNode) host.parentNode.removeChild(host);
    window.__ptableConfettiStopper = false;
  }, 3000);
}

  if (typeof window === "undefined") return;

  const now = Date.now();
  const last = window.__ptableConfettiLast || 0;
  if (now - last < 2500) { return; }           // cooldown (2.5s) to prevent back-to-back runs
  window.__ptableConfettiLast = now;

  const c = window.confetti || window.canvasConfetti;
  if (c) {
    const origins = [{x:0.15,y:0.15},{x:0.5,y:0.15},{x:0.85,y:0.15},{x:0.25,y:0.35},{x:0.75,y:0.35}];
    let i=0; const timer=setInterval(()=>{
      c({ particleCount: 140, spread: 75, startVelocity: 60, ticks: 210, origin: origins[i%origins.length] });
      if(++i>=7){ clearInterval(timer); }
    }, 200);
    return;
  }
  // DOM fallback (single host, auto-removed)
  try {
    // remove any stray host first
    document.querySelectorAll(".sf-confetti").forEach(n => n.remove());
  } catch {}
  const host = document.createElement("div");
  host.className = "sf-confetti";
  document.body.appendChild(host);
  const colors = ["#10B981","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];
  for (let i=0;i<160;i++){
    const p = document.createElement("div");
    p.className = "sf-confetti-piece";
    p.style.left = Math.random()*100 + "vw";
    p.style.width = "6px"; p.style.height = "10px";
    p.style.background = colors[(Math.random() * colors.length) | 0];
    p.style.animationDuration = (1.8 + Math.random()*1.4) + "s";
    p.style.animationDelay = (Math.random()*0.6) + "s";
    host.appendChild(p);
  }
  setTimeout(() => host.remove(), 3000);
}

const _pickStore = { data: null, set(d){this.data=d||null;}, peek(){return this.data;}, clear(){this.data=null;} };

const Draggable = ({ payload, data, onClick, ...rest }) => {
  const merged = data ?? payload ?? undefined;
  const handleClick = (e) => { _pickStore.set(merged); onClick?.(e); };
  return <DraggableBase data={merged} onClick={handleClick} role="button" tabIndex={0} {...rest} />;
};

// NOTE: `blinkWrap` renders a wrapper-level animated outline.
const Slot = ({ accept, onDrop, validator, test, onDropContent, onClick, children, blinkWrap=false, ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
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
  return (
    <div className={`slot-wrap ${blinkWrap ? 'ptable-blink-wrap' : ''}`} onClick={handleClick}>
      <DropSlotBase test={testFn} onDropContent={onDropContentFn} {...rest}>{children}</DropSlotBase>
    </div>
  );
};

const ACCEPT_HEADER = ["chip", "sym", "symbol", "header"];
const ACCEPT_VALUE  = ["value", "number"];

export default function ProportionalTablesModule() {
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);
  const [numIsY, setNumIsY] = useState(false);
  const [denIsX, setDenIsX] = useState(false);
  const headerEqCorrect = kPlaced && numIsY && denIsX;
  const [labelStepTarget, setLabelStepTarget] = useState('x');
  const [buildTarget, setBuildTarget] = useState('num');
  const [fillRow, setFillRow] = useState(0);
  const [fillPart, setFillPart] = useState('num');
  const [fractions, setFractions] = useState({});
  const [kValues, setKValues] = useState({});
  const [reveal, setReveal] = useState({});
  const revealTimers = useRef({});
  const [conceptAnswer, setConceptAnswer] = useState(null);

  // cache choices
  const fillChoicesRef = useRef({});

  useEffect(()=>saveDifficulty(difficulty),[difficulty]);
  useEffect(()=>()=>{ Object.values(revealTimers.current).forEach(clearTimeout); revealTimers.current={}; }, []);

  const allRowsComputed = useMemo(()=>[0,1,2].every(i=>{
    const f = fractions[i];
    return f?.num != null && f?.den != null && Number.isFinite(kValues[i]);
  }), [fractions,kValues]);

  const allRowsRevealed = useMemo(()=>[0,1,2].every(i=>Number.isFinite(kValues[i]) && reveal[i]===true), [kValues,reveal]);

  const ksEqual = useMemo(()=>{
    const vals=[kValues[0],kValues[1],kValues[2]];
    if (vals.some(v=>typeof v!=="number")) return null;
    return Math.abs(vals[0]-vals[1])<1e-9 && Math.abs(vals[1]-vals[2])<1e-9;
  },[kValues]);

  const randomizedConcept = useMemo(()=>shuffle([
    { key:"yes_same", label:"Yes, because k is the same" },
    { key:"yes_diff", label:"Yes, because k is NOT the same" },
    { key:"no_same",  label:"No, because k is the same" },
    { key:"no_diff",  label:"No, because k is NOT the same" },
  ]), [problem]);

  const conceptCorrect = useMemo(()=>{
    if (!allRowsComputed || ksEqual==null || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer==="yes_same") return true;
    if (!ksEqual && conceptAnswer==="no_diff") return true;
    return false;
  }, [allRowsComputed, ksEqual, conceptAnswer]);

  const revealFourthRow = (ksEqual===true && conceptCorrect);
  const [row4Answer, setRow4Answer] = useState(null);

  const resetAll = (nextDiff = difficulty) => {
    const next = genPTable(nextDiff);
    setProblem(next);
    setXPlaced(false); setYPlaced(false); setKPlaced(false);
    setNumIsY(false); setDenIsX(false);
    setFractions({}); setKValues({}); setReveal({});
    setConceptAnswer(null); setRow4Answer(null);
    setLabelStepTarget('x'); setBuildTarget('num'); setFillRow(0); setFillPart('num');
    fillChoicesRef.current = {};
    Object.values(revealTimers.current).forEach(clearTimeout); revealTimers.current = {};
  };

  useEffect(()=>{ [0,1,2].forEach(i=>{
    const f = fractions[i];
    if (f?.num!=null && f?.den!=null && f.den!==0) {
      const kv=f.num/f.den; setKValues(prev => (prev[i]===kv?prev:{...prev,[i]:kv}));
    }
  })},[fractions]);

  useEffect(()=>{ [0,1,2].forEach(i=>{
    const f = fractions[i];
    if (f?.num!=null && f?.den!=null && Number.isFinite(kValues[i]) && !reveal[i]) {
      if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
      revealTimers.current[i]=setTimeout(()=>setReveal(prev=>({...prev,[i]:true})),2000);
    }
  })},[fractions,kValues,reveal]);

  const onRowDrop = (i, part, d) => {
    if (!d || !ACCEPT_VALUE.includes(d.type)) return;
    if (d.row !== i) return;
    if (part === "num" && d.axis !== "y") return;
    if (part === "den" && d.axis !== "x") return;
    const val = Number(d.value ?? nameOf(d));
    if (!Number.isFinite(val)) return;
    if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
    setReveal(prev=>({...prev,[i]:false}));
    setFractions(prev=>({...prev,[i]:{...(prev[i]||{}),[part]:val}}));
  };

  const solveRow4 = () => {
    if (!revealFourthRow || !problem.revealRow4) return;
    setRow4Answer(kValues[0] * problem.revealRow4.x);
  };

  const currentStep = useMemo(()=>{
    if (!xPlaced || !yPlaced || !kPlaced) return "label";
    if (!headerEqCorrect) return "build";
    if (!allRowsRevealed) return "fill";
    if (!conceptCorrect) return "concept";
    return "solve";
  }, [xPlaced,yPlaced,kPlaced,headerEqCorrect,allRowsRevealed,conceptCorrect]);

  const dragEnabled = currentStep==="concept" || currentStep==="solve";

  const HeaderDrop = ({ placed, label, expectName, onPlaced, blink=false, canDrop=true }) => (
    <Slot
      accept={canDrop ? ACCEPT_HEADER : []}
      onDrop={(d)=>{
        const got=(nameOf(d)??"").toString().trim().toLowerCase();
        const want=(expectName??"").toString().trim().toLowerCase();
        if (got===want) onPlaced(true);
      }}
      className={`ptable-thslot ${placed ? "placed" : "empty"} ${blink ? "ptable-blink-hard blink-bg" : ""}`}
      blinkWrap={blink && !placed}
    >
      {blink && !placed ? <span className="ptable-pulse" aria-hidden="true"></span> : null}
      {placed ? <span className="chip chip-lg">{label}</span> : <span className="visually-hidden">empty</span>}
    </Slot>
  );

  const HeaderEqArea = () => {
    const blinkNum = currentStep==="build" && buildTarget==="num";
    const blinkDen = currentStep==="build" && buildTarget==="den";
    return (
      <div className="ptable-header-eq">
        <div className="ptable-eq-row nowrap">
          <div className="badge">k</div>
          <span>=</span>
          <div className="fraction mini-frac" aria-label="k equals Y over X">
            <Slot accept={dragEnabled ? ACCEPT_HEADER : []}
              onDrop={(d)=>{ const got=(nameOf(d)??"").toString().trim().toUpperCase(); if (got==="Y") setNumIsY(true);}}
              className={`slot ptable-fracslot ${blinkNum ? "ptable-blink-hard blink-bg" : ""} ${numIsY ? "filled" : ""}`}
              blinkWrap={blinkNum && !numIsY}>
              {blinkNum && !numIsY ? <span className="ptable-pulse" aria-hidden="true"></span> : null}
              {numIsY ? <span className="chip chip-lg">y</span> : <span className="muted">—</span>}
            </Slot>
            <div className="frac-bar narrow" />
            <Slot accept={dragEnabled ? ACCEPT_HEADER : []}
              onDrop={(d)=>{ const got=(nameOf(d)??"").toString().trim().toUpperCase(); if (got==="X") setDenIsX(true);}}
              className={`slot ptable-fracslot ${blinkDen ? "ptable-blink-hard blink-bg" : ""} ${denIsX ? "filled" : ""}`}
              blinkWrap={blinkDen && !denIsX}>
              {blinkDen && !denIsX ? <span className="ptable-pulse" aria-hidden="true"></span> : null}
              {denIsX ? <span className="chip chip-lg">x</span> : <span className="muted">—</span>}
            </Slot>
          </div>
        </div>
      </div>
    );
  };

  useEffect(()=>{ if (!xPlaced) setLabelStepTarget('x'); else if (!yPlaced) setLabelStepTarget('y'); else setLabelStepTarget('k'); }, [xPlaced,yPlaced,kPlaced]);
  useEffect(()=>{ if (!numIsY) setBuildTarget('num'); else setBuildTarget('den'); }, [numIsY,denIsX]);
  useEffect(()=>{
    const f = fractions[fillRow] || {};
    if (fillPart==='num' && f.num!=null) { setFillPart('den'); return; }
    if (fillPart==='den' && f.den!=null) { if (fillRow<2) { setFillRow(fillRow+1); setFillPart('num'); } }
  }, [fractions,fillRow,fillPart]);

  const computeChoices = (rowIndex, part) => {
    const ys = problem.rows.map(r => r.y);
    const xs = problem.rows.map(r => r.x);
    const row = problem.rows[rowIndex];
    const correct = part === "num" ? row.y : row.x;
    const sameRowDecoy = part === "num" ? row.x : row.y;
    const otherY = ys[(rowIndex + 1) % ys.length];
    const otherX = xs[(rowIndex + 2) % xs.length];
    const setVals = Array.from(new Set([correct, sameRowDecoy, otherY, otherX]));
    while (setVals.length < 4) {
      const pool = ys.concat(xs).filter(v => !setVals.includes(v));
      setVals.push(pool[Math.floor(Math.random()*pool.length)]);
    }
    return shuffle(setVals);
  };

  const getFillChoices = (rowIndex, part) => {
    const key = `${rowIndex}:${part}`;
    if (!fillChoicesRef.current[key]) fillChoicesRef.current[key] = computeChoices(rowIndex, part);
    return fillChoicesRef.current[key];
  };

  const Table = useMemo(()=>{
    const invis = !kPlaced ? "col3-invisible" : "";
    return (
      <div className={`ptable-wrap ${!dragEnabled ? 'disable-dnd' : ''}`}>
        <div className={`ptable-rel ptable-table dark ${invis}`}>
          <table className="ptable" style={{ tableLayout: "fixed" }}>
            <colgroup><col style={{ width: "25%" }} /><col style={{ width: "25%" }} /><col style={{ width: "50%" }} /></colgroup>
            <thead>
              <tr>
                <th><HeaderDrop placed={xPlaced} label="x" expectName="X" onPlaced={(ok)=>{if(ok)setXPlaced(true);}} blink={!xPlaced && labelStepTarget==='x'} canDrop={dragEnabled} /></th>
                <th><HeaderDrop placed={yPlaced} label="y" expectName="Y" onPlaced={(ok)=>{if(ok)setYPlaced(true);}} blink={!yPlaced && xPlaced && labelStepTarget==='y'} canDrop={dragEnabled} /></th>
                <th>
                  {kPlaced ? <HeaderEqArea /> : (
                    <Slot accept={dragEnabled ? ACCEPT_HEADER : []}
                      onDrop={(d)=>{ const got=(nameOf(d)??"").toString().trim().toLowerCase(); if (got==='k') setKPlaced(true);}}
                      className={`ptable-thslot empty ${labelStepTarget==='k' ? 'ptable-blink-hard blink-bg' : ''}`}
                      blinkWrap={labelStepTarget==='k' && !kPlaced}>
                      {labelStepTarget==='k' && !kPlaced ? <span className="ptable-pulse" aria-hidden="true"></span> : null}
                      <span className="visually-hidden">empty</span>
                    </Slot>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {[0,1,2].map(idx=>{
                const r=problem.rows[idx];
                const isBlinkRow = currentStep==="fill" && idx===fillRow;
                const blinkNum = isBlinkRow && fillPart==="num";
                const blinkDen = isBlinkRow && fillPart==="den";
                return (
                  <tr key={idx}>
                    <td><span className="chip chip-lg">{r.x}</span></td>
                    <td><span className="chip chip-lg">{r.y}</span></td>
                    <td>
                      {headerEqCorrect ? (
                        <div className="row-calc nowrap">
                          <div className="fraction mini-frac static">
                            <div><strong>y</strong></div><div className="frac-bar extra-narrow" /><div><strong>x</strong></div>
                          </div>
                          <span className="eq">=</span>
                          <div className="fraction mini-frac">
                            <Slot accept={ACCEPT_VALUE} validator={(d)=>d?.row===idx && d?.axis==='y'} onDrop={(d)=>onRowDrop(idx,'num',d)}
                              className={`slot ptable-fracslot tight ${blinkNum ? 'ptable-blink-hard blink-bg' : ''}`}
                              blinkWrap={blinkNum && (fractions[idx]?.num==null)}>
                              {blinkNum && (fractions[idx]?.num==null) ? <span className="ptable-pulse" aria-hidden="true"></span> : null}
                              {fractions[idx]?.num!=null ? <span className="chip chip-lg">{fractions[idx].num}</span> : <span className="muted">—</span>}
                            </Slot>
                            <div className="frac-bar extra-narrow" />
                            <Slot accept={ACCEPT_VALUE} validator={(d)=>d?.row===idx && d?.axis==='x'} onDrop={(d)=>onRowDrop(idx,'den',d)}
                              className={`slot ptable-fracslot tight ${blinkDen ? 'ptable-blink-hard blink-bg' : ''}`}
                              blinkWrap={blinkDen && (fractions[idx]?.den==null)}>
                              {blinkDen && (fractions[idx]?.den==null) ? <span className="ptable-pulse" aria-hidden="true"></span> : null}
                              {fractions[idx]?.den!=null ? <span className="chip chip-lg">{fractions[idx].den}</span> : <span className="muted">—</span>}
                            </Slot>
                          </div>
                          {Number.isFinite(kValues[idx]) && reveal[idx] && (
                            <span className="eq result reveal-value">= <b>{fmt(kValues[idx])}</b></span>
                          )}
                        </div>
                      ) : <span className="muted">—</span>}
                    </td>
                  </tr>
                );
              })}

              {(ksEqual===true && conceptCorrect && problem.revealRow4) && (
                <tr>
                  <td><span className="chip chip-lg">{problem.revealRow4.x}</span></td>
                  <td><span className="chip chip-lg">{row4Answer==null ? "?" : row4Answer}</span></td>
                  <td><span className="badge" style={{ background:"#ecfdf5", borderColor:"#86efac" }}>k = {fmt(kValues[0])}</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="center" style={{ marginTop: 18 }}>
          <BigButton onClick={() => resetAll()}>New Problem</BigButton>
        </div>
      </div>
    );
  }, [problem,xPlaced,yPlaced,kPlaced,headerEqCorrect,fractions,kValues,revealFourthRow,row4Answer,reveal,labelStepTarget,buildTarget,fillRow,fillPart,dragEnabled,currentStep]);

  const renderLabelChoices = () => (
    <div className="row" style={{ gap: 10, marginTop: 12 }}>
      {["x","y","k"].map((opt) => (
        <button key={opt} type="button" className="ptable-choice big"
          onClick={() => {
            if (labelStepTarget === "x" && opt === "x" && !xPlaced) { setXPlaced(true); setLabelStepTarget("y"); return; }
            if (labelStepTarget === "y" && opt === "y" && xPlaced && !yPlaced) { setYPlaced(true); setLabelStepTarget("k"); return; }
            if (labelStepTarget === "k" && opt === "k" && xPlaced && yPlaced && !kPlaced) { setKPlaced(true); return; }
            try { const el = document.activeElement; if (el) { el.classList.add("shake"); setTimeout(() => el.classList.remove("shake"), 350); } } catch {}
          }}
          aria-label={`choose ${opt}`}
        >{opt}</button>
      ))}
    </div>
  );

  const renderBuildChoices = () => {
    const order = buildTarget === "num" ? ["y","x"] : ["x","y"];
    return (
      <div className="row" style={{ gap: 10, marginTop: 12 }}>
        {order.map((opt) => (
          <button key={opt} type="button" className="ptable-choice big"
            onClick={() => {
              if (buildTarget === "num" && opt === "y" && !numIsY) { setNumIsY(true); setBuildTarget("den"); return; }
              if (buildTarget === "den" && opt === "x" && numIsY && !denIsX) { setDenIsX(true); return; }
              try { const el = document.activeElement; if (el) { el.classList.add("shake"); setTimeout(() => el.classList.remove("shake"), 350); } } catch {}
            }}
            aria-label={`choose ${opt}`}
          >{opt}</button>
        ))}
      </div>
    );
  };

  const renderFillChoices = () => {
    const choices = getFillChoices(fillRow, fillPart);
    const correct = (fillPart === "num") ? problem.rows[fillRow].y : problem.rows[fillRow].x;
    return (
      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap:"wrap" }}>
        {choices.map((val, i) => (
          <button key={`${fillPart}-${i}-${val}`} type="button" className="ptable-choice big"
            onClick={() => {
              if (val === correct) {
                if (fillPart === "num") {
                  onRowDrop(fillRow, "num", { type:"value", axis:"y", row: fillRow, value: val });
                  setFillPart("den");
                } else {
                  onRowDrop(fillRow, "den", { type:"value", axis:"x", row: fillRow, value: val });
                  if (fillRow < 2) { setFillRow(fillRow + 1); setFillPart("num"); }
                }
                return;
              }
              try { const el = document.activeElement; if (el) { el.classList.add("shake"); setTimeout(() => el.classList.remove("shake"), 350); } } catch {}
            }}
            aria-label={`choose ${val}`}
          >{val}</button>
        ))}
      </div>
    );
  };

  return (
    <div className="panes ptables-layout">
      <div className="card">
        <div className="row" style={{ justifyContent: "flex-start", marginBottom: 8, gap: 8 }}>
          <div className={`press ${difficulty === "easy" ? "is-active" : ""}`}>
            <BigButton className={difficulty === "easy" ? "active" : ""}
              onClick={() => { setDifficulty("easy"); resetAll("easy"); }} aria-pressed={difficulty === "easy"}>Easy</BigButton>
          </div>
          <div className={`press ${difficulty === "medium" ? "is-active" : ""}`}>
            <BigButton className={difficulty === "medium" ? "active" : ""}
              onClick={() => { setDifficulty("medium"); resetAll("medium"); }} aria-pressed={difficulty === "medium"}>Medium</BigButton>
          </div>
          <div className={`press ${difficulty === "hard" ? "is-active" : ""}`}>
            <BigButton className={difficulty === "hard" ? "active" : ""}
              onClick={() => { setDifficulty("hard"); resetAll("hard"); }} aria-pressed={difficulty === "hard"}>Hard</BigButton>
          </div>
        </div>
        {Table}
      </div>

      <div className="card right-steps">
        {currentStep === "label" && (
          <div className="section">
            <div className="step-title">What goes here?</div>
            {renderLabelChoices()}
          </div>
        )}
        {currentStep === "build" && (
          <div className="section">
            <div className="step-title">What goes here?</div>
            {renderBuildChoices()}
          </div>
        )}
        {currentStep === "fill" && (
          <div className="section">
            <div className="step-title">What goes here?</div>
            {renderFillChoices()}
          </div>
        )}
        {currentStep === "concept" && (
          <div className="section">
            <div className="step-title">Is this table proportional?</div>
            <div className="row" style={{ gap: 8, justifyContent: "center" }}>
              {randomizedConcept.map(({ key, label }) => (
                <button key={key} className="button" onClick={() => setConceptAnswer(key)}>{label}</button>
              ))}
            </div>
            {conceptAnswer && (
              <div className="center" style={{ marginTop: 10 }}>
                {conceptCorrect ? (
                  <div className="badge" style={{ background: "#ecfdf5", borderColor: "#86efac" }}>✓ Correct</div>
                ) : (
                  <div className="badge" style={{ background: "#fff7ed", borderColor: "#fed7aa" }}>Try again</div>
                )}
              </div>
            )}
          </div>
        )}
        {currentStep === "solve" && (
          <div className="section">
            <div className="step-title">How do we solve for the missing y-value in the new 4th row?</div>
            <div className="row" style={{ gap: 8, justifyContent: "center" }}>
              {shuffle([
                { key: "dot", label: "y = k • x", correct: true },
                { key: "div", label: "y = k ÷ x", correct: false },
                { key: "add", label: "y = k + x", correct: false },
                { key: "emd", label: "y = k – x", correct: false },
              ]).map(({ key, label, correct }) => (
                <button key={key} className="button"
                  onClick={() => {
                    if (correct) {
                      setRow4Answer(null);
                      setTimeout(() => {
                        solveRow4();
                        const el = document.querySelector(".ptable tbody tr:last-child td:nth-child(2)");
                        if (el) { el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1200); }
                        multiBurstConfetti();
                      }, 10);
                    } else {
                      alert("Not quite — try another.");
                    }
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
