// src/modules/ptables/ProportionalTablesModule.jsx
import React, { useEffect, useMemo, useState } from "react";
import { genPTable } from "../../lib/generator.js";
import Draggable from "../../components/DraggableChip.jsx";
import Slot from "../../components/DropSlot.jsx";

const loadDifficulty = () => localStorage.getItem("ptables-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("ptables-difficulty", d);

const Header = ({ children }) => (
  <div className="text-lg font-semibold tracking-wide mb-2">{children}</div>
);

const Chip = ({ id, label, payload, className = "" }) => (
  <Draggable
    id={id}
    label={label}
    payload={payload}
    className={`px-4 py-2 text-xl rounded-xl shadow bg-white text-gray-800 hover:bg-gray-50 ${className}`}
  />
);

function FractionDrop({ rowIndex, onRowFilled }) {
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
        className="w-16 h-10 border rounded-md flex items-center justify-center text-xl bg-white"
      >
        {num ?? <span className="text-gray-400 italic">—</span>}
      </Slot>
      <div className="text-2xl">/</div>
      <Slot
        accept={["value"]}
        onDrop={(data) => setDen(data?.value ?? null)}
        className="w-16 h-10 border rounded-md flex items-center justify-center text-xl bg-white"
      >
        {den ?? <span className="text-gray-400 italic">—</span>}
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

  const headerCell = (label, placed, onDrop) => (
    <Slot
      accept={["chip"]}
      onDrop={onDrop}
      className={`h-12 border-2 rounded-md flex items-center justify-center text-lg font-semibold ${
        placed ? "bg-blue-50" : "bg-gray-50"
      }`}
    >
      {placed ? label : "Drop here"}
    </Slot>
  );

  const Table = useMemo(() => {
    return (
      <div className="w-full">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>{headerCell("X", xPlaced, () => setXPlaced(true))}</div>
          <div>{headerCell("Y", yPlaced, () => setYPlaced(true))}</div>
          <div>{headerCell("K or Y/X", kPlaced, () => setKPlaced(true))}</div>
        </div>

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
                {xPlaced && yPlaced && kPlaced ? (
                  <FractionDrop rowIndex={idx} onRowFilled={onRowFilled} />
                ) : (
                  <span className="text-gray-400 italic text-sm">—</span>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

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
                  className="px-4 py-2 border rounded-lg shadow text-sm bg-gray-50 hover:bg-gray-100"
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
  }, [problem, xPlaced, yPlaced, kPlaced, row4Answer, kFromFractions]);

  return (
    <div className="w-full h-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT PANE */}
      <div className="rounded-2xl border shadow p-4 flex flex-col bg-white">
        <Header>Proportional Table</Header>
        <div className="mt-3 border-2 rounded-xl p-4 bg-gray-50">{Table}</div>

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

      {/* RIGHT PANE */}
      <div className="rounded-2xl border shadow p-4 flex flex-col bg-white">
        <Header>Build the Equation</Header>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          1) Drag <b>X</b> to the first header, <b>Y</b> to the second, and{" "}
          <b>K</b> to the third. <br />
          2) For each row, drag values into the fraction to form <b>Y/X</b>. <br />
          3) If all ratios match, that constant is <b>k</b>. <br />
          4) If proportional, use <b>Y = k·X</b> to find the missing fourth-row Y.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Chip id="chip-x" label="X" payload={{ type: "chip", name: "X" }} />
          <Chip id="chip-y" label="Y" payload={{ type: "chip", name: "Y" }} />
          <Chip id="chip-k" label="K" payload={{ type: "chip", name: "K" }} />
          <Chip id="chip-eq" label="=" payload={{ type: "chip", name: "=" }} />
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
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
                  : "Fractions disagree"
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
