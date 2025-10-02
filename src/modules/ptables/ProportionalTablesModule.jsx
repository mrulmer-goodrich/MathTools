// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import DraggableBase from "../../components/DraggableChip.jsx";
import DropSlotBase from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

// use the existing components under the names our wrappers expect
const DraggableChip = DraggableBase;
const DropSlot = DropSlotBase;

// --- PTables scoped confetti helper (no-op if not present) ---
function __ptableBurstConfetti(times=6, interval=220){
  const c = (typeof window!=="undefined") && (window.confetti || window.canvasConfetti);
  if(!c) return;
  let i=0; const t=setInterval(()=>{ c({ particleCount: 200, spread: 80, startVelocity: 55, origin:{y:0.3} }); if(++i>=times) clearInterval(t); }, interval);
}
// --- end helper ---

// ---- tap-to-place helpers (surgical; keeps drag working) ----
const __tapPickStore = { v:null, set(x){this.v=x||null;}, peek(){return this.v;}, clear(){this.v=null;} };

function __wrapDraggable(DraggableChip){
  return function __TapDraggable(props){
    const { data, onClick, ...rest } = props;
    const handleClick = (e)=>{ __tapPickStore.set(data); if(onClick) onClick(e); };
    return <DraggableChip {...rest} data={data} onClick={handleClick}>{props.children}</DraggableChip>;
  };
}

function __wrapDropSlot(DropSlot){
  return function __TapSlot(props){
    const { test, accept, onDropContent, onClick, ...rest } = props;
    const testFn = test || (d => {
      const t = (d && (d.type||d.kind||"")).toString();
      return Array.isArray(accept) && accept.length ? accept.includes(t) : true;
    });
    const handleClick = (e)=>{
      const picked = __tapPickStore.peek();
      if (picked && testFn(picked)) { try{ onDropContent && onDropContent(picked); }catch(e){} __tapPickStore.clear(); }
      if (onClick) onClick(e);
    };
    return <div onClick={handleClick} style={{ display: "inline-block", width: "100%" }}>
      <DropSlot {...rest} test={testFn} onDropContent={onDropContent} onClick={onClick}>{props.children}</DropSlot>
    </div>;
  };
}

const __TapDraggable = __wrapDraggable(DraggableChip);
const __TapSlot = __wrapDropSlot(DropSlot);
// ---- end tap-to-place helpers ----



// persistence
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// helpers
const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const nameOf = (d) => d?.name ?? d?.label ?? d?.value;
const fmt = (n) => (Number.isFinite(n) ? (Math.round(n * 1000) / 1000).toString() : "");
const shuffle = (arr) => { const a = [...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j]]=[a[j],a[i]]; } return a; };


// --- Local compatibility wrappers (only affect this module) ---
// Tiny in-module store to support tap-to-place without touching shared components
const _pickStore = {
  data: null,
  set(d) { this.data = d || null; },
  peek() { return this.data; },
  clear() { this.data = null; }
};

// Wrap Draggable so this module can pass `payload` (legacy) or `data` (current)
// and also support tap-to-place (click/touch) pickup.
const Draggable = ({ payload, data, onClick, ...rest }) => {
  const merged = data ?? payload ?? undefined;

  const handleClick = (e) => {
    _pickStore.set(merged);           // tap = pick up
    onClick?.(e);
  };

  return (
    <DraggableBase
      data={merged}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      {...rest}
    />
  );
};

// Wrap DropSlot so this module can pass accept/validator and add tap-to-place drop.
const Slot = ({ accept, onDrop, validator, test, onDropContent, onClick, ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });

  const onDropContentFn = onDropContent ?? onDrop;

  // Tap on slot = try to place the currently picked chip
  const handleClick = (e) => {
    const picked = _pickStore.peek();
    if (picked && testFn(picked)) {
      try { onDropContentFn?.(picked); } catch {}
      _pickStore.clear();
    }
    onClick?.(e);
  };

  return (
    <__TapSlotBase
      test={testFn}
      onDropContent={onDropContentFn}
      onClick={handleClick}
      {...rest}
    />
  );
};


