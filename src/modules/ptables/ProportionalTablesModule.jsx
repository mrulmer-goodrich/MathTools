// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

export default function ProportionalTablesModule() {
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  // { [rowIndex]: { num, den } }
  const [fractions, setFractions] = useState({});
  const [kFromFractions, setKFromFractions] = useState(null);
  const [row4Answer, setRow4Answer] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  const resetAll = (d = difficulty) => {
    const next = genPTable(d);
    setProblem(next);
    setXPlaced(false);
    setYPlaced(false);
    setKPlaced(false);
    setFractions({});
    setKFromFractions(null);
    setRow4Answer(null);
    setFeedback("");
  };

  const writeFrac = (rowIndex, part, value) => {
    setFractions((prev) => {
      const next = { ...prev, [rowIndex]: { ...(prev[rowIndex] || {}), [part]: value } };
      const rows = Object.values(next);
      if (rows.length === 3 && rows.every(r => r.num != null && r.den != null)) {
        const ks = rows.map(({ num, den }) => (den === 0 ? null : num / den));
        if (ks.every(v => typeof v === "number" && isFinite(v))) {
          const eq = (a,b) => Math.abs(a-b) < 1e-9;
          const same = ks.every(v => eq(v, ks[0]));
          if (same) {
            setKFromFractions(ks[0]);
            setFeedback("Nice! Constant of proportionality identified.");
          } else {
            setKFromFractions(null);
            setFeedback("Those ratios don’t match. This table may not be proportional.");
          }
        }
      }
      return next;
    });
  };

  const onSolveRow4 = () => {
    if (!problem.revealRow4 || kFromFractions == null) return;
    setRow4Answer(kFromFractions * problem.revealRow4.x);
    setFeedback("Multiply k · x to get y. Great work!");
  };

  const HeaderDrop = ({ placed, label, onDrop }) => (
    <Slot
      accept={["chip"]}
      onDrop={onDrop}
      className={`ptable-thslot ${placed ? "placed" : "empty"}`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  const FractionSlot = ({ rowIndex, part }) => (
    <Slot
      accept={["value"]}
      onDrop={(data) => writeFrac(rowIndex, part, data?.value ?? null)}
      className="slot ptable-fracslot"
    >
      {fractions[rowIndex]?.[part] ?? <span className="muted">—</span>}
    </Slot>
  );

  return (
    <div className="panes">
      {/* LEFT CARD — TABLE */}
      <div className="card">
        <h2 className="brand" style={{ fontSize: 24, margin: 0, marginBottom: 6 }}>Proportional Table</h2>

        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th><HeaderDrop placed={xPlaced} label="X" onDrop={() => setXPlaced(true)} /></th>
                <th><HeaderDrop placed={yPlaced} label="Y" onDrop={() => setYPlaced(true)} /></th>
                <th><HeaderDrop placed={kPlaced} label="K or Y/X" onDrop={() => setKPlaced(true)} /></th>
              </tr>
            </thead>

            <tbody>
              {problem.rows.map((r, idx) => (
                <tr key={idx}>
                  <td>
                    <Draggable id={`x-${idx}`} label={`${r.x}`} payload={{ type: "value", value: r.x }} className="chip" />
                  </td>
                  <td>
                    <Draggable id={`y-${idx}`} label={`${r.y}`} payload={{ type: "value", value: r.y }} className="chip" />
                  </td>
                  <td>
                    {xPlaced && yPlaced && kPlaced ? (
                      <div className="fraction-row nowrap">
                        <FractionSlot rowIndex={idx} part="num" />
                        <span>/</span>
                        <FractionSlot rowIndex={idx} part="den" />
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {problem.proportional && (
                <tr>
                  <td>{problem.revealRow4?.x}</td>
                  <td>{row4Answer == null ? "?" : row4Answer}</td>
                  <td>
                    {kFromFractions != null ? (
                      <BigButton onClick={onSolveRow4}>Solve Y = k×X</BigButton>
                    ) : (
                      <span className="muted small">Find k first</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controls row */}
        <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <BigButton onClick={() => { setDifficulty("easy");   resetAll("easy");   }} className={difficulty==="easy"?"flash":""}>Easy</BigButton>
            <BigButton onClick={() => { setDifficulty("medium"); resetAll("medium"); }} className={difficulty==="medium"?"flash":""}>Medium</BigButton>
            <BigButton onClick={() => { setDifficulty("hard");   resetAll("hard");   }} className={difficulty==="hard"?"flash":""}>Hard</BigButton>
          </div>

          <BigButton onClick={() => resetAll()}>New Problem</BigButton>
        </div>
      </div>

      {/* RIGHT CARD — STEPS & CHIPS */}
      <div className="card right-steps">
        <h2 className="brand" style={{ fontSize: 24, margin: 0, marginBottom: 6 }}>Build the Equation</h2>

        <div className="section">
          <div className="step-title">Step 1 — Label the headers</div>
          <div className="muted bigger">Drag <b>X</b> to the first header, <b>Y</b> to the second, and <b>K</b> to the third.</div>
        </div>

        <div className="section">
          <div className="step-title">Step 2 — Form the ratios</div>
          <div className="muted bigger">For each row, drag values into the fraction to form <b>Y/X</b>.</div>
        </div>

        <div className="section">
          <div className="step-title">Step 3 — Check for a constant</div>
          <div className="muted bigger">If all three ratios match, the table is proportional and the common value is <b>k</b>.</div>
        </div>

        <div className="section">
          <div className="step-title">Step 4 — Solve a new row</div>
          <div className="muted bigger">Use <b>Y = k×X</b> to find the missing fourth-row <b>Y</b>.</div>
        </div>

        <div className="chips with-borders">
          <Draggable id="chip-x" label="X" payload={{ type: "chip", name: "X" }} />
          <Draggable id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} />
          <Draggable id="chip-k" label="K" payload={{ type: "chip", name: "K" }} />
          <Draggable id="chip-eq" label="=" payload={{ type: "chip", name: "=" }} />
        </div>

        <div className="status-box mt-8">
          <div className="step-title" style={{ marginBottom: 4 }}>Status</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Headers: {xPlaced ? "X ✓" : "X …"}, {yPlaced ? "Y ✓" : "Y …"}, {kPlaced ? "K ✓" : "K …"}</li>
            <li>k from rows: {kFromFractions != null ? <b>{kFromFractions}</b> : "—"}</li>
            <li>Table: {kFromFractions != null ? (problem.proportional ? "Proportional ✓" : "Fractions disagree ✗") : "Undetermined"}</li>
          </ul>
          {feedback && <div className="mt-8">{feedback}</div>}
        </div>
      </div>
    </div>
  );
}
