// src/modules/circles/CirclesModule.jsx
// Circles — One Shape, Two Formulas, Three Words
// - Coins tracked locally (module-only)
// - Stats tracked globally via updateStats prop (separate from coins)
// - Two-in-a-row correct answers unlock next stage (user chooses to move on)
// - Timer mode (1–10 minutes) locks coins at expiration
// - Left card: visualization only; Right card: prompts + choices
// - Uses UG classes: .ug-answer .ug-answer--pill and BigButton ug-button

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ErrorOverlay } from "../../components/StatsSystem.jsx";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";

// ---------- Helpers (no emojis) ----------
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rndInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const fmtVal = (n) => (Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1))));

// ---------- Problem generator (hoisted) ----------
function generateProblem(stage) {
  // radius limited to 1..20 (all other values derive from this)
  const r = rndInt(1, 20);
  const d = 2 * r;
  const C = 2 * Math.PI * r;
  const A = Math.PI * r * r;

  // Randomize where radius/diameter lines are drawn so labels move
  const radiusAngle = rndInt(0, 359);
  const diameterAngle = (radiusAngle + 90) % 360;

  // Decide which value(s) are visible based on stage band
  //  - Stage 1: identify the circle (right side shows four "shape" options)
  //  - Stage 2: click which graphic element is r/d/C (no numeric reveal)
  //  - Stage 3+: operation + value flow (formula chip shows)
  const band = stage <= 2 ? stage : 3;

  return {
    stage,
    r,
    d,
    C,
    A,
    radiusAngle,
    diameterAngle,
    band, // 1,2,3
  };
}

// Value target mapping used in stages 3+
const TARGETS = ["d", "C", "A", "r"];
const FROMS = {
  d: ["r"],
  C: ["r", "d"], // allow two routes: 2πr or πd
  A: ["r"],      // πr²
  r: ["d", "C", "A"], // inverse questions sometimes
};

// available operations (as strings displayed on chips)
function getOperationChoices(target, from) {
  // We stick to simple, student-facing operation tokens
  // order matters (two distractors + one correct, typically)
  if (target === "d" && from === "r") return ["× 2", "× π", "÷ 2"];
  if (target === "C" && from === "r") return ["× 2", "× π", "÷ 2"];
  if (target === "C" && from === "d") return ["× π", "÷ 2", "× 2"];
  if (target === "A" && from === "r") return ["× r", "× π", "× r"];
  if (target === "r" && from === "d") return ["× 2", "÷ 2", "÷ π"];
  if (target === "r" && from === "C") return ["÷ 2", "÷ 2π", "× 2"];
  if (target === "r" && from === "A") return ["√", "÷ π", "× π"];
  // default safe fallbacks
  return ["× 2", "× π", "÷ 2"];
}

function computeTarget(problem, target, from) {
  const { r, d, C, A } = problem;
  switch (target) {
    case "d":
      // expected from: r
      return d;
    case "C":
      // expected from: r or d
      return C;
    case "A":
      // expected from: r
      return A;
    case "r":
      // inverse: from could be d, C, or A
      return r;
    default:
      return null;
  }
}

function formulaString(target, from) {
  if (target === "d" && from === "r") return "d = r × 2";
  if (target === "C" && from === "r") return "C = 2 × π × r";
  if (target === "C" && from === "d") return "C = π × d";
  if (target === "A" && from === "r") return "A = π × r × r";
  if (target === "r" && from === "d") return "r = d ÷ 2";
  if (target === "r" && from === "C") return "r = C ÷ (2 × π)";
  if (target === "r" && from === "A") return "r = √(A ÷ π)";
  return "";
}

// coin payout by stage (simple scale)
const coinValueFor = (stage) => Math.max(1, Math.min(10, Math.ceil(stage)));

// ---------- Local Success overlay (shared ErrorOverlay already exists) ----------
function SuccessOverlay({ show }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(34,197,94,0.20)",
      }}
    >
      <div style={{ fontSize: 120, color: "#16a34a", fontWeight: 900 }}>✓</div>
    </div>
  );
}