// accept types
const ACCEPT_HEADER = ["chip", "sym", "symbol", "header"];
const ACCEPT_VALUE  = ["value", "number"]; // row values

export default function ProportionalTablesModule() {
  // difficulty & problem
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));

  // header labels
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  // header fraction (k = y / x)
  const [numIsY, setNumIsY] = useState(false);
  const [denIsX, setDenIsX] = useState(false);
  const headerEqCorrect = kPlaced && numIsY;

  // per-row fraction inputs & computed k values
  const [fractions, setFractions] = useState({}); // {rowIndex: {num, den}}
  const [kValues, setKValues] = useState({});     // {rowIndex: number}
  const [reveal, setReveal] = useState({});       // {rowIndex: boolean} - show "= value" after delay
  const revealTimers = useRef({});                // refs to timeouts per row

  // concept readiness + correctness
  const allRowsComputed = useMemo(() => {
    return [0,1,2].every(i => {
      const f = fractions[i];
      return f?.num != null && f?.den != null && Number.isFinite(kValues[i]);
    });
  }, [fractions, kValues]);

  const allRowsRevealed = useMemo(() => {
    return [0,1,2].every(i => Number.isFinite(kValues[i]) && reveal[i] === true);
  }, [kValues, reveal]);

  const ksEqual = useMemo(() => {
    const vals = [kValues[0], kValues[1], kValues[2]];
    if (vals.some((v) => typeof v !== "number")) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  }, [kValues]);

  const randomizedConcept = useMemo(() =>
    shuffle([
      { key: "yes_same", label: "Yes, because k is the same" },
      { key: "yes_diff", label: "Yes, because k is NOT the same" },
      { key: "no_same",  label: "No, because k is the same" },
      { key: "no_diff",  label: "No, because k is NOT the same" },
    ])
  , [problem]);

  const [conceptAnswer, setConceptAnswer] = useState(null);
  const conceptCorrect = useMemo(() => {
    if (!allRowsComputed || ksEqual == null || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  }, [allRowsComputed, ksEqual, conceptAnswer]);

  // fourth row reveal only if proportional & concept is correct
  const revealFourthRow = (ksEqual === true && conceptCorrect);
  const [row4Answer, setRow4Answer] = useState(null);

  // persist difficulty
  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  // clear timers on unmount
  useEffect(() => {
    return () => {
      Object.values(revealTimers.current).forEach((t) => clearTimeout(t));
      revealTimers.current = {};
    };
  }, []);

  // reset all for new problem/difficulty
  const resetAll = (nextDiff = difficulty) => {
    const next = genPTable(nextDiff);
    setProblem(next);

    setXPlaced(false); setYPlaced(false); setKPlaced(false);
    setNumIsY(false); setDenIsX(false);
    setFractions({}); setKValues({});
    setReveal({});
    setConceptAnswer(null); setRow4Answer(null);

    Object.values(revealTimers.current).forEach((t) => clearTimeout(t));
    revealTimers.current = {};
  };

  // auto-calc row k when both numerator & denominator are present
  useEffect(() => {
    [0, 1, 2].forEach((i) => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0) {
        const kv = f.num / f.den;
        setKValues((prev) => (prev[i] === kv ? prev : { ...prev, [i]: kv }));
      }
    });
  }, [fractions]);

  // reveal "= value" after 2s once both values present
  useEffect(() => {
    [0, 1, 2].forEach((i) => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && Number.isFinite(kValues[i]) && !reveal[i]) {
        if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
        revealTimers.current[i] = setTimeout(() => {
          setReveal((prev) => ({ ...prev, [i]: true }));
        }, 2000);
      }
    });
  }, [fractions, kValues, reveal]);

  const calcRow = (i) => {
    const f = fractions[i];
    if (!f || f.den == null || f.num == null || f.den === 0) return;
    setKValues((prev) => ({ ...prev, [i]: f.num / f.den }));
  };
  const calcAll = () => [0, 1, 2].forEach(calcRow);

  // row drop handler with strict validation (row + axis), also resets reveal timer
  const onRowDrop = (i, part, d) => {
    if (!d || !ACCEPT_VALUE.includes(d.type)) return;
    if (d.row !== i) return;
    if (part === "num" && d.axis !== "y") return;
    if (part === "den" && d.axis !== "x") return;
    const val = Number(d.value ?? nameOf(d));
    if (!Number.isFinite(val)) return;

    // reset reveal for this row & clear prior timer so we re-wait 2s
    if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
    setReveal((prev) => ({ ...prev, [i]: false }));

    setFractions((prev) => ({ ...prev, [i]: { ...(prev[i] || {}), [part]: val } }));
  };

  // solve fourth row Y
  const solveRow4 = () => {
    if (!revealFourthRow || !problem.revealRow4) return;
    setRow4Answer(kValues[0] * problem.revealRow4.x);
  };

  // step gating
  const currentStep = useMemo(() => {
    if (!xPlaced || !yPlaced || !kPlaced) return "label";
    if (!headerEqCorrect) return "build";
    if (!allRowsRevealed) return "fill";     // wait until values are revealed
    if (!conceptCorrect) return "concept";
    return "solve";
  }, [xPlaced, yPlaced, kPlaced, headerEqCorrect, allRowsRevealed, conceptCorrect]);

  // header drop (for X / Y / K)
  const HeaderDrop = ({ placed, label, expectName, onPlaced }) => (
    <Slot
      accept={ACCEPT_HEADER}
      onDrop={(d) => {
        const got = (nameOf(d) ?? "").toString().trim().toLowerCase();
        const want = (expectName ?? "").toString().trim().toLowerCase();
        if (got === want) onPlaced(true);
      }}
      className={`ptable-thslot ${placed ? "placed" : "empty"}`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  // header equation (under K header) — compact, single line; shows chips immediately
  const HeaderEqArea = () => {
    if (!kPlaced) return null;
    return (
      <div className="ptable-header-eq">
        <div className="ptable-eq-row nowrap">
          <div className="badge">k</div>
          <span>=</span>
          <div className="fraction mini-frac" aria-label="k equals Y over X">
            {/* Numerator: Y */}
            <Slot
              accept={ACCEPT_HEADER}
              onDrop={(d) => {
                const got = (nameOf(d) ?? "").toString().trim().toUpperCase();
                if (got === "Y") setNumIsY(true);
              }}
              className={`slot ptable-fracslot tiny ${numIsY ? "filled" : ""}`}
            >
              {numIsY ? <span className="chip chip-tiny">y</span> : <span className="muted">—</span>}
            </Slot>
            <div className="frac-bar narrow" />
            {/* Denominator: X */}
            <Slot
              accept={ACCEPT_HEADER}
              onDrop={(d) => {
                const got = (nameOf(d) ?? "").toString().trim().toUpperCase();
                if (got === "X") setDenIsX(true);
              }}
              className={`slot ptable-fracslot tiny ${denIsX ? "filled" : ""}`}
            >
              {denIsX ? <span className="chip chip-tiny">x</span> : <span className="muted">—</span>}
            </Slot>
          </div>
        </div>

        {numIsY && (
          <div className="muted small" style={{ marginTop: 6 }}>
            Now drag each row’s <b>y</b> and <b>x</b> into the spots. The result will appear after a moment.
          </div>
        )}
      </div>
    );
  };

  // invisible K overlay over 3rd header area until K placed
  const KRevealOverlay = () => {
    if (kPlaced) return null;
    return (
      <div className="ptable-k-overlay" aria-hidden="true">
        <Slot
          accept={ACCEPT_HEADER}
          onDrop={(d) => {
            const got = (nameOf(d) ?? "").toString().trim().toUpperCase();
            if (got === "K") { setKPlaced(true); }
          }}
          className="ptable-k-target"
        />
      </div>
    );
  };

  const burstConfetti = () => {
    const host = document.createElement("div");
    host.className = "sf-confetti";
    document.body.appendChild(host);
    const colors = ["#10B981","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];
    for (let i = 0; i < 80; i++) {
      const p = document.createElement("div");
      p.className = "sf-confetti-piece";
      p.style.left = Math.random() * 100 + "vw";
      p.style.width = "6px";
      p.style.height = "10px";
      p.style.background = colors[(Math.random() * colors.length) | 0];
      p.style.animationDuration = 2 + Math.random() * 1.5 + "s";
      host.appendChild(p);
    }
    setTimeout(() => host.remove(), 2500);
  };

  // table
  const Table = useMemo(() => {
    const invis = !kPlaced ? "col3-invisible" : "";
    return (
      <div className="ptable-wrap">
        <div className={`ptable-rel ptable-table dark ${invis}`}>
          <KRevealOverlay />
          <table className="ptable" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "50%" }} />
            </colgroup>
            <thead>
              <tr>
                <th><HeaderDrop placed={xPlaced} label="X" expectName="X" onPlaced={setXPlaced} /></th>
                <th><HeaderDrop placed={yPlaced} label="Y" expectName="Y" onPlaced={setYPlaced} /></th>
                <th>{kPlaced ? <HeaderEqArea /> : <div style={{ height: 44 }} />}</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((idx) => {
                const r = problem.rows[idx];
                return (
                  <tr key={idx}>
                    <td>
                      <Draggable
                        id={`x-${idx}`}
                        label={`${r.x}`}
                        payload={{ type: "value", axis: "x", row: idx, value: r.x }}
                        className="chip"
                      />
                    </td>
                    <td>
                      <Draggable
                        id={`y-${idx}`}
                        label={`${r.y}`}
                        payload={{ type: "value", axis: "y", row: idx, value: r.y }}
                        className="chip"
                      />
                    </td>
                    <td>
                      {headerEqCorrect ? (
                        <div className="row-calc nowrap">
                          {/* left: static Y/X fraction (bold) */}
                          <div className="fraction mini-frac static">
                            <div><strong>y</strong></div>
                            <div className="frac-bar extra-narrow" />
                            <div><strong>x</strong></div>
                          </div>

                          <span className="eq">=</span>

                          {/* right: draggable y_i / x_i (chips retained) */}
                          <div className="fraction mini-frac">
                            <Slot
                              accept={ACCEPT_VALUE}
                              validator={(d) => d?.row === idx && d?.axis === "y"}
                              onDrop={(d) => onRowDrop(idx, "num", d)}
                              className="slot ptable-fracslot tight"
                            >
                              {fractions[idx]?.num != null
                                ? <span className="chip chip-tiny">{fractions[idx].num}</span>
                                : <span className="muted">—</span>}
                            </Slot>
                            <div className="frac-bar extra-narrow" />
                            <Slot
                              accept={ACCEPT_VALUE}
                              validator={(d) => d?.row === idx && d?.axis === "x"}
                              onDrop={(d) => onRowDrop(idx, "den", d)}
                              className="slot ptable-fracslot tight"
                            >
                              {fractions[idx]?.den != null
                                ? <span className="chip chip-tiny">{fractions[idx].den}</span>
                                : <span className="muted">—</span>}
                            </Slot>
                          </div>

                          {/* reveal result after delay */}
                          {Number.isFinite(kValues[idx]) && reveal[idx] && (
                            <span className="eq result">= <b>{fmt(kValues[idx])}</b></span>
                          )}
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* row 4 appears only when proportional & concept is correct */}
              {revealFourthRow && problem.revealRow4 && (
                <tr>
                  <td>{problem.revealRow4.x}</td>
                  <td>{row4Answer == null ? "?" : row4Answer}</td>
                  <td>
                    <span className="badge" style={{ background: "#ecfdf5", borderColor: "#86efac" }}>
                      k = {fmt(kValues[0])}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* New Problem BELOW the table, centered */}
        <div className="center" style={{ marginTop: 18 }}>
          <BigButton onClick={() => resetAll()}>New Problem</BigButton>
        </div>
      </div>
    );
  }, [
    problem,
    xPlaced,
    yPlaced,
    kPlaced,
    headerEqCorrect,
    fractions,
    kValues,
    revealFourthRow,
    row4Answer,
    reveal,
  ]);

  // right-panel "solve" options (after concept)
  const kDisplay = fmt(kValues[0]);
  const solveOptions = useMemo(() => {
    const options = [
      { key: "dot", label: "y = k • x", correct: true },  // correct (multiplication dot)
      { key: "div", label: "y = k ÷ x", correct: false },
      { key: "add", label: "y = k + x", correct: false },
      { key: "emd", label: "y = k – x", correct: false }, // EN DASH
    ];
    return shuffle(options);
  }, [kDisplay]);

  return (
  <div className="panes ptables-layout">
    {/* LEFT CARD */}
    <div className="card">
      {/* Difficulty top-left */}
      <div className="row" style={{ justifyContent: "flex-start", marginBottom: 8, gap: 8 }}>
        <div className={`press ${difficulty === "easy" ? "is-active" : ""}`}>
          <BigButton
            className={difficulty === "easy" ? "active" : ""}
            onClick={() => { setDifficulty("easy"); resetAll("easy"); }}
            aria-pressed={difficulty === "easy"}
          >
            Easy
          </BigButton>
        </div>
        <div className={`press ${difficulty === "medium" ? "is-active" : ""}`}>
          <BigButton
            className={difficulty === "medium" ? "active" : ""}
            onClick={() => { setDifficulty("medium"); resetAll("medium"); }}
            aria-pressed={difficulty === "medium"}
          >
            Medium
          </BigButton>
        </div>
        <div className={`press ${difficulty === "hard" ? "is-active" : ""}`}>
          <BigButton
            className={difficulty === "hard" ? "active" : ""}
            onClick={() => { setDifficulty("hard"); resetAll("hard"); }}
            aria-pressed={difficulty === "hard"}
          >
            Hard
          </BigButton>
        </div>
      </div>

      {Table}
    </div>

    {/* RIGHT CARD — one step visible at a time */}
    <div className="card right-steps">
      {currentStep === "label" && (
        <div className="section">
          <div className="step-title">Where do these values belong in the table?</div>
          <div className="muted bigger">Drag and drop to the header of the table.</div>
          <div className="chips with-borders" style={{ marginTop: 10 }}>
            <Draggable id="chip-x" label="X" payload={{ type: "chip", name: "X" }} className="chip large" />
            <Draggable id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} className="chip large" />
            <Draggable id="chip-k" label="K" payload={{ type: "chip", name: "K" }} className="chip large" />
          </div>
        </div>
      )}

      {currentStep === "build" && (
        <div className="section">
          <div className="step-title">What’s the equation for k?</div>
          <div className="muted bigger">Drag <b>y</b> and <b>x</b> into the fraction.</div>
          <div className="chips with-borders" style={{ marginTop: 10 }}>
            <Draggable id="chip-y2" label="Y" payload={{ type: "chip", name: "Y" }} className="chip large" />
            <Draggable id="chip-x2" label="X" payload={{ type: "chip", name: "X" }} className="chip large" />
          </div>
        </div>
      )}

      {currentStep === "fill" && (
        <div className="section">
          <div className="step-title">Fill each row & calculate</div>
          <div className="muted bigger">
            For each row, make <b>Y/X = yᵢ/xᵢ</b>. The result will appear after a moment.
          </div>
          <div className="center mt-8">
          </div>
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
            <div className="center mt-10">
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
            {solveOptions.map(({ key, label, correct }) => (
              <button
                key={key}
                className="button"
                onClick={() => {
                  if (correct) {
                    solveRow4();
                    const el = document.querySelector(".ptable tbody tr:last-child td:nth-child(2)");
                    if (el) {
                      el.classList.add("flash");
                      setTimeout(() => el.classList.remove("flash"), 1500);
                    }
                    // confetti
                    const host = document.createElement("div");
                    host.className = "sf-confetti";
                    document.body.appendChild(host);
                    const colors = ["#10B981","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];
                    for (let i = 0; i < 80; i++) {
                      const p = document.createElement("div");
                      p.className = "sf-confetti-piece";
                      p.style.left = Math.random() * 100 + "vw";
                      p.style.width = "6px";
                      p.style.height = "10px";
                      p.style.background = colors[(Math.random() * colors.length) | 0];
                      p.style.animationDuration = 2 + Math.random() * 1.5 + "s";
                      host.appendChild(p);
                    }
                    setTimeout(() => host.remove(), 2500);
                  } else {
                    alert("Not quite — try another.");
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
