// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useMemo, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

// ---------- persistence ----------
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// Helper: compare floats
const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

export default function ProportionalTablesModule() {
  // difficulty + problem
  const [difficulty, setDifficulty] = useState(loadDifficulty()); // default Easy
  const [problem, setProblem] = useState(() => genPTable(difficulty));

  // header labels placed?
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false); // controls showing column 3

  // header equation assembly: k = Y/X
  const [eqPlaced, setEqPlaced] = useState(false);      // '=' dropped
  const [fracPlaced, setFracPlaced] = useState(false);  // Fraction template dropped
  const [numIsY, setNumIsY] = useState(false);          // Y in numerator
  const [denIsX, setDenIsX] = useState(false);          // X in denominator

  // once header eq is correct, prefill row equations (Y/X = [ - / - ])
  const headerEqCorrect = kPlaced && eqPlaced && fracPlaced && numIsY && denIsX;

  // per-row fractions entered and computed k_i
  // fractions: { [row]: { num, den } }, kValues: { [row]: number|null }
  const [fractions, setFractions] = useState({});
  const [kValues, setKValues] = useState({});

  // gate for concept question
  const allRowsComputed = useMemo(() => {
    const rows = [0, 1, 2];
    return rows.every((i) => {
      const f = fractions[i];
      return f?.num != null && f?.den != null && typeof kValues[i] === "number" && isFinite(kValues[i]);
    });
  }, [fractions, kValues]);

  // concept question answer
  const [conceptAnswer, setConceptAnswer] = useState(null); // 'yes_same' | 'yes_diff' | 'no_same' | 'no_diff'
  const ksEqual = useMemo(() => {
    const vals = [kValues[0], kValues[1], kValues[2]].filter((v) => typeof v === "number");
    if (vals.length < 3) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  }, [kValues]);

  const conceptCorrect = useMemo(() => {
    if (!allRowsComputed || ksEqual == null || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  }, [allRowsComputed, ksEqual, conceptAnswer]);

  // reveal 4th row only if proportional AND concept answer correct
  const revealFourthRow = conceptCorrect && ksEqual === true;

  // overlay for Y = k × X (show when revealFourthRow)
  const [row4Answer, setRow4Answer] = useState(null);

  // ---------- effects ----------
  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  // ---------- helpers ----------
  const resetAll = (nextDiff = difficulty) => {
    const next = genPTable(nextDiff);
    setProblem(next);

    setXPlaced(false);
    setYPlaced(false);
    setKPlaced(false);

    setEqPlaced(false);
    setFracPlaced(false);
    setNumIsY(false);
    setDenIsX(false);

    setFractions({});
    setKValues({});
    setConceptAnswer(null);
    setRow4Answer(null);
  };

  const onRowDrop = (rowIndex, part, data) => {
    // part: 'num' | 'den' ; data: { type:'value', value:number }
    if (!data || data.type !== "value") return;
    setFractions((prev) => {
      const next = { ...prev, [rowIndex]: { ...(prev[rowIndex] || {}), [part]: data.value } };
      return next;
    });
  };

  const calcRow = (rowIndex) => {
    const f = fractions[rowIndex];
    if (!f || f.den == null || f.num == null || f.den === 0) return;
    const kv = f.num / f.den;
    setKValues((prev) => ({ ...prev, [rowIndex]: kv }));
  };

  const calcAll = () => {
    [0, 1, 2].forEach((i) => calcRow(i));
  };

  const solveRow4 = () => {
    if (!revealFourthRow || !problem.revealRow4) return;
    // compute k as consensus of kValues (they're equal)
    const k = kValues[0];
    const y = k * problem.revealRow4.x;
    setRow4Answer(y);
  };

  // ---------- render helpers ----------
  const HeaderDrop = ({ placed, label, onDrop }) => (
    <Slot
      accept={["chip"]}
      onDrop={onDrop}
      className={`ptable-thslot ${placed ? "placed" : "empty"}`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  const HeaderEqArea = () => {
    // visible *only* after kPlaced (column revealed)
    if (!kPlaced) return null;

    const eqOK = headerEqCorrect;

    return (
      <div className="ptable-header-eq">
        {/* k  =  [ Y / X ] */}
        <div className="ptable-eq-row">
          <div className="badge">k</div>

          {/* equals slot */}
          <Slot
            accept={["sym"]}
            onDrop={(d) => { if (d?.type === "sym" && d?.name === "=") setEqPlaced(true); }}
            className={`ptable-eq-slot ${eqPlaced ? "filled" : ""}`}
          >
            {eqPlaced ? "=" : <span className="muted">=</span>}
          </Slot>

          {/* fraction template slot (first drop), then Y/X sub-slots */}
          {!fracPlaced ? (
            <Slot
              accept={["frac"]}
              onDrop={(d) => { if (d?.type === "frac") setFracPlaced(true); }}
              className="ptable-frac-template-slot"
            >
              <span className="muted">fraction</span>
            </Slot>
          ) : (
            <div className="fraction-row nowrap">
              <Slot
                accept={["chip"]}
                onDrop={(d) => { if (d?.type === "chip" && d?.name === "Y") setNumIsY(true); }}
                className={`slot ptable-fracslot ${numIsY ? "filled" : ""}`}
              >
                {numIsY ? "Y" : <span className="muted">—</span>}
              </Slot>
              <span>/</span>
              <Slot
                accept={["chip"]}
                onDrop={(d) => { if (d?.type === "chip" && d?.name === "X") setDenIsX(true); }}
                className={`slot ptable-fracslot ${denIsX ? "filled" : ""}`}
              >
                {denIsX ? "X" : <span className="muted">—</span>}
              </Slot>
            </div>
          )}
        </div>

        {eqOK && (
          <div className="muted small" style={{ marginTop: 6 }}>
            Great—now fill each row with its own <b>Y</b> and <b>X</b>, then Calculate.
          </div>
        )}
      </div>
    );
  };

  // generous invisible dropzone for K before the 3rd column is visible
  const KRevealOverlay = () => {
    if (kPlaced) return null;
    return (
      <div className="ptable-k-overlay">
        <Slot
          accept={["chip"]}
          onDrop={(d) => {
            if (d?.type === "chip" && d?.name === "K") setKPlaced(true);
          }}
          className="ptable-k-target"
        >
          {/* intentionally subtle; student is told to drop K to reveal */}
          <span className="muted small">drop K here to reveal</span>
        </Slot>
      </div>
    );
  };

  const Table = useMemo(() => {
    const col3Hidden = !kPlaced ? "col3-hidden" : "";

    return (
      <div className={`ptable-wrap ${col3Hidden}`}>
        <div className="ptable-rel">
          {/* wide K drop overlay (only when hidden) */}
          <KRevealOverlay />

          <table className="ptable">
            <thead>
              <tr>
                <th><HeaderDrop placed={xPlaced} label="X" onDrop={(d)=>{ if(d?.type==="chip" && d?.name==="X") setXPlaced(true); }} /></th>
                <th><HeaderDrop placed={yPlaced} label="Y" onDrop={(d)=>{ if(d?.type==="chip" && d?.name==="Y") setYPlaced(true); }} /></th>
                <th>
                  {/* when visible, header shows the assembly area */}
                  <HeaderDrop placed={kPlaced} label="K" onDrop={(d)=>{ if(d?.type==="chip" && d?.name==="K") setKPlaced(true); }} />
                  <HeaderEqArea />
                </th>
              </tr>
            </thead>

            <tbody>
              {[0,1,2].map((idx) => {
                const r = problem.rows[idx];
                return (
                  <tr key={idx}>
                    <td>
                      <Draggable id={`x-${idx}`} label={`${r.x}`} payload={{ type: "value", value: r.x }} className="chip" />
                    </td>
                    <td>
                      <Draggable id={`y-${idx}`} label={`${r.y}`} payload={{ type: "value", value: r.y }} className="chip" />
                    </td>
                    <td>
                      {headerEqCorrect ? (
                        <div className="fraction-row nowrap center">
                          <div className="calc-inline">Y/X =</div>
                          <Slot
                            accept={["value"]}
                            onDrop={(d) => onRowDrop(idx, "num", d)}
                            className="slot ptable-fracslot"
                          >
                            {fractions[idx]?.num ?? <span className="muted">—</span>}
                          </Slot>
                          <span>/</span>
                          <Slot
                            accept={["value"]}
                            onDrop={(d) => onRowDrop(idx, "den", d)}
                            className="slot ptable-fracslot"
                          >
                            {fractions[idx]?.den ?? <span className="muted">—</span>}
                          </Slot>

                          <button className="button ml-12" onClick={() => calcRow(idx)}>
                            Calculate
                          </button>

                          {typeof kValues[idx] === "number" && isFinite(kValues[idx]) && (
                            <span className="badge ml-12">k = {kValues[idx]}</span>
                          )}
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* 4th row: only when proportional AND concept answer is correct */}
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

          {/* overlay after concept-correct & proportional */}
          {revealFourthRow && (
            <div className="ptable-overlay">
              <div className="ptable-overlay-inner">
                <span className="calc-inline">Y</span>
                <span className="calc-inline" style={{ color: "#b91c1c", fontWeight: 900 }}>×</span>
                <span className="result-big">k = {kValues[0]}</span>
                <span className="calc-inline">· X</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [problem, xPlaced, yPlaced, kPlaced, headerEqCorrect, fractions, kValues, revealFourthRow, row4Answer]);

  // ---------- render ----------
  return (
    <div className="panes">
      {/* LEFT CARD */}
      <div className="card">
        {/* difficulty row (top-left), New Problem centered under */}
        <div className="row" style={{ justifyContent: "flex-start", marginBottom: 8, gap: 8 }}>
          <BigButton
            className={difficulty === "easy" ? "active" : ""}
            onClick={() => { setDifficulty("easy"); resetAll("easy"); }}
            aria-pressed={difficulty === "easy"}
          >
            Easy
          </BigButton>
          <BigButton
            className={difficulty === "medium" ? "active" : ""}
            onClick={() => { setDifficulty("medium"); resetAll("medium"); }}
            aria-pressed={difficulty === "medium"}
          >
            Medium
          </BigButton>
          <BigButton
            className={difficulty === "hard" ? "active" : ""}
            onClick={() => { setDifficulty("hard"); resetAll("hard"); }}
            aria-pressed={difficulty === "hard"}
          >
            Hard
          </BigButton>
        </div>

        <div className="center" style={{ marginBottom: 12 }}>
          <BigButton onClick={() => resetAll()}>New Problem</BigButton>
        </div>

        {Table}
      </div>

      {/* RIGHT CARD — steps & chips */}
      <div className="card right-steps">
        <div className="section">
          <div className="step-title">Label the table</div>
          <div className="muted bigger">
            Drag <b>X</b>, <b>Y</b> to the first two headers. Drop <b>K</b> onto the hidden third header to reveal it.
          </div>

          <div className="chips with-borders" style={{ marginTop: 10 }}>
            <Draggable id="chip-x" label="X" payload={{ type: "chip", name: "X" }} className="chip large" />
            <Draggable id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} className="chip large" />
            <Draggable id="chip-k" label="K" payload={{ type: "chip", name: "K" }} className="chip large" />
          </div>
        </div>

        <div className="section">
          <div className="step-title">Complete the formula for k</div>
          <div className="muted bigger">Build <b>k = Y / X</b> in the third header: drag “=” and the Fraction chip, then place <b>Y</b> on top and <b>X</b> on bottom.</div>

          <div className="chips with-borders" style={{ marginTop: 10 }}>
            <Draggable id="chip-eq" label="=" payload={{ type: "sym", name: "=" }} className="chip large" />
            <Draggable id="chip-frac" label="Fraction" payload={{ type: "frac" }} className="chip large" />
          </div>
        </div>

        <div className="section">
          <div className="step-title">Fill each row & calculate</div>
          <div className="muted bigger">
            For each row, make <b>Y/X = yᵢ/xᵢ</b> and press <b>Calculate</b>. You can recalc anytime.
          </div>
          <div className="center mt-8">
            <button className="button" onClick={calcAll}>Calculate All</button>
          </div>
        </div>

        <div className="section">
          <div className="step-title">Is this table proportional?</div>
          <fieldset
            className="mt-8"
            disabled={!allRowsComputed}
            aria-disabled={!allRowsComputed}
          >
            <div className="row" style={{ alignItems: "stretch", justifyContent: "center", gap: 8 }}>
              <button
                className="button"
                onClick={() => setConceptAnswer("yes_same")}
                disabled={!allRowsComputed}
              >
                Yes, because k is the same
              </button>
              <button
                className="button"
                onClick={() => setConceptAnswer("yes_diff")}
                disabled={!allRowsComputed}
              >
                Yes, because k is NOT the same
              </button>
              <button
                className="button"
                onClick={() => setConceptAnswer("no_same")}
                disabled={!allRowsComputed}
              >
                No, because k is the same
              </button>
              <button
                className="button"
                onClick={() => setConceptAnswer("no_diff")}
                disabled={!allRowsComputed}
              >
                No, because k is NOT the same
              </button>
            </div>

            {conceptAnswer && (
              <div className="center mt-10">
                {conceptCorrect ? (
                  <div className="badge" style={{ background: "#ecfdf5", borderColor: "#86efac" }}>
                    ✓ Correct
                  </div>
                ) : (
                  <div className="badge" style={{ background: "#fff7ed", borderColor: "#fed7aa" }}>
                    Try again
                  </div>
                )}
              </div>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
