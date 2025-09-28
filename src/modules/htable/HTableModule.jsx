// src/modules/htable/HTableModule.jsx — Rebuilt (spec v2.0)
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

/* ---------- Step labels (unchanged text with one wording tweak on step 6) ---------- */
const STEP_HEADS = [
  'What first?', 'Column 1', 'Units', 'Column 2', 'Place Scale',
  'Place Given', 'Where does the other number go?', 'Which multiply?',
  'Next?', 'Which divide?'
]

/* ---------- Step 1 tiles (correct = Draw an H-Table) ---------- */
const STEP1_CHOICES = [
  { id: 'drawH',     label: 'Draw an H-Table',     correct: true },
  { id: 'proportion',label: 'Make a Proportion',   correct: false },
  { id: 'convert',   label: 'Convert Units First', correct: false },
  { id: 'guess',     label: 'Just Guess',          correct: false },
]

/* ---------- Problem sanity helpers ---------- */
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

/* ================================================================================ */

export default function HTableModule() {
  /* ---------- versioned snapshot so old localStorage doesn’t freeze the UI ---------- */
  const H_SNAP_VERSION = 3
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

  /* ---------- persist snapshot whenever core state changes ---------- */
  useEffect(()=>{
    const next = {
      ...(session || {}),
      hSnap: { version: H_SNAP_VERSION, problem, table, step, steps }
    }
    saveSession(next)
    setSession(next)
  },[problem, table, step, steps])

  /* ---------- step helpers ---------- */
  const miss = (idx)=>setSteps(s=>{const c=[...s]; if (c[idx]) c[idx].misses++; return c})
  const setDone = (idx)=>setSteps(s=>{const c=[...s]; if (c[idx]) c[idx].done=true; return c})
  const next = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))

  /* ---------- language / redaction ---------- */
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
    startTimer()
    const t = setTimeout(()=>{
      setShowEnglish(false)
      if (allowedModes.length>0){
        const pick = allowedModes[Math.floor(Math.random()*allowedModes.length)]
        setMode(pick)
      }
    }, 10000)
    return ()=>{ stopTimer(); clearTimeout(t) }
  },[problem?.id, allowedModes.length])

  /* ---------- chip pools ---------- */
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

  // header options include decoys
  const headerChoices = useMemo(()=>[
    { id:'col_units', label:'Units', kind:'col', v:'Units' },
    { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
    { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
    { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
    { id:'col_labels', label:'Labels', kind:'col', v:'Labels' },
  ],[])

  /* ---------- accept tests (step-gated) ---------- */
  const acceptCol1 = d => step===1 && d.kind==='col' && d.v==='Units'
  const acceptCol2 = d => step===3 && d.kind==='col' && d.v==='ScaleNumbers'
  const acceptUnitTop    = d => step===2 && d.kind==='unit'
  const acceptUnitBottom = d => step===2 && d.kind==='unit'
  const acceptScaleTop   = d => step===4 && d.kind==='num'
  const acceptScaleBottom= d => step===4 && d.kind==='num'
  const acceptValueTop   = d => step===5 && d.kind==='num'
  const acceptValueBottom= d => step===5 && d.kind==='num'

  /* ---------- compute helpers (for steps 8 & 10 validation) ---------- */
  const givenRow = (table.vBottom!=null) ? 'bottom' : (table.vTop!=null ? 'top' : null)
  const crossPair = useMemo(()=>{
    // the correct multiplicands are: given value × opposite scale
    if (!givenRow || table.sTop==null || table.sBottom==null) return null
    const v = (givenRow==='top') ? table.vTop : table.vBottom
    const sOpp = (givenRow==='top') ? table.sBottom : table.sTop
    if (v==null || sOpp==null) return null
    return { a:v, b:sOpp, label:`${v} × ${sOpp}` }
  },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom])

  const wrongPairs = useMemo(()=>{
    // two distractors: given × same-scale, and scale × scale
    const list = []
    const v = (givenRow==='top') ? table.vTop : table.vBottom
    const sSame = (givenRow==='top') ? table.sTop : table.sBottom
    if (v!=null && sSame!=null) list.push({ a:v, b:sSame, label:`${v} × ${sSame}` })
    if (table.sTop!=null && table.sBottom!=null) list.push({ a:table.sTop, b:table.sBottom, label:`${table.sTop} × ${table.sBottom}` })
    return list
  },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom])

  const chooseMultiply = (pair)=>{
    if (!pair || !crossPair) { miss(7); return }
    const correct = (pair.a===crossPair.a && pair.b===crossPair.b)
    if (!correct) { miss(7); return }
    setTable(t => ({ ...t, product: pair.a * pair.b }))
    setDone(7); next()
  }

  const chooseDivisor = (div)=>{
    const wanted = (givenRow==='top') ? 'top' : 'bottom'
    const isTop = (div==='top')
    if ((wanted==='top' && isTop) || (wanted==='bottom' && !isTop)) {
      setTable(t => ({ ...t, divisor: isTop ? t.sTop : t.sBottom, result: (t.product!=null && (isTop?t.sTop:t.sBottom)!=null) ? (t.product/(isTop?t.sTop:t.sBottom)) : null }))
      setDone(9)
      // Step advances when submit or we can auto-advance:
      // next()
    } else {
      miss(9)
    }
  }

  const submitAttempt = ()=>{
    if (table.result==null) return
    const attempt = {
      ts: Date.now(),
      problemId: problem?.id,
      units: problem?.units,
      scale: [table.sTop, table.sBottom],
      given: { row: problem?.given?.row, value: problem?.given?.value },
      answer: table.result
    }
    const nextSession = { ...(session||{}), attempts: [...(session?.attempts||[]), attempt] }
    saveSession({ ...nextSession, hSnap: { version: H_SNAP_VERSION, problem, table, step, steps } })
    setSession(nextSession)
    setOpenSum(true)
  }

  /* ---------- reset/new ---------- */
  const resetProblem = ()=>{
    setProblem(genSaneHProblem())
    setTable({ head1:'', head2:'', uTop:'', uBottom:'', sTop:null, sBottom:null, vTop:null, vBottom:null, product:null, divisor:null, result:null })
    setStep(0)
    setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setShowEnglish(true); setMode('English')
  }

  /* ---------- Step 1 handler ---------- */
  const handleStep1 = (choice) => {
    if (choice?.correct) { setDone(0); setStep(1); }
    else { miss(0); }
  };

  /* ---------- Story (left card header) ---------- */
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
        {/* Language badge NOW directly under the problem */}
        <div className="lang-badge" style={{marginBottom: 8}}>Language: {showEnglish ? 'English' : mode}</div>
        <div className="toolbar" style={{justifyContent:'center', marginTop: 4, gap: 12, display:'flex'}}>
          <button
            className="button big-under"
            onPointerDown={()=>{ setShowEnglish(true) }}
            onPointerUp={()=>{ setShowEnglish(false) }}
            aria-label="Hold English"
          >Hold: English</button>
          <button className="button primary big-under" onClick={resetProblem}>New Problem</button>
        </div>
      </>
    )
  }

  /* ================================================================================ */

  return (
    <div className="container">
      <div className="panes">
        {/* LEFT: Story + H-table */}
        <div className="card">
          <Story />

          {/* H-table appears only after Step 1 is answered */}
          {step>=1 && (
            <div className="hwrap" style={{position:'relative', marginTop:12}}>
              {/* Removed vertical H-lines; we add only a horizontal divider BETWEEN the data rows */}
              <div className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
                {/* Headers */}
                <div className="hhead">
                  <Slot
                    className={`${!table.head1 ? "empty" : ""}`}
                    test={acceptCol1}
                    onDropContent={(d)=>{
                      if(d.v==='Units'){ setTable(t=>({...t, head1:'Units'})); setDone(1); next() } else miss(1)
                    }}
                  >
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:48}}>
                      <span className="hhead-text">{table.head1 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead">
                  <Slot
                    className={`${!table.head2 ? "empty" : ""}`}
                    test={acceptCol2}
                    onDropContent={(d)=>{
                      if(d.v==='ScaleNumbers'){ setTable(t=>({...t, head2:'Scale Numbers'})); setDone(3); next() } else miss(3)
                    }}
                  >
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:48}}>
                      <span className="hhead-text">{table.head2 || ''}</span>
                    </div>
                  </Slot>
                </div>
                <div className="hhead">{/* third column header intentionally blank */}</div>

                {/* Row 1 */}
                <div className="hcell">
                  <Slot className={`flat ${!table.uTop ? "empty" : ""}`}
                    test={acceptUnitTop}
                    onDropContent={(d)=>setTable(t=>{
                      const t2={...t,uTop:d.label}
                      const placed=new Set([t2.uTop,t2.uBottom].filter(Boolean))
                      if(placed.size===2){ setDone(2); next(); }
                      return t2
                    })}
                  >
                    <span style={{fontSize:16}}>{table.uTop || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.sTop==null ? "empty" : ""}`}
                    test={acceptScaleTop}
                    onDropContent={(d)=>setTable(t=>{
                      const t2={...t,sTop: Number(d.value)}
                      const both = (t2.sTop!=null && t2.sBottom!=null && t2.sTop!==t2.sBottom)
                      if(both){ setDone(4); next(); }
                      return t2
                    })}
                  >
                    <span style={{fontSize:18}}>{table.sTop ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.vTop==null ? "empty" : ""}`}
                    test={acceptValueTop}
                    onDropContent={(d)=>setTable(t=>{
                      const correct = problem?.given?.row==='top' && d.value===problem?.given?.value
                      if(!correct){ miss(5); return t }
                      const t2={...t,vTop:Number(d.value)}
                      if(t2.vTop!=null && t2.vBottom==null){ setDone(5); next(); }
                      return t2
                    })}
                  >
                    <span style={{fontSize:18}}>{table.vTop ?? ''}</span>
                  </Slot>
                </div>

                {/* Horizontal divider between rows (the "H" crossbar) */}
                <div style={{gridColumn: '1 / span 3', height:0, borderTop:'2px dashed var(--border-2)', margin:'2px 0'}} />

                {/* Row 2 */}
                <div className="hcell">
                  <Slot className={`flat ${!table.uBottom ? "empty" : ""}`}
                    test={acceptUnitBottom}
                    onDropContent={(d)=>setTable(t=>{
                      const t2={...t,uBottom:d.label}
                      const placed=new Set([t2.uTop,t2.uBottom].filter(Boolean))
                      if(placed.size===2){ setDone(2); next(); }
                      return t2
                    })}
                  >
                    <span style={{fontSize:16}}>{table.uBottom || ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.sBottom==null ? "empty" : ""}`}
                    test={acceptScaleBottom}
                    onDropContent={(d)=>setTable(t=>{
                      const t2={...t,sBottom: Number(d.value)}
                      const both = (t2.sTop!=null && t2.sBottom!=null && t2.sTop!==t2.sBottom)
                      if(both){ setDone(4); next(); }
                      return t2
                    })}
                  >
                    <span style={{fontSize:18}}>{table.sBottom ?? ''}</span>
                  </Slot>
                </div>
                <div className="hcell">
                  <Slot className={`flat ${table.vBottom==null ? "empty" : ""}`}
                    test={acceptValueBottom}
                    onDropContent={(d)=>setTable(t=>{
                      const correct = problem?.given?.row==='bottom' && d.value===problem?.given?.value
                      if(!correct){ miss(5); return t }
                      const t2={...t,vBottom:Number(d.value)}
                      if(t2.vBottom!=null && t2.vTop==null){ setDone(5); next(); }
                      return t2
                    })}
                  >
                    <span style={{fontSize:18}}>{table.vBottom ?? ''}</span>
                  </Slot>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: guidance + tiles/chips */}
        <div className="card right-steps">
          <div className="section">
            <div className="step-title">
              {[
                'Step 1: What do we do first?',
                'Step 2: What do we put in the first column? (drag onto header)',
                'Step 3: Place the units (drag onto left cells)',
                'Step 4: What goes in the second column? (drag onto header)',
                'Step 5: Place the scale numbers',
                'Step 6: Where does the other number in the problem go?',
                'Step 7: What’s next?',
                'Step 8: Which numbers are we multiplying?',
                'Step 9: What’s next?',
                'Step 10: Which number are we dividing?'
              ][step]}
            </div>

            {/* Step 1 tiles (click) */}
            {step===0 && (
              <div className="chips with-borders center">
                {STEP1_CHOICES.map(c => (
                  <button key={c.id} className="chip" onClick={()=>handleStep1(c)}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* Header choices (with decoys) */}
            {step>=1 && step<=3 && (
              <div className="chips with-borders center" style={{marginTop: 8}}>
                {headerChoices.map(h => (
                  <Draggable key={h.id} id={h.id} label={h.label} data={h} />
                ))}
              </div>
            )}

            {/* Unit chips visible from Step 2 on */}
            {step>=2 && (
              <div className="chips center mt-8">
                {unitChoices.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
              </div>
            )}

            {/* Number chips visible from Step 4 on */}
            {step>=4 && (
              <div className="chips center mt-8">
                {numberChoices.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
              </div>
            )}

            {/* Steps 7–10 controls live here on the right */}
            {step>=6 && (
              <>
                {step===6 && (
                  <div className="chips center mt-8">
                    <button className="chip" onClick={()=>{ setDone(6); next(); }}>Next</button>
                  </div>
                )}

                {step===7 && (
                  <div className="chips with-borders center mt-8">
                    {[crossPair, ...wrongPairs].filter(Boolean)
                      .sort(()=>Math.random()-0.5)
                      .map((p,idx)=>(
                        <button key={idx} className="chip" onClick={()=>chooseMultiply(p)}>
                          {p.label}
                        </button>
                      ))}
                  </div>
                )}

                {step===8 && (
                  <div className="chips center mt-8">
                    <button className="chip" onClick={()=>{ setDone(8); next(); }}>Next</button>
                  </div>
                )}

                {step>=9 && (
                  <>
                    {step===9 && (
                      <div className="chips with-borders center mt-8">
                        <button className="chip" onClick={()=>chooseDivisor('top')}>
                          Divide by top scale
                        </button>
                        <button className="chip" onClick={()=>chooseDivisor('bottom')}>
                          Divide by bottom scale
                        </button>
                      </div>
                    )}
                    <div className="toolbar mt-10 center">
                      <button
                        className="button success"
                        disabled={table.result==null}
                        onClick={submitAttempt}
                      >
                        Submit
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
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
