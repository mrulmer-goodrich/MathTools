// src/modules/scale/ScaleFactor.jsx (v3.1.0)
// Key fixes from user feedback:
// - Remove always-visible ghost; show a '?' pill on the Copy's missing side from the start.
// - Formula (words) row never wraps; chips remain bold when dropped.
// - Values step: drop both numbers in ANY order; auto-advance after both correct.
// - Calculate: "divide numerator and denominator by <GCD>" and decimal to 1 place (hide .0 if whole).
// - Replace word-building step with a single concept-check (with distractors, includes ÷).
// - Compute step: shows "Original × Scale Factor = Copy", displays scale factor used, confetti, auto-new-problem.
// - Keep corresponding side click behavior and large hit targets.

import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 11

const STEP_HEADS = [
  'Label the rectangles',
  'Pick the corresponding sides',
  'Build the scale factor formula (words)',
  'Fill the formula with values',
  'Calculate & Simplify',
  'How do we get the missing side?',
  'Compute the missing side'
]

export default function ScaleFactorModule() {
  const [session, setSession] = useState(loadSession())

  const freshSnap = {
    version: SNAP_VERSION,
    problem: genScaleProblem(),
    step: 0,
    steps: STEP_HEADS.map(()=>({misses:0,done:false})),
    labels: { left:null, right:null },
    // step 2 correspondence
    firstPick: null,            // {shape, edge, orient}
    chosen: { orig:null, copy:null },
    picked: false,
    // scale factor slots
    num: null, den: null,
    slots: { sSF:null, sNUM:null, sDEN:null },
    // concept check result
    conceptOK: false,
    // compute step
    missingResult: null
  }

  const persisted = (session.scaleSnap && session.scaleSnap.version===SNAP_VERSION) ? session.scaleSnap : freshSnap

  const [problem, setProblem] = useState(persisted.problem)
  const [step, setStep] = useState(persisted.step)
  const [steps, setSteps] = useState(persisted.steps)
  const [labels, setLabels] = useState(persisted.labels)

  const [firstPick, setFirstPick] = useState(persisted.firstPick)
  const [chosen, setChosen] = useState(persisted.chosen)
  const [picked, setPicked] = useState(persisted.picked)

  const [num, setNum] = useState(persisted.num)
  const [den, setDen] = useState(persisted.den)
  const [slots, setSlots] = useState(persisted.slots)

  const [conceptOK, setConceptOK] = useState(persisted.conceptOK)
  const [missingResult, setMissingResult] = useState(persisted.missingResult)

  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [calc, setCalc] = useState(null)

  const saveSnap = ()=>{
    const snap = { version: SNAP_VERSION, problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, conceptOK, missingResult }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
  }
  useEffect(saveSnap, [problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, conceptOK, missingResult]) // eslint-disable-line

  const miss  = (i)=>setSteps(s=>{const c=[...s];c[i].misses++;return c})
  const done  = (i)=>setSteps(s=>{const c=[...s];c[i].done=true;return c})
  const next  = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))
  const again = (i,msg='Try Again!')=>{ miss(i); setErrorMsg(msg); setTimeout(()=>setErrorMsg(''), 1200) }

  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w,     ch = problem.copy.h
  const shown = problem.shownPair          // 'horizontal' | 'vertical'
  const missingPair = problem.missingPair  // opposite

  /* ---------- Rectangle sizing ---------- */
  const SCALE = 6
  const rectStyle = (w,h)=>{
    const W = Math.max(110, w*SCALE)
    const H = Math.max(90,  h*SCALE)
    return { width: W+'px', height: H+'px' }
  }

  /* ---------- Shared badge metrics (same size for both visible pills) ---------- */
  const sharedBadgeMetrics = useMemo(()=>{
    let basis
    if (shown==='horizontal') basis = Math.min(ow, cw) * SCALE
    else basis = Math.min(oh, ch) * SCALE
    const font = Math.max(18, Math.min(26, Math.floor(basis/6)))
    const padV = Math.round(font*0.45)
    const padH = Math.round(font*0.65)
    return { '--badge-font': `${font}px`, '--badge-pad-v': `${padV}px`, '--badge-pad-h': `${padH}px` }
  }, [ow,oh,cw,ch,shown])

  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }
  const correctCopy = copyVals[shown]
  const correctOrig = origVals[shown]

  const wordBank = useMemo(()=>{
    const src = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    for(let i=src.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [src[i],src[j]]=[src[j],src[i]] }
    return src.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  }, [problem.id])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum  = d => d?.kind==='num'

  /* ---------- Step 0: label drop only on step 0 ---------- */
  const dropLabelOnRect = (side) => (d) => {
    if (side==='left' && testWord('Original')(d)) {
      const after = { ...labels, left: 'Original' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else if (side==='right' && testWord('Copy')(d)) {
      const after = { ...labels, right: 'Copy' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else { again(0) }
  }

  /* ---------- Step 2: corresponding sides ---------- */
  const clickSide = (shape, edge, orient)=>{
    if(step!==1){ return }
    if(!labels.left || !labels.right){ again(1); return }
    if(orient !== shown){ again(1); return } // only the shown orientation is valid
    if(!firstPick){
      setFirstPick({shape,edge,orient})
    } else {
      if(firstPick.shape !== shape && firstPick.orient===orient){
        const pair = { orig: (shape==='orig'? firstPick.edge : edge), copy: (shape==='copy'? firstPick.edge : edge) }
        setChosen(pair); setPicked(true); setFirstPick(null); done(1); next()
      } else { setFirstPick(null); again(1) }
    }
  }

  const isChosen=(s,e)=> step===1 && firstPick && firstPick.shape===s && firstPick.edge===e
  const isGood  =(s,e)=> step>=2 && picked && ((s==='orig' && chosen.orig===e) || (s==='copy' && chosen.copy===e))

  /* ---------- Step 3 (words) ---------- */
  const onDropFormula = (slotKey, want) => (d) => {
    if (!testWord(want)(d)) { again(2); return }
    setSlots(prev => {
      const nextSlots = { ...prev, [slotKey]: d }
      const ok =
        nextSlots.sSF?.label === 'Scale Factor' &&
        nextSlots.sNUM?.label === 'Copy' &&
        nextSlots.sDEN?.label === 'Original'
      if (ok) { done(2); next() }
      return nextSlots
    })
  }

  /* ---------- Step 4: numbers (ANY ORDER) ---------- */
  const dropNumAny = (where, d) => {
    if(!testNum(d)) { again(3); return }
    // Only accept numbers dragged from visible side pills (they are tagged as {kind:'num'})
    if (where==='num') {
      if (d.value !== correctCopy) { again(3); return }
      setNum(d.value)
    } else if (where==='den') {
      if (d.value !== correctOrig) { again(3); return }
      setDen(d.value)
    }
    // After either drop, if both are correct, advance
    setTimeout(()=>{
      setSteps(s=>{
        if (num===correctCopy && den===correctOrig) return s
        return s
      })
      if ((where==='num' ? d.value===correctCopy : num===correctCopy) &&
          (where==='den' ? d.value===correctOrig : den===correctOrig)) {
        done(3); next()
      }
    }, 0)
  }

  /* ---------- Step 5 calculate ---------- */
  const gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y){[x,y]=[y,x%y]}return x||1}
  const doCalculate=()=>{
    if(num==null||den==null){ again(4); return }
    const g=gcd(num,den), a=num/g, b=den/g, dec=(den!==0)?(num/den):null
    setCalc({num,den,a,b,dec,g}); done(4)
  }
  const format1=(x)=>{
    if (x==null) return ''
    const v = Math.round(x*10)/10
    return (v % 1 === 0) ? String(v.toFixed(0)) : String(v.toFixed(1))
  }

  /* ---------- Step 6 concept check (drag one correct sentence) ---------- */
  const conceptChoices = useMemo(()=>[
    { id:'c_ok', label:'Original × Scale Factor = Copy', kind:'concept', ok:true },
    { id:'c_wrong1', label:'Original ÷ Scale Factor = Copy', kind:'concept', ok:false },
    { id:'c_wrong2', label:'Copy × Scale Factor = Original', kind:'concept', ok:false },
    { id:'c_wrong3', label:'Copy ÷ Original = Scale Factor', kind:'concept', ok:false },
  ], [])

  const acceptConcept = (d)=> d?.kind==='concept'
  const onConceptDrop = (d)=>{
    if (d.ok) { setConceptOK(true); done(5); next() }
    else again(5)
  }

  /* ---------- New Problem ---------- */
  const newProblem=()=>{
    const p=genScaleProblem()
    setProblem(p); setStep(0); setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setLabels({left:null,right:null})
    setFirstPick(null); setChosen({orig:null,copy:null}); setPicked(false)
    setSlots({sSF:null,sNUM:null,sDEN:null})
    setNum(null); setDen(null); setCalc(null)
    setConceptOK(false)
    setMissingResult(null)
  }

  /* ---------- Confetti helper ---------- */
  const popConfetti = ()=>{
    try {
      const node = document.createElement('div')
      node.textContent = '🎉 Great job!'
      Object.assign(node.style, {
        position:'fixed', left:'50%', top:'18%', transform:'translateX(-50%)',
        fontSize:'20px', fontWeight:'900', background:'#fff', padding:'8px 12px',
        border:'2px solid #34d399', borderRadius:'12px', zIndex:9999
      })
      document.body.appendChild(node)
      setTimeout(()=>{ node.remove(); }, 1400)
    } catch {}
  }

  /* ---------- Tag (number badge) ---------- */
  const Tag = ({id, value, side, orient, shape}) => {
    const cls = 'side-tag '+side
    const isShown = (orient===shown)
    const draggableNow = (step>=3) && isShown
    const handleClick = ()=>{
      if(step===1){ clickSide(shape, side, orient) }
    }
    if (draggableNow) {
      return <Draggable id={id} label={String(value)} data={{kind:'num', value}} className={cls} style={sharedBadgeMetrics} />
    }
    return <span className={cls} style={sharedBadgeMetrics} onClick={handleClick}>{value}</span>
  }

  /* ---------- Rect (labels only at step 0) ---------- */
  const RectWithLabel = ({which})=>{
    const isLeft = which==='orig'
    const w = isLeft ? ow : cw
    const h = isLeft ? oh : ch

    const baseRect = (
      <div className={`rect ${!isLeft ? 'copy' : ''}`} style={rectStyle(w,h)}>
        <div className={"shape-label-center "+(!labels[isLeft?'left':'right']?'hidden':'')}>{labels[isLeft?'left':'right'] || ''}</div>

        {/* Shown orientation pills (draggable from Step 3) */}
        {shown==='horizontal' && (
          <Tag id={(isLeft?'o':'c')+"num_h"} value={isLeft?ow:cw} side="top" orient="horizontal" shape={isLeft?'orig':'copy'} />
        )}
        {shown==='vertical' && (
          <Tag id={(isLeft?'o':'c')+"num_v"} value={isLeft?oh:ch} side="left" orient="vertical" shape={isLeft?'orig':'copy'} />
        )}

        {/* Missing orientation: show a '?' on the COPY only (never a ghost), from the start */}
        {!isLeft && (missingPair==='horizontal') && (
          <span className="side-tag top" style={sharedBadgeMetrics}>?</span>
        )}
        {!isLeft && (missingPair==='vertical') && (
          <span className="side-tag left" style={sharedBadgeMetrics}>?</span>
        )}

        {/* Wide side-hit zones for Step 1 selection */}
        <div className={"side-hit top "+(isChosen(isLeft?'orig':'copy','top')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','top')?'good':'')}
             onClick={()=> step===1 && clickSide(isLeft?'orig':'copy','top','horizontal') } />
        <div className={"side-hit bottom "+(isChosen(isLeft?'orig':'copy','bottom')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','bottom')?'good':'')}
             onClick={()=> step===1 && clickSide(isLeft?'orig':'copy','bottom','horizontal') } />
        <div className={"side-hit left "+(isChosen(isLeft?'orig':'copy','left')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','left')?'good':'')}
             onClick={()=> step===1 && clickSide(isLeft?'orig':'copy','left','vertical') } />
        <div className={"side-hit right "+(isChosen(isLeft?'orig':'copy','right')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','right')?'good':'')}
             onClick={()=> step===1 && clickSide(isLeft?'orig':'copy','right','vertical') } />
      </div>
    )

    if (step===0) {
      return (
        <Slot className="rect-slot" test={testWord(isLeft?'Original':'Copy')} onDropContent={dropLabelOnRect(isLeft?'left':'right')}>
          {baseRect}
        </Slot>
      )
    }
    return baseRect
  }

  return (
    <div className="container">
      <div className="panes equal">
        {/* LEFT: shapes */}
        <div className="card shape-area">
          <div className="rects" style={sharedBadgeMetrics}>
            <RectWithLabel which="orig" />
            <RectWithLabel which="copy" />
          </div>
          <button className="button primary big-under" onClick={newProblem}>New Problem</button>
        </div>

        {/* RIGHT: steps */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title question-xl">{STEP_HEADS[step]}</div>

            {step===0 && (
              <div className="section">
                <div className="muted bigger">Drag and drop the words onto the rectangles.</div>
                <div className="chips mt-10 chips-lg with-borders">
                  <Draggable id="wO" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wC" label="Copy" data={{kind:'word',label:'Copy'}} />
                  {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
                </div>
              </div>
            )}

            {step===1 && (
              <div className="section">
                <div className="muted bigger">Click one side on a rectangle, then click the matching side on the other rectangle.</div>
              </div>
            )}

            {step===2 && (
              <div className="section">
                <div className="muted bigger">Drag the words to build the formula.</div>
                <div className="fraction-row mt-8 big-fraction nowrap">
                  <Slot test={testWord('Scale Factor')} onDropContent={onDropFormula('sSF','Scale Factor')}>
                    {slots.sSF ? <Draggable id={slots.sSF.id} label={slots.sSF.label} data={slots.sSF} /> : '_____'}
                  </Slot>
                  <span>=</span>
                  <div className="fraction ml-6">
                    <div>
                      <Slot test={testWord('Copy')} onDropContent={onDropFormula('sNUM','Copy')}>
                        {slots.sNUM ? <Draggable id={slots.sNUM.id} label={slots.sNUM.label} data={slots.sNUM} /> : '_____'}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={testWord('Original')} onDropContent={onDropFormula('sDEN','Original')}>
                        {slots.sDEN ? <Draggable id={slots.sDEN.id} label={slots.sDEN.label} data={slots.sDEN} /> : '_____'}
                      </Slot>
                    </div>
                  </div>
                </div>
                <div className="chips chips-lg with-borders">
                  {wordBank.map(w=><Draggable key={w.id} id={w.id} label={w.label} data={w} />)}
                </div>
              </div>
            )}

            {step===3 && (
              <div className="section">
                <div className="muted bigger">Drag values from the shapes into the formula.</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:12}}>
                  <div className="fraction-row nowrap">
                    <span className="chip static">Scale Factor</span>
                    <span>=</span>
                    <div className="fraction ml-6">
                      <div><span className="chip static">Copy</span></div>
                      <div className="frac-bar"></div>
                      <div><span className="chip static">Original</span></div>
                    </div>
                  </div>
                  <div className="fraction ml-12">
                    <div>
                      <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNumAny('num',d)}>
                        {num==null ? '—' : <span className="chip">{num}</span>}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNumAny('den',d)}>
                        {den==null ? '—' : <span className="chip">{den}</span>}
                      </Slot>
                    </div>
                  </div>
                </div>
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {step===4 && (
              <div className="section">
                <div className="muted bigger">Tap Calculate to show the math, then Next.</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:12}}>
                  <div className="fraction-row nowrap">
                    <span className="chip static">Scale Factor</span>
                    <span>=</span>
                    <div className="fraction ml-6">
                      <div><span className="chip static">Copy</span></div>
                      <div className="frac-bar"></div>
                      <div><span className="chip static">Original</span></div>
                    </div>
                  </div>
                  <div className="fraction ml-12">
                    <div>{num==null ? '—' : <span className="chip">{num}</span>}</div>
                    <div className="frac-bar"></div>
                    <div>{den==null ? '—' : <span className="chip">{den}</span>}</div>
                  </div>
                </div>
                <div className="chips mt-8">
                  {!calc && <button className="button primary" onClick={doCalculate}>Calculate</button>}
                  {calc && (
                    <div className="calc-steps">
                      <div>= <b>{calc.num}</b> / <b>{calc.den}</b></div>
                      <div>= divide numerator and denominator by <b>{calc.g}</b> → <b>{calc.a}</b> / <b>{calc.b}</b></div>
                      {calc.dec!=null && <div>= decimal ≈ <b>{format1(calc.dec)}</b></div>}
                      <div className="toolbar mt-8">
                        <button className="button primary" onClick={()=>{ if(calc) { next() } }}>Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step===5 && (
              <div className="section">
                <div className="muted bigger">How do we calculate the missing side of the Copy?</div>
                <div className="chips mt-8 chips-lg with-borders">
                  {conceptChoices.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
                </div>
                <Slot className="mt-8" test={acceptConcept} onDropContent={onConceptDrop}>
                  <span className="slot">Drop the correct sentence here</span>
                </Slot>
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {step===6 && (
              <div className="section">
                <div className="muted bigger">Original × Scale Factor = Copy</div>
                <div className="mt-8 muted">Scale Factor used: <b>{num!=null && den!=null ? `${num}/${den}` : '—'}</b></div>
                <div className="toolbar mt-8">
                  <button className="button success" onClick={()=>{
                    if (num==null || den==null) { again(6); return }
                    const sf = num/den
                    const origSide = origVals[missingPair]
                    const result = origSide * sf
                    setMissingResult(result)
                    popConfetti()
                    done(6)
                    setTimeout(()=>{ newProblem() }, 1200)
                  }}>
                    Compute Missing Side
                  </button>
                </div>
                {missingResult!=null && (
                  <div className="chips mt-10">
                    <span className="badge">Result: {format1(missingResult)}</span>
                  </div>
                )}
              </div>
            )}

            {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
          </div>
        </div>
      </div>

      <button className="button primary floating-summary" onClick={()=>setOpenSum(true)}>Summary</button>
      <SummaryOverlay open={openSum} onClose={()=>setOpenSum(false)} attempts={session.attempts} stepHeads={STEP_HEADS} />
    </div>
  )
}
