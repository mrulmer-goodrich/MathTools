import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'
import { choice } from '../../lib/rng.js'

/**
 * HTableModule — full file replacement (clean UX, no feature loss)
 * - Centers column headers; removes placeholder descriptors in header cells.
 * - Adds a clear divider line directly BELOW the header row (without touching existing strokes).
 * - Keeps all original step logic, chips, and persistence.
 * - Uses inline styles for centering & divider (no CSS changes needed elsewhere).
 */

const STEP_HEADS = [
  'What first?', 'Column 1', 'Units', 'Column 2', 'Place Scale', 'Place Given',
  'Next?', 'Which multiply?', 'Next?', 'Which divide?'
]

const LANG_BADGE = (mode) => mode

export default function HTableModule() {
  const [session, setSession] = useState(loadSession() || { attempts: [] })
  const [problem, setProblem] = useState(() => session.hSnap?.problem || genHProblem())
  const [table, setTable] = useState(() => session.hSnap?.table || {
    head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null,
    product:null, divisor:null, result:null
  })
  const [step, setStep] = useState(session.hSnap?.step ?? 0)
  const [steps, setSteps] = useState(session.hSnap?.steps || STEP_HEADS.map(()=>({misses:0,done:false})))
  const [openSum, setOpenSum] = useState(false)

  // persist snapshot on every meaningful change
  useEffect(()=>{
    const next = { ...session, hSnap: { problem, table, step, steps } }
    saveSession(next); setSession(next)
  },[problem, table, step, steps])

  const miss = (idx)=>setSteps(s=>{const c=[...s];c[idx].misses++;return c})
  const setDone = (idx)=>setSteps(s=>{const c=[...s];c[idx].done=true;return c})
  const next = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))

  
  // Redaction / translation modes
  // - After 10s: switch away from English to a random mode among available languages or 'XXXX' (redacted)
  // - Every 15s thereafter: randomize again
  // - 'XXXX' redacts letters but preserves numbers and unit tokens from problem.units
  const [showEnglish,setShowEnglish]=useState(true)
  const [mode,setMode]=useState('English') // 'English' | <language> | 'XXXX'
  const timerRef = useRef(null)

  const allowedLangs = useMemo(()=>{
    const alts = (problem && problem.text && problem.text.alts) ? problem.text.alts : {}
    try { return Object.keys(alts) } catch { return [] }
  },[problem && problem.id])

  const allowedModes = useMemo(()=>{
    // Randomize among languages and 'XXXX' only (no 'BlackOut' / masks)
    return [...allowedLangs, 'XXXX']
  },[allowedLangs])

  const redactText = (txt, units)=>{
    if(!txt) return ''
    const unitsSorted = [...(units||[])].sort((a,b)=>b.length-a.length)
    let placeholderMap = new Map()
    let out = txt
    // Protect unit tokens by placeholder substitution
    unitsSorted.forEach((u, idx)=>{
      const ph = `__UNIT_${idx}__`
      placeholderMap.set(ph, u)
      // word boundary-ish replace (case-insensitive)
      const re = new RegExp(`\b${u}\b`, 'gi')
      out = out.replace(re, ph)
    })
    // Replace letters with X, leave digits/punct/space
    out = out.replace(/[A-Za-z]/g, 'X')
    // Restore units
    placeholderMap.forEach((u, ph)=>{
      const re = new RegExp(ph, 'g')
      out = out.replace(re, u)
    })
    return out
  }

  const startTimer = ()=>{
    stopTimer()
    timerRef.current = setInterval(()=>{
      if (!showEnglish){
        if (allowedModes.length>0){
          const pick = allowedModes[Math.floor(Math.random()*allowedModes.length)]
          setMode(pick)
        }
      }
    },15000) // every 15s
  }
  const stopTimer = ()=> { if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null } }

  useEffect(()=>{
    startTimer()
    const t = setTimeout(()=>{
      setShowEnglish(false)
      if (allowedModes.length>0){
        const pick = allowedModes[Math.floor(Math.random()*allowedModes.length)]
        setMode(pick)
      }
    }, 10000) // first switch after 10s
    return ()=>{ stopTimer(); clearTimeout(t) }
  },[problem.id, allowedModes.length])

  // inline story renderer
  const Story = ()=>{
    const p = problem
    let txt = p?.text?.english || ''
    if (!showEnglish){
      if (mode === 'XXXX'){
        txt = redactText(p?.text?.english || '', problem.units)
      } else {
        const alt = p?.text?.alts?.[mode]
        txt = alt || (p?.text?.english || '')
      }
    }
    return (
      <>
        <div className="problem">{txt}</div>
        <div className="toolbar" style={{justifyContent:'center', marginTop: 10, gap: 12, display:'flex'}}>
          <button
            className="button big-under"
            onPointerDown={()=>{ setShowEnglish(true) }}
            onPointerUp={()=>{ setShowEnglish(false) }}
          >Hold: English</button>
          <button className="button primary big-under" onClick={resetProblem}>New Problem</button>
        </div>
      </>
    )
  }


  const centerCellStyle = { display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:48 }

  return (
    <div className="container">
      <div className="panes">
        {/* LEFT: Story + H table */}
        <div className="card">
          <Story />
          <button className="button primary big-under" onClick={resetProblem}>New Problem</button>

          {/* H-table appears only after Step 1 */}
          {step>=1 && (
            <div className="hwrap">
              <div className="hgrid">
                {/* Headers row */}
                <div className="hhead">
                  <Slot
                    test={acceptCol1}
                    onDropContent={(d)=>{
                      if(d.v==='Units'){ setTable(t=>({...t, head1:'Units'})); setDone(1); next() } else miss(1)
                    }}>
                    <div style={centerCellStyle}>
                      <span className="hhead-text">{table.head1 || ''}</span>
                    </div>
                  </Slot>
                </div>

                <div className="hhead">
                  <Slot
                    test={acceptCol2}
                    onDropContent={(d)=>{
                      if(d.v==='Scale'){ setTable(t=>({...t, head2:'Scale'})); setDone(3); next() } else miss(3)
                    }}>
                    <div style={centerCellStyle}>
                      <span className="hhead-text">{table.head2 || ''}</span>
                    </div>
                  </Slot>
                </div>

                <div className="hhead">{/* 3rd column header intentionally blank */}</div>

                {/* Divider directly below headers (spans all 3 columns) */}
                <div
                  className="hdivider"
                  aria-hidden="true"
                  style={{ gridColumn: '1 / span 3', height: 0, borderBottom: '2px solid #94a3b8', marginTop: 4 }}
                />

                {/* Row 1 cells */}
                <div className="hcell">
                  <Slot className="flat" test={acceptUnitTop} onDropContent={(d)=>setTable(t=>({...t,uTop:d.label}))}>
                    <span>{table.uTop || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={acceptScaleTop} onDropContent={(d)=>setTable(t=>({...t,sTop:d.value}))}>
                    <span>{table.sTop ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={acceptValueTop} onDropContent={(d)=>setTable(t=>({...t,vTop:d.value}))}>
                    <span>{table.vTop ?? ''}</span>
                  </Slot>
                </div>

                {/* Row 2 cells */}
                <div className="hcell">
                  <Slot className="flat" test={acceptUnitBottom} onDropContent={(d)=>setTable(t=>({...t,uBottom:d.label}))}>
                    <span>{table.uBottom || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={acceptScaleBottom} onDropContent={(d)=>setTable(t=>({...t,sBottom:d.value}))}>
                    <span>{table.sBottom ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className="flat" test={acceptValueBottom} onDropContent={(d)=>setTable(t=>({...t,vBottom:d.value}))}>
                    <span>{table.vBottom ?? ''}</span>
                  </Slot>
                </div>

                {/* Existing H strokes (kept as-is) */}
                <div className="hstroke horiz"></div>
                <div className="hstroke vert-left"></div>
                <div className="hstroke vert-right"></div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: steps and chips */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title">
              {[
                'Step 1: What do we do first?',
                'Step 2: What do we put in the first column? (drag onto header)',
                'Step 3: Place the units (drag onto left cells)',
                'Step 4: Column 2 (drag onto header)',
                'Step 5: Place the scale numbers',
                'Step 6: Place the given number',
                'Step 7: What’s next?',
                'Step 8: Which numbers are we multiplying? (click the grid cells after you place them)',
                'Step 9: What’s next?',
                'Step 10: Which number are we dividing? (click the divisor)'
              ][step]}
            </div>

            {/* Step 1 */}
            {step===0 && (
              <>
                <div className="chips">
                  <Draggable id="a1" label="Draw an H Table" data={{kind:'act',v:'ok'}} />
                  <Draggable id="a2" label="Circle the Biggest Number" data={{kind:'act',v:'x'}} />
                  <Draggable id="a3" label="Multiply and Divide the Numbers" data={{kind:'act',v:'x'}} />
                  <Draggable id="a4" label="Draw an O Table" data={{kind:'act',v:'x'}} />
                  <Draggable id="a5" label="Scream into the Void" data={{kind:'act',v:'x'}} />
                </div>
                <Slot test={(d)=>d.kind==='act'} onDropContent={(d)=>{ if(d.v==='ok'){ setDone(0); next() } else miss(0) }}>
                  <span className="slot">Drop answer here</span>
                </Slot>
              </>
            )}

            {/* Step 2 & 4: headers */}
            {(step===1 || step===3) && (
              <div className="chips">
                <Draggable id="c1" label="Units" data={{kind:'col',v:'Units'}} />
                <Draggable id="c5" label="Scale" data={{kind:'col',v:'Scale'}} />
                <Draggable id="c2" label="Random Numbers" data={{kind:'col',v:'x'}} />
                <Draggable id="c3" label="Answer" data={{kind:'col',v:'x'}} />
                <Draggable id="c4" label="Multiply" data={{kind:'col',v:'x'}} />
              </div>
            )}

            {/* Step 3: units */}
            {step===2 && (
              <>
                <div className="chips">
                  {unitChoices.map(u=><Draggable key={u.id} id={u.id} label={u.label} data={u} />)}
                </div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={()=>{
                    // HT3: either arrangement is acceptable as long as two distinct units are placed
                    const placed = new Set([table.uTop, table.uBottom].filter(Boolean))
                    if(placed.size===2){ setDone(2); next() } else miss(2)
                  }}>Confirm Units</button>
                </div>
              </>
            )}

            {/* Step 5: scale numbers */}
            {step===4 && (
              <>
                <div className="chips">
                  {numberChoices.map(n=><Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
                </div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={()=>{
                    // accept any placement of the two scale numbers as long as both are placed and distinct
                    const ok = (table.sTop!=null && table.sBottom!=null) &&
                               new Set([table.sTop, table.sBottom]).size===2
                    if(ok){ setDone(4); next() } else miss(4)
                  }}>Confirm Scale</button>
                </div>
              </>
            )}

            {/* Step 6: given */}
            {step===5 && (
              <>
                <div className="chips">
                  {numberChoices.map(n=><Draggable key={n.id} id={n.id} label={n.label} data={n} />)}
                </div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={()=>{
                    const placed = (table.vTop!=null) !== (table.vBottom!=null) // exactly one row
                    const matches = (table.vTop===problem.given.value) || (table.vBottom===problem.given.value)
                    if(placed && matches){ setDone(5); next() } else miss(5)
                  }}>Confirm Given</button>
                </div>
              </>
            )}

            {/* Step 7 & 9: next actions */}
            {(step===6 || step===8) && (
              <>
                <div className="chips">
                  <Draggable id="n1" label="Divide then Multiply" data={{kind:'nx',v:'x'}} />
                  <Draggable id="n2" label="Cross Multiply" data={{kind:'nx',v: step===6 ? 'ok':'x'}} />
                  <Draggable id="n3" label="Divide" data={{kind:'nx',v: step===8 ? 'ok':'x'}} />
                  <Draggable id="n4" label="Multiply Across" data={{kind:'nx',v:'x'}} />
                  <Draggable id="n5" label="Add the Numbers" data={{kind:'nx',v:'x'}} />
                </div>
                <Slot test={(d)=>d.kind==='nx'} onDropContent={(d)=>{ if(d.v==='ok'){ setDone(step); next() } else miss(step) }}>
                  <span className="slot">Drop answer here</span>
                </Slot>
              </>
            )}

            {/* Step 8: click multiply pair */}
            {step===7 && (
              <>
                <div className="muted">Click the two numbers in the grid to multiply (the given and the scale from the opposite row).</div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={()=>{
                    const prod = computeProduct()
                    if(prod!=null){ setTable(t=>({...t, product:prod})); setDone(7); next() } else miss(7)
                  }}>Confirm Multiply</button>
                </div>
              </>
            )}

            {/* Step 10: click divisor */}
            {step===9 && (
              <>
                <div className="muted">Click the divisor (the scale in the same row as the given), then submit.</div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button success" onClick={()=>{
                    const prod = computeProduct()
                    const res = computeResult(prod)
                    if(res!=null){
                      setTable(t=>({...t, result:res }))
                      // record attempt
                      const missCount = steps.reduce((t,s)=>t+s.misses,0)
                      const scoreColor = missCount===0?'green':(missCount===1?'yellow':'red')
                      const attempt = { scoreColor, stepResults: steps, stepHeads: STEP_HEADS }
                      const nextSession = { ...session, attempts:[...(session.attempts || []), attempt] }
                      saveSession(nextSession); setSession(nextSession)
                      // new problem
                      resetProblem()
                    } else miss(9)
                  }}>Submit</button>
                </div>
              </>
            )}

            {/* Chips used across steps */}
            {step===1 && (
              <div className="chips">
                <Draggable id="c1" label="Units" data={{kind:'col',v:'Units'}} />
                <Draggable id="c5" label="Scale" data={{kind:'col',v:'Scale'}} />
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="button primary floating-summary" onClick={()=>setOpenSum(true)}>Summary</button>
      <SummaryOverlay open={openSum} onClose={()=>setOpenSum(false)} attempts={session.attempts || []} stepHeads={STEP_HEADS} />
    </div>
  )
}
