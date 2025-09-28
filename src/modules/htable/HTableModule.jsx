// src/modules/htable/HTableModule.jsx — Rebuilt (spec v1.3)
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

/** ------------------------------
 *  Step copy (unchanged)
 *  ------------------------------ */
const STEP_HEADS = [
  'What first?', 'Column 1', 'Units', 'Column 2', 'Place Scale', 'Place Given',
  'Next?', 'Which multiply?', 'Next?', 'Which divide?'
]

// Step 1 tiles (correct = Draw an H-Table)
const STEP1_CHOICES = [
  { id: 'drawH',     label: 'Draw an H-Table',     correct: true },
  { id: 'proportion',label: 'Make a Proportion',   correct: false },
  { id: 'convert',   label: 'Convert Units First', correct: false },
  { id: 'guess',     label: 'Just Guess',          correct: false },
]

/** ------------------------------
 *  Problem sanity helpers
 *  ------------------------------ */
const UNIT_CATS = {
  length: ['in','inch','inches','cm','mm','m','meter','meters','km','kilometer','kilometers','yd','yard','yards','mi','mile','miles'],
  time: ['sec','secs','second','seconds','min','mins','minute','minutes','hour','hours'],
  volume: ['liter','liters','milliliter','milliliters','cup','cups','tablespoon','tablespoons','gallon','gallons'],
  mass: ['gram','grams','kilogram','kilograms'],
  count: ['item','items','page','pages','point','points'],
  money: ['dollar','dollars','$','euro','euros']
}
const unitCategory = (u='') => {
  const s = (u||'').toLowerCase()
  for (const [cat, list] of Object.entries(UNIT_CATS)) if (list.includes(s)) return cat
  return null
}
const saneProblem = (p) => {
  try{
    const [u1,u2] = p.units || []
    const c1 = unitCategory(u1), c2 = unitCategory(u2)
    if (!c1 || !c2 || c1!==c2) return false
    if (p?.given?.unit && ![u1,u2].includes(p.given.unit)) return false
    return true
  }catch{ return false }
}
const genSaneHProblem = () => {
  let tries = 0, p = genHProblem()
  while(!saneProblem(p) && tries<50){ p = genHProblem(); tries++ }
  return p
}

/** ------------------------------
 *  Component
 *  ------------------------------ */
