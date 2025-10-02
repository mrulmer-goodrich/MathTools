// src/modules/ptables/ProportionalTablesModule.jsx — NOW format (LOCKED v7.8)
// This file preserves your current NOW structure & wording, adds the missing
// K = y/x area under the headers, and includes only surgical fixes:
//  • single wrapper system (local tap-to-place) — no global component edits
//  • safe Fisher–Yates shuffle
//  • strict header gate: kPlaced && numIsY && denIsX
//  • no refactors, no renames of shared components
//  • PATCH markers show exactly what changed vs earlier NOW versions

import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import DraggableChip from "../../components/DraggableChip.jsx";
import DropSlot from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";
import SummaryOverlay from "../../components/SummaryOverlay.jsx";

// ---------------------------------------------------------------------------
// Persistence (unchanged)
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// ---------------------------------------------------------------------------
// Utils (PATCH: fixed shuffle)
const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const nameOf = (d) => d?.name ?? d?.label ?? d?.value;
const fmt = (n) => (Number.isFinite(n) ? (Math.round(n * 1000) / 1000).toString() : "");
// PATCH: safe Fisher–Yates swap
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---------------------------------------------------------------------------
// Tap-to-place support — local store + local wrappers (no global changes)
const _pickStore = {
  data: null,
  set(d) { this.data = d || null; },
  peek() { return this.data; },
  clear() { this.data = null; }
};

// Local wrapper: Draggable that supports tap-to-pick
const Draggable = ({ data, payload, onClick, ...rest }) => {
  const merged = data ?? payload;
  const handleClick = (e) => {
    _pickStore.set(merged);
    onClick?.(e);
  };
  return <DraggableChip data={merged} onClick={handleClick} {...rest} />;
};

