import React, { useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const STEP_HEADS = [
  'Formula', 'Label Shapes', 'Pick Sides', 'Copy → Numerator', 'Original → Denominator', 'Calculate'
]

export default function ScaleFactorModule({ openHTable }) {
  const [session, setSession] = useState(loadSession())
  const [problem, setProblem] = useState(genScaleProblem())
  const [openSum, setOpenSum] = useState(false)

  const [step, setStep] = useState(0)
  const [steps, setSteps] = useState(STEP_HEADS.map(() => ({ misses: 0, done: false })))
  const miss = (idx) => setSteps(s => { const c = [...s]; c[idx].misses++; return c })
  const setDone = (idx) => setSteps(s => { const c = [...s]; c[idx].done = true; return c })
  const next = () => setStep(s => Math.min(s + 1, STEP_HEADS.length - 1))

  const [labels, setLabels] = useState({ left: null, right: null })
  const visiblePair = problem.shownPair
  const [picked, setPicked] = useState(false)

  const [slots, setSlots] = useState({ s0: null, s1: null, s2: null, s3: null, s4: null })
  const [num, setNum] = useState(null)
  const [den, setDen] = useState(null)
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
  const [calc, setCalc] = useState({ simplified: null, steps: [] })

  const wordBank = useMemo(() => ([
    { id: 'w_sf', label: 'Scale Factor', kind: 'word' },
    { id: 'w_eq', label: '=', kind: 'word' },
    { id: 'w_copy', label: 'Copy', kind: 'word' },
    { id: 'w_div', label: '/', kind: 'word' },
    { id: 'w_orig', label: 'Original', kind: 'word' },
    // decoys
    { id: 'w_ht', label: 'H Table', kind: 'word' },
    { id: 'w_mul', label: 'Multiply', kind: 'word' },
    { id: 'w_eight', label: 'Eight', kind: 'word' },
    { id: 'w_nine', label: 'Nine', kind: 'word' },
    { id: 'w_ten', label: 'Ten', kind: 'word' }
  ]), [])

  const copyVals = { horizontal: problem.copy.w, vertical: problem.copy.h }
  const origVals = { horizontal: problem.original.w, vertical: problem.original.h }
  const numberChips = useMemo(() => {
    const vals = new Set([copyVals[visiblePair], origVals[visiblePair], ...problem.distractors])
    return Array.from(vals).map((v, i) => ({ id: 'n' + i, label: String(v), kind: 'num', value: v }))
  }, [problem])

  const testWord = (want) => (data) => data?.kind === 'word' && data.label === want
  const testNum = () => (data) => data?.kind === 'num'
  const onDropFormula = (slotKey, want) => (data) => {
    if (data?.label !== want) { miss(0); return }
    setSlots(prev => ({ ...prev, [slotKey]: want }))
    const after = { ...slots, [slotKey]: want }
    const ok = after.s0 === 'Scale Factor' && after.s1 === '=' && after.s2 === 'Copy' && after.s3 === '/' && after.s4 === 'Original'
    if (ok) { setDone(0); next() }
  }
  const dropLabel = (side, data) => {
    if (data?.kind !== 'word' || (data.label !== 'Copy' && data.label !== 'Original')) { miss(1); return }
    setLabels(prev => ({ ...prev, [side]: data.label }))
    const after = { ...labels, [side]: data.label }
    if (after.left && after.right && after.left !== after.right) { setDone(1); next() }
  }
  const clickSide = (which) => {
    if (!labels.left || !labels.right) { miss(2); return }
    if (which === visiblePair) { setPicked(true); setDone(2); next() } else { miss(2) }
  }
  const dropNum = (where, data) => {
    if (data?.kind !== 'num') { miss(where === 'num' ? 3 : 4); return }
    const correctCopy = copyVals[visiblePair]
    const correctOrig = origVals[visiblePair]
    if (where === 'num') {
      if (data.value === correctCopy) { setNum(data.value); setDone(3); next() } else { miss(3) }
    } else {
      if (data.value === correctOrig) { setDen(data.value); setDone(4); next() } else { miss(4) }
    }
  }
  const doCalculate = () => {
    if (num == null || den == null) { miss(5); return }
    let n = num, d = den; const stepsOut = []
    let g = gcd(n, d)
    while (g > 1) {
      stepsOut.push(`${n} ÷ ${g} = ${n / g} ; ${d} ÷ ${g} = ${d / g}`)
      n = n / g; d = d / g; g = gcd(n, d)
    }
    setCalc({ simplified: `${n}/${d}`, steps: stepsOut })
    setDone(5)
    const missCount = steps.reduce((t, s) => t + s.misses, 0)
    const scoreColor = missCount === 0 ? 'green' : (missCount === 1 ? 'yellow' : 'red')
    const attempt = { scoreColor, stepResults: steps, stepHeads: STEP_HEADS }
    const nextSession = { ...session, attempts: [...session.attempts, attempt] }
    saveSession(nextSession); setSession(nextSession)
  }
  const resetProblem = () => {
    setProblem(genScaleProblem()); setStep(0)
    setSteps(STEP_HEADS.map(() => ({ misses: 0, done: false })))
    setLabels({ left: null, right: null }); setPicked(false)
    setSlots({ s0: null, s1: null, s2: null, s3: null, s4: null })
    setNum(null); setDen(null); setCalc({ simplified: null, steps: [] })
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">Scale Factor</div>
        <div className="toolbar">
          <button className="button" onClick={openHTable}>H-Table</button>
          <button className="button" onClick={() => setOpenSum(true)}>Summary</button>
          <button className="button ghost" onClick={resetProblem}>New Problem</button>
        </div>
      </div>

      <div className="panes">
        {/* LEFT: shapes */}
        <div className="card shape-area">
          <div className="rects">
            <div className="rect">
              <div className={"shape-label " + (!labels.left ? 'hidden' : '')}>{labels.left || 'Label me'}</div>
              {visiblePair === 'horizontal' && (<><div className="side-tag top">{problem.original.w}</div><div className="side-tag bottom">{problem.original.w}</div></>)}
              {visiblePair === 'vertical' && (<><div className="side-tag left">{problem.original.h}</div><div className="side-tag right">{problem.original.h}</div></>)}
              <div className={"side-hit top " + (picked && visiblePair === 'horizontal' ? 'good' : '')} onClick={() => clickSide('horizontal')} />
              <div className={"side-hit bottom " + (picked && visiblePair === 'horizontal' ? 'good' : '')} onClick={() => clickSide('horizontal')} />
              <div className={"side-hit left " + (picked && visiblePair === 'vertical' ? 'good' : '')} onClick={() => clickSide('vertical')} />
              <div className={"side-hit right " + (picked && visiblePair === 'vertical' ? 'good' : '')} onClick={() => clickSide('vertical')} />
            </div>

            <div className="rect copy">
              <div className={"shape-label " + (!labels.right ? 'hidden' : '')}>{labels.right || 'Label me'}</div>
              {visiblePair === 'horizontal' && (<><div className="side-tag top">{problem.copy.w}</div><div className="side-tag bottom">{problem.copy.w}</div></>)}
              {visiblePair === 'vertical' && (<><div className="side-tag left">{problem.copy.h}</div><div className="side-tag right">{problem.copy.h}</div></>)}
            </div>
          </div>

          <div className="chips">
            {wordBank.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={{ ...c }} />)}
          </div>
          <div className="chips">
            {numberChips.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={{ ...c }} />)}
          </div>
        </div>

        {/* RIGHT: one-step panel */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title">{STEP_HEADS[step]}</div>

            {step === 0 && (
              <>
                <div className="muted">Drag words into the correct framework. Chips can be reused.</div>
                <div className="fraction-row" style={{ marginTop: 10 }}>
                  <Slot test={testWord('Scale Factor')} onDropContent={onDropFormula('s0', 'Scale Factor')}>{slots.s0 || '___'}</Slot>
                  <Slot test={testWord('=')} onDropContent={onDropFormula('s1', '=')}>{slots.s1 || '___'}</Slot>
                  <Slot test={testWord('Copy')} onDropContent={onDropFormula('s2', 'Copy')}>{slots.s2 || '___'}</Slot>
                  <Slot test={testWord('/')} onDropContent={onDropFormula('s3', '/')}>{slots.s3 || '___'}</Slot>
                  <Slot test={testWord('Original')} onDropContent={onDropFormula('s4', 'Original')}>{slots.s4 || '___'}</Slot>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="muted">Drag “Original” and “Copy” onto the rectangles.</div>
                <div className="row" style={{ marginTop: 10 }}>
                  <Slot test={testWord('Original')} onDropContent={(d) => dropLabel('left', d)}><span>{labels.left || 'Left label'}</span></Slot>
                  <Slot test={testWord('Copy')} onDropContent={(d) => dropLabel('right', d)}><span>{labels.right || 'Right label'}</span></Slot>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="muted">Click the side pair that has values on both shapes (it will highlight).</div>
            )}

            {step === 3 && (
              <>
                <div className="muted">Drag the <b>Copy</b> value into the numerator.</div>
                <div className="fraction" style={{ marginTop: 10 }}>
                  <div><Slot test={testNum()} onDropContent={(d) => dropNum('num', d)}>{num ?? '—'}</Slot></div>
                  <div className="frac-bar"></div>
                  <div>{den ?? '—'}</div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="muted">Drag the <b>Original</b> value into the denominator.</div>
                <div className="fraction" style={{ marginTop: 10 }}>
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar"></div>
                  <div><Slot test={testNum()} onDropContent={(d) => dropNum('den', d)}>{den ?? '—'}</Slot></div>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="muted">Click calculate to simplify if needed.</div>
                <div className="fraction" style={{ marginTop: 10 }}>
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar"></div>
                  <div>{den ?? '—'}</div>
                </div>
                <div className="toolbar" style={{ marginTop: 10 }}>
                  <button className="button primary" onClick={doCalculate}>Calculate</button>
                </div>
                {calc.simplified && (
                  <div style={{ marginTop: 10 }}>
                    <div className="badge">Result: {calc.simplified}</div>
                    {calc.steps.length > 0 && (
                      <div className="muted" style={{ marginTop: 6 }}>
                        {calc.steps.map((s, i) => <div key={i}>{s}</div>)}
                      </div>
                    )}
                    <div className="toolbar" style={{ marginTop: 10 }}>
                      <button className="button" onClick={resetProblem}>Next Problem</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <SummaryOverlay open={openSum} onClose={() => setOpenSum(false)} attempts={session.attempts} stepHeads={STEP_HEADS} />
    </div>
  )
}
