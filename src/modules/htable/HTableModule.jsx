import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'
import { choice } from '../../lib/rng.js'

const STEP_HEADS = [
  'What first?', 'Column 1', 'Units', 'Column 2', 'Place Scale', 'Place Given',
  'Next?', 'Which multiply?', 'Next?', 'Which divide?'
]

const LANG_BADGE = (mode) => mode

export default function HTableModule() {
  // SAFER session default to avoid first-load crashes
  const [session, setSession] = useState(loadSession() || { attempts: [] })
  const [problem, setProblem] = useState(() => (loadSession()?.hSnap?.problem) || genHProblem())
  const [table, setTable] = useState(() => (loadSession()?.hSnap?.table) || {
    head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null,
    product:null, divisor:null, result:null
  })
  const [step, setStep] = useState(loadSession()?.hSnap?.step ?? 0)
  const [steps, setSteps] = useState(loadSession()?.hSnap?.steps || STEP_HEADS.map(()=>({misses:0,done:false})))
  const [openSum, setOpenSum] = useState(false)

  // persist snapshot on every meaningful change
  useEffect(()=>{
    const next = { ...(session || {}), hSnap: { problem, table, step, steps } }
    saveSession(next); setSession(next)
  },[problem, table, step, steps])

  const miss = (idx)=>setSteps(s=>{const c=[...s];c[idx].misses++;return c})
  const setDone = (idx)=>setSteps(s=>{const c=[...s];c[idx].done=true;return c})
  const next = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))

  // ===== Language / Redaction Modes =====
  // - After 10s: switch from English to a random mode among available languages or 'XXXX' (redacted)
  // - Every 15s thereafter: randomize again among languages + 'XXXX'
  // - 'XXXX' redacts letters but preserves numbers and unit tokens from the story
  const [showEnglish,setShowEnglish]=useState(true)
  const [mode,setMode]=useState('English') // 'English' | <language> | 'XXXX'
  const timerRef = useRef(null)

  const allowedLangs = useMemo(()=>{
    // Prefer problem.altOrder if present; else keys in text.alts
    const byOrder = problem?.altOrder || []
    const inAlts = Object.keys(problem?.text?.alts || {})
    // Keep order from altOrder, but only include those that exist in alts
    const ordered = byOrder.filter(x => inAlts.includes(x))
    // Fallback to whatever is in alts if altOrder empty
    return ordered.length ? ordered : inAlts
  },[problem?.id])

  const allowedModes = useMemo(()=>{
    // Randomize among languages and 'XXXX' only (no 'BlackOut' / masks)
    return [...allowedLangs, 'XXXX']
  },[allowedLangs])

  const redactText = (txt, units)=>{
    if(!txt) return ''
    const unitList = Array.isArray(units) ? units.slice() : []
    unitList.sort((a,b)=> (b||'').length - (a||'').length)
    const placeholders = new Map()
    let out = txt

    // Protect unit tokens by placeholder substitution (case-insensitive whole words)
    unitList.forEach((u, idx)=>{
      if(!u) return
      const ph = `__UNIT_${idx}__`
      placeholders.set(ph, u)
      const re = new RegExp(`\\b${u.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'gi')
      out = out.replace(re, ph)
    })

    // Replace letters with X; keep digits, punctuation, spaces
    out = out.replace(/[A-Za-z]/g, 'X')

    // Restore units
    placeholders.forEach((u, ph)=>{
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
  },[problem?.id, allowedModes.length])

  // Unit choices
  const unitChoices = useMemo(()=>{
    const pool = ['in','cm','km','m','yd','miles','seconds','hours','minutes','liters','cups','tablespoons','pages','points','dollars','items','meters','yards']
    const set = new Set(problem.units)
    while(set.size<6) set.add(pool[Math.floor(Math.random()*pool.length)])
    return Array.from(set).map((u,i)=>({ id:'u'+i, label:u, kind:'unit' }))
  },[problem])

  // Number choices (appear only when needed; the actual numbers are embedded in the story but we mirror them here for dragging convenience)
  const numberChoices = useMemo(()=>{
    const nums = new Set([problem.scale[0], problem.scale[1], problem.given.value])
    while(nums.size<6) nums.add(Math.floor(Math.random()*20)+1)
    return Array.from(nums).map((n,i)=>({ id:'n'+i, label:String(n), kind:'num', value:n }))
  },[problem])

  // Accept logic
  const acceptCol1 = d => step===1 && d.kind==='col'
  const acceptCol2 = d => step===3 && d.kind==='col'
  const acceptUnitTop    = d => step===2 && d.kind==='unit'
  const acceptUnitBottom = d => step===2 && d.kind==='unit'
  const acceptScaleTop   = d => step===4 && d.kind==='num'
  const acceptScaleBottom= d => step===4 && d.kind==='num'
  const acceptValueTop   = d => step===5 && d.kind==='num'
  const acceptValueBottom= d => step===5 && d.kind==='num'

  // Product/Result
  const computeProduct = ()=>{
    // multiply given * opposite scale row
    const givenRow = (table.vBottom!=null) ? 'bottom' : (table.vTop!=null ? 'top' : null)
    if(!givenRow || table.sTop==null || table.sBottom==null) return null
    const sOpp = (givenRow==='top') ? table.sBottom : table.sTop
    const v = givenRow==='top' ? table.vTop : table.vBottom
    return (v!=null && sOpp!=null) ? v * sOpp : null
  }
  const computeResult = (product)=>{
    const givenRow = (table.vBottom!=null) ? 'bottom' : (table.vTop!=null ? 'top' : null)
    if(!givenRow) return null
    const divisor = (givenRow==='top') ? table.sTop : table.sBottom
    if(product==null || divisor==null) return null
    return product / divisor
  }

  const product = computeProduct()
  const result  = computeResult(product)

  const resetProblem = ()=>{
    setProblem(genHProblem())
    setTable({ head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null, product:null, divisor:null, result:null })
    setStep(0)
    setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setShowEnglish(true); setMode('English')
  }

  // inline story with embedded draggable tokens (subtle styling)
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

  return (
    <div className="container">
      <div className="panes">
        {/* LEFT: Story + H table */}
        <div className="card">
          <Story />

          {/* H-table appears only after Step 1 */}
          {step>=1 && (
            <div className="hwrap">
              <div className="hgrid">
                {/* Headers row */}
                <div className="hhead">
                  <Slot test={acceptCol1} onDropContent={(d)=>{
                    if(d.v==='Units'){ setTable(t=>({...t, head1:'Units'})); setDone(1); next() } else miss(1)
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:48}}>
                      <span className="hhead-text">{table.head1 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead">
                  <Slot test={acceptCol2} onDropContent={(d)=>{
                    if(d.v==='Scale'){ setTable(t=>({...t, head2:'Scale'})); setDone(3); next() } else miss(3)
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:48}}>
                      <span className="hhead-text">{table.head2 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead">{/* no label needed for 3rd col */}</div>

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

                {/* H strokes (oversized H only) */}
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
                    // accept any placement of the two scale numbers as long as both are placed
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
                      const nextSession = { ...(session || {}), attempts:[...(session.attempts || []), attempt] }
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
