// src/modules/scale/ScaleFactor.jsx (v3.0.2)
// Fixes: ghost pill no-block, same-size badges, green-first-pick, Step 7/8 enforcement,
// improved instructions, disabled label slots after Step 0.

import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 10

const STEP_HEADS = [
  'Label the rectangles',
  'Pick the corresponding sides',
  'Build the scale factor formula (words)',
  'Fill the formula (numerator)',
  'Fill the formula (denominator)',
  'Calculate & Simplify',
  'Build: Original × Scale Factor = Copy',
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
    // scale factor slots
    num: null, den: null,
    slots: { sSF:null, sNUM:null, sDEN:null },
    // step 7 equation words placed?
    eqPlaced: { O:false, SF:false, C:false },
    // step 8 click
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

  const [num, setNum] = useState(persisted.num)
  const [den, setDen] = useState(persisted.den)
  const [slots, setSlots] = useState(persisted.slots)

  const [eqPlaced, setEqPlaced] = useState(persisted.eqPlaced)
  const [missingClicked, setMissingClicked] = useState(persisted.missingClicked)

  const [missingResult, setMissingResult] = useState(persisted.missingResult)

  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [calc, setCalc] = useState(null)

  const saveSnap = ()=>{
    const snap = { version: SNAP_VERSION, problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, eqPlaced, missingClicked, missingResult }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
  }
  useEffect(saveSnap, [problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, eqPlaced, missingClicked, missingResult]) // eslint-disable-line

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

  const formulaReady = slots.sSF && slots.sNUM && slots.sDEN
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

  /* ---------- Step 2: corresponding sides ---------- */
  const clickSide = (shape, edge, orient)=>{
    if(step!==1){ return }
    if(!labels.left || !labels.right){ again(1); return }
    // allow any orient click; only SHOWN is accepted
    if(orient !== shown){
      again(1); return
    }
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
  const onDropFormula = (slotKey, want) => d => {
    if (!testWord(want)(d)) { again(2); return }
    const after = { ...slots, [slotKey]: want }
    setSlots(after)
    const ok = after.sSF==='Scale Factor' && after.sNUM==='Copy' && after.sDEN==='Original'
    if(ok){ done(2); next() }
  }

  /* ---------- Step 4/5 numbers ---------- */
  const dropNum = (where,d)=>{
    if(!testNum(d)) { again(where==='num'?3:4); return }
    const correctCopy = copyVals[shown], correctOrig = origVals[shown]
    if(where==='num'){
      if(d.value===correctCopy){ setNum(d.value); done(3); next() } else again(3)
    } else {
      if(d.value===correctOrig){ setDen(d.value); done(4); next() } else again(4)
    }
  }

  /* ---------- Step 6 calculate ---------- */
  const gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y){[x,y]=[y,x%y]}return x||1}
  const doCalculate=()=>{
    if(num==null||den==null){ again(5); return }
    const g=gcd(num,den), a=num/g, b=den/g, dec=(den!==0)?(num/den):null
    setCalc({num,den,a,b,dec}); done(5)
  }
  const proceedAfterCalc=()=>{ if(calc) next() }

  /* ---------- Step 7 equation (words) ---------- */
  const dropEq = (target, want) => d => {
    if (!testWord(want)(d)) { again(6); return }
    setEqPlaced(prev=>({ ...prev, [target]: true }))
  }
  const eqReady = eqPlaced.O && eqPlaced.SF && eqPlaced.C

  /* ---------- Step 8: must click missing side on the COPY ---------- */
  const handleMissingClick = (shape, edge, orient) => {
    if(step!==7) return
    if(shape!=='copy'){ again(7); return }
    if(orient!==missingPair){ again(7); return }
    setMissingClicked(true); done(7); next()
  }

  /* ---------- New Problem ---------- */
  const newProblem=()=>{
    const p=genScaleProblem()
    setProblem(p); setStep(0); setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setLabels({left:null,right:null})
    setFirstPick(null); setChosen({orig:null,copy:null}); setPicked(false)
    setSlots({sSF:null,sNUM:null,sDEN:null})
    setNum(null); setDen(null); setCalc(null)
    setEqPlaced({O:false,SF:false,C:false})
    setMissingClicked(false)
    setMissingResult(null)
  }

  /* ---------- Tag (number badge) ---------- */
  const Tag = ({id, value, side, orient, shape}) => {
    const cls = 'side-tag '+side
    const isShown = (orient===shown)
    const draggableNow = (step>=3) && isShown
    const handleClick = ()=>{
      if(step===1){ clickSide(shape, side, orient) }
      if(step===7){ handleMissingClick(shape, side, orient) }
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

        {shown==='horizontal' && (
          <Tag id={(isLeft?'o':'c')+"num_h"} value={isLeft?ow:cw} side="top" orient="horizontal" shape={isLeft?'orig':'copy'} />
        )}
        {shown==='vertical' && (
          <Tag id={(isLeft?'o':'c')+"num_v"} value={isLeft?oh:ch} side="left" orient="vertical" shape={isLeft?'orig':'copy'} />
        )}

        {/* Ghost BEFORE side-hit, lower z-index */}
        {isLeft && missingPair==='horizontal' && (
          <span className="side-tag ghost top" style={{...sharedBadgeMetrics, zIndex:5}}>{ow}</span>
        )}
        {isLeft && missingPair==='vertical' && (
          <span className="side-tag ghost left" style={{...sharedBadgeMetrics, zIndex:5}}>{oh}</span>
        )}

        {/* Side-hit zones AFTER ghost, higher z-index */}
        <div
          className={"side-hit top " + (isChosen(isLeft?'orig':'copy','top')?'chosen':'') + " " + (isGood(isLeft?'orig':'copy','top')?'good':'')}
          style={{zIndex:20}}
          onClick={() =>
            (step===1
              ? clickSide(isLeft?'orig':'copy','top','horizontal')
              : step===7
                ? handleMissingClick(isLeft?'orig':'copy','top','horizontal')
                : null)
          }
        />
        <div
          className={"side-hit bottom " + (isChosen(isLeft?'orig':'copy','bottom')?'chosen':'') + " " + (isGood(isLeft?'orig':'copy','bottom')?'good':'')}
          style={{zIndex:20}}
          onClick={() =>
            (step===1
              ? clickSide(isLeft?'orig':'copy','bottom','horizontal')
              : step===7
                ? handleMissingClick(isLeft?'orig':'copy','bottom','horizontal')
                : null)
          }
        />
        <div
          className={"side-hit left " + (isChosen(isLeft?'orig':'copy','left')?'chosen':'') + " " + (isGood(isLeft?'orig':'copy','left')?'good':'')}
          style={{zIndex:20}}
          onClick={() =>
            (step===1
              ? clickSide(isLeft?'orig':'copy','left','vertical')
              : step===7
                ? handleMissingClick(isLeft?'orig':'copy','left','vertical')
                : null)
          }
        />
        <div
          className={"side-hit right " + (isChosen(isLeft?'orig':'copy','right')?'chosen':'') + " " + (isGood(isLeft?'orig':'copy','right')?'good':'')}
          style={{zIndex:20}}
          onClick={() =>
            (step===1
              ? clickSide(isLeft?'orig':'copy','right','vertical')
              : step===7
                ? handleMissingClick(isLeft?'orig':'copy','right','vertical')
                : null)
          }
        />

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

    <div className="fraction-row mt-8 big-fraction">
      {/* [ Scale Factor ] slot */}
      <Slot
        test={testWord('Scale Factor')}
        onDropContent={onDropFormula('sSF','Scale Factor')}
      >
        {slots.sSF
          ? <Draggable id={slots.sSF.id} label={slots.sSF.label} data={slots.sSF} />
          : '_____'}
      </Slot>

      <span>=</span>

      {/* [ Copy / Original ] fraction slots */}
      <div className="fraction ml-6">
        <div>
          <Slot
            test={testWord('Copy')}
            onDropContent={onDropFormula('sNUM','Copy')}
          >
            {slots.sNUM
              ? <Draggable id={slots.sNUM.id} label={slots.sNUM.label} data={slots.sNUM} />
              : '_____'}
          </Slot>
        </div>
        <div className="frac-bar thick"></div>
        <div>
          <Slot
            test={testWord('Original')}
            onDropContent={onDropFormula('sDEN','Original')}
          >
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
                <div className="muted bigger">Drag values from the shapes into the formula (numerator).</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:12}}>
                  <div className="fraction-row">
                    <span>Scale Factor =</span>
                    <div className="fraction ml-6">
                      <div>Copy</div>
                      <div className="frac-bar"></div>
                      <div>Original</div>
                    </div>
                  </div>
                  <div className="fraction ml-12">
                    <div>
                      <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('num',d)}>
                        {num ?? '—'}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>{den ?? '—'}</div>
                  </div>
                </div>
              </div>
            )}

            {step===4 && (
              <div className="section">
                <div className="muted bigger">Drag values from the shapes into the formula (denominator).</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:12}}>
                  <div className="fraction-row">
                    <span>Scale Factor =</span>
                    <div className="fraction ml-6">
                      <div>Copy</div>
                      <div className="frac-bar"></div>
                      <div>Original</div>
                    </div>
                  </div>
                  <div className="fraction ml-12">
                    <div>{num ?? '—'}</div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('den',d)}>
                        {den ?? '—'}
                      </Slot>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step===5 && (
              <div className="section">
                <div className="muted bigger">Tap Calculate to show the math, then Next.</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:12}}>
                  <div className="fraction-row">
                    <span>Scale Factor =</span>
                    <div className="fraction ml-6">
                      <div>Copy</div>
                      <div className="frac-bar"></div>
                      <div>Original</div>
                    </div>
                  </div>
                  <div className="fraction ml-12">
                    <div>{num ?? '—'}</div>
                    <div className="frac-bar"></div>
                    <div>{den ?? '—'}</div>
                  </div>
                </div>
                <div className="chips mt-8">
                  {!calc && <button className="button primary" onClick={doCalculate}>Calculate</button>}
                  {calc && (
                    <div className="calc-steps">
                      <div>= <b>{calc.num}</b> / <b>{calc.den}</b></div>
                      <div>= simplify by GCD → <b>{calc.a}</b> / <b>{calc.b}</b></div>
                      {calc.dec!=null && <div>= decimal ≈ <b>{(calc.dec).toFixed(3)}</b></div>}
                      <div className="toolbar mt-8">
                        <button className="button primary" onClick={proceedAfterCalc}>Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step===6 && (
              <div className="section">
                <div className="muted bigger">Drag words to build: Original × Scale Factor = Copy</div>
                <div className="chips mt-8 chips-lg with-borders" style={{alignItems:'center', gap:8}}>
                  <Slot className="flat" test={testWord('Original')} onDropContent={dropEq('O','Original')}>
                    <span className="slot">Original</span>
                  </Slot>
                  <span>×</span>
                  <Slot className="flat" test={testWord('Scale Factor')} onDropContent={dropEq('SF','Scale Factor')}>
                    <span className="slot">Scale Factor</span>
                  </Slot>
                  <span>=</span>
                  <Slot className="flat" test={testWord('Copy')} onDropContent={dropEq('C','Copy')}>
                    <span className="slot">Copy</span>
                  </Slot>
                </div>
                <div className="chips mt-8 chips-lg with-borders">
                  <Draggable id="wO2"  label="Original"     data={{kind:'word',label:'Original'}} />
                  <Draggable id="wSF2" label="Scale Factor" data={{kind:'word',label:'Scale Factor'}} />
                  <Draggable id="wC2"  label="Copy"         data={{kind:'word',label:'Copy'}} />
                </div>
                <div className="toolbar mt-8">
                  <button className="button primary" disabled={!eqReady} onClick={()=>{ if(eqReady){ done(6); next() } }}>
                    Next
                  </button>
                  {!eqReady && <span className="ml-12 muted">Place all three in order first.</span>}
                </div>
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {step===7 && (
              <div className="section">
                <div className="muted bigger">Click the side on the <b>Copy</b> that is missing (the other orientation).</div>
                {!missingClicked && <div className="mt-8 muted">Tip: it’s the {missingPair==='horizontal'?'top/bottom':'left/right'} edge.</div>}
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {step===8 && (
              <div className="section">
                <div className="muted bigger">We’ll use Original × (Copy/Original) to find the Copy’s missing side.</div>
                <div className="toolbar mt-8">
                  <button className="button success" onClick={()=>{
                    const sf = num/den
                    const origSide = origVals[missingPair]
                    const result = origSide * sf
                    setMissingResult(result); done(8)
                  }}>
                    Compute Missing Side
                  </button>
                </div>
                {missingResult!=null && (
                  <div className="chips mt-10">
                    <span className="badge">Result: {missingResult}</span>
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
