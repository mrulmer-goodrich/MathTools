import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const STEP_HEADS = [
  'What first?', 'Column 1', 'Units', 'Column 2', 'Place Scale', 'Place Given',
  'Next?', 'Which multiply?', 'Next?', 'Which divide?'
]

export default function HTableModule({ openScale }) {
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
  const textShown = showEnglish ? problem.text.longStory : (problem.text.alts[altKey] || problem.text.english)
  const maskedClass = (!showEnglish && (altKey === 'FadeOut' || altKey === 'BlackOut')) ? (altKey === 'FadeOut' ? 'mask fade' : 'mask black') : ''

  // choices
  const unitChoices = useMemo(() => {
    const pool = ['in','cm','km','miles','hours','minutes','liters','cups','pages','points','dollars','items','meters','yards']
    const unique = new Set(problem.units)
    while (unique.size < 6) unique.add(pool[Math.floor(Math.random() * pool.length)])
    return Array.from(unique).map((u, i) => ({ id: 'u' + i, label: u, kind: 'unit' }))
  }, [problem])

  const numberChoices = useMemo(() => {
    const nums = new Set([problem.scale[0], problem.scale[1], problem.given.value])
    while (nums.size < 6) nums.add(Math.floor(Math.random() * 20) + 1)
    return Array.from(nums).map((n, i) => ({ id: 'n' + i, label: String(n), kind: 'num', value: n }))
  }, [problem])

  // table state (2 rows x 3 columns)
  const [table, setTable] = useState({
    head1: '', head2: '', // "Units", "Scale"
    uTop: '', uBottom: '',
    sTop: null, sBottom: null,
    vTop: null, vBottom: null, // given usually vBottom
    product: null, divisor: null, result: null
  })

  const product = useMemo(() => {
    const A = table.vBottom ?? table.vTop
    if (A != null && table.sTop != null) return A * table.sTop
    return null
  }, [table.vBottom, table.vTop, table.sTop])

  const result = useMemo(() => {
    if (product != null && table.sBottom != null) return product / table.sBottom
    return null
  }, [product, table.sBottom])

  const resetProblem = () => {
    setProblem(genHProblem())
    setStep(0)
    setSteps(STEP_HEADS.map(() => ({ misses: 0, done: false })))
    setShowEnglish(true); setModeIndex(0)
    setTable({ head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null, product:null, divisor:null, result:null })
  }

  const finish = () => {
    const missCount = steps.reduce((t, s) => t + s.misses, 0)
    const scoreColor = missCount === 0 ? 'green' : (missCount === 1 ? 'yellow' : 'red')
    const attempt = { scoreColor, stepResults: steps, stepHeads: STEP_HEADS }
    const nextSession = { ...session, attempts: [...session.attempts, attempt] }
    saveSession(nextSession); setSession(nextSession)
    resetProblem()
  }

  // Accept helpers (drop must occur on LEFT table cells)
  const acceptCol1 = (d) => step === 1 && d.kind === 'col'
  const acceptCol2 = (d) => step === 3 && d.kind === 'col'
  const acceptUnitTop = (d) => step === 2 && d.kind === 'unit'
  const acceptUnitBottom = (d) => step === 2 && d.kind === 'unit'
  const acceptScaleTop = (d) => step === 4 && d.kind === 'num'
  const acceptScaleBottom = (d) => step === 4 && d.kind === 'num'
  const acceptValueTop = (d) => step === 5 && d.kind === 'num'
  const acceptValueBottom = (d) => step === 5 && d.kind === 'num'

  return (
    <div className="container">
      <div className="header">
        <div className="brand">H-Table</div>
        <div className="toolbar">
          <button className="button" onClick={openScale}>Scale Factor</button>
          <button className="button" onClick={() => setOpenSum(true)}>Summary</button>
          <button className="button ghost" onClick={resetProblem}>New Problem</button>
        </div>
      </div>

      <div className="panes">
        {/* LEFT: Problem + H-grid (true drop targets) */}
        <div className="card">
          <div className={"problem " + maskedClass}>{textShown}</div>
          <div className="altmeta">
            {showEnglish ? 'English' : altKey} • After 10s or on release, the problem toggles presentation.
          </div>
          <div className="toolbar" style={{ marginTop: 8 }}>
            <button
              className="button"
              onMouseDown={() => setShowEnglish(true)}
              onMouseUp={() => { setShowEnglish(false); setModeIndex((modeIndex + 1) % problem.altOrder.length) }}
            >Hold: English</button>
          </div>

          {/* Tokens always visible under any mask */}
          <div className="tokens">
            <span className="token">{problem.scale[0]} {problem.units[0]} = {problem.scale[1]} {problem.units[1]}</span>
            <span className="token">{problem.given.value} {problem.units[1]}</span>
          </div>

          {/* H-table grid (2x3) */}
          {true && (
            <div className="hwrap">
              <div className="htitle">H Table</div>
              <div className="hgrid">
                {/* headers */}
                <Slot test={acceptCol1} onDropContent={(d)=> {
                  if (d.v === 'Units') { setTable(t=>({...t, head1:'Units'})); setDone(1); next() } else miss(1)
                }}>
                  <div className="hhead">{table.head1 || 'Header 1'}</div>
                </Slot>
                <Slot test={acceptCol2} onDropContent={(d)=> {
                  if (d.v === 'Scale') { setTable(t=>({...t, head2:'Scale'})); setDone(3); next() } else miss(3)
                }}>
                  <div className="hhead">{table.head2 || 'Header 2'}</div>
                </Slot>
                <div className="hhead">Value / ?</div>

                {/* row 1 */}
                <Slot test={acceptUnitTop} onDropContent={(d)=> setTable(t=>({...t, uTop:d.label }))}>
                  <div className="hcell">{table.uTop || 'Top Unit'}</div>
                </Slot>
                <Slot test={acceptScaleTop} onDropContent={(d)=> setTable(t=>({...t, sTop:d.value }))}>
                  <div className="hcell">{table.sTop ?? 'Scale top'}</div>
                </Slot>
                <Slot test={acceptValueTop} onDropContent={(d)=> setTable(t=>({...t, vTop:d.value }))}>
                  <div className="hcell">{table.vTop ?? '—'}</div>
                </Slot>

                {/* row 2 */}
                <Slot test={acceptUnitBottom} onDropContent={(d)=> setTable(t=>({...t, uBottom:d.label }))}>
                  <div className="hcell">{table.uBottom || 'Bottom Unit'}</div>
                </Slot>
                <Slot test={acceptScaleBottom} onDropContent={(d)=> setTable(t=>({...t, sBottom:d.value }))}>
                  <div className="hcell">{table.sBottom ?? 'Scale bottom'}</div>
                </Slot>
                <Slot test={acceptValueBottom} onDropContent={(d)=> setTable(t=>({...t, vBottom:d.value }))}>
                  <div className="hcell">{table.vBottom ?? '—'}</div>
                </Slot>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: instructions only; all drops happen on the H-grid */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title">
              {[
                'Step 1: What do we do first?',
                'Step 2: Column 1 (drag onto table header)',
                'Step 3: Drag the units into the left column cells',
                'Step 4: Column 2 (drag onto table header)',
                'Step 5: Place the scale numbers into the Scale column',
                'Step 6: Place the given value into the Value column',
                'Step 7: What’s the next step?',
                'Step 8: Which numbers are we multiplying? (click the H-table cells)',
                'Step 9: What’s the next step?',
                'Step 10: Which number are we dividing? (click the divisor cell)'
              ][step]}
            </div>

            {/* Step 1 */}
            {step === 0 && (
              <>
                <div className="chips">
                  <Draggable id="a1" label="Draw an H Table" data={{ kind: 'act', v: 'ok' }} />
                  <Draggable id="a2" label="Circle the Biggest Number" data={{ kind: 'act', v: 'x' }} />
                  <Draggable id="a3" label="Multiply and Divide the Numbers" data={{ kind: 'act', v: 'x' }} />
                  <Draggable id="a4" label="Draw an O Table" data={{ kind: 'act', v: 'x' }} />
                  <Draggable id="a5" label="Scream into the Void" data={{ kind: 'act', v: 'x' }} />
                </div>
                <Slot test={(d)=>d.kind==='act'} onDropContent={(d)=>{ if(d.v==='ok'){ setDone(0); next() } else miss(0) }}>
                  <span className="slot">Drop answer here</span>
                </Slot>
              </>
            )}

            {/* Step 2 / 4 chips */}
            {(step === 1 || step === 3) && (
              <div className="chips">
                <Draggable id="c1" label="Units" data={{ kind:'col', v:'Units' }} />
                <Draggable id="c2" label="Random Numbers" data={{ kind:'col', v:'x' }} />
                <Draggable id="c3" label="Answer" data={{ kind:'col', v:'x' }} />
                <Draggable id="c4" label="Multiply" data={{ kind:'col', v:'x' }} />
                <Draggable id="c5" label="Scale" data={{ kind:'col', v:'Scale' }} />
              </div>
            )}

            {/* Step 3 unit choices */}
            {step === 2 && (
              <div className="chips">
                {unitChoices.map(u => <Draggable key={u.id} id={u.id} label={u.label} data={u} />)}
              </div>
            )}

            {/* Step 5 & 6 number choices */}
            {(step === 4 || step === 5) && (
              <div className="chips">
                {numberChoices.map(n => <Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
              </div>
            )}

            {/* Buttons to confirm correctness for steps with multiple drops */}
            {step === 2 && (
              <div className="toolbar" style={{ marginTop: 8 }}>
                <button className="button primary" onClick={()=>{
                  if(table.uTop===problem.units[0] && table.uBottom===problem.units[1]){ setDone(2); next() } else miss(2)
                }}>Confirm Units</button>
              </div>
            )}
            {step === 4 && (
              <div className="toolbar" style={{ marginTop: 8 }}>
                <button className="button primary" onClick={()=>{
                  if(table.sTop===problem.scale[0] && table.sBottom===problem.scale[1]){ setDone(4); next() } else miss(4)
                }}>Confirm Scale</button>
              </div>
            )}
            {step === 5 && (
              <div className="toolbar" style={{ marginTop: 8 }}>
                <button className="button primary" onClick={()=>{
                  if(table.vBottom===problem.given.value){ setDone(5); next() } else miss(5)
                }}>Confirm Given</button>
              </div>
            )}

            {/* Step 7 and 9 choice chips */}
            {(step === 6 || step === 8) && (
              <>
                <div className="chips">
                  <Draggable id="n1" label="Divide then Multiply" data={{ kind:'nx', v:'x' }} />
                  <Draggable id="n2" label="Cross Multiply" data={{ kind:'nx', v: step===6 ? 'ok':'x' }} />
                  <Draggable id="n3" label="Divide" data={{ kind:'nx', v: step===8 ? 'ok':'x' }} />
                  <Draggable id="n4" label="Multiply Across" data={{ kind:'nx', v:'x' }} />
                  <Draggable id="n5" label="Add the Numbers" data={{ kind:'nx', v:'x' }} />
                </div>
                <Slot test={(d)=>d.kind==='nx'} onDropContent={(d)=>{ if(d.v==='ok'){ setDone(step); next() } else miss(step) }}>
                  <span className="slot">Drop answer here</span>
                </Slot>
              </>
            )}

            {/* Step 8 click multiply; Step 10 click divide */}
            {step === 7 && (
              <>
                <div className="muted">Click the two numbers to multiply (they’ll highlight in red).</div>
                <div style={{ marginTop: 8 }}>
                  <span className="red-oval">{table.vBottom ?? '?'}</span> × <span className="red-oval">{table.sTop ?? '?'}</span> = {product ?? '?'}
                </div>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <button className="button primary" onClick={()=>{
                    if(product!=null){ setTable(t=>({...t, product})); setDone(7); next() } else miss(7)
                  }}>Confirm Multiply</button>
                </div>
              </>
            )}

            {step === 9 && (
              <>
                <div className="muted">Click the divisor (Scale bottom). We compute for you.</div>
                <div style={{ marginTop: 8 }}>
                  <span>{product ?? '?'}</span> ÷ <span className="triple-ul">{table.sBottom ?? '?'}</span> = {result ?? '?'}
                </div>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <button className="button primary" onClick={()=>{
                    if(result!=null){ setTable(t=>({...t, result })); setDone(9); 
                      const missCount = steps.reduce((t,s)=>t+s.misses,0)
                      const scoreColor = missCount===0?'green':(missCount===1?'yellow':'red')
                      const attempt = { scoreColor, stepResults: steps, stepHeads: STEP_HEADS }
                      const nextSession = { ...session, attempts:[...session.attempts, attempt] }
                      saveSession(nextSession); setSession(nextSession)
                      resetProblem()
                    } else miss(9)
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
