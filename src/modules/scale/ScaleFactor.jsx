// src/modules/htable/HTableModule.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

/** ---------- Step headings (10 boxes in Summary) ---------- */
const STEP_HEADS = [
  'What do we do first?',
  'Column 1 header',
  'Place the units (drag onto left cells)',
  'Column 2 header',
  'Place the scale numbers',
  'Place the given number',
  'What’s next?',
  'Which numbers multiply? (click the two cells)',
  'What’s next?',
  'Which number do we divide by? (click one cell)'
]

/** Utility: deep clone helper to avoid accidental mutations */
const clone = (x) => JSON.parse(JSON.stringify(x))

export default function HTableModule() {
  /** ---------- persisted session ----------- */
  const persisted = loadSession()
  const [session, setSession] = useState(persisted)

  /** ---------- problem + table state ----------- */
  const [problem, setProblem] = useState(() => session.hSnap?.problem || genHProblem())
  const [step, setStep] = useState(session.hSnap?.step ?? 0)
  const [steps, setSteps] = useState(session.hSnap?.steps || STEP_HEADS.map(() => ({ misses: 0, done: false })))
  const [openSum, setOpenSum] = useState(false)

  /** H-grid state */
  const initialTable = {
    head1: '', head2: '',
    uTop: '', uBottom: '',
    sTop: null, sBottom: null,
    vTop: null, vBottom: null,
    // interaction highlights
    multPick: [],   // e.g. ['vTop','sBottom']
    divisor: null,  // 'sTop' | 'sBottom'
    product: null,
    result: null
  }
  const [table, setTable] = useState(() => session.hSnap?.table || initialTable)

  /** helpers: miss/done/next */
  const markMiss = (i) => setSteps(s => { const c = clone(s); c[i].misses++; return c })
  const markDone = (i) => setSteps(s => { const c = clone(s); c[i].done = true; return c })
  const goNext = () => setStep(s => Math.min(s + 1, STEP_HEADS.length - 1))

  /** persist snapshot anytime key state changes */
  useEffect(() => {
    const next = { ...session, hSnap: { problem, table, step, steps } }
    saveSession(next); setSession(next)
    // eslint-disable-next-line
  }, [problem, table, step, steps])

  /** ---------- Story + mode scheduler ---------- */
  const [showEnglish, setShowEnglish] = useState(true)
  const [mode, setMode] = useState('Spanish')  // starting alt (we’ll randomize subsequently)
  const [errorMsg, setErrorMsg] = useState('')
  const timerRef = useRef(null)
  const holdRef  = useRef(false)

  const randomAlt = (list) => list[Math.floor(Math.random()*list.length)]

  const applyMode = (m) => {
    setShowEnglish(false)
    // Filter out legacy redaction modes; support 'MaskLetters' and languages
    const filtered = (m === 'FadeOut' || m === 'BlackOut') ? 'MaskLetters' : m
    setMode(filtered)
  }

  const startTicker = () => {
    stopTicker()
    timerRef.current = setInterval(() => {
      if (holdRef.current) return // paused while holding English
      const pool = problem.altOrder
      const choices = pool.filter(m => m !== mode)
      const m = choices[Math.floor(Math.random()*choices.length)]
      applyMode(m)
    }, 15000) // 15s per spec
  }
  const stopTicker = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  // start with English for 15s, then first random mode
  useEffect(() => {
    stopTicker()
    holdRef.current = false
    setShowEnglish(true); setMode('Spanish')
    const first = setTimeout(() => applyMode(randomAlt(problem.altOrder)), 15000)
    startTicker()
    return () => { clearTimeout(first); stopTicker() }
    // eslint-disable-next-line
  }, [problem.id])

  /** ---------- Choices (units & numbers) ---------- */
  const unitChoices = useMemo(() => {
    // 6 unique including the two correct units
    const pool = ['in','cm','km','m','yd','miles','seconds','hours','minutes','liters','cups','tablespoons','pages','points','dollars','items','meters','yards']
    const need = new Set(problem.units)
    while (need.size < 6) need.add(pool[Math.floor(Math.random()*pool.length)])
    return Array.from(need).map((u, i) => ({ id: 'u'+i, label: u, kind: 'unit' }))
  }, [problem])

  const numberChoices = useMemo(() => {
    const nums = new Set([problem.scale[0], problem.scale[1], problem.given.value])
    while (nums.size < 6) nums.add(Math.floor(Math.random()*20)+1)
    return Array.from(nums).map((n, i) => ({ id: 'n'+i, label: String(n), kind: 'num', value: n }))
  }, [problem])

  /** ---------- Accept tests for drop slots ---------- */
  const acceptHeader1 = (d) => step===1 && d.kind==='col'
  const acceptHeader2 = (d) => step===3 && d.kind==='col'
  const acceptUnit     = (d) => step===2 && d.kind==='unit'
  const acceptScaleNum = (d) => step===4 && d.kind==='num'
  const acceptGivenNum = (d) => step===5 && d.kind==='num'

  /** ---------- Validation helpers (alignment-sensitive) ---------- */
  const unitTop = table.uTop, unitBottom = table.uBottom
  const [u1,u2] = problem.units
  const [a,b]   = problem.scale

  // Which number should align to a unit?
  const scaleForUnit = (u) => (u===u1 ? a : (u===u2 ? b : null))

  // Given's unit (relative to original units)
  const givenUnit = problem.given.row === 'top' ? u1 : u2

  // Which row (top/bottom) now holds that unit?
  const rowOfUnit = (u) => (u && u===unitTop ? 'top' : (u && u===unitBottom ? 'bottom' : null))
  const expectedGivenRow = rowOfUnit(givenUnit)

  /** ---------- Clickable multiply/divide selection ---------- */
  const clickCell = (key) => {
    if (step===7) {
      // pick two cells to multiply (must be given + opposite-row scale)
      setTable(t => {
        const picks = new Set(t.multPick)
        if (picks.has(key)) picks.delete(key); else if (picks.size<2) picks.add(key)
        return { ...t, multPick: Array.from(picks) }
      })
    } else if (step===9) {
      // pick divisor (must be scale from same row as given)
      if (key==='sTop' || key==='sBottom') setTable(t => ({ ...t, divisor: key }))
    }
  }

  const tryAgain = (i, msg='Try Again!') => {
    markMiss(i)
    setErrorMsg(msg)
    setTimeout(()=>setErrorMsg(''), 1200)
  }

  /** ---------- Auto-advance hooks ---------- */
  // Units auto-advance
  useEffect(() => {
    if (step===2) {
      const placed = new Set([unitTop, unitBottom].filter(Boolean))
      if (placed.size===2) { markDone(2); goNext() }
    }
    // eslint-disable-next-line
  }, [step, unitTop, unitBottom])

  // Scale numbers alignment auto-advance
  useEffect(() => {
    if (step===4) {
      const shouldTop    = scaleForUnit(unitTop)
      const shouldBottom = scaleForUnit(unitBottom)
      const ok = (table.sTop===shouldTop && table.sBottom===shouldBottom)
      if (table.sTop!=null || table.sBottom!=null) {
        if (!ok && table.sTop!=null && table.sBottom!=null) tryAgain(4)
        if (ok) { markDone(4); goNext() }
      }
    }
    // eslint-disable-next-line
  }, [step, table.sTop, table.sBottom, unitTop, unitBottom])

  // Given auto-advance
  useEffect(() => {
    if (step===5) {
      const placedTop = table.vTop!=null
      const placedBottom = table.vBottom!=null
      const correctValue = (table.vTop===problem.given.value || table.vBottom===problem.given.value)
      const correctRow = (placedTop && expectedGivenRow==='top') || (placedBottom && expectedGivenRow==='bottom')
      if (placedTop || placedBottom) {
        if ((placedTop ^ placedBottom) && correctValue && correctRow) { markDone(5); goNext() }
        else if ((placedTop ^ placedBottom)) tryAgain(5)
      }
    }
    // eslint-disable-next-line
  }, [step, table.vTop, table.vBottom, expectedGivenRow, problem.given.value])

  /** ---------- Step helpers ---------- */
  const confirmStep1 = (d) => { // Draw an H Table
    if (d.v === 'ok') { markDone(0); goNext() } else markMiss(0)
  }

  const confirmNext = (want) => (d) => { if (d.v===want) { markDone(step); goNext() } else markMiss(step) }

  const confirmMultiply = () => {
    // Must have picked exactly [givenCell, oppositeScaleCell]
    const picks = table.multPick.slice().sort().join(',')
    const givenCell = expectedGivenRow==='top' ? 'vTop' : 'vBottom'
    const oppScale  = expectedGivenRow==='top' ? 'sBottom' : 'sTop'
    const want = [givenCell, oppScale].sort().join(',')
    if (picks!==want) { tryAgain(7); return }
    const givenVal = table[givenCell]
    const oppVal   = table[oppScale]
    if (givenVal==null || oppVal==null) { tryAgain(7); return }
    setTable(t => ({ ...t, product: givenVal * oppVal }))
    markDone(7); goNext()
  }

  const submitDivide = () => {
    // Must click divisor = scale in same row as given
    const need = expectedGivenRow==='top' ? 'sTop' : 'sBottom'
    if (table.divisor !== need) { tryAgain(9); return }
    const product = table.product
    const divisor = table[need]
    if (product==null || divisor==null) { tryAgain(9); return }
    const result = product / divisor
    setTable(t => ({ ...t, result }))

    // log attempt
    const missCount = steps.reduce((t,s)=>t+s.misses,0)
    const scoreColor = missCount===0 ? 'green' : missCount===1 ? 'yellow' : 'red'
    const attempt = { scoreColor, stepResults: clone(steps), stepHeads: STEP_HEADS }
    const nextSession = { ...session, attempts: [...session.attempts, attempt] }
    saveSession(nextSession); setSession(nextSession)
  }

  const resetProblem = () => {
    setProblem(genHProblem())
    setTable(initialTable)
    setStep(0)
    setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    // reset rotation
    stopTicker(); holdRef.current=false; setShowEnglish(true); setMode('Spanish')
    setTimeout(()=>applyMode(randomAlt(problem.altOrder)), 10) // replaced by effect
  }

  /** ---------- Story rendering ---------- */
  const Story = () => {
    const lang = showEnglish ? 'English' : mode
    const raw  = showEnglish ? problem.text.english : (problem.text.alts[lang] || problem.text.english)
    // Mask-Letters mode: replace letters with 'X', keep digits/units/spaces/punct
    const txt = (!showEnglish && mode==='MaskLetters')
      ? raw.replace(/[A-Za-z]/g, 'X')
      : raw
    return (
      <>
        <div className="problem">{txt}</div>
        <div className="lang-badge">Mode: {showEnglish ? 'English' : mode}</div>
        <div className="toolbar" style={{justifyContent:'center', marginTop: 10}}>
          <button
            className="button big-under"
            onMouseDown={()=>{ holdRef.current=true; setShowEnglish(true) }}
            onMouseUp={()=>{ holdRef.current=false; applyMode(randomAlt(problem.altOrder)) }}
            onTouchStart={()=>{ holdRef.current=true; setShowEnglish(true) }}
            onTouchEnd={()=>{ holdRef.current=false; applyMode(randomAlt(problem.altOrder)) }}
            aria-pressed={holdRef.current ? 'true':'false'}
          >
            Hold: English
          </button>
          {errorMsg && <div className="error big-red" style={{marginLeft:12}}>{errorMsg}</div>}
        </div>
      </>
    )
  }

  /** ---------- Cell helpers for click selection UI ---------- */
  const picked = (key) => table.multPick.includes(key)
  const ovalIf = (key, children) => (
    <span className={picked(key) ? 'red-oval' : ''} onClick={()=>clickCell(key)} role="button">{children}</span>
  )

  /** ---------- Render ---------- */
  return (
    <div className="container">
      <div className="panes">
        {/* LEFT: Story + New Problem + H-grid */}
        <div className="card">
          <Story />
          <button className="button primary big-under" onClick={resetProblem}>New Problem</button>

          {/* H-table appears only after Step 1 */}
          {step >= 1 && (
            <div className="hwrap">
              <div className="hgrid">
                {/* headers row (1st + 2nd col only; 3rd column has no label) */}
                <div className="hhead">
                  <Slot
                    test={acceptHeader1}
                    onDropContent={(d)=>{
                      if (d.v==='Units') { setTable(t=>({...t, head1:'Units'})); markDone(1); goNext() }
                      else markMiss(1)
                    }}
                  >
                    <span>{table.head1 || ''}</span>
                  </Slot>
                </div>
                <div className="hhead">
                  <Slot
                    test={acceptHeader2}
                    onDropContent={(d)=>{
                      if (d.v==='Scale Numbers') { setTable(t=>({...t, head2:'Scale Numbers'})); markDone(3); goNext() }
                      else markMiss(3)
                    }}
                  >
                    <span>{table.head2 || ''}</span>
                  </Slot>
                </div>
                <div className="hhead"></div>

                {/* row 1 — no horizontal bar here */}
                <div className="hcell">
                  <Slot
                    className={`${table.uTop ? 'filled' : ''}`}
                    test={acceptUnit}
                    onDropContent={(d)=>setTable(t=>({...t,uTop:d.label}))}
                  >
                    <span>{table.uTop || ''}</span>
                  </Slot>
                </div>

                <div className="hcell vline">
                  <Slot
                    className={`${table.sTop!=null ? 'filled' : ''}`}
                    test={acceptScaleNum}
                    onDropContent={(d)=>{
                      const want = scaleForUnit(unitTop)
                      if (d.value===want) setTable(t=>({...t,sTop:d.value}))
                      else tryAgain(4)
                    }}
                  >
                    {ovalIf('sTop', <span>{table.sTop ?? ''}</span>)}
                  </Slot>
                </div>

                <div className="hcell vline">
                  <Slot
                    className={`${table.vTop!=null ? 'filled' : ''}`}
                    test={acceptGivenNum}
                    onDropContent={(d)=>{
                      if (expectedGivenRow==='top' && d.value===problem.given.value && table.vBottom==null)
                        setTable(t=>({...t,vTop:d.value}))
                      else tryAgain(5)
                    }}
                  >
                    {ovalIf('vTop', <span>{table.vTop ?? ''}</span>)}
                  </Slot>
                </div>

                {/* row 2 — bottom half; H horizontal bar BETWEEN data rows */}
                <div className="hcell rowline">
                  <Slot
                    className={`${table.uBottom ? 'filled' : ''}`}
                    test={acceptUnit}
                    onDropContent={(d)=>setTable(t=>({...t,uBottom:d.label}))}
                  >
                    <span>{table.uBottom || ''}</span>
                  </Slot>
                </div>

                <div className="hcell vline rowline">
                  <Slot
                    className={`${table.sBottom!=null ? 'filled' : ''}`}
                    test={acceptScaleNum}
                    onDropContent={(d)=>{
                      const want = scaleForUnit(unitBottom)
                      if (d.value===want) setTable(t=>({...t,sBottom:d.value}))
                      else tryAgain(4)
                    }}
                  >
                    {ovalIf('sBottom', <span>{table.sBottom ?? ''}</span>)}
                  </Slot>
                </div>

                <div className="hcell vline rowline">
                  <Slot
                    className={`${table.vBottom!=null ? 'filled' : ''}`}
                    test={acceptGivenNum}
                    onDropContent={(d)=>{
                      if (expectedGivenRow==='bottom' && d.value===problem.given.value && table.vTop==null)
                        setTable(t=>({...t,vBottom:d.value}))
                      else tryAgain(5)
                    }}
                  >
                    {ovalIf('vBottom', <span>{table.vBottom ?? ''}</span>)}
                  </Slot>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: steps & chips */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title">{STEP_HEADS[step]}</div>

            {/* Step 1 */}
            {step===0 && (
              <>
                <div className="chips">
                  <Draggable id="a1" label="Draw an H Table" data={{kind:'act', v:'ok'}} />
                  <Draggable id="a2" label="Circle the Biggest Number" data={{kind:'act', v:'x'}} />
                  <Draggable id="a3" label="Multiply and Divide the Numbers" data={{kind:'act', v:'x'}} />
                  <Draggable id="a4" label="Draw an O Table" data={{kind:'act', v:'x'}} />
                  <Draggable id="a5" label="Scream into the Void" data={{kind:'act', v:'x'}} />
                </div>
                <Slot test={(d)=>d.kind==='act'} onDropContent={confirmStep1}>
                  <span className="slot">Drop answer here</span>
                </Slot>
              </>
            )}

            {/* Step 2 & 4: headers */}
            {(step===1 || step===3) && (
              <div className="chips">
                <Draggable id="c1" label="Units" data={{kind:'col', v:'Units'}} />
                <Draggable id="c2" label="Scale Numbers" data={{kind:'col', v:'Scale Numbers'}} />
                <Draggable id="c3" label="Random Numbers" data={{kind:'col', v:'x'}} />
                <Draggable id="c4" label="Answer" data={{kind:'col', v:'x'}} />
                <Draggable id="c5" label="Multiply" data={{kind:'col', v:'x'}} />
              </div>
            )}

            {/* Step 3: units */}
            {step===2 && (
              <div className="chips">
                {unitChoices.map(u => <Draggable key={u.id} id={u.id} label={u.label} data={u} />)}
              </div>
            )}

            {/* Step 5: scale numbers (alignment sensitive) */}
            {step===4 && (
              <div className="chips">
                {numberChoices.map(n => <Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
              </div>
            )}

            {/* Step 6: given number */}
            {step===5 && (
              <div className="chips">
                {numberChoices.map(n => <Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
              </div>
            )}

            {/* Step 7 & 9: next actions */}
            {(step===6 || step===8) && (
              <>
                <div className="chips">
                  <Draggable id="n1" label="Divide then Multiply" data={{kind:'nx', v:'x'}} />
                  <Draggable id="n2" label="Cross Multiply" data={{kind:'nx', v: step===6 ? 'ok' : 'x'}} />
                  <Draggable id="n3" label="Divide" data={{kind:'nx', v: step===8 ? 'ok' : 'x'}} />
                  <Draggable id="n4" label="Multiply Across" data={{kind:'nx', v:'x'}} />
                  <Draggable id="n5" label="Add the Numbers" data={{kind:'nx', v:'x'}} />
                </div>
                <Slot test={(d)=>d.kind==='nx'} onDropContent={confirmNext(step===6 ? 'ok' : 'ok')}>
                  <span className="slot">Drop answer here</span>
                </Slot>
              </>
            )}

            {/* Step 8: click multiply pair */}
            {step===7 && (
              <>
                <div className="muted">Click the <b>given</b> and the <b>opposite-row scale</b> in the H-table. Then confirm.</div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={confirmMultiply}>Confirm Multiply</button>
                </div>
                {table.product!=null && <div className="muted" style={{marginTop:8}}>Product: {table.product}</div>}
              </>
            )}

            {/* Step 10: click divisor & submit */}
            {step===9 && (
              <>
                <div className="muted">Click the divisor (scale on the <b>same row</b> as the given), then Submit.</div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button success" onClick={submitDivide}>Submit</button>
                </div>
                {table.result!=null && <div className="muted" style={{marginTop:8}}>Answer: {table.result}</div>}
              </>
            )}
          </div>
        </div>
      </div>

      <button className="button primary floating-summary" onClick={()=>setOpenSum(true)}>Summary</button>
      <SummaryOverlay open={openSum} onClose={()=>setOpenSum(false)} attempts={session.attempts} stepHeads={STEP_HEADS} />
    </div>
  )
}
