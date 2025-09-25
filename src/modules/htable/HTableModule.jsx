import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

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

const clone = (x) => JSON.parse(JSON.stringify(x))

export default function HTableModule() {
  const persisted = loadSession()
  const [session, setSession] = useState(persisted)

  const [problem, setProblem] = useState(() => session.hSnap?.problem || genHProblem())
  const [step, setStep] = useState(session.hSnap?.step ?? 0)
  const [steps, setSteps] = useState(session.hSnap?.steps || STEP_HEADS.map(() => ({ misses: 0, done: false })))
  const [openSum, setOpenSum] = useState(false)

  const initialTable = {
    head1: '', head2: '',
    uTop: '', uBottom: '',
    sTop: null, sBottom: null,
    vTop: null, vBottom: null,
    multPick: [],
    divisor: null,
    product: null,
    result: null
  }
  const [table, setTable] = useState(() => session.hSnap?.table || initialTable)

  const markMiss = (i) => setSteps(s => { const c = clone(s); c[i].misses++; return c })
  const markDone = (i) => setSteps(s => { const c = clone(s); c[i].done = true; return c })
  const goNext = () => setStep(s => Math.min(s + 1, STEP_HEADS.length - 1))

  useEffect(() => {
    const next = { ...session, hSnap: { problem, table, step, steps } }
    saveSession(next); setSession(next)
  }, [problem, table, step, steps])

  const [showEnglish, setShowEnglish] = useState(true)
  const [mode, setMode] = useState('Spanish')
  const [maskClass, setMaskClass] = useState('')
  const timerRef = useRef(null)
  const holdRef  = useRef(false)

  const randomAlt = (list) => list[Math.floor(Math.random()*list.length)]

  const applyMode = (m) => {
    setShowEnglish(false)
    setMode(m)
    if (m === 'FadeOut') setMaskClass('mask fade')
    else if (m === 'BlackOut') setMaskClass('mask black')
    else setMaskClass('')
  }

  const startTicker = () => {
    stopTicker()
    timerRef.current = setInterval(() => {
      if (holdRef.current) return
      const pool = problem.altOrder
      const choices = pool.filter(m => m !== mode)
      const m = choices[Math.floor(Math.random()*choices.length)]
      applyMode(m)
    }, 10000)
  }
  const stopTicker = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  useEffect(() => {
    stopTicker()
    holdRef.current = false
    setShowEnglish(true); setMode('Spanish'); setMaskClass('')
    const first = setTimeout(() => applyMode(randomAlt(problem.altOrder)), 10000)
    startTicker()
    return () => { clearTimeout(first); stopTicker() }
  }, [problem.id])

  const unitChoices = useMemo(() => {
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

  const acceptHeader1 = (d) => step===1 && d.kind==='col'
  const acceptHeader2 = (d) => step===3 && d.kind==='col'
  const acceptUnit     = (d) => step===2 && d.kind==='unit'
  const acceptScaleNum = (d) => step===4 && d.kind==='num'
  const acceptGivenNum = (d) => step===5 && d.kind==='num'

  const unitTop = table.uTop, unitBottom = table.uBottom
  const [u1,u2] = problem.units
  const [a,b]   = problem.scale

  const scaleForUnit = (u) => (u===u1 ? a : (u===u2 ? b : null))

  const givenUnit = problem.given.row === 'top' ? u1 : u2

  const rowOfUnit = (u) => (u && u===unitTop ? 'top' : (u && u===unitBottom ? 'bottom' : null))
  const expectedGivenRow = rowOfUnit(givenUnit)

  const clickCell = (key) => {
    if (step===7) {
      setTable(t => {
        const picks = new Set(t.multPick)
        if (picks.has(key)) picks.delete(key); else if (picks.size<2) picks.add(key)
        return { ...t, multPick: Array.from(picks) }
      })
    } else if (step===9) {
      if (key==='sTop' || key==='sBottom') setTable(t => ({ ...t, divisor: key }))
    }
  }

  const confirmStep1 = (d) => { if (d.v === 'ok') { markDone(0); goNext() } else markMiss(0) }

  const confirmUnits = () => {
    const placed = new Set([unitTop, unitBottom].filter(Boolean))
    if (placed.size===2) { markDone(2); goNext() } else markMiss(2)
  }

  const confirmScale = () => {
    const shouldTop    = scaleForUnit(unitTop)
    const shouldBottom = scaleForUnit(unitBottom)
    const ok = (table.sTop===shouldTop && table.sBottom===shouldBottom)
    if (ok) { markDone(4); goNext() } else markMiss(4)
  }

  const confirmGiven = () => {
    const placedTop = table.vTop!=null
    const placedBottom = table.vBottom!=null
    const correctValue = (table.vTop===problem.given.value || table.vBottom===problem.given.value)
    const correctRow = (placedTop && expectedGivenRow==='top') || (placedBottom && expectedGivenRow==='bottom')
    if ((placedTop ^ placedBottom) && correctValue && correctRow) { markDone(5); goNext() } else markMiss(5)
  }

  const confirmNext = (want) => (d) => { if (d.v===want) { markDone(step); goNext() } else markMiss(step) }

  const confirmMultiply = () => {
    const picks = table.multPick.slice().sort().join(',')
    const givenCell = expectedGivenRow==='top' ? 'vTop' : 'vBottom'
    const oppScale  = expectedGivenRow==='top' ? 'sBottom' : 'sTop'
    const want = [givenCell, oppScale].sort().join(',')
    if (picks!==want) { markMiss(7); return }
    const givenVal = table[givenCell]
    const oppVal   = table[oppScale]
    if (givenVal==null || oppVal==null) { markMiss(7); return }
    setTable(t => ({ ...t, product: givenVal * oppVal }))
    markDone(7); goNext()
  }

  const submitDivide = () => {
    const need = expectedGivenRow==='top' ? 'sTop' : 'sBottom'
    if (table.divisor !== need) { markMiss(9); return }
    const product = table.product
    const divisor = table[need]
    if (product==null || divisor==null) { markMiss(9); return }
    const result = product / divisor
    setTable(t => ({ ...t, result }))

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
    // reset redaction
    stopTicker(); holdRef.current=false; setShowEnglish(true); setMode('Spanish'); setMaskClass('')
    setTimeout(()=>applyMode(randomAlt(problem.altOrder)), 10)
  }

  const Story = () => {
    const lang = showEnglish ? 'English' : mode
    const txt  = showEnglish ? problem.text.english : (problem.text.alts[lang] || problem.text.english)
    return (
      <>
        <div className={`problem ${!showEnglish && (mode==='FadeOut' || mode==='BlackOut') ? maskClass : ''}`}>
          {txt}
        </div>
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
        </div>
      </>
    )
  }

  const picked = (key) => table.multPick.includes(key)
  const ovalIf = (key, children) => (
    <span className={picked(key) ? 'red-oval' : ''} onClick={()=>clickCell(key)} role="button">{children}</span>
  )

  return (
    <div className="container">
      <div className="panes">
        <div className="card">
          <Story />
          <button className="button primary big-under" onClick={resetProblem}>New Problem</button>

          {step >= 1 and True and (
            <div className="hwrap">
              <div className="hgrid">
                <div className="hhead">
                  <Slot
                    test={(d)=>step===1 && d.kind==='col'}
                    onDropContent={(d)=>{
                      if (d.v==='Units') { setTable(t=>({...t, head1:'Units'})); markDone(1); goNext() }
                      else markMiss(1)
                    }}
                  >
                    <span>{table.head1 || 'Header 1'}</span>
                  </Slot>
                </div>
                <div className="hhead">
                  <Slot
                    test={(d)=>step===3 && d.kind==='col'}
                    onDropContent={(d)=>{
                      if (d.v==='Scale') { setTable(t=>({...t, head2:'Scale'})); markDone(3); goNext() }
                      else markMiss(3)
                    }}
                  >
                    <span>{table.head2 || 'Header 2'}</span>
                  </Slot>
                </div>
                <div className="hhead"></div>

                <div className="hcell">
                  <Slot className="flat" test={(d)=>step===2 && d.kind==='unit'} onDropContent={(d)=>setTable(t=>({...t,uTop:d.label}))}>
                    <span>{table.uTop || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={(d)=>step===4 && d.kind==='num'} onDropContent={(d)=>setTable(t=>({...t,sTop:d.value}))}>
                    {ovalIf('sTop', <span>{table.sTop ?? ''}</span>)}
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={(d)=>step===5 && d.kind==='num'} onDropContent={(d)=>setTable(t=>({...t,vTop:d.value}))}>
                    {ovalIf('vTop', <span>{table.vTop ?? ''}</span>)}
                  </Slot>
                </div>

                <div className="hcell">
                  <Slot className="flat" test={(d)=>step===2 && d.kind==='unit'} onDropContent={(d)=>setTable(t=>({...t,uBottom:d.label}))}>
                    <span>{table.uBottom || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={(d)=>step===4 && d.kind==='num'} onDropContent={(d)=>setTable(t=>({...t,sBottom:d.value}))}>
                    {ovalIf('sBottom', <span>{table.sBottom ?? ''}</span>)}
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={(d)=>step===5 && d.kind==='num'} onDropContent={(d)=>setTable(t=>({...t,vBottom:d.value}))}>
                    {ovalIf('vBottom', <span>{table.vBottom ?? ''}</span>)}
                  </Slot>
                </div>

                <div className="hstroke horiz"></div>
                <div className="hstroke vert-left"></div>
                <div className="hstroke vert-right"></div>
              </div>
            </div>
          )}
        </div>

        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title">{STEP_HEADS[step]}</div>

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

            {(step===1 || step===3) and True and (
              <div className="chips">
                <Draggable id="c1" label="Units" data={{kind:'col', v:'Units'}} />
                <Draggable id="c2" label="Scale" data={{kind:'col', v:'Scale'}} />
                <Draggable id="c3" label="Random Numbers" data={{kind:'col', v:'x'}} />
                <Draggable id="c4" label="Answer" data={{kind:'col', v:'x'}} />
                <Draggable id="c5" label="Multiply" data={{kind:'col', v:'x'}} />
              </div>
            )}

            {step===2 and True and (
              <>
                <div className="chips">
                  {unitChoices.map(u => <Draggable key={u.id} id={u.id} label={u.label} data={u} />)}
                </div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={confirmUnits}>Confirm Units</button>
                </div>
              </>
            )}

            {step===4 and True and (
              <>
                <div className="chips">
                  {numberChoices.map(n => <Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
                </div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={confirmScale}>Confirm Scale</button>
                </div>
              </>
            )}

            {step===5 and True and (
              <>
                <div className="chips">
                  {numberChoices.map(n => <Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
                </div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={confirmGiven}>Confirm Given</button>
                </div>
              </>
            )}

            {(step===6 || step===8) and True and (
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

            {step===7 and True and (
              <>
                <div className="muted">Click the <b>given</b> and the <b>opposite-row scale</b> in the H-table. Then confirm.</div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={confirmMultiply}>Confirm Multiply</button>
                </div>
                {table.product!=null && <div className="muted" style={{marginTop:8}}>Product: {table.product}</div>}
              </>
            )}

            {step===9 and True and (
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
