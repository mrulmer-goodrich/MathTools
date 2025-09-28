// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";
import BigButton from "../../components/BigButton.jsx";

// ---- helpers for persistence
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// ---- small inline style tokens (no Tailwind dependency)
const styles = {
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    width: "100%",
    height: "100%",
    padding: 16,
  },
  card: {
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(16,24,40,0.06)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  h2: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    marginBottom: 12,
  },
  tableWrap: {
    border: "1px solid #e5e7ef",
    borderRadius: 10,
    overflow: "hidden",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#f3f4f6",
    borderBottom: "1px solid #e5e7ef",
    borderRight: "1px solid #e5e7ef",
    padding: "10px 8px",
    textAlign: "center",
    fontWeight: 600,
  },
  td: {
    borderTop: "1px solid #e5e7ef",
    borderRight: "1px solid #e5e7ef",
    padding: 8,
    textAlign: "center",
    height: 56,
  },
  lastCol: { borderRight: "none" },
  placeholder: { color: "#9ca3af", fontStyle: "italic" },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: "auto",
    paddingTop: 12,
  },
  stepTitle: { fontWeight: 700, marginBottom: 6 },
  stepText: { lineHeight: 1.6, color: "#374151", marginBottom: 12 },
  chipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  statusBox: {
    marginTop: 8,
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    fontSize: 14,
  },
  kBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
};

