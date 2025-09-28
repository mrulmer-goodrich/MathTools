// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useMemo, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

// --- persistence ---
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// --- helpers ---
const approxEq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

export default function ProportionalTablesModule() {
  // difficulty & problem
  const [difficulty, setDifficulty] = useState(loadDifficulty()); // default Easy
  const [problem, setProblem] = useState(() => genPTable(difficulty));

  // header labels
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false); // reveals 3rd column

  // header equation (k = Y/X) assembly
  const [eqPlaced, setEqPlaced] = useState(false);     // '=' dropped
  const [fracPlaced, setFracPlaced] = useState(false); // fraction template dropped
  const [numIsY, setNumIsY] = useState(false);         // Y on top
  const [denIsX, setDenIsX] = useState(false);         // X on bottom

  const headerEqCorrect = kPlaced && eqPlaced && fracPlaced && numIsY && denIsX;

  // per-row fractions and computed k_i
  // fractions[row] = { num, den }; kValues[row] = number
  const [fractions, setFractions] = useState({});
  const [kValues, setKValues] = useState({});

  // concept question state
  const allRowsComputed = useMemo(() => {
    const rows = [0, 1, 2];
    return rows.every((i) => {
      const f = fractions[i];
      return (
        f?.num != null &&
        f?.den != null &&
        typeof kValues[i] === "number" &&
        isFinite(kValues[i])
      );
    });
  }, [fractions, kValues]);

  const ksEqual = useMemo(() => {
    const vals = [kValues[0], kValues[1], kValues[2]];
    if (vals.some((v) => typeof v !== "number")) return null;
    return approxEq(vals[0], vals[1]) && approxEq(vals[1], vals[2]);
  }, [kValues]);

  const [conceptAnswer, setConceptAnswer] = useState(null); // 'yes_same' | 'yes_diff' | 'no_same' | 'no_diff'
  const conceptCorrect = useMemo(() => {
    if (!allRowsComputed || ksEqual == null || !conceptAnswer) return false;
    if (ksEqual && conceptAnswer === "yes_same") return true;
    if (!ksEqual && conceptAnswer === "no_diff") return true;
    return false;
  }, [allRowsComputed, ksEqual, conceptAnswer]);

  // row 4 reveal (only if proportional AND concept answered correctly)
  const revealFourthRow = conceptCorrect && ksEqual === true;
  const [row4Answer, setRow4Answer] = useState(null);

  // persistence
  useEffect(() => { saveDifficulty(difficulty); }, [difficulty]);

  // reset
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

  // auto-calc when both parts dropped (still leave explicit Calculate buttons)
  useEffect(() => {
    [0, 1, 2].forEach((i) => {
      const f = fractions[i];
      if (f?.num != null && f?.den != null && f.den !== 0) {
        const kv = f.num / f.den;
        setKValues((prev) => (prev[i] === kv ? prev : { ...prev, [i]: kv }));
      }
    });
  }, [fractions]);

  // manual calc
  const calcRow = (rowIndex) => {
    const f = fractions[rowIndex];
    if (!f || f.den == null || f.num == null || f.den === 0) return;
    const kv = f.num / f.den;
    setKValues((prev) => ({ ...prev, [rowIndex]: kv }));
  };
  const calcAll = () => [0, 1, 2].forEach((i) => calcRow(i));

  const onRowDrop = (rowIndex, part, data) => {
    if (!data || data.type !== "value") return;
    setFractions((prev) => ({
      ...prev,
      [rowIndex]: { ...(prev[rowIndex] || {}), [part]: data.value },
    }));
  };

  const solveRow4 = () => {
    if (!revealFourthRow || !problem.revealRow4) return;
    const k = kValues[0]; // all equal
    setRow4Answer(k * problem.revealRow4.x);
  };

  // step gating (right pane)
  const currentStep = useMemo(() => {
    if (!xPlaced || !yPlaced || !kPlaced) return "label";
    if (!headerEqCorrect) return "build";
    if (!allRowsComputed) return "fill";
    if (!conceptCorrect) return "concept";
    return "solve";
  }, [xPlaced, yPlaced, kPlaced, headerEqCorrect, allRowsComputed, conceptCorrect]);

  // header drop targets
  const HeaderDrop = ({ placed, label, expectName, onPlaced }) => (
    <Slot
      accept={["chip"]}
      onDrop={(d) => {
        if (d?.type === "chip" && d?.name === expectName) onPlaced(true);
      }}
      className={`ptable-thslot ${placed ? "placed" : "empty"}`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  // header equation build (visible only after K placed)
  const HeaderEqArea = () => {
    if (!kPlaced) return null;
    const eqOK = headerEqCorrect;
    return (
      <div className="ptable-header-eq">
        <div className="ptable-eq-row">
          <div className="badge">k</div>

          {/* '=' slot */}
          <Slot
            accept={["sym"]}
            onDrop={(d) => { if (d?.type === "sym" && d?.name === "=") setEqPlaced(true); }}
            className={`ptable-eq-slot ${eqPlaced ? "filled" : ""}`}
          >
            {eqPlaced ? "=" : <span className="muted">=</span>}
          </Slot>

          {/* Fraction template THEN Y over X */}
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

  // invisible K drop overlay when 3rd column is hidden
  const KRevealOverlay = () => {
    if (kPlaced) return null;
    return (
      <div className="ptable-k-overlay" aria-hidden="true">
        <Slot
          accept={["chip"]}
          onDrop={(d) => { if (d?.type === "chip" && d?.name === "K") setKPlaced(true); }}
          className="ptable-k-target"
        />
      </div>
    );
  };

  // table
  const Table = useMemo(() => {
    const col3Hidden = !kPlaced ? "col3-hidden" : "";
    return (
      <div className={`ptable-wrap`}>
        <div className={`ptable-rel ptable-table dark ${col3Hidden}`}>
          <KRevealOverlay />
          <table className="ptable">
            <thead>
              <tr>
                <th>
                  <HeaderDrop
                    placed={xPlaced}
                    label="X"
                    expectName="X"
                    onPlaced={setXPlaced}
                  />
                </th>
                <th>
                  <HeaderDrop
                    placed={yPlaced}
                    label="Y"
                    expectName="Y"
                    onPlaced={setYPlaced}
                  />
                </th>
                <th>
                  <HeaderDrop
                    placed={kPlaced}
                    label="K"
                    expectName="K"
                    onPlaced={setKPlaced}
                  />
                  <HeaderEqArea />
                </th>
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
                        payload={{ type: "value", value: r.x }}
                        className="chip"
                      />
                    </td>
                    <td>
                      <Draggable
                        id={`y-${idx}`}
                        label={`${r.y}`}
                        payload={{ type: "value", value: r.y }}
                        className="chip"
                      />
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

              {/* 4th row appears only after correct concept answer & proportional */}
              {revealFourthRow && problem.revealRow4 && (
                <tr>
                  <td>{problem.revealRow4.x}</td>
                  <td>{row4Answer == null ? "?" : row4Answer}</td>
                  <td>
                    <button className="button success" onClick={solveRow4}>
                      Solve Y = k×X
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* proportional overlay (big red × + k) */}
          {revealFourthRow && (
            <div className="ptable-overlay" aria-hidden="true">
              <div className="ptable-overlay-inner">
                <span className="calc-inline">Y</span>
                <span className="calc-inline" style={{ color: "#b91c1c", fontWeight: 900 }}>
                  ×
                </span>
                <span className="result-big">k = {kValues[0]}</span>
                <span className="calc-inline">· X</span>
              </div>
            </div>
          )}
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
  ]);

  // --- render ---
  return (
    <div className="panes">
      {/* LEFT CARD */}
      <div className="card">
        {/* Difficulty top-left */}
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

        {/* New Problem centered */}
        <div className="center" style={{ marginBottom: 12 }}>
          <BigButton onClick={() => resetAll()}>New Problem</BigButton>
        </div>

        {Table}
      </div>

      {/* RIGHT CARD — step-by-step (only one active step visible) */}
      <div className="card right-steps">
        {currentStep === "label" && (
          <div className="section">
            <div className="step-title">Label the table</div>
            <div className="muted bigger">
              Drag <b>X</b> and <b>Y</b> to the first two headers. Drop <b>K</b> onto the hidden third header to reveal it.
            </div>
            <div className="chips with-borders" style={{ marginTop: 10 }}>
              <Draggable id="chip-x" label="X" payload={{ type: "chip", name: "X" }} className="chip large" />
              <Draggable id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} className="chip large" />
              <Draggable id="chip-k" label="K" payload={{ type: "chip", name: "K" }} className="chip large" />
            </div>
          </div>
        )}

        {currentStep === "build" && (
          <div className="section">
            <div className="step-title">Complete the formula for k</div>
            <div className="muted bigger">
              Build <b>k = Y / X</b> in the third header: drag “=” and the Fraction chip, then place <b>Y</b> on top and <b>X</b> on bottom.
            </div>
            <div className="chips with-borders" style={{ marginTop: 10 }}>
              <Draggable id="chip-eq" label="=" payload={{ type: "sym", name: "=" }} className="chip large" />
              <Draggable id="chip-frac" label="Fraction" payload={{ type: "frac" }} className="chip large" />
              <Draggable id="chip-y2" label="Y" payload={{ type: "chip", name: "Y" }} className="chip large" />
              <Draggable id="chip-x2" label="X" payload={{ type: "chip", name: "X" }} className="chip large" />
            </div>
          </div>
        )}

        {currentStep === "fill" && (
          <div className="section">
            <div className="step-title">Fill each row & calculate</div>
            <div className="muted bigger">
              For each row, make <b>Y/X = yᵢ/xᵢ</b> and press <b>Calculate</b>. You can recalc anytime.
            </div>
            <div className="center mt-8">
              <button className="button" onClick={calcAll}>Calculate All</button>
            </div>
          </div>
        )}

        {currentStep === "concept" && (
          <div className="section">
            <div className="step-title">Is this table proportional?</div>
            <fieldset className="mt-8">
              <div className="row" style={{ alignItems: "stretch", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                <button className="button" onClick={() => setConceptAnswer("yes_same")}>Yes, because k is the same</button>
                <button className="button" onClick={() => setConceptAnswer("yes_diff")}>Yes, because k is NOT the same</button>
                <button className="button" onClick={() => setConceptAnswer("no_same")}>No, because k is the same</button>
                <button className="button" onClick={() => setConceptAnswer("no_diff")}>No, because k is NOT the same</button>
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
            </fieldset>
          </div>
        )}

        {currentStep === "solve" && (
          <div className="section">
            <div className="step-title">Finish the problem</div>
            <div className="muted bigger">
              Use <b>Y = k×X</b> to find the missing fourth-row <b>Y</b>. Click <b>Solve</b> on the left card.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
