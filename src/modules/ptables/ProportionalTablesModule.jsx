// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useMemo, useState } from "react";
import { genPTable } from "../../lib/ptables/generator.js";

// If your app already has these, great. If the prop names differ slightly in your project,
// see the Integration Notes at the bottom of this file.
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";

// Utility: localStorage helpers
const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

// A small, consistent header style
const Header = ({ children }) => (
  <div className="text-lg font-semibold tracking-wide">{children}</div>
);

const Chip = ({ id, label, payload, className = "" }) => (
  <Draggable id={id} label={label} payload={payload} className={`px-4 py-2 text-xl rounded-xl shadow ${className}`} />
);

function FractionDrop({ rowIndex, onRowFilled }) {
  // We maintain numerator & denominator per row via controlled Slot drops
  const [num, setNum] = useState(null);
  const [den, setDen] = useState(null);

  useEffect(() => {
    if (num != null && den != null) onRowFilled(rowIndex, { num, den });
  }, [num, den, onRowFilled, rowIndex]);

  return (
    <div className="flex items-center gap-3">
      <Slot
        accept={["value"]}
        onDrop={(data) => setNum(data?.value ?? null)}
        className="w-16 h-10 border rounded-md flex items-center justify-center text-xl"
      >
        {num ?? "—"}
      </Slot>
      <div className="text-2xl">/</div>
      <Slot
        accept={["value"]}
        onDrop={(data) => setDen(data?.value ?? null)}
        className="w-16 h-10 border rounded-md flex items-center justify-center text-xl"
      >
        {den ?? "—"}
      </Slot>
    </div>
  );
}