export default function ProportionalTablesModule() {
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  // per-row fractions: { [rowIndex]: { num, den } }
  const [fractions, setFractions] = useState({});
  const [kFromFractions, setKFromFractions] = useState(null);
  const [row4Answer, setRow4Answer] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => saveDifficulty(difficulty), [difficulty]);

  const resetAll = (nextDiff = difficulty) => {
    const next = genPTable(nextDiff);
    setProblem(next);
    setXPlaced(false);
    setYPlaced(false);
    setKPlaced(false);
    setFractions({});
    setKFromFractions(null);
    setRow4Answer(null);
    setFeedback("");
  };

  const updateRowFrac = (rowIndex, part, value) => {
    setFractions((prev) => {
      const next = { ...prev, [rowIndex]: { ...(prev[rowIndex] || {}), [part]: value } };

      // if we have all 3 rows with both parts, try compute k
      const rows = Object.values(next);
      if (rows.length === 3 && rows.every(r => r.num != null && r.den != null)) {
        const ks = rows.map(({ num, den }) => (den === 0 ? null : num / den));
        if (ks.every(v => typeof v === "number" && isFinite(v))) {
          const eq = (a, b) => Math.abs(a - b) < 1e-9;
          const match = ks.every(v => eq(v, ks[0]));
          if (match) {
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

  // header cell = drop target for X/Y/K
  const HeaderDrop = ({ placed, label, onDrop }) => (
    <Slot
      accept={["chip"]}
      onDrop={onDrop}
      className="ptable-header-slot"
      style={{
        ...styles.th,
        background: placed ? "#e8f1ff" : "#f3f4f6",
        fontStyle: placed ? "normal" : "italic",
      }}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  const FractionSlot = ({ rowIndex, part }) => (
    <Slot
      accept={["value"]}
      onDrop={(data) => updateRowFrac(rowIndex, part, data?.value ?? null)}
      className="ptable-fraction-slot"
      style={{
        display: "inline-flex",
        width: 56,
        height: 40,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
      }}
    >
      {fractions[rowIndex]?.[part] ?? <span style={styles.placeholder}>—</span>}
    </Slot>
  );

  return (
    <div style={styles.grid2}>
      {/* LEFT CARD — TABLE */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Proportional Table</h2>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <HeaderDrop placed={xPlaced} label="X" onDrop={() => setXPlaced(true)} />
                </th>
                <th style={styles.th}>
                  <HeaderDrop placed={yPlaced} label="Y" onDrop={() => setYPlaced(true)} />
                </th>
                <th style={{ ...styles.th, ...styles.lastCol }}>
                  <HeaderDrop placed={kPlaced} label="K or Y/X" onDrop={() => setKPlaced(true)} />
                </th>
              </tr>
            </thead>

            <tbody>
              {problem.rows.map((r, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>
                    <Draggable
                      id={`x-${idx}`}
                      label={`${r.x}`}
                      payload={{ type: "value", value: r.x }}
                    />
                  </td>
                  <td style={styles.td}>
                    <Draggable
                      id={`y-${idx}`}
                      label={`${r.y}`}
                      payload={{ type: "value", value: r.y }}
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.lastCol }}>
                    {xPlaced && yPlaced && kPlaced ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <FractionSlot rowIndex={idx} part="num" />
                        <span>/</span>
                        <FractionSlot rowIndex={idx} part="den" />
                      </div>
                    ) : (
                      <span style={styles.placeholder}>—</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* 4th row prompt if proportional */}
              {problem.proportional && (
                <tr>
                  <td style={styles.td}>{problem.revealRow4?.x}</td>
                  <td style={styles.td}>{row4Answer == null ? "?" : row4Answer}</td>
                  <td style={{ ...styles.td, ...styles.lastCol }}>
                    {kFromFractions != null ? (
                      <div style={styles.kBtn}>
                        <BigButton onClick={onSolveRow4}>Solve Y = k×X</BigButton>
                      </div>
                    ) : (
                      <span style={{ ...styles.placeholder, fontSize: 12 }}>Find k first</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controls */}
        <div style={styles.controlsRow}>
          {/* Difficulty as buttons like "New Problem" */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <BigButton
              onClick={() => {
                setDifficulty("easy");
                resetAll("easy");
              }}
            >
              Easy
            </BigButton>
            <BigButton
              onClick={() => {
                setDifficulty("medium");
                resetAll("medium");
              }}
            >
              Medium
            </BigButton>
            <BigButton
              onClick={() => {
                setDifficulty("hard");
                resetAll("hard");
              }}
            >
              Hard
            </BigButton>
          </div>

          <BigButton onClick={() => resetAll()}>New Problem</BigButton>
        </div>
      </div>

      {/* RIGHT CARD — STEPS & CHIPS */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Build the Equation</h2>

        {/* Step 1 */}
        <div>
          <div style={styles.stepTitle}>Step 1 — Label the headers</div>
          <div style={styles.stepText}>
            Drag <b>X</b> to the first header, <b>Y</b> to the second, and <b>K</b> to the third.
          </div>
        </div>

        {/* Step 2 */}
        <div>
          <div style={styles.stepTitle}>Step 2 — Form the ratios</div>
          <div style={styles.stepText}>
            For each row, drag the values into the fraction to make <b>Y/X</b>.
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <div style={styles.stepTitle}>Step 3 — Check for a constant</div>
          <div style={styles.stepText}>
            If all three ratios are equal, the table is proportional and that common value is <b>k</b>.
          </div>
        </div>

        {/* Step 4 */}
        <div>
          <div style={styles.stepTitle}>Step 4 — Solve a new row</div>
          <div style={styles.stepText}>
            When proportional, use <b>Y = k×X</b> to find the missing fourth-row <b>Y</b>.
          </div>
        </div>

        {/* Chips */}
        <div style={styles.chipsGrid}>
          <Draggable id="chip-x" label="X" payload={{ type: "chip", name: "X" }} />
          <Draggable id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} />
          <Draggable id="chip-k" label="K" payload={{ type: "chip", name: "K" }} />
          <Draggable id="chip-eq" label="=" payload={{ type: "chip", name: "=" }} />
        </div>

        {/* Status */}
        <div style={styles.statusBox}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Status</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              Headers: {xPlaced ? "X ✓" : "X …"}, {yPlaced ? "Y ✓" : "Y …"}, {kPlaced ? "K ✓" : "K …"}
            </li>
            <li>
              k from rows:{" "}
              {kFromFractions != null ? <b>{kFromFractions}</b> : <span>—</span>}
            </li>
            <li>
              Table:{" "}
              {kFromFractions != null
                ? problem.proportional
                  ? "Proportional ✓"
                  : "Fractions disagree ✗"
                : "Undetermined"}
            </li>
          </ul>
          {feedback && <div style={{ marginTop: 6 }}>{feedback}</div>}
        </div>

        {/* Spacer to bottom */}
        <div style={{ marginTop: "auto" }} />
      </div>
    </div>
  );
}