// ---------- SVG Visualization (left card only) ----------
function CircleVisualization({
  problem,
  onClickPart, // optional: used on Stage 2 to identify r/d/C
}) {
  const size = 360; // fixed pixel size; values change, not the circle size
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38; // visual radius

  const rEnd = {
    x: cx + R * Math.cos((problem.radiusAngle * Math.PI) / 180),
    y: cy + R * Math.sin((problem.radiusAngle * Math.PI) / 180),
  };
  const dEnd = {
    x: cx + R * Math.cos((problem.diameterAngle * Math.PI) / 180),
    y: cy + R * Math.sin((problem.diameterAngle * Math.PI) / 180),
  };

  // click handlers (Stage 2 only)
  const handleClick = (part) => {
    onClickPart?.(part);
  };

  return (
    <div className="rounded-xl bg-blue-50/60 p-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto block"
      >
        {/* fill */}
        <circle cx={cx} cy={cy} r={R} fill="#EADBC8" />

        {/* circumference */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          stroke="#2563eb"
          strokeWidth="8"
          fill="none"
          onClick={() => handleClick("C")}
          style={{ cursor: onClickPart ? "pointer" : "default" }}
        />

        {/* radius line */}
        <line
          x1={cx}
          y1={cy}
          x2={rEnd.x}
          y2={rEnd.y}
          stroke="#22c55e"
          strokeWidth="8"
          onClick={() => handleClick("r")}
          style={{ cursor: onClickPart ? "pointer" : "default" }}
        />

        {/* diameter line */}
        <line
          x1={cx}
          y1={cy}
          x2={dEnd.x}
          y2={dEnd.y}
          stroke="#9333ea"
          strokeWidth="8"
          onClick={() => handleClick("d")}
          style={{ cursor: onClickPart ? "pointer" : "default" }}
        />

        {/* center dot */}
        <circle cx={cx} cy={cy} r={6} fill="#111827" />

        {/* place labels near, but not on, the lines */}
        {/* radius label */}
        <text
          x={cx + (rEnd.x - cx) * 0.45}
          y={cy + (rEnd.y - cy) * 0.45}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20"
          fill="#0f766e"
        >
          r = {fmtVal(problem.r)}
        </text>

        {/* diameter label */}
        <text
          x={cx + (dEnd.x - cx) * 0.55}
          y={cy + (dEnd.y - cy) * 0.55}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20"
          fill="#ef4444"
        >
          d
        </text>
      </svg>
    </div>
  );
}

// ---------- Main component ----------
export default function CirclesModule({
  onProblemComplete,
  registerReset,
  updateStats,
}) {
  // stage progression
  const [stage, setStage] = useState(1);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [streak, setStreak] = useState(0);

  // local coins (module-only)
  const [totalCoins, setTotalCoins] = useState(0);

  // timer + lock
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [scoreLocked, setScoreLocked] = useState(false);
  const timerRef = useRef(null);

  // UI
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);

  // stage 2 target (what term we ask for on the right; click is on SVG)
  const [termToPlace, setTermToPlace] = useState(() =>
    ["r", "d", "C"][rndInt(0, 2)]
  );

  // stages 3+ operation/value flow
  const [currentTarget, setCurrentTarget] = useState("d"); // start sensible
  const [currentFrom, setCurrentFrom] = useState("r");
  const [currentStep, setCurrentStep] = useState("operation"); // "operation" -> "value"

  const currentFormula = useMemo(
    () => (stage >= 3 ? formulaString(currentTarget, currentFrom) : ""),
    [stage, currentTarget, currentFrom]
  );

  // ---------- Timer effect ----------
  useEffect(() => {
    if (!timerRunning || scoreLocked) return;
    const id = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          setScoreLocked(true); // lock coins
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, scoreLocked]);

  // ---------- Register Reset for header "New Problem" ----------
  useEffect(() => {
    registerReset?.(() => {
      // stop timer
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // unlock + clear
      setScoreLocked(false);
      setTimeRemaining(0);
      setShowError(false);
      setShowSuccess(false);
      setShowConfetti(false);
      setShowMoveOnChoice(false);
      setStreak(0);
      setTermToPlace(["r", "d", "C"][rndInt(0, 2)]);
      // new problem in same stage
      const p = generateProblem(stage);
      setProblem(p);
      if (stage >= 3) {
        const target = TARGETS[rndInt(0, TARGETS.length - 1)];
        const froms = FROMS[target] || ["r"];
        const from = froms[rndInt(0, froms.length - 1)];
        setCurrentTarget(target);
        setCurrentFrom(from);
        setCurrentStep("operation");
      }
    });
  }, [registerReset, stage]);

  // ---------- Stage engine set-up for stages 3+ on stage change ----------
  useEffect(() => {
    if (stage >= 3) {
      const target = TARGETS[rndInt(0, TARGETS.length - 1)];
      const froms = FROMS[target] || ["r"];
      const from = froms[rndInt(0, froms.length - 1)];
      setCurrentTarget(target);
      setCurrentFrom(from);
      setCurrentStep("operation");
    }
  }, [stage]);

  // ---------- Handlers ----------
  const handleCorrect = (coinsDelta = coinValueFor(stage)) => {
    setShowError(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 500);

    try {
      ugConfetti?.burst?.();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 600);
    } catch (_) {}

    if (!scoreLocked) {
      setTotalCoins((c) => c + coinsDelta);
    }

    setStreak((s) => {
      const next = s + 1;
      if (next >= 2 && stage < 10) {
        setShowMoveOnChoice(true);
      }
      return next;
    });

    onProblemComplete?.({
      module: "circles",
      stage,
      correct: true,
      coinsDelta,
      timeRemaining,
    });

    updateStats?.({
      module: "circles",
      problemsSolved: 1,
      lastStage: stage,
      lastOutcome: "correct",
    });
  };

  const handleWrong = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 500);
    setStreak(0);
    updateStats?.({
      module: "circles",
      problemsSolved: 0,
      lastStage: stage,
      lastOutcome: "incorrect",
    });
  };

  const nextProblemSameStage = () => {
    setProblem(generateProblem(stage));
    if (stage >= 3) {
      const target = TARGETS[rndInt(0, TARGETS.length - 1)];
      const froms = FROMS[target] || ["r"];
      const from = froms[rndInt(0, froms.length - 1)];
      setCurrentTarget(target);
      setCurrentFrom(from);
      setCurrentStep("operation");
    }
    setTermToPlace(["r", "d", "C"][rndInt(0, 2)]);
  };

  const handlePracticeChoice = (moveOn) => {
    setShowMoveOnChoice(false);
    if (moveOn && stage < 10) {
      setStage((s) => s + 1);
      setStreak(0);
      setProblem(generateProblem(stage + 1));
    } else {
      nextProblemSameStage();
    }
  };

  // Stage 1: choose the circle among 4 shapes (one option is literally "shape")
  const shapes = useMemo(
    () => [
      { label: "circle", isCircle: true },
      { label: "square", isCircle: false },
      { label: "rectangle", isCircle: false },
      { label: "shape", isCircle: false }, // required literal option
    ],
    []
  );
  const handleShapeSelect = (s) => {
    if (s.isCircle) {
      handleCorrect();
      nextProblemSameStage();
    } else {
      handleWrong();
    }
  };

  // Stage 2: click where r/d/C are on the left SVG
  const handlePartClick = (part) => {
    if (part === termToPlace) {
      handleCorrect();
      nextProblemSameStage();
    } else {
      handleWrong();
    }
  };

  // Stage 3+: operation then value
  const onOperationSelect = (op) => {
    // check against expected pattern for current target/from.
    // We only validate broadly: ensure the correct token is chosen.
    const correctOps = getOperationChoices(currentTarget, currentFrom);
    const correct = correctOps[0]; // we order the sets so index 0 is the correct one
    if (op === correct) {
      setCurrentStep("value");
    } else {
      handleWrong();
    }
  };

  const onValueSelect = (val) => {
    const expect = computeTarget(problem, currentTarget, currentFrom);
    const chosen = Number(val.toFixed ? val.toFixed(1) : val);
    const expectedRounded = Number(expect.toFixed ? expect.toFixed(1) : expect);
    if (Number.isFinite(chosen) && Number(chosen) === Number(expectedRounded)) {
      handleCorrect();
      nextProblemSameStage();
    } else {
      handleWrong();
    }
  };

  // Timer controls
  const startTimer = (minutes) => {
    const secs = clamp(minutes, 1, 10) * 60;
    setTimeRemaining(secs);
    setTimerRunning(true);
    setScoreLocked(false);
  };
  const stopTimer = () => {
    setTimerRunning(false);
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <ErrorOverlay show={showError} />
      <SuccessOverlay show={showSuccess} />

      {/* Fixed coins display (top-right) */}
      <div className="fixed right-4 top-4 z-20 bg-amber-100 border-2 border-amber-400 rounded-lg px-4 py-2 shadow">
        <div className="text-xs font-semibold text-amber-700">Coins</div>
        <div className="font-bold text-amber-700 text-xl">{totalCoins}</div>
      </div>

      {/* Header area (skip + timer quick-starts) */}
      <div className="relative mb-6">
        {stage < 10 && (
          <BigButton
            className="ug-button mb-2"
            onClick={() => {
              setStage(10);
              setStreak(0);
              // optional rule from your earlier file: double current coins when skipping
              setTotalCoins((c) => c * 2);
              setProblem(generateProblem(10));
            }}
          >
            Skip to Stage 10 (2× coins!)
          </BigButton>
        )}

        <div className="mt-2 flex gap-2 items-center">
          <span className="text-sm text-slate-500">Timer:</span>
          {[1, 3, 5, 10].map((m) => (
            <button
              key={m}
              onClick={() => startTimer(m)}
              className="ug-answer ug-answer--pill"
            >
              {m} min
            </button>
          ))}
          {timerRunning && (
            <button onClick={stopTimer} className="ug-answer ug-answer--pill">
              Stop
            </button>
          )}
          <span className="text-sm text-slate-600">
            {timerRunning ? `Time left: ${timeRemaining}s` : `not running`}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold text-gray-800">Circles</h1>
        <p className="text-gray-600">One Shape, Two Formulas, Three Words</p>
        <p className="text-sm text-gray-400 mt-1">Stage {stage}</p>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* LEFT: Visualization only */}
        <div className="bg-white rounded-xl shadow-md p-4">
          {stage >= 3 && currentFormula && (
            <div className="inline-block mb-3 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-mono">
              {currentFormula}
            </div>
          )}
          <CircleVisualization
            problem={problem}
            onClickPart={stage === 2 ? handlePartClick : undefined}
          />
        </div>

        {/* RIGHT: Questions & Choices */}
        <div className="bg-white rounded-xl shadow-md p-4">
          {/* Move-on choice gate */}
          {showMoveOnChoice ? (
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-xl font-bold mb-4">Great job!</div>
              <div className="flex justify-center gap-3">
                <BigButton
                  onClick={() => handlePracticeChoice(false)}
                  className="ug-button"
                >
                  More practice
                </BigButton>
                {stage < 10 && (
                  <BigButton
                    onClick={() => handlePracticeChoice(true)}
                    className="ug-button"
                  >
                    Move on →
                  </BigButton>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Stage 1 */}
              {stage === 1 && (
                <div>
                  <div className="text-xl font-semibold mb-2">
                    Which one is a circle?
                  </div>
                  <p className="text-slate-600">
                    Click the circle among the options below.
                  </p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {shapes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleShapeSelect(s)}
                        className="ug-answer ug-answer--pill text-lg px-5 py-3"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 2 */}
              {stage === 2 && (
                <div>
                  <div className="text-xl font-semibold mb-2">
                    Where is the {termToPlace}?
                  </div>
                  <p className="text-slate-600">
                    Click on the {termToPlace} on the circle to the left.
                  </p>
                </div>
              )}

              {/* Stages 3+ : operation step then value step */}
              {stage >= 3 && (
                <div className="space-y-6">
                  {/* Operation Step */}
                  {currentStep === "operation" && (
                    <div>
                      <div className="text-lg font-semibold mb-2">
                        {currentTarget} = {currentTarget === "A" ? "π × " : ""}
                        {currentFrom}
                        {currentTarget === "A" ? " × r" : ""} _____
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getOperationChoices(currentTarget, currentFrom).map(
                          (op, i) => (
                            <button
                              key={i}
                              onClick={() => onOperationSelect(op)}
                              className="ug-answer ug-answer--pill"
                            >
                              {op}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Value Step */}
                  {currentStep === "value" && (
                    <div>
                      <div className="text-lg font-semibold mb-2">
                        What is {currentTarget}?
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // generate plausible choices around the exact answer
                          const exact = computeTarget(
                            problem,
                            currentTarget,
                            currentFrom
                          );
                          const exactRound = Number(
                            exact.toFixed ? exact.toFixed(1) : exact
                          );
                          const offsets = [-4, -2, 0, +2, +4];
                          const vals = offsets
                            .map((o) => exactRound + o)
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .slice(0, 5);
                          return vals.map((v, i) => (
                            <button
                              key={i}
                              onClick={() => onValueSelect(v)}
                              className="ug-answer ug-answer--pill"
                            >
                              {fmtVal(v)}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
