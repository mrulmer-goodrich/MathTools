import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const STEP_HEADS = [
  'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5',
  'Step 6', 'Step 7', 'Step 8', 'Step 9', 'Step 10'
]

export default function HTableModule({ goHome, goScale }) {
  const [session, setSession] = useState(loadSession())
  const [problem, setProblem] = useState(genHProblem())
  const [openSum, setOpenSum] = useState(false)

  const [step, setStep] = useState(0)
  const [steps, setSteps] = useState(STEP_HEADS.map(() => ({ misses: 0, done: false })))
  const miss = (idx) => setSteps(s => { const c = [...s]; c[idx].misses++; return c })
  const setDone = (idx) => setSteps(s => { const c = [...s]; c[idx].done = true; return c })
  const next = () => setStep(s => Math.min(s + 1, STEP_HEADS.length - 1))

  // redaction / alt modes
  const [showEnglish, setShowEnglish] = useState(true)
  const [modeIndex, setModeIndex] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => { setShowEnglish(false); setModeIndex(0) }, 10000)
    return () => clearTimeout(t)
  }, [problem.id])

  const altKey = problem.altOrder[modeIndex] || 'Spanish'
  const textShown = showEnglish ? problem.text.english : (problem.text.alts[altKey] || problem.text.english)

  // chips (drag-only)
  const unitChoices = useMemo(() => {
    // include correct + 4 random distractors from a simple pool
    const pool = ['in', 'cm', 'km', 'miles', 'hours', 'minutes', 'liters', 'cups', 'pages', 'points', 'dollars', 'items', 'meters', 'yards']
    const unique = new Set(problem.units)
    while (unique.size < 6) unique.add(pool[Math.floor(Math.random() * pool.length)])
    return Array.from(unique).map((u, i) => ({ id: 'u' + i, label: u, kind: 'unit' }))
  }, [problem])

  const numberChoices = useMemo(() => {
    const nums = new Set([problem.scale[0], problem.scale[1], problem.given.value])
    while (nums.size < 6) nums.add(Math.floor(Math.random() * 20) + 1)
    return Array.from(nums).map((n, i) => ({ id: 'n' + i, label: String(n), kind: 'num', value: n }))
  }, [problem])

  // table state
  const [table, setTable] = useState({
    col1: '', col2: '', uTop: '', uBottom: '',
    sTop: null, sBottom: null, givenBottom: null, product: null, divisor: null, result: null
  })

  const product = useMemo(() => {
    if (table.givenBottom != null && table.sTop != null) return table.givenBottom * table.sTop
    return null
  }, [table.givenBottom, table.sTop])

  const result = useMemo(() => {
    if (product != null && table.sBottom != null) return product / table.sBottom
    return null
  }, [product, table.sBottom])

  const resetProblem = () => {
    setProblem(genHProblem())
    setStep(0)
    setSteps(STEP_HEADS.map(() => ({ misses: 0, done: false })))
    setShowEnglish(true); setModeIndex(0)
    setTable({ col1: '', col2: '', uTop: '', uBottom: '', sTop: null, sBottom: null, givenBottom: null, product: null, divisor: null, result: null })
  }

  const finish = () => {
    const missCount = steps.reduce((t, s) => t + s.misses, 0)
    const scoreColor = missCount === 0 ? 'green' : (missCount === 1 ? 'yellow' : 'red')
    const attempt = { scoreColor, stepResults: steps, stepHeads: [
      'What first?', 'Column 1', 'Units', 'Column 2', 'Place Values', 'Place Other Value',
      'Next?', 'Which multiply?', 'Next?', 'Which divide?'
    ] }
    const nextSession = { ...session, attempts: [...session.attempts, attempt] }
    saveSession(nextSession); setSession(nextSession)
    resetProblem()
  }

  // render
  return (
    <div className="container">
      <div className="header">
        <div className="brand">H-Table</div>
        <div className="toolbar">
          <button className="button" onClick={goHome}>Home</button>
          <button className="button" onClick={goScale}>Scale Factor</button>
          <button className="button" onClick={() => setOpenSum(true)}>Summary</button>
          <button className="button ghost" onClick={resetProblem}>New Problem</button>
        </div>
      </div>

      <div className="panes">
        {/* LEFT: problem + (after step 1) table outline */}
        <div className="card">
          <div className="problem">{textShown}</div>
          <div className="altmeta">
            {showEnglish ? 'English' : altKey} • After 10s or on release, the problem toggles presentation. Key values remain.
          </div>
          <div className="toolbar" style={{ marginTop: 8 }}>
            <button
              className="button"
              onMouseDown={() => setShowEnglish(true)}
              onMouseUp={() => { setShowEnglish(false); setModeIndex((modeIndex + 1) % problem.altOrder.length) }}
            >Hold: English</button>
          </div>

          {steps[0].done && (
            <div style={{ marginTop: 16 }}>
              <div className="houtline" aria-label="H-table outline" />
              <div className="muted" style={{ marginTop: 6 }}>{problem.scale[0]} {problem.units[0]} = {problem.scale[1]} {problem.units[1]}</div>
            </div>
          )}
        </div>

        {/* RIGHT: one-step-at-a-time */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title">
              {[
                'Step 1: What do we do first?',
                'Step 2: What goes in the first column (drag & drop)?',
                'Step 3: What are the Units in this problem (drag & drop)?',
                'Step 4: What goes in the second column (drag & drop)?',
                'Step 5: Where do these values go in the H Table (drag & drop)?',
                'Step 6: Where does the other value go (drag & drop)?',
                'Step 7: What’s the next step?',
                'Step 8: Which numbers are we multiplying? (click on H Table)',
                'Step 9: What’s the next step?',
                'Step 10: Which number are we dividing? (click on H Table)'
              ][step]}
            </div>

            {step === 0 && (
              <>
                <div className="chips">
                  <Draggable id="a1" label="Draw an H Table" data={{ kind: 'act', v: 'ok' }} />
                  <Draggable id="a2" label="Circle the Biggest Number" data={{ kind: 'act', v: 'x' }} />
                  <Draggable id="a3" label="Multiply and Divide the Numbers" data={{ kind: 'act', v: 'x' }} />
                  <Draggable id="a4" label="Draw an O Table" data={{ kind: 'act', v: 'x' }} />
                  <Draggable id="a5" label="Scream into the Void" data={{ kind: 'act', v: 'x' }} />
                </div>
                <Slot test={(d) => d.kind === 'act'} onDropContent={(d) => { if (d.v === 'ok') { setDone(0); next() } else miss(0) }}><span>Drop answer here</span></Slot>
              </>
            )}

            {step === 1 && (
              <>
                <div className="chips">
                  <Draggable id="c1" label="Units" data={{ kind: 'col', v: 'Units' }} />
                  <Draggable id="c2" label="Random Numbers" data={{ kind: 'col', v: 'x' }} />
                  <Draggable id="c3" label="Answer" data={{ kind: 'col', v: 'x' }} />
                  <Draggable id="c4" label="Multiply" data={{ kind: 'col', v: 'x' }} />
                  <Draggable id="c5" label="Scale" data={{ kind: 'col', v: 'Scale' }} />
                </div>
                <div className="row">
                  <Slot test={(d) => d.kind === 'col'} onDropContent={(d) => { if (d.v === 'Units') { setTable(t => ({ ...t, col1: 'Units' })); setDone(1); next() } else miss(1) }}>
                    <span>{table.col1 || 'Column 1'}</span>
                  </Slot>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="chips">
                  {unitChoices.map(u => <Draggable key={u.id} id={u.id} label={u.label} data={u} />)}
                </div>
                <div className="row">
                  <Slot test={(d) => d.kind === 'unit'} onDropContent={(d) => { setTable(t => ({ ...t, uTop: d.label })); }}>
                    <span>{table.uTop || 'Top Unit'}</span>
                  </Slot>
                  <Slot test={(d) => d.kind === 'unit'} onDropContent={(d) => { setTable(t => ({ ...t, uBottom: d.label })); }}>
                    <span>{table.uBottom || 'Bottom Unit'}</span>
                  </Slot>
                </div>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <button className="button primary" onClick={() => {
                    if (table.uTop === problem.units[0] && table.uBottom === problem.units[1]) { setDone(2); next() } else miss(2)
                  }}>Confirm Units</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="chips">
                  <Draggable id="c6" label="Units" data={{ kind: 'col', v: 'Units' }} />
                  <Draggable id="c7" label="Random Numbers" data={{ kind: 'col', v: 'x' }} />
                  <Draggable id="c8" label="Answer" data={{ kind: 'col', v: 'x' }} />
                  <Draggable id="c9" label="Multiply" data={{ kind: 'col', v: 'x' }} />
                  <Draggable id="c10" label="Scale" data={{ kind: 'col', v: 'Scale' }} />
                </div>
                <div className="row">
                  <Slot test={(d) => d.kind === 'col'} onDropContent={(d) => { if (d.v === 'Scale') { setTable(t => ({ ...t, col2: 'Scale' })); setDone(3); next() } else miss(3) }}>
                    <span>{table.col2 || 'Column 2'}</span>
                  </Slot>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="chips">
                  {numberChoices.map(n => <Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
                </div>
                <div className="row">
                  <Slot test={(d) => d.kind === 'num'} onDropContent={(d) => setTable(t => ({ ...t, sTop: d.value }))}>
                    <span>{table.sTop ?? 'Scale top'}</span>
                  </Slot>
                  <Slot test={(d) => d.kind === 'num'} onDropContent={(d) => setTable(t => ({ ...t, sBottom: d.value }))}>
                    <span>{table.sBottom ?? 'Scale bottom'}</span>
                  </Slot>
                </div>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <button className="button primary" onClick={() => {
                    if (table.sTop === problem.scale[0] && table.sBottom === problem.scale[1]) { setDone(4); next() } else miss(4)
                  }}>Confirm Scale</button>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="chips">
                  {numberChoices.map(n => <Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
                </div>
                <div className="row">
                  <Slot test={(d) => d.kind === 'num'} onDropContent={(d) => setTable(t => ({ ...t, givenBottom: d.value }))}>
                    <span>{table.givenBottom ?? 'Given (bottom row)'}</span>
                  </Slot>
                </div>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <button className="button primary" onClick={() => {
                    if (table.givenBottom === problem.given.value) { setDone(5); next() } else miss(5)
                  }}>Confirm Value</button>
                </div>
              </>
            )}

            {step === 6 && (
              <>
                <div className="chips">
                  <Draggable id="n1" label="Divide then Multiply" data={{ kind: 'nx', v: 'x' }} />
                  <Draggable id="n2" label="Cross Multiply" data={{ kind: 'nx', v: 'ok' }} />
                  <Draggable id="n3" label="Divide" data={{ kind: 'nx', v: 'x' }} />
                  <Draggable id="n4" label="Multiply Across" data={{ kind: 'nx', v: 'x' }} />
                  <Draggable id="n5" label="Add the Numbers" data={{ kind: 'nx', v: 'x' }} />
                </div>
                <Slot test={(d) => d.kind === 'nx'} onDropContent={(d) => { if (d.v === 'ok') { setDone(6); next() } else miss(6) }}>
                  <span>Drop answer here</span>
                </Slot>
              </>
            )}

            {step === 7 && (
              <>
                <div className="muted">Click the two numbers to multiply (a red oval will appear).</div>
                <div style={{ marginTop: 8 }}>
                  <span className="red-oval">{table.givenBottom ?? '?'}</span> × <span className="red-oval">{table.sTop ?? '?'}</span> = {product ?? '?'}
                </div>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <button className="button primary" onClick={() => {
                    if (product != null) { setTable(t => ({ ...t, product })); setDone(7); next() } else miss(7)
                  }}>Confirm Multiply</button>
                </div>
              </>
            )}

            {step === 8 && (
              <>
                <div className="chips">
                  <Draggable id="m1" label="Divide then Multiply" data={{ kind: 'nx', v: 'x' }} />
                  <Draggable id="m2" label="Cross Multiply" data={{ kind: 'nx', v: 'x' }} />
                  <Draggable id="m3" label="Divide" data={{ kind: 'nx', v: 'ok' }} />
                  <Draggable id="m4" label="Multiply Across" data={{ kind: 'nx', v: 'x' }} />
                  <Draggable id="m5" label="Add the Numbers" data={{ kind: 'nx', v: 'x' }} />
                </div>
                <Slot test={(d) => d.kind === 'nx'} onDropContent={(d) => { if (d.v === 'ok') { setDone(8); next() } else miss(8) }}>
                  <span>Drop answer here</span>
                </Slot>
              </>
            )}

            {step === 9 && (
              <>
                <div className="muted">Click the number we divide by (it becomes triple-underlined).</div>
                <div style={{ marginTop: 8 }}>
                  <span>{product ?? '?'}</span> ÷ <span className="triple-ul">{table.sBottom ?? '?'}</span> = {result ?? '?'}
                </div>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <button className="button primary" onClick={() => {
                    if (result != null) { setTable(t => ({ ...t, result })); setDone(9); finish() } else miss(9)
                  }}>Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <SummaryOverlay open={openSum} onClose={() => setOpenSum(false)} attempts={session.attempts} stepHeads={STEP_HEADS} />
    </div>
  )
}