export default function HTableModule() {
  // Versioned snapshot so old saved state doesn’t freeze the UI across releases
  const H_SNAP_VERSION = 2
  const __persisted = loadSession() || {}
  const H_PERSIST = (__persisted.hSnap && __persisted.hSnap.version === H_SNAP_VERSION)
    ? __persisted.hSnap
    : null

  const [session, setSession] = useState(loadSession() || { attempts: [] })
  const [problem, setProblem] = useState(() => (H_PERSIST?.problem) || genSaneHProblem())
  const [table, setTable]   = useState(() => (H_PERSIST?.table) || {
    head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null,
    product:null, divisor:null, result:null
  })
  const [step, setStep]     = useState(H_PERSIST?.step ?? 0)
  const [steps, setSteps]   = useState(H_PERSIST?.steps || STEP_HEADS.map(()=>({misses:0,done:false})))
  const [openSum, setOpenSum] = useState(false)

  // persist entire snapshot any time core state changes
  useEffect(()=>{
    const next = {
      ...(session || {}),
      hSnap: { version: H_SNAP_VERSION, problem, table, step, steps }
    }
    saveSession(next)
    setSession(next)
  },[problem, table, step, steps])

  // convenience helpers for step flow
  const miss = (idx)=>setSteps(s=>{const c=[...s]; if (c[idx]) c[idx].misses++; return c})
  const setDone = (idx)=>setSteps(s=>{const c=[...s]; if (c[idx]) c[idx].done=true; return c})
  const next = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))

  /** ------------------------------
   *  Language / redaction logic
   *  ------------------------------ */
  const [showEnglish,setShowEnglish] = useState(true)
  const [mode,setMode] = useState('English') // 'English' | <language> | 'XXXX'
  const timerRef = useRef(null)

  const allowedLangs = useMemo(()=>{
    const byOrder = problem?.altOrder || []
    const inAlts = Object.keys(problem?.text?.alts || {})
    const ordered = byOrder.filter(x => inAlts.includes(x))
    return ordered.length ? ordered : inAlts
  },[problem?.id])

  const allowedModes = useMemo(()=>[...allowedLangs, 'XXXX'],[allowedLangs])

  const redactText = (txt, units)=>{
    if(!txt) return ''
    // preserve unit tokens; redact letters elsewhere to 'X'
    const unitList = Array.isArray(units) ? units.slice() : []
    unitList.sort((a,b)=> (b||'').length - (a||'').length)
    const placeholders = new Map()
    let out = txt
    unitList.forEach((u, idx)=>{
      if(!u) return
      const ph = `__UNIT_${idx}__`
      placeholders.set(ph, u)
      const re = new RegExp(`\\b${u.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&')}\\b`, 'gi')
      out = out.replace(re, ph)
    })
    out = out.replace(/[A-Za-z]/g, 'X')
    placeholders.forEach((u, ph)=>{
      const re = new RegExp(ph, 'g')
      out = out.replace(re, u)
    })
    return out
  }

  const stopTimer = ()=> { if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null } }
  const startTimer = ()=>{
    stopTimer()
    timerRef.current = setInterval(()=>{
      if (!showEnglish && allowedModes.length>0){
        const pick = allowedModes[Math.floor(Math.random()*allowedModes.length)]
        setMode(pick)
      }
    }, 15000)
  }

  useEffect(()=>{
    // T+0: start cadence
    startTimer()
    // T+10s: switch once from English
    const t = setTimeout(()=>{
      setShowEnglish(false)
      if (allowedModes.length>0){
        const pick = allowedModes[Math.floor(Math.random()*allowedModes.length)]
        setMode(pick)
      }
    }, 10000)
    return ()=>{ stopTimer(); clearTimeout(t) }
  },[problem?.id, allowedModes.length])

  /** ------------------------------
   *  Chip pools
   *  ------------------------------ */
  const unitChoices = useMemo(()=>{
    const pool = ['meters','kilometers','miles','seconds','minutes','hours','grams','kilograms','liters','milliliters','gallons','cups','dollars','euros']
    const set = new Set(problem.units)
    while(set.size<6) set.add(pool[Math.floor(Math.random()*pool.length)])
    return Array.from(set).map((u,i)=>({ id:'u'+i, label:u, kind:'unit' }))
  },[problem])

  const numberChoices = useMemo(()=>{
    const nums = new Set([problem.scale?.[0], problem.scale?.[1], problem.given?.value].filter(x=>x!=null))
    while(nums.size<6) nums.add(Math.floor(Math.random()*20)+1)
    return Array.from(nums).map((n,i)=>({ id:'n'+i, label:String(n), kind:'num', value:n }))
  },[problem])

  /** ------------------------------
   *  Accept tests (step-gated)
   *  ------------------------------ */
  const acceptCol1 = d => step===1 && d.kind==='col' && d.v==='Units'
  const acceptCol2 = d => step===3 && d.kind==='col' && d.v==='ScaleNumbers'
  const acceptUnitTop    = d => step===2 && d.kind==='unit'
  const acceptUnitBottom = d => step===2 && d.kind==='unit'
  const acceptScaleTop   = d => step===4 && d.kind==='num'
  const acceptScaleBottom= d => step===4 && d.kind==='num'
  const acceptValueTop   = d => step===5 && d.kind==='num'
  const acceptValueBottom= d => step===5 && d.kind==='num'

  /** ------------------------------
   *  Compute pipeline (7–10)
   *  ------------------------------ */
  const givenRow = (table.vBottom!=null) ? 'bottom' : (table.vTop!=null ? 'top' : null)

  const computeProduct = ()=>{
    if(!givenRow || table.sTop==null || table.sBottom==null) return null
    const sOpp = (givenRow==='top') ? table.sBottom : table.sTop   // opposite scale to given
    const v = givenRow==='top' ? table.vTop : table.vBottom        // given value
    return (v!=null && sOpp!=null) ? v * sOpp : null               // cross-multiply
  }
  const computeResult = (product)=>{
    if(!givenRow) return null
    const divisor = (givenRow==='top') ? table.sTop : table.sBottom
    if(product==null || divisor==null) return null
    return product / divisor
  }

  const product = computeProduct()
  const result  = computeResult(product)

  /** ------------------------------
   *  Submit -> record attempt -> overlay
   *  ------------------------------ */
  const submitAttempt = ()=>{
    if (result==null) return
    const attempt = {
      ts: Date.now(),
      problemId: problem?.id,
      units: problem?.units,
      scale: [table.sTop, table.sBottom],
      given: { row: problem?.given?.row, value: problem?.given?.value },
      answer: result
    }
    const nextSession = { ...(session||{}), attempts: [...(session?.attempts||[]), attempt] }
    saveSession({ ...nextSession, hSnap: { version: H_SNAP_VERSION, problem, table, step, steps } })
    setSession(nextSession)
    setOpenSum(true)
  }

  /** ------------------------------
   *  Reset / New Problem
   *  ------------------------------ */
  const resetProblem = ()=>{
    setProblem(genSaneHProblem())
    setTable({ head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null, product:null, divisor:null, result:null })
    setStep(0)
    setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setShowEnglish(true); setMode('English')
  }

  /** ------------------------------
   *  Step 1 handler
   *  ------------------------------ */
  const handleStep1 = (choice) => {
    if (choice?.correct) { setDone(0); setStep(1); }
    else { miss(0); }
  };

  /** ------------------------------
   *  Story (narrative box)
   *  ------------------------------ */
  const Story = ()=>{
    const p = problem
    let txt = p?.text?.english || ''
    if (!showEnglish){
      if (mode === 'XXXX'){
        txt = redactText(p?.text?.english || '', problem.units)
      } else {
        const alt = p?.text?.alts?.[mode]
        txt = alt || redactText(p?.text?.english || '', problem.units)
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
            aria-label="Hold English"
          >Hold: English</button>
          <button className="button primary big-under" onClick={resetProblem}>New Problem</button>
        </div>
        <div className="lang-badge">Mode: {showEnglish ? 'English' : mode}</div>
      </>
    )
  }

  /** ------------------------------
   *  Render
   *  ------------------------------ */
  return (
    <div className="container">
      <div className="panes">
        {/* LEFT CARD: Story + H-table */}
        <div className="card">
          <Story />

          {/* STEP 1: tiles */}
          {step===0 && (
            <div className="card section" style={{marginTop:12}}>
              <div className="step-title">Step 1: What do we do first?</div>
              <div className="chips with-borders center">
                {STEP1_CHOICES.map(c => (
                  <button key={c.id} className="chip" onClick={()=>handleStep1(c)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* H-table appears only after Step 1 is answered */}
          {step>=1 && (
            <div className="hwrap" style={{position:'relative', marginTop:12}}>
              {/* H lines (CSS provides exact positions) */}
              <div className="hline horiz" />
              <div className="hline vert1" />
              <div className="hline vert2" />

              {/* Grid */}
              <div className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
                {/* Headers */}
                <div className="hhead">
                  <Slot className={`${!table.head1 ? "empty" : ""}`} test={acceptCol1} onDropContent={(d)=>{
                    if(d.v==='Units'){ setTable(t=>({...t, head1:'Units'})); setDone(1); next() } else miss(1)
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:48}}>
                      <span className="hhead-text">{table.head1 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead">
                  <Slot className={`${!table.head2 ? "empty" : ""}`} test={acceptCol2} onDropContent={(d)=>{
                    if(d.v==='ScaleNumbers'){ setTable(t=>({...t, head2:'Scale Numbers'})); setDone(3); next() } else miss(3)
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:48}}>
                      <span className="hhead-text">{table.head2 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead">{/* third column intentionally blank */}</div>

                {/* Row 1 */}
                <div className="hcell">
                  <Slot className={`flat ${!table.uTop ? "empty" : ""}`} test={acceptUnitTop} onDropContent={(d)=>setTable(t=>{
                    const t2={...t,uTop:d.label}
                    const placed=new Set([t2.uTop,t2.uBottom].filter(Boolean))
                    if(placed.size===2){ setDone(2); next(); }
                    return t2
                  })}>
                    <span>{table.uTop || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.sTop==null ? "empty" : ""}`} test={acceptScaleTop} onDropContent={(d)=>setTable(t=>{
                    const t2={...t,sTop: Number(d.value)}
                    const both = (t2.sTop!=null && t2.sBottom!=null && t2.sTop!==t2.sBottom)
                    if(both){ setDone(4); next(); }
                    return t2
                  })}>
                    <span>{table.sTop ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.vTop==null ? "empty" : ""}`} test={acceptValueTop} onDropContent={(d)=>setTable(t=>{
                    const correct = problem?.given?.row==='top' && d.value===problem?.given?.value
                    if(!correct){ miss(5); return t }
                    const t2={...t,vTop:Number(d.value)}
                    if(t2.vTop!=null && t2.vBottom==null){ setDone(5); next(); }
                    return t2
                  })}>
                    <span>{table.vTop ?? ''}</span>
                  </Slot>
                </div>

                {/* Row 2 */}
                <div className="hcell">
                  <Slot className={`flat ${!table.uBottom ? "empty" : ""}`} test={acceptUnitBottom} onDropContent={(d)=>setTable(t=>{
                    const t2={...t,uBottom:d.label}
                    const placed=new Set([t2.uTop,t2.uBottom].filter(Boolean))
                    if(placed.size===2){ setDone(2); next(); }
                    return t2
                  })}>
                    <span>{table.uBottom || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.sBottom==null ? "empty" : ""}`} test={acceptScaleBottom} onDropContent={(d)=>setTable(t=>{
                    const t2={...t,sBottom: Number(d.value)}
                    const both = (t2.sTop!=null && t2.sBottom!=null && t2.sTop!==t2.sBottom)
                    if(both){ setDone(4); next(); }
                    return t2
                  })}>
                    <span>{table.sBottom ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.vBottom==null ? "empty" : ""}`} test={acceptValueBottom} onDropContent={(d)=>setTable(t=>{
                    const correct = problem?.given?.row==='bottom' && d.value===problem?.given?.value
                    if(!correct){ miss(5); return t }
                    const t2={...t,vBottom:Number(d.value)}
                    if(t2.vBottom!=null && t2.vTop==null){ setDone(5); next(); }
                    return t2
                  })}>
                    <span>{table.vBottom ?? ''}</span>
                  </Slot>
                </div>
              </div>

              {/* Step 7–10 controls (visible when relevant) */}
              {step>=6 && (
                <div className="toolbar mt-10 center">
                  <button className="button" onClick={()=>{ if(step===6){ setDone(6); next(); } else miss(step) }}>Cross Multiply</button>
                  <button className="button" onClick={()=>{ if(step===8){ setDone(8); next(); } else miss(step) }}>Divide</button>
                  <button className="button success" disabled={result==null || step!==9} onClick={submitAttempt}>Submit</button>
                </div>
              )}

              {/* Read-only previews */}
              <div className="mt-8 muted">
                {product!=null && <div>Product: <strong>{product}</strong></div>}
                {result!=null && <div>Result: <strong>{result}</strong></div>}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CARD: dynamic guidance + chips */}
        <div className="card right-steps">
          <div className="section">
            <div className="step-title">
              {[
                'Step 1: What do we do first?',
                'Step 2: What do we put in the first column? (drag onto header)',
                'Step 3: Place the units (drag onto left cells)',
                'Step 4: What goes in the second column? (drag onto header)',
                'Step 5: Place the scale numbers',
                'Step 6: Where does the other number go?',
                'Step 7: What’s next?',
                'Step 8: Which numbers are we multiplying? (click the grid cells after you place them)',
                'Step 9: What’s next?',
                'Step 10: Which number are we dividing? (click the divisor)'
              ][step]}
            </div>

            {step>=1 && (
              <>
                <div className="chips with-borders center">
                  <Draggable id="col1" label="Units" data={{kind:'col', v:'Units'}} />
                  <Draggable id="col2" label="Scale Numbers" data={{kind:'col', v:'ScaleNumbers'}} />
                </div>

                <div className="chips center mt-8">
                  {unitChoices.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
                </div>

                <div className="chips center mt-8">
                  {numberChoices.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
                </div>
              </>
            )}
          </div>

          <ol className="muted bigger">
            {STEP_HEADS.map((h,i)=>(
              <li key={i}><strong>{i+1}.</strong> {h} {steps?.[i]?.done ? '✓' : ''}</li>
            ))}
          </ol>
        </div>
      </div>

      {openSum && (
        <SummaryOverlay
          attempts={session?.attempts || []}
          onClose={() => { setOpenSum(false); resetProblem(); }}
        />
      )}
    </div>
  )
}