// Local wrapper: DropSlot that supports tap-to-place
const Slot = ({ accept, test, validator, onDrop, onDropContent, onClick, ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const allowed = Array.isArray(accept) && accept.length ? accept.includes(t) : true;
    const ok = typeof validator === "function" ? !!validator(d) : true;
    return allowed && ok;
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
  return <DropSlot test={testFn} onDropContent={onDropContentFn} onClick={handleClick} {...rest} />;
};

// ---------------------------------------------------------------------------
// Accept types (PATCH: ensure 'header' included)
const ACCEPT_HEADER = ["chip", "sym", "symbol", "header"];
const ACCEPT_VALUE  = ["value", "number"];

// ---------------------------------------------------------------------------
// Component
export default function ProportionalTablesModule() {
  // Difficulty + problem
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));

  // Header placements — two columns (x, y). K is handled in the K-area below.
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);

  // K equation area (PATCH: explicit k token + y/x fraction)
  const [kPlaced, setKPlaced] = useState(false);
  const [numIsY, setNumIsY] = useState(false);
  const [denIsX, setDenIsX] = useState(false);

  // PATCH: strict header gate
  const headerEqCorrect = kPlaced && numIsY && denIsX;

  // Per-row fractions & computed k
  const [fractions, setFractions] = useState({}); // {i:{num,den}}
  const [kValues, setKValues] = useState({});     // {i:number}
  const [reveal, setReveal] = useState({});       // {i:true}
  const timers = useRef({});

  // Concept
  const allRowsComputed = useMemo(() => [0,1,2].every(i => {
    const f = fractions[i];
    return f?.num != null && f?.den != null && Number.isFinite(kValues[i]);
  }), [fractions, kValues]);

  const allRowsRevealed = useMemo(() => [0,1,2].every(i => reveal[i] === true), [reveal]);

  const ksEqual = useMemo(() => {
    const vals = [kValues[0], kValues[1], kValues[2]];
    if (vals.some(v => typeof v !== "number")) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  }, [kValues]);

  const conceptChoices = useMemo(() => shuffle([
    { key:"yes_same", label:"Yes, because k is the same" },
    { key:"yes_diff", label:"Yes, because k is NOT the same" },
    { key:"no_same",  label:"No, because k is the same" },
    { key:"no_diff",  label:"No, because k is NOT the same" },
  ]), [problem]);

  const [conceptAnswer, setConceptAnswer] = useState(null);
  const conceptCorrect = useMemo(() => {
    if (!allRowsComputed || ksEqual == null || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  }, [allRowsComputed, ksEqual, conceptAnswer]);

  const revealFourthRow = conceptCorrect && ksEqual === true;
  const [row4Answer, setRow4Answer] = useState(null);

  // Side effects
  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  const resetAll = (next = difficulty) => {
    const p = genPTable(next);
    setProblem(p);
    setXPlaced(false); setYPlaced(false);
    setKPlaced(false); setNumIsY(false); setDenIsX(false);
    setFractions({}); setKValues({}); setReveal({});
    setConceptAnswer(null); setRow4Answer(null);
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  };

  // Auto-compute k when num/den present
  useEffect(() => {
    [0,1,2].forEach(i => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0) {
        const kv = f.num / f.den;
        setKValues(prev => (prev[i] === kv ? prev : { ...prev, [i]: kv }));
      }
    });
  }, [fractions]);

  // Reveal after delay
  useEffect(() => {
    [0,1,2].forEach(i => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && Number.isFinite(kValues[i]) && !reveal[i]) {
        if (timers.current[i]) clearTimeout(timers.current[i]);
        timers.current[i] = setTimeout(() => {
          setReveal(prev => ({ ...prev, [i]: true }));
        }, 2000);
      }
    });
  }, [fractions, kValues, reveal]);

  // Row drop validator (keeps your stricter rules)
  const onRowDrop = (i, part, d) => {
    if (!d || !ACCEPT_VALUE.includes(d.type)) return;
    if (d.row !== i) return;
    if (part === "num" && d.axis !== "y") return;
    if (part === "den" && d.axis !== "x") return;
    const val = Number(d.value ?? nameOf(d));
    if (!Number.isFinite(val)) return;
    if (timers.current[i]) clearTimeout(timers.current[i]);
    setReveal(prev => ({ ...prev, [i]: false }));
    setFractions(prev => ({ ...prev, [i]: { ...(prev[i] || {}), [part]: val } }));
  };

  const calcRow = (i) => {
    const f = fractions[i];
    if (!f || f.den == null || f.num == null || f.den === 0) return;
    setKValues(prev => ({ ...prev, [i]: f.num / f.den }));
  };
  const calcAll = () => [0,1,2].forEach(calcRow);

  const solveRow4 = () => {
    if (!revealFourthRow || !problem.revealRow4) return;
    setRow4Answer(kValues[0] * problem.revealRow4.x);
  };

  // Step gating (unchanged except stricter header gate)
  const currentStep = useMemo(() => {
    if (!xPlaced || !yPlaced) return "label";
    if (!headerEqCorrect)   return "build";
    if (!allRowsRevealed)   return "fill";
    if (!conceptCorrect)    return "concept";
    return "solve";
  }, [xPlaced, yPlaced, headerEqCorrect, allRowsRevealed, conceptCorrect]);

  // -------------------------------------------------------------------------
  // Small helpers
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

  // PATCH: K equation area under header row
  const KArea = () => (
    <div className="ptable-header-eq">
      <div className="ptable-eq-row nowrap">
        {/* K token slot */}
        <Slot
          accept={ACCEPT_HEADER}
          onDrop={(d) => {
            const n = (nameOf(d) ?? "").toString().trim().toUpperCase();
            if (n === "K") setKPlaced(true);
          }}
          className={`slot k-badge ${kPlaced ? "filled" : ""}`}
        >
          {kPlaced ? <span className="badge">k</span> : <span className="muted">K</span>}
        </Slot>

        <span>=</span>

        {/* Numerator (Y) */}
        <Slot
          accept={ACCEPT_HEADER}
          onDrop={(d) => {
            const n = (nameOf(d) ?? "").toString().trim().toUpperCase();
            if (n === "Y") setNumIsY(true);
          }}
          className={`slot ptable-fracslot tiny ${numIsY ? "filled" : ""}`}
        >
          {numIsY ? <span className="chip chip-tiny">y</span> : <span className="muted">—</span>}
        </Slot>

        <div className="frac-bar narrow" />

        {/* Denominator (X) */}
        <Slot
          accept={ACCEPT_HEADER}
          onDrop={(d) => {
            const n = (nameOf(d) ?? "").toString().trim().toUpperCase();
            if (n === "X") setDenIsX(true);
          }}
          className={`slot ptable-fracslot tiny ${denIsX ? "filled" : ""}`}
        >
          {denIsX ? <span className="chip chip-tiny">x</span> : <span className="muted">—</span>}
        </Slot>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render
  return (
    <div className="ptables">
      <div className="panes">
        <div className="left-pane">
          {/* Difficulty */}
          <div className="difficulty">
            <button onClick={() => resetAll("easy")} className="pill">Easy</button>
            <button onClick={() => resetAll("medium")} className="pill">Medium</button>
            <button onClick={() => resetAll("hard")} className="pill">Hard</button>
          </div>

          {/* Chips (keep your capitalization style) */}
          <div className="chips with-borders">
            <Draggable data={{ type:"header", name:"x" }} label="X" />
            <Draggable data={{ type:"header", name:"y" }} label="Y" />
            <Draggable data={{ type:"header", name:"k" }} label="K" />
          </div>

          {/* Two header slots (X, Y) as in NOW */}
          <div className="table header-row">
            <HeaderDrop placed={xPlaced} label="x" expectName="x" onPlaced={setXPlaced} />
            <HeaderDrop placed={yPlaced} label="y" expectName="y" onPlaced={setYPlaced} />
          </div>

          {/* PATCH: K equation area (added under header row) */}
          <KArea />

          {/* Rows 1–3 */}
          {[0,1,2].map(i => (
            <div key={i} className="fraction-row nowrap">
              <Slot accept={ACCEPT_VALUE} onDrop={(d) => onRowDrop(i, "num", d)} className="slot ptable-fracslot">
                {fractions[i]?.num ?? <span className="muted">—</span>}
              </Slot>
              <div className="frac-bar" />
              <Slot accept={ACCEPT_VALUE} onDrop={(d) => onRowDrop(i, "den", d)} className="slot ptable-fracslot">
                {fractions[i]?.den ?? <span className="muted">—</span>}
              </Slot>
              <span className="muted">=</span>
              <span className={`result ${reveal[i] ? "sf-fade" : "sf-hidden"}`}>
                {Number.isFinite(kValues[i]) ? fmt(kValues[i]) : "—"}
              </span>
            </div>
          ))}

          {/* Controls */}
          <div className="controls">
            <BigButton onClick={calcAll} className="mr-2">Calculate All</BigButton>
            <BigButton onClick={() => resetAll(difficulty)}>New Problem</BigButton>
          </div>
        </div>

        <div className="right-pane">
          {/* Right card wording kept as in NOW */}
          <div className="card q">
            <div className="title">Where do these values belong in the table?</div>
            <div className="subtitle">Drag and drop to the header of the table.</div>
          </div>

          {/* Concept */}
          {currentStep === "concept" && (
            <div className="right-steps">
              <div className="step-title question-xl">Is this table proportional?</div>
              <div className="choices grid-2">
                {conceptChoices.map(c => (
                  <button
                    key={c.key}
                    className={`choice ${conceptAnswer === c.key ? "selected" : ""}`}
                    onClick={() => setConceptAnswer(c.key)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Solve */}
          {currentStep === "solve" && (
            <div className="right-steps">
              <div className="step-title">Use k to find the missing value</div>
              <div className="muted bigger">k = {fmt(kValues[0])}</div>
              {problem?.revealRow4 ? (
                <div className="big-fraction">
                  <span className="badge">y</span>
                  <span>=</span>
                  <span className="badge">x</span>
                  <span>×</span>
                  <span className="badge">k</span>
                </div>
              ) : null}
              <div className="controls">
                <BigButton onClick={solveRow4} disabled={!revealFourthRow}>Solve</BigButton>
                {row4Answer != null && <div className="result-big sf-fade">{fmt(row4Answer)}</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary overlay hook preserved */}
      <SummaryOverlay visible={false} />
    </div>
  );
}
