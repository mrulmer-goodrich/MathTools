
import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import DraggableBase from "../../components/DraggableChip.jsx";
import DropSlotBase from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const nameOf = (d) => d?.name ?? d?.label ?? d?.value;

function formatNumber(n){
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  const qMax = 9;
  for (let q=2;q<=qMax;q++){
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

const shuffle = (arr) => { const a = [...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

const _pickStore = {
  data: null,
  set(d){ this.data = d || null; },
  peek(){ return this.data; },
  clear(){ this.data = null; }
};

const Draggable = ({ payload, data, onClick, ...rest }) => {
  const merged = data ?? payload ?? undefined;
  const handleClick = (e) => { _pickStore.set(merged); onClick?.(e); };
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

const Slot = ({ accept, onDrop, validator, test, onDropContent, onClick, ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });
  const onDropContentFn = onDropContent ?? onDrop;
  const handleClick = (e) => {
    const picked = _pickStore.peek();
    if (picked && testFn(picked)) { try { onDropContentFn?.(picked); } catch {} _pickStore.clear(); }
    onClick?.(e);
  };
  return (
    <DropSlotBase
      test={testFn}
      onDropContent={onDropContentFn}
      onClick={handleClick}
      {...rest}
    />
  );
};

const ACCEPT_HEADER = ["chip", "sym", "symbol", "header"];
const ACCEPT_VALUE  = ["value", "number"];

export default function ProportionalTablesModule(){
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem]     = useState(() => genPTable(difficulty));

  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  const [numIsY, setNumIsY] = useState(false);
  const [denIsX, setDenIsX] = useState(false);
  const headerEqCorrect = kPlaced && numIsY && denIsX;

  const [fractions, setFractions] = useState({});
  const [kValues, setKValues]     = useState({});
  const [reveal, setReveal]       = useState({});
  const revealTimers = useRef({});

  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  useEffect(() => {
    [0,1,2].forEach(i => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0){
        const kv = f.num / f.den;
        setKValues(prev => (prev[i] === kv ? prev : { ...prev, [i]: kv }));
      }
    });
  }, [fractions]);

  useEffect(() => {
    [0,1,2].forEach(i => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && Number.isFinite(kValues[i]) && !reveal[i]){
        if (revealTimers.current[i]) clearTimeout(revealTimers.current[i]);
        revealTimers.current[i] = setTimeout(() => {
          setReveal(prev => ({ ...prev, [i]: true }));
        }, 1200);
      }
    });
  }, [fractions, kValues, reveal]);

  const ksEqual = useMemo(() => {
    const vals = [kValues[0], kValues[1], kValues[2]];
    if (vals.some(v => typeof v !== "number")) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  }, [kValues]);

  const randomizedConcept = useMemo(() =>
    shuffle([
      { key: "yes_same", label: "Yes, because k is the same" },
      { key: "no_diff",  label: "No, because k is NOT the same" },
      { key: "no_same",  label: "No, because k is the same" },
      { key: "yes_diff", label: "Yes, because k is NOT the same" },
    ])
  , [problem]);

  const [conceptAnswer, setConceptAnswer] = useState(null);
  const conceptCorrect = useMemo(() => {
    if (!headerEqCorrect) return false;
    if (ksEqual == null) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  }, [headerEqCorrect, ksEqual, conceptAnswer]);

  const revealFourthRow = conceptCorrect && ksEqual === true;
  const [row4Answer, setRow4Answer] = useState(null);

  useEffect(() => () => {
    Object.values(revealTimers.current).forEach(t => clearTimeout(t));
    revealTimers.current = {};
  }, []);

  const resetAll = (nextDiff = difficulty) => {
    const next = genPTable(nextDiff);
    setProblem(next);
    setXPlaced(false); setYPlaced(false); setKPlaced(false);
    setNumIsY(false); setDenIsX(false);
    setFractions({}); setKValues({}); setReveal({});
    setConceptAnswer(null); setRow4Answer(null);
    Object.values(revealTimers.current).forEach(t => clearTimeout(t));
    revealTimers.current = {};
    _pickStore.clear();
  };

  const HeaderDrop = ({ placed, label, expectName, onPlaced }) => (
    <Slot
      accept={ACCEPT_HEADER}
      onDrop={(d) => {
        const got = (nameOf(d) ?? "").toString().trim().toLowerCase();
        const want = (expectName ?? "").toString().trim().toLowerCase();
        if (got === want) onPlaced(true);
      }}
      className={`ptable-thslot ${placed ? "placed" : "empty"}`}
      aria-label={placed ? label : `place ${expectName}`}
    >
      {placed ? label : <span className="visually-hidden">target</span>}
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
            <Slot
              accept={ACCEPT_HEADER}
              onDrop={(d) => { const got = (nameOf(d) ?? "").toString().trim().toLowerCase(); if (got === "y") setNumIsY(true); }}
              className={`slot ptable-fracslot tiny ${numIsY ? "filled" : ""}`}
            >
              {numIsY ? <span className="chip chip-tiny">y</span> : <span className="muted">—</span>}
            </Slot>
            <div className="frac-bar narrow" />
            <Slot
              accept={ACCEPT_HEADER}
              onDrop={(d) => { const got = (nameOf(d) ?? "").toString().trim().toLowerCase(); if (got === "x") setDenIsX(true); }}
              className={`slot ptable-fracslot tiny ${denIsX ? "filled" : ""}`}
            >
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
        <Slot
          accept={ACCEPT_HEADER}
          onDrop={(d) => { const got = (nameOf(d) ?? "").toString().trim().toLowerCase(); if (got === "k") setKPlaced(true); }}
          className="ptable-k-target"
        />
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
                <th><HeaderDrop placed={xPlaced} label="x" expectName="x" onPlaced={setXPlaced} /></th>
                <th><HeaderDrop placed={yPlaced} label="y" expectName="y" onPlaced={setYPlaced} /></th>
                <th>
                  {kPlaced ? (
                    <>
                      <div className="hhead-text">k</div>
                      <HeaderEqArea />
                    </>
                  ) : (
                    <div className="hhead-text">k</div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {[0,1,2].map(i => (
                <tr key={i}>
                  <td>
                    <Slot
                      accept={ACCEPT_VALUE}
                      onDrop={(d)=> setFractions(prev => ({ ...prev, [i]: { ...(prev[i]||{}), num: d?.value } }))}
                      className="slot ptable-fracslot"
                    >
                      {fractions[i]?.num ?? <span className="muted">—</span>}
                    </Slot>
                  </td>
                  <td>
                    <Slot
                      accept={ACCEPT_VALUE}
                      onDrop={(d)=> setFractions(prev => ({ ...prev, [i]: { ...(prev[i]||{}), den: d?.value } }))}
                      className="slot ptable-fracslot"
                    >
                      {fractions[i]?.den ?? <span className="muted">—</span>}
                    </Slot>
                  </td>
                  <td>
                    {reveal[i] && Number.isFinite(kValues[i]) ? (
                      <div className="calc-inline">= <b>{formatNumber(kValues[i])}</b></div>
                    ) : (
                      <span className="muted">…</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  {revealFourthRow ? (
                    <div className="calc-inline">Use k to find the missing value.</div>
                  ) : <span className="muted">—</span>}
                </td>
                <td>
                  {revealFourthRow ? (
                    <div className="row" style={{ justifyContent:"center" }}>
                      {["× k","÷ k"].map((label,idx)=>{
                        const val = idx===0 ? "mul" : "div";
                        return (
                          <button key={val} className={`button ${row4Answer===val?"active":""}`} onClick={()=> setRow4Answer(val)}>
                            {label.replace("k","k")}
                          </button>
                        );
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
  }, [problem, xPlaced, yPlaced, kPlaced, fractions, kValues, reveal, revealFourthRow, row4Answer]);

  const ChipsLeft = () => {
    const vals = problem?.values || [];
    const symbols = ["x","y","k"].map((s) => ({ type:"header", label:s }));
    const valueChips = vals.map(v => ({ type:"value", value:v }));
    const all = [...symbols, ...valueChips];
    return (
      <div className="row" style={{ justifyContent:"center", flexWrap:"wrap", gap:12 }}>
        {all.map((c, idx) => (
          <Draggable key={idx} data={c} className="chip">
            {"label" in c ? c.label : c.value}
          </Draggable>
        ))}
      </div>
    );
  };

  const Concept = () => {
    const disabled = !(headerEqCorrect && [0,1,2].every(i => Number.isFinite(kValues[i])));
    return (
      <div className="section">
        <div className="step-title">Is the table proportional?</div>
        <div className="row" style={{ justifyContent:"center", gap:12, flexWrap:"wrap", maxWidth:520, margin:"0 auto" }}>
          {randomizedConcept.map((opt) => (
            <button
              key={opt.key}
              className={`button ${conceptAnswer===opt.key?"active":""}`}
              onClick={() => setConceptAnswer(opt.key)}
              disabled={disabled}
              style={{ width: 240 }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {conceptCorrect && <div className="lang-badge" style={{ marginTop:10 }}>Great — k is constant.</div>}
      </div>
    );
  };

  const Controls = () => (
    <div className="row" style={{ justifyContent:"center", gap:12 }}>
      <div className="press">
        <BigButton onClick={() => resetAll(difficulty)} label="New Problem" />
      </div>
      <select
        aria-label="difficulty"
        value={difficulty}
        onChange={(e)=> resetAll(e.target.value)}
        className="button"
      >
        <option value="easy">easy</option>
        <option value="medium">medium</option>
        <option value="hard">hard</option>
      </select>
    </div>
  );

  return (
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
  );
}
