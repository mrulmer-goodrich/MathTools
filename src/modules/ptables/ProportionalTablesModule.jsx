// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useMemo, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);
const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

export default function ProportionalTablesModule() {
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));

  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  const [eqPlaced, setEqPlaced] = useState(false);
  const [fracPlaced, setFracPlaced] = useState(false);
  const [numIsY, setNumIsY] = useState(false);
  const [denIsX, setDenIsX] = useState(false);
  const headerEqCorrect = kPlaced && eqPlaced && fracPlaced && numIsY && denIsX;

  const [fractions, setFractions] = useState({});
  const [kValues, setKValues] = useState({});

  const allRowsComputed = useMemo(() => {
    return [0,1,2].every(i => {
      const f = fractions[i];
      return f?.num != null && f?.den != null &&
             typeof kValues[i] === "number" && isFinite(kValues[i]);
    });
  }, [fractions, kValues]);

  const ksEqual = useMemo(() => {
    const vals = [kValues[0], kValues[1], kValues[2]];
    if (vals.some(v => typeof v !== "number")) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  }, [kValues]);

  const [conceptAnswer, setConceptAnswer] = useState(null); // 'yes_same'|'yes_diff'|'no_same'|'no_diff'
  const conceptCorrect = useMemo(() => {
    if (!allRowsComputed || ksEqual == null || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  }, [allRowsComputed, ksEqual, conceptAnswer]);

  const revealFourthRow = conceptCorrect && ksEqual === true;
  const [row4Answer, setRow4Answer] = useState(null);

  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  const resetAll = (nextDiff = difficulty) => {
    const next = genPTable(nextDiff);
    setProblem(next);
    setXPlaced(false); setYPlaced(false); setKPlaced(false);
    setEqPlaced(false); setFracPlaced(false); setNumIsY(false); setDenIsX(false);
    setFractions({}); setKValues({}); setConceptAnswer(null); setRow4Answer(null);
  };

  // tolerant helpers
  const nameOf = (d) => (d?.name ?? d?.label ?? d?.value);
  const acceptHeader = ["chip","sym","symbol"];      // X/Y/K sometimes come as chip or sym
  const acceptEq     = ["sym","symbol","chip"];      // '=' may be a chip or sym
  const acceptFrac   = ["frac","fraction","template"];
  const acceptValue  = ["value","number"];

  useEffect(() => {
    [0,1,2].forEach(i => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0) {
        const kv = f.num / f.den;
        setKValues(prev => (prev[i] === kv ? prev : { ...prev, [i]: kv }));
      }
    });
  }, [fractions]);

  const calcRow = (i) => {
    const f = fractions[i];
    if (!f || f.den == null || f.num == null || f.den === 0) return;
    setKValues(prev => ({ ...prev, [i]: f.num / f.den }));
  };
  const calcAll = () => [0,1,2].forEach(calcRow);

  const onRowDrop = (i, part, d) => {
    if (!d || !acceptValue.includes(d.type)) return;
    setFractions(prev => ({ ...prev, [i]: { ...(prev[i]||{}), [part]: Number(nameOf(d)) } }));
  };

  const solveRow4 = () => {
    if (!revealFourthRow || !problem.revealRow4) return;
    setRow4Answer(kValues[0] * problem.revealRow4.x);
  };

  const currentStep = useMemo(() => {
    if (!xPlaced || !yPlaced || !kPlaced) return "label";
    if (!headerEqCorrect) return "build";
    if (!allRowsComputed) return "fill";
    if (!conceptCorrect) return "concept";
    return "solve";
  }, [xPlaced,yPlaced,kPlaced,headerEqCorrect,allRowsComputed,conceptCorrect]);

  const HeaderDrop = ({ placed, label, expectName, onPlaced }) => (
    <Slot
      accept={acceptHeader}
      onDrop={(d) => { if (nameOf(d) === expectName) onPlaced(true); }}
      className={`ptable-thslot ${placed ? "placed" : "empty"}`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  const HeaderEqArea = () => {
    if (!kPlaced) return null;
    return (
      <div className="ptable-header-eq">
        <div className="ptable-eq-row">
          <div className="badge">k</div>
          <Slot
            accept={acceptEq}
            onDrop={(d) => { if (nameOf(d) === "=") setEqPlaced(true); }}
            className={`ptable-eq-slot ${eqPlaced ? "filled" : ""}`}
          >
            {eqPlaced ? "=" : <span className="muted">=</span>}
          </Slot>

          {!fracPlaced ? (
            <Slot
              accept={acceptFrac}
              onDrop={() => setFracPlaced(true)}
              className="ptable-frac-template-slot"
            >
              <span className="muted">fraction</span>
            </Slot>
          ) : (
            <div className="fraction-row nowrap">
              <Slot
                accept={acceptHeader}
                onDrop={(d) => { if (nameOf(d) === "Y") setNumIsY(true); }}
                className={`slot ptable-fracslot ${numIsY ? "filled" : ""}`}
              >
                {numIsY ? "Y" : <span className="muted">—</span>}
              </Slot>
              <span>/</span>
              <Slot
                accept={acceptHeader}
                onDrop={(d) => { if (nameOf(d) === "X") setDenIsX(true); }}
                className={`slot ptable-fracslot ${denIsX ? "filled" : ""}`}
              >
                {denIsX ? "X" : <span className="muted">—</span>}
              </Slot>
            </div>
          )}
        </div>
        {headerEqCorrect && (
          <div className="muted small" style={{ marginTop: 6 }}>
            Great—now fill each row with its own <b>Y</b> and <b>X</b>, then Calculate.
          </div>
        )}
      </div>
    );
  };

  const KRevealOverlay = () => {
    if (kPlaced) return null;
    return (
      <div className="ptable-k-overlay" aria-hidden="true">
        <Slot
          accept={acceptHeader}
          onDrop={(d) => { if (nameOf(d) === "K") setKPlaced(true); }}
          className="ptable-k-target"
        />
      </div>
    );
  };

  const Table = useMemo(() => {
    // keep 3rd column width reserved until K is placed
    const invis = !kPlaced ? "col3-invisible" : "";
    return (
      <div className="ptable-wrap">
        <div className={`ptable-rel ptable-table dark ${invis}`}>
          <KRevealOverlay />
          <table className="ptable">
            <colgroup>
              <col /> <col /> <col /> {/* reserve width for col 3 */}
            </colgroup>
            <thead>
              <tr>
                <th>
                  <HeaderDrop placed={xPlaced} label="X" expectName="X" onPlaced={setXPlaced} />
                </th>
                <th>
                  <HeaderDrop placed={yPlaced} label="Y" expectName="Y" onPlaced={setYPlaced} />
                </th>
                <th>
                  <HeaderDrop placed={kPlaced} label="K" expectName="K" onPlaced={setKPlaced} />
                  <HeaderEqArea />
                </th>
              </tr>
            </thead>
            <tbody>
              {[0,1,2].map(idx => {
                const r = problem.rows[idx];
                return (
                  <tr key={idx}>
                    <td>
                      <Draggable id={`x-${idx}`} label={`${r.x}`} payload={{ type:"number", value:r.x }} className="chip" />
                    </td>
                    <td>
                      <Draggable id={`y-${idx}`} label={`${r.y}`} payload={{ type:"number", value:r.y }} className="chip" />
                    </td>
                    <td>
                      {headerEqCorrect ? (
                        <div className="fraction-row nowrap center">
                          <div className="calc-inline">Y/X =</div>
                          <Slot accept={acceptValue} onDrop={(d)=>onRowDrop(idx,"num",d)} className="slot ptable-fracslot">
                            {fractions[idx]?.num ?? <span className="muted">—</span>}
                          </Slot>
                          <span>/</span>
                          <Slot accept={acceptValue} onDrop={(d)=>onRowDrop(idx,"den",d)} className="slot ptable-fracslot">
                            {fractions[idx]?.den ?? <span className="muted">—</span>}
                          </Slot>
                          <button className="button ml-12" onClick={()=>calcRow(idx)}>Calculate</button>
                          {typeof kValues[idx] === "number" && isFinite(kValues[idx]) && (
                            <span className="badge ml-12">k = {kValues[idx]}</span>
                          )}
                        </div>
                      ) : <span className="muted">—</span>}
                    </td>
                  </tr>
                );
              })}
              {revealFourthRow && problem.revealRow4 && (
                <tr>
                  <td>{problem.revealRow4.x}</td>
                  <td>{row4Answer == null ? "?" : row4Answer}</td>
                  <td>
                    <button className="button success" onClick={solveRow4}>Solve Y = k×X</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {revealFourthRow && (
            <div className="ptable-overlay" aria-hidden="true">
              <div className="ptable-overlay-inner">
                <span className="calc-inline">Y</span>
                <span className="calc-inline" style={{ color:"#b91c1c", fontWeight:900 }}>×</span>
                <span className="result-big">k = {kValues[0]}</span>
                <span className="calc-inline">· X</span>
              </div>
            </div>
          )}
        </div>

        {/* New Problem BELOW the table, centered */}
        <div className="center" style={{ marginTop: 12 }}>
          <BigButton onClick={() => resetAll()}>New Problem</BigButton>
        </div>
      </div>
    );
  }, [problem, xPlaced, yPlaced, kPlaced, headerEqCorrect, fractions, kValues, revealFourthRow, row4Answer]);

  return (
    <div className="panes">
      {/* LEFT CARD */}
      <div className="card">
        {/* Difficulty top-left (pressed look handled in CSS .press) */}
        <div className="row" style={{ justifyContent:"flex-start", marginBottom:8, gap:8 }}>
          <div className={`press ${difficulty==="easy" ? "is-active" : ""}`}>
            <BigButton onClick={()=>{ setDifficulty("easy"); resetAll("easy"); }} aria-pressed={difficulty==="easy"}>Easy</BigButton>
          </div>
          <div className={`press ${difficulty==="medium" ? "is-active" : ""}`}>
            <BigButton onClick={()=>{ setDifficulty("medium"); resetAll("medium"); }} aria-pressed={difficulty==="medium"}>Medium</BigButton>
          </div>
          <div className={`press ${difficulty==="hard" ? "is-active" : ""}`}>
            <BigButton onClick={()=>{ setDifficulty("hard"); resetAll("hard"); }} aria-pressed={difficulty==="hard"}>Hard</BigButton>
          </div>
        </div>

        {Table}
      </div>

      {/* RIGHT CARD — single step visible */}
      <div className="card right-steps">
        {currentStep === "label" && (
          <div className="section">
            <div className="step-title">Label the table</div>
            <div className="muted bigger">
              Drag <b>X</b> and <b>Y</b> to the first two headers. Drop <b>K</b> onto the hidden third header to reveal it.
            </div>
            <div className="chips with-borders" style={{ marginTop:10 }}>
              <Draggable id="chip-x" label="X" payload={{ type:"chip", name:"X" }} className="chip large" />
              <Draggable id="chip-y" label="Y" payload={{ type:"chip", name:"Y" }} className="chip large" />
              <Draggable id="chip-k" label="K" payload={{ type:"chip", name:"K" }} className="chip large" />
            </div>
          </div>
        )}

        {currentStep === "build" && (
          <div className="section">
            <div className="step-title">Complete the formula for k</div>
            <div className="muted bigger">Build <b>k = Y / X</b> in the third header.</div>
            <div className="chips with-borders" style={{ marginTop:10 }}>
              <Draggable id="chip-eq" label="=" payload={{ type:"sym", name:"=" }} className="chip large" />
              <Draggable id="chip-frac" label="Fraction" payload={{ type:"frac" }} className="chip large" />
              <Draggable id="chip-y2" label="Y" payload={{ type:"chip", name:"Y" }} className="chip large" />
              <Draggable id="chip-x2" label="X" payload={{ type:"chip", name:"X" }} className="chip large" />
            </div>
          </div>
        )}

        {currentStep === "fill" && (
          <div className="section">
            <div className="step-title">Fill each row & calculate</div>
            <div className="muted bigger">For each row, make <b>Y/X = yᵢ/xᵢ</b> and press <b>Calculate</b>. Or use Calculate All.</div>
            <div className="center mt-8">
              <button className="button" onClick={calcAll}>Calculate All</button>
            </div>
          </div>
        )}

        {currentStep === "concept" && (
          <div className="section">
            <div className="step-title">Is this table proportional?</div>
            <div className="row" style={{ gap:8, justifyContent:"center" }}>
              <button className="button" onClick={()=>setConceptAnswer("yes_same")}>Yes, because k is the same</button>
              <button className="button" onClick={()=>setConceptAnswer("yes_diff")}>Yes, because k is NOT the same</button>
              <button className="button" onClick={()=>setConceptAnswer("no_same")}>No, because k is the same</button>
              <button className="button" onClick={()=>setConceptAnswer("no_diff")}>No, because k is NOT the same</button>
            </div>
            {conceptAnswer && (
              <div className="center mt-10">
                {conceptCorrect
                  ? <div className="badge" style={{ background:"#ecfdf5", borderColor:"#86efac" }}>✓ Correct</div>
                  : <div className="badge" style={{ background:"#fff7ed", borderColor:"#fed7aa" }}>Try again</div>
                }
              </div>
            )}
          </div>
        )}

        {currentStep === "solve" && (
          <div className="section">
            <div className="step-title">Finish the problem</div>
            <div className="muted bigger">Use <b>Y = k×X</b> to find the missing fourth-row <b>Y</b> on the left.</div>
          </div>
        )}
      </div>
    </div>
  );
}
