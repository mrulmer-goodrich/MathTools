// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";

const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

export default function ProportionalTablesModule() {
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPTable(difficulty));
  const [xPlaced, setXPlaced] = useState(false);
  const [yPlaced, setYPlaced] = useState(false);
  const [kPlaced, setKPlaced] = useState(false);
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
      if (Object.keys(next).length === 3) {
        const ks = Object.values(next).map(({ num, den }) =>
          den === 0 ? null : num / den
        );
        if (ks.every((v) => typeof v === "number" && isFinite(v))) {
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

  const onSolveRow4 = () => {
    if (!problem.revealRow4 || kFromFractions == null) return;
    const y = kFromFractions * problem.revealRow4.x;
    setRow4Answer(y);
    setFeedback("Multiply k · x to get y. Great work!");
  };

  // header cell with drop zone
  const headerCell = (label, placed, onDrop) => (
    <Slot
      accept={["chip"]}
      onDrop={onDrop}
      className={`p-2 border font-semibold text-center ${
        placed ? "bg-blue-50" : "bg-gray-50 italic text-gray-500"
      }`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-6">
      {/* LEFT PANE — TABLE */}
      <div className="rounded-2xl border shadow bg-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Proportional Table</h2>

        {/* TABLE */}
        <div className="border rounded-lg overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-3 divide-x divide-gray-300 bg-gray-100 font-semibold">
            {headerCell("X", xPlaced, () => setXPlaced(true))}
            {headerCell("Y", yPlaced, () => setYPlaced(true))}
            {headerCell("K or Y/X", kPlaced, () => setKPlaced(true))}
          </div>

          {/* Data rows */}
          {problem.rows.map((r, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 divide-x divide-gray-300 border-t text-center"
            >
              <div className="p-2 flex justify-center items-center">
                <Draggable
                  id={`x-${idx}`}
                  label={`${r.x}`}
                  payload={{ type: "value", value: r.x }}
                  className="px-3 py-1 border rounded bg-white shadow-sm"
                />
              </div>
              <div className="p-2 flex justify-center items-center">
                <Draggable
                  id={`y-${idx}`}
                  label={`${r.y}`}
                  payload={{ type: "value", value: r.y }}
                  className="px-3 py-1 border rounded bg-white shadow-sm"
                />
              </div>
              <div className="p-2 flex justify-center items-center">
                {xPlaced && yPlaced && kPlaced ? (
                  <div className="flex items-center gap-1">
                    <Slot
                      accept={["value"]}
                      onDrop={(data) =>
                        onRowFilled(idx, {
                          num: data?.value,
                          den: fractions[idx]?.den ?? null,
                        })
                      }
                      className="w-14 h-10 border rounded flex items-center justify-center"
                    >
                      {fractions[idx]?.num ?? (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </Slot>
                    <span>/</span>
                    <Slot
                      accept={["value"]}
                      onDrop={(data) =>
                        onRowFilled(idx, {
                          num: fractions[idx]?.num ?? null,
                          den: data?.value,
                        })
                      }
                      className="w-14 h-10 border rounded flex items-center justify-center"
                    >
                      {fractions[idx]?.den ?? (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </Slot>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">—</span>
                )}
              </div>
            </div>
          ))}

          {/* Row 4 prompt */}
          {problem.proportional && (
            <div className="grid grid-cols-3 divide-x divide-gray-300 border-t text-center">
              <div className="p-2">{problem.revealRow4?.x}</div>
              <div className="p-2">{row4Answer == null ? "?" : row4Answer}</div>
              <div className="p-2">
                {kFromFractions != null ? (
                  <button
                    onClick={onSolveRow4}
                    className="px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100 text-sm"
                  >
                    Solve Y = k·X
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Find k first</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
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
            className="px-4 py-2 border rounded-xl shadow text-sm bg-gray-50 hover:bg-gray-100"
          >
            New Problem
          </button>
        </div>
      </div>

      {/* RIGHT PANE — CHIPS & PROMPTS */}
      <div className="rounded-2xl border shadow bg-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Build the Equation</h2>

        <p className="text-sm leading-6 text-gray-700 mb-4">
          1) Drag <b>X</b> to the first header, <b>Y</b> to the second, and{" "}
          <b>K</b> to the third. <br />
          2) For each row, drag values into the fraction to form <b>Y/X</b>. <br />
          3) If all ratios match, that constant is <b>k</b>. <br />
          4) If proportional, use <b>Y = k·X</b> to find the missing fourth-row Y.
        </p>

        {/* Chips */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Draggable id="chip-x" label="X" payload={{ type: "chip", name: "X" }} />
          <Draggable id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} />
          <Draggable id="chip-k" label="K" payload={{ type: "chip", name: "K" }} />
          <Draggable id="chip-eq" label="=" payload={{ type: "chip", name: "=" }} />
        </div>

        {/* Status box */}
        <div className="p-3 rounded-lg bg-gray-50 border mb-4">
          <div className="text-sm font-medium mb-1">Status</div>
          <ul className="text-sm leading-7">
            <li>
              Headers: {xPlaced ? "X ✓" : "X …"}, {yPlaced ? "Y ✓" : "Y …"},{" "}
              {kPlaced ? "K ✓" : "K …"}
            </li>
            <li>
              k from rows:{" "}
              {kFromFractions != null ? (
                <span className="font-semibold">{kFromFractions}</span>
              ) : (
                "—"
              )}
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
          {feedback && <div className="mt-2 text-sm">{feedback}</div>}
        </div>

        <div className="mt-auto pt-4 text-xs text-gray-500">
          Tip: Multiply the constant by the given X (row 4) to solve for Y.
        </div>
      </div>
    </div>
  );
}