export default function ProportionalTablesModule() {
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);

  // fraction results per row: { [rowIndex]: { num, den } }
  const [fractions, setFractions] = useState({});
  const [kFromFractions, setKFromFractions] = useState(null);
  const [row4Answer, setRow4Answer] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    saveDifficulty(difficulty);
  }, [difficulty]);

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

  const onRowFilled = (rowIndex, frac) => {
    setFractions((prev) => {
      const next = { ...prev, [rowIndex]: frac };
      // when all 3 fractions exist, attempt to compute k
      if (Object.keys(next).length === 3) {
        // compute k candidates = y/x for each row
        const ks = Object.values(next).map(({ num, den }) => {
          if (den === 0) return null;
          return num / den;
        });
        if (ks.every((v) => typeof v === "number" && isFinite(v))) {
          // tolerate tiny FP noise
          const approxEqual = (a, b) => Math.abs(a - b) < 1e-9;
          const allEqual = ks.every((v) => approxEqual(v, ks[0]));
          if (allEqual) {
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

  const canShowFractionsCol = xPlaced && yPlaced && kPlaced;

  const onSolveRow4 = () => {
    if (!problem.revealRow4 || kFromFractions == null) return;
    const y = kFromFractions * problem.revealRow4.x;
    setRow4Answer(y);
    setFeedback("Multiply k · x to get y. Great work!");
  };

  const headerCell = (label, placed, onDrop) => (
    <Slot
      accept={["chip"]}
      onDrop={onDrop}
      className={`h-12 border-2 rounded-md flex items-center justify-center text-lg font-semibold ${
        placed ? "bg-gray-100" : "bg-white"
      }`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  const Table = useMemo(() => {
    const thick = "border-2";
    return (
      <div className="w-full">
        <div className={`grid grid-cols-3 gap-2 mb-3 ${thick}`}>
          <div className="col-span-1">
            {headerCell("X", xPlaced, () => setXPlaced(true))}
          </div>
          <div className="col-span-1">
            {headerCell("Y", yPlaced, () => setYPlaced(true))}
          </div>
          <div className="col-span-1">
            {headerCell("K or Y/X", kPlaced, () => setKPlaced(true))}
          </div>
        </div>

        {/* Rows 1–3 */}
        <div className="grid grid-cols-3 gap-2">
          {problem.rows.map((r, idx) => (
            <React.Fragment key={idx}>
              <Draggable
                id={`x-${idx}`}
                label={`${r.x}`}
                payload={{ type: "value", value: r.x }}
                className="h-12 border rounded-md flex items-center justify-center text-xl bg-white"
              />
              <Draggable
                id={`y-${idx}`}
                label={`${r.y}`}
                payload={{ type: "value", value: r.y }}
                className="h-12 border rounded-md flex items-center justify-center text-xl bg-white"
              />
              <div className="h-12 flex items-center justify-center">
                {canShowFractionsCol ? (
                  <FractionDrop rowIndex={idx} onRowFilled={onRowFilled} />
                ) : (
                  <div className="text-gray-400 text-sm">…</div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Row 4 prompt (only if proportional and k determined) */}
        {problem.proportional && (
          <div className="grid grid-cols-3 gap-2 mt-4 items-center">
            <div className="h-12 border rounded-md flex items-center justify-center text-xl bg-white">
              {problem.revealRow4?.x ?? ""}
            </div>
            <div className="h-12 border rounded-md flex items-center justify-center text-xl bg-white">
              {row4Answer == null ? "?" : row4Answer}
            </div>
            <div className="h-12 flex items-center justify-center">
              {kFromFractions != null ? (
                <button
                  onClick={onSolveRow4}
                  className="px-4 py-2 border rounded-lg shadow text-sm"
                  title="Multiply k · x to find y"
                >
                  Solve Y = k·X
                </button>
              ) : (
                <div className="text-gray-400 text-sm">Find k first</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [problem, xPlaced, yPlaced, kPlaced, canShowFractionsCol, row4Answer, kFromFractions]);

  return (
    <div className="w-full h-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT PANE — TABLE */}
      <div className="rounded-2xl border shadow p-4 flex flex-col">
        <Header>Proportional Table</Header>

        <div className="mt-3 border-2 rounded-xl p-4 bg-white">{Table}</div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                resetAll(e.target.value);
              }}
              className="border rounded-md px-2 py-1"
            >
              <option value="easy">Easy (whole numbers)</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            onClick={() => resetAll()}
            className="mx-auto px-4 py-2 border rounded-xl shadow text-sm"
            title="New Problem"
          >
            New Problem
          </button>
        </div>
      </div>

      {/* RIGHT PANE — CHIPS & PROMPTS */}
      <div className="rounded-2xl border shadow p-4 flex flex-col">
        <Header>Build the Equation</Header>
        <p className="mt-2 text-sm text-gray-700">
          1) Drag <span className="font-semibold">X</span> to the first header,{" "}
          <span className="font-semibold">Y</span> to the second, and{" "}
          <span className="font-semibold">K</span> to the third. <br />
          2) For each row, drag values into the fraction to form <span className="font-semibold">Y/X</span>. <br />
          3) If all ratios match, that constant is <span className="font-semibold">k</span>. <br />
          4) If proportional, use <span className="font-semibold">Y = k·X</span> to find the missing fourth-row Y.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Chip id="chip-x" label="X" payload={{ type: "chip", name: "X" }} />
          <Chip id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} />
          <Chip id="chip-k" label="K" payload={{ type: "chip", name: "K" }} />
          <Chip id="chip-eq" label="=" payload={{ type: "chip", name: "=" }} />
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
          <div className="text-sm font-medium mb-1">Status</div>
          <ul className="text-sm leading-7">
            <li>Headers: {xPlaced ? "X ✓" : "X …"}, {yPlaced ? "Y ✓" : "Y …"}, {kPlaced ? "K ✓" : "K …"}</li>
            <li>
              k from rows:{" "}
              {kFromFractions != null ? <span className="font-semibold">{kFromFractions}</span> : "—"}
            </li>
            <li>
              Table:{" "}
              {kFromFractions != null
                ? (problem.proportional ? "Proportional ✓" : "Fractions agree, but this instance flagged non-proportional")
                : "Undetermined"}
            </li>
          </ul>
          {feedback && <div className="mt-2 text-sm">{feedback}</div>}
        </div>

        <div className="mt-auto pt-4 text-xs text-gray-500">
          Tip: The instructions clearly state to multiply the constant by the given X (row 4) to solve for Y.
        </div>
      </div>

      {/* Integration Notes (kept in file for your devs; safe to leave) */}
      {/* 
        If your Draggable/Slot components use different prop names, adapt here:
        - <Draggable payload={{ type: "value", value: number }} /> should emit that object from onDrop
        - <Slot accept={["value"]} onDrop={(payload)=>{...}} />
        - For header cells, accept={["chip"]} and setXPlaced/setYPlaced/setKPlaced on drop.
        If your DropSlot sends e.detail.payload, wrap onDrop={(e)=>onDrop(e.detail.payload)}.
      */}
    </div>
  );
}
