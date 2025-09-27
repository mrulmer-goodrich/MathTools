// src/modules/scale/ScaleFactor.jsx  (v3.0.3)
// Position-locked badges, both orientations rendered, order-agnostic value fill,
// and robust step advancement.

import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 11

const STEP_HEADS = [
  'Label the rectangles',
  'Pick the corresponding sides (with values)',
  'Build the scale factor formula (words)',
  'Fill the values from the shapes',
  'Calculate & Simplify',
  'Concept check',
  'Identify the missing side on the Copy',
  'Compute missing side'
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

    // scale factor formula chips (words)
    slots: { sSF:null, sNUM:null, sDEN:null },

    // numeric values
    num: null,
    den: null,

    // concept check state (kept simple here)
    eqPlaced: { O:false, SF:false, C:false },

    // step 7 click
    missingClicked: false,

    // final
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

  const [slots, setSlots] = useState(persisted.slots)

  const [num, setNum] = useState(persisted.num)
  const [den, setDen] = useState(persisted.den)

  const [eqPlaced] = useState(persisted.eqPlaced)

  const [missingClicked, setMissingClicked] = useState(persisted.missingClicked)

  const [missingResult, setMissingResult] = useState(persisted.missingResult)

  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [calc, setCalc] = useState(null)

  const saveSnap = ()=>{
    const snap = {
      version: SNAP_VERSION,
      problem, step, steps, labels,
      firstPick, chosen, picked,
      slots, num, den,
      eqPlaced, missingClicked, missingResult
    }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
  }
  // eslint-disable-next-line
  useEffect(saveSnap, [problem, step, steps, labels, firstPick, chosen, picked, slots, num, den, eqPlaced, missingClicked, missingResult])

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

  /* ---------- Shared badge metrics ---------- */
  const sharedBadgeMetrics = useMemo(()=>{
    const basis = shown==='horizontal'
      ? Math.min(ow, cw) * SCALE
      : Math.min(oh, ch) * SCALE
    const font = Math.max(18, Math.min(26, Math.floor(basis/6)))
    const padV = Math.round(font*0.45)
    const padH = Math.round(font*0.65)
    return { '--badge-font': `${font}px`, '--badge-pad-v': `${padV}px`, '--badge-pad-h': `${padH}px` }
  }, [ow,oh,cw,ch,shown])

  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }

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

  /* ---------- Step 2: corresponding sides (only sides with values) ---------- */
  const clickSide = (shape, edge, orient)=>{
    if(step!==1){ return }
    if(!labels.left || !labels.right){ again(1); return }
    // only accept SHOWN orientation (the two sides that currently have values)
    if(orient !== shown){ again(1); return }

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

  /* ---------- Step 4 values: order-agnostic, auto-advance when both correct ---------- */
  const tryAdvanceAfterSet = (justSetWhich) => {
    const haveNum = (justSetWhich==='num') ? true : (num!=null)
    const haveDen = (justSetWhich==='den') ? true : (den!=null)
    if (haveNum && haveDen) { done(3); /* no step 4 now */ setStep(4) }
  }

  const dropNum = (where,d)=>{
    if(!testNum(d)) { again(3); return }

    const correctCopy = copyVals[shown]
    const correctOrig = origVals[shown]

    if(where==='num'){
      if(d.value===correctCopy){ setNum(d.value); tryAdvanceAfterSet('num') } else again(3)
    } else {
      if(d.value===correctOrig){ setDen(d.value); tryAdvanceAfterSet('den') } else again(3)
    }
  }

  /* ---------- Step 5 calculate/simplify ---------- */
  const gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y){[x,y]=[y,x%y]}return x||1}
  const doCalculate=()=>{
    if(num==null||den==null){ again(4); return }
    const g=gcd(num,den), a=num/g, b=den/g
    setCalc({num,den,a,b,g}); done(4)
  }
  const proceedAfterCalc=()=>{ if(calc) next() }

  /* ---------- Step 7: must click missing side on the COPY ---------- */
  const handleMissingClick = (shape, edge, orient) => {
    if(step!==6) return
    if(shape!=='copy'){ again(6); return }
    if(orient!==missingPair){ again(6); return }
    setMissingClicked(true); done(6); next()
  }

  /* ---------- New Problem ---------- */
  const newProblem=()=>{
    const p=genScaleProblem()
    setProblem(p); setStep(0); setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setLabels({left:null,right:null})
    setFirstPick(null); setChosen({orig:null,copy:null}); setPicked(false)
    setSlots({sSF:null,sNUM:null,sDEN:null})
    setNum(null); setDen(null); setCalc(null)
    setMissingClicked(false)
    setMissingResult(null)
  }

  /* ---------- Pill / Tag (wrapper carries absolute positioning) ---------- */
  const Tag = ({id, value, side, orient, shape}) => {
    const cls = 'side-tag ' + side
    const isShown = (orient===shown)
    const isPerp  = (orient===missingPair)

    // Draggable logic:
    // - All numeric badges on the Original are draggable during value steps
    // - On the Copy: shown orientation number is visible; the perpendicular shows "?" (not draggable)
    const isNumeric = (value!== '?' && value!=null && value!=='')
    const draggableNow = (step>=3) && (
      (shape==='orig' && isNumeric) ||
      (shape==='copy' && isShown && isNumeric)
    )

    const handleClick = ()=>{
      if(step===1){ clickSide(shape, side, orient) }
      if(step===6){ handleMissingClick(shape, side, orient) }
    }

    if (draggableNow) {
      return (
        <span className={cls} style={sharedBadgeMetrics} onClick={handleClick}>
          <Draggable id={id} label={String(value)} data={{kind:'num', value}} />
        </span>
      )
    }
    return (
      <span className={cls} style={sharedBadgeMetrics} onClick={handleClick}>
        {value}
      </span>
    )
  }

  // compute value for each side/orientation
  const valueFor = (isLeft, orient) => {
    if (orient==='horizontal') {
      if (isLeft) return ow
      return (missingPair==='horizontal') ? '?' : cw
    } else {
      if (isLeft) return oh
      return (missingPair==='vertical') ? '?' : ch
    }
  }

  /* ---------- Rect (labels only at step 0) ---------- */
  const RectWithLabel = ({which})=>{
    const isLeft = which==='orig'
    const w = isLeft ? ow : cw
    const h = isLeft ? oh : ch
    const baseRect = (
      <div className={`rect ${!isLeft ? 'copy' : ''}`} style={rectStyle(w,h)}>
        <div className={"shape-label-center "+(!labels[isLeft?'left':'right']?'hidden':'')}>{labels[isLeft?'left':'right'] || ''}</div>

        {/* Always render BOTH orientations so non-corresponding numbers exist as distractors */}
        <Tag id={(isLeft?'o':'c')+"num_h"} value={valueFor(isLeft,'horizontal')} side="top"    orient="horizontal" shape={isLeft?'orig':'copy'} />
        <Tag id={(isLeft?'o':'c')+"num_v"} value={valueFor(isLeft,'vertical')}   side="left"   orient="vertical"   shape={isLeft?'orig':'copy'} />
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
                <div className="muted bigger">Click one side on a rectangle, then click the matching side on the other rectangle (sides with values).</div>
              </div>
            )}

            {step===2 && (
              <div className="section">
                <div className="muted bigger">Drag the words to build the formula.</div>

                <div className="fraction-row mt-8 big-fraction">
                  <Slot test={testWord('Scale Factor')} onDropContent={onDropFormula('sSF','Scale Factor')}>
                    {slots.sSF
                      ? <Draggable id={slots.sSF.id} label={slots.sSF.label} data={slots.sSF} />
                      : '_____'}
                  </Slot>

                  <span>=</span>

                  <div className="fraction ml-6">
                    <div>
                      <Slot test={testWord('Copy')} onDropContent={onDropFormula('sNUM','Copy')}>
                        {slots.sNUM
                          ? <Draggable id={slots.sNUM.id} label={slots.sNUM.label} data={slots.sNUM} />
                          : '_____'}
                      </Slot>
                    </div>
                    <div className="frac-bar thick"></div>
                    <div>
                      <Slot test={testWord('Original')} onDropContent={onDropFormula('sDEN','Original')}>
                        {slots.sDEN
                          ? <Draggable id={slots.sDEN.id} label={slots.sDEN.label} data={slots.sDEN} />
                          : '_____'}
                      </Slot>
                    </div>
                  </div>
                </div>

                <div className="chips chips-lg with-borders">
                  {wordBank.map(w => (
                    <Draggable key={w.id} id={w.id} label={w.label} data={w} />
                  ))}
                </div>
              </div>
            )}

            {step===3 && (
              <div className="section">
                <div className="muted bigger">Drag values from the shapes into the formula.</div>

                <div className="fraction-row mt-8">
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
                    <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('num',d)}>
                      {num == null ? '—' : <span className="chip">{num}</span>}
                    </Slot>
                  </div>
                  <div className="frac-bar"></div>
                  <div>
                    <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('den',d)}>
                      {den == null ? '—' : <span className="chip">{den}</span>}
                    </Slot>
                  </div>
                </div>
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {step===4 && (
              <div className="section">
                <div className="muted bigger">Tap Calculate to simplify.</div>

                <div className="fraction ml-12">
                  <div><span className="chip">{num ?? '—'}</span></div>
                  <div className="frac-bar"></div>
                  <div><span className="chip">{den ?? '—'}</span></div>
                </div>

                <div className="chips mt-8">
                  {!calc && <button className="button primary" onClick={doCalculate}>Calculate</button>}
                  {calc && (
                    <div className="calc-steps">
                      {/* compact inline simplification */}
                      <div className="fraction ml-12" style={{alignItems:'center'}}>
                        <div><span className="chip">{calc.num}</span></div>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span>÷</span><span className="chip">{calc.g}</span>
                        </div>
                        <div className="frac-bar"></div>
                        <div><span className="chip">{calc.den}</span></div>
                        <div style={{display:'flex', alignItems:'center', gap:8, marginLeft:8}}>
                          <span>÷</span><span className="chip">{calc.g}</span>
                          <span>=</span>
                          <span className="chip">{calc.a}</span>
                          <span>/</span>
                          <span className="chip">{calc.b}</span>
                        </div>
                      </div>

                      <div className="toolbar mt-8">
                        <button className="button primary" onClick={proceedAfterCalc}>Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step===5 && (
              <div className="section">
                <div className="muted bigger">(Concept check placeholder — randomized options handled elsewhere.)</div>
                <div className="toolbar mt-8">
                  <button className="button primary" onClick={()=>next()}>Next</button>
                </div>
              </div>
            )}

            {step===6 && (
              <div className="section">
                <div className="muted bigger">What value are we solving for? Click the missing side on the <b>Copy</b>.</div>
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {step===7 && (
              <div className="section">
                <div className="muted bigger">Original × <b>Scale Factor</b> = Copy</div>
                <div className="toolbar mt-8">
                  <button className="button success" onClick={()=>{
                    const g = (d)=>{ let a=Math.abs(d.num), b=Math.abs(d.den); while(b){[a,b]=[b,a%b]} return a||1 }
                    const sfNum = num, sfDen = den
                    const gg = g({num:sfNum, den:sfDen})
                    const a = sfNum/gg, b = sfDen/gg
                    const sf = a/b
                    const origSide = origVals[missingPair]
                    const result = origSide * sf
                    setMissingResult(result); 
                    // do NOT auto-advance; let the user bask
                  }}>
                    Compute Missing Side
                  </button>
                </div>
                {missingResult!=null && (
                  <div className="chips mt-10">
                    <span className="badge" style={{fontSize:'1.25rem'}}>Result: <b>{Number.isInteger(missingResult) ? missingResult : Number(missingResult.toFixed(1))}</b></span>
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
