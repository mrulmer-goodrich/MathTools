// src/modules/scale/ScaleFactor.jsx (v3.0.5)
//
// Changes:
// - Responsive left pane sizing (rect SCALE follows window width)
// - More space between rectangles
// - Bigger/shaded chips across Steps 2–5 (persistent look)
// - All side pills draggable during value fill (incl. perpendicular + "?")
// - Larger drop zones; numbers keep bold pill look inside slots
// - Step 3/4 copy updates (“Drag values from the shapes…”; either order OK)
// - Step 5 shows “Divide numerator and denominator by g” and simplified a/b only
// - Step 6: 4 randomized options (× and ÷ distractors)
// - Step 8: shows reduced SF, big result, small celebration + auto-new problem

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
  'Fill the formula (values)',
  'Fill the formula (values)',
  'Calculate & Simplify',
  'Which equation finds the copy?',
  'Identify the missing side on the Copy',
  'Compute missing side'
]

// small util
const gcd = (x, y) => { x=Math.abs(x); y=Math.abs(y); while (y){ [x,y]=[y,x%y] } return x||1 }
const reduce = (n, d) => { const g=gcd(n,d); return {a:n/g, b:d/g, g} }
const getScale = () => {
  if (typeof window === 'undefined') return 6
  const w = window.innerWidth
  if (w < 900) return 5
  if (w < 1200) return 6
  return 7
}

export default function ScaleFactorModule() {
  const [session, setSession] = useState(loadSession())

  const freshSnap = {
    version: SNAP_VERSION,
    problem: genScaleProblem(),
    step: 0,
    steps: STEP_HEADS.map(()=>({misses:0,done:false})),
    labels: { left:null, right:null },
    firstPick: null,
    chosen: { orig:null, copy:null },
    picked: false,
    num: null, den: null,
    slots: { sSF:null, sNUM:null, sDEN:null },
    eqChoice: null,
    missingClicked: false,
    missingResult: null,
    calc: null
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

  const [eqChoice, setEqChoice] = useState(persisted.eqChoice)
  const [missingClicked, setMissingClicked] = useState(persisted.missingClicked)
  const [missingResult, setMissingResult] = useState(persisted.missingResult)
  const [calc, setCalc] = useState(persisted.calc)

  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // responsive SCALE used for rectangles + tag sizing
  const [pxScale, setPxScale] = useState(getScale())
  useEffect(() => {
    const onResize = () => setPxScale(getScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const saveSnap = ()=>{
    const snap = {
      version: SNAP_VERSION, problem, step, steps, labels,
      firstPick, chosen, picked, num, den, slots,
      eqChoice, missingClicked, missingResult, calc
    }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
  }
  useEffect(saveSnap, [problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, eqChoice, missingClicked, missingResult, calc]) // eslint-disable-line

  const miss  = (i)=>setSteps(s=>{const c=[...s];c[i].misses++;return c})
  const done  = (i)=>setSteps(s=>{const c=[...s];c[i].done=true;return c})
  const next  = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))
  const again = (i,msg='Try Again!')=>{ miss(i); setErrorMsg(msg); setTimeout(()=>setErrorMsg(''), 1200) }

  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w,     ch = problem.copy.h
  const shown = problem.shownPair          // 'horizontal' | 'vertical'
  const missingPair = problem.missingPair  // opposite

  /* ---------- Rectangle sizing ---------- */
  const rectStyle = (w,h)=>{
    const W = Math.max(110, w*pxScale)
    const H = Math.max(90,  h*pxScale)
    return { width: W+'px', height: H+'px' }
  }

  /* ---------- Shared badge metrics ---------- */
  const sharedBadgeMetrics = useMemo(()=>{
    let basis = shown==='horizontal' ? Math.min(ow, cw)*pxScale : Math.min(oh, ch)*pxScale
    const font = Math.max(18, Math.min(28, Math.floor(basis/6)))
    const padV = Math.round(font*0.45)
    const padH = Math.round(font*0.65)
    return { '--badge-font': `${font}px`, '--badge-pad-v': `${padV}px`, '--badge-pad-h': `${padH}px` }
  }, [ow,oh,cw,ch,shown,pxScale])

  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }

  const wordBank = useMemo(()=>{
    const src = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    for(let i=src.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [src[i],src[j]]=[src[j],src[i]] }
    return src.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  }, [problem.id])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum  = d => d?.kind==='num' && typeof d.value === 'number'

  /* ---------- Step 0: label drop ---------- */
  const dropLabelOnRect = (side) => (d) => {
    if (side==='left' && testWord('Original')(d)) {
      const after = { ...labels, left: 'Original' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else if (side==='right' && testWord('Copy')(d)) {
      const after = { ...labels, right: 'Copy' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else { again(0) }
  }

  /* ---------- Step 1: corresponding sides ---------- */
  const clickSide = (shape, edge, orient)=>{
    if(step!==1){ return }
    if(!labels.left || !labels.right){ again(1); return }
    if(orient !== shown){ again(1); return }
    if(!firstPick){ setFirstPick({shape,edge,orient}) }
    else{
      if(firstPick.shape !== shape && firstPick.orient===orient){
        const pair = { orig: (shape==='orig'? firstPick.edge : edge), copy: (shape==='copy'? firstPick.edge : edge) }
        setChosen(pair); setPicked(true); setFirstPick(null); done(1); next()
      } else { setFirstPick(null); again(1) }
    }
  }
  const isChosen=(s,e)=> step===1 && firstPick && firstPick.shape===s && firstPick.edge===e
  const isGood  =(s,e)=> step>=2 && picked && ((s==='orig' && chosen.orig===e) || (s==='copy' && chosen.copy===e))

  /* ---------- Step 2 (words) ---------- */
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

  /* ---------- Step 3/4 numbers (either order) ---------- */
  const correctCopy = copyVals[shown], correctOrig = origVals[shown]
  const dropNum = (where, d) => {
    if (where==='num') {
      if (testNum(d) && d.value === correctCopy) setNum(d.value)
      else { again(3); return }
    } else {
      if (testNum(d) && d.value === correctOrig) setDen(d.value)
      else { again(4); return }
    }
    // advance when both present
    if (num!=null && where==='den') { done(4); next() }
    if (den!=null && where==='num') { done(3); next() }
  }

  /* ---------- Step 5 calculate ---------- */
  const doCalculate = ()=>{
    if(num==null||den==null){ again(5); return }
    const {a,b,g} = reduce(num,den)
    setCalc({num,den,a,b,g}); done(5)
  }
  const proceedAfterCalc = ()=>{ if(calc) next() }

  /* ---------- Step 6: concept check with 4 randomized options ---------- */
  const eqOptions = useMemo(()=>{
    const opts = [
      { id:'ok',  text:'Original × Scale Factor = Copy',   ok:true },
      { id:'d1',  text:'Original ÷ Scale Factor = Copy',   ok:false },
      { id:'d2',  text:'Copy × Scale Factor = Original',   ok:false },
      { id:'d3',  text:'Original × Copy = Scale Factor',   ok:false },
    ]
    for(let i=opts.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [opts[i],opts[j]]=[opts[j],opts[i]] }
    return opts
  }, [problem.id])

  const onDropEq = d => {
    if (d?.kind!=='word') return
    const ok = d.label === 'Original × Scale Factor = Copy'
    if (ok) { setEqChoice('ok'); done(6); next() }
    else again(6)
  }

  /* ---------- Step 7 click missing side on COPY ---------- */
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
    setEqChoice(null)
    setMissingClicked(false); setMissingResult(null)
  }

  /* ---------- Tag (number badge) ---------- */
  const Tag = ({id, value, side, orient, shape, isQuestion}) => {
    const cls = 'side-tag '+side
    const handleClick = ()=>{
      if(step===1){ clickSide(shape, side, orient) }
      if(step===7){ handleMissingClick(shape, side, orient) }
    }
    // Step >= 3: everything is draggable (including perpendicular and “?”)
    if (step>=3) {
      const data = isQuestion
        ? {kind:'num', value: NaN} // distractor still draggable
        : {kind:'num', value}
      return <Draggable id={id} label={isQuestion ? '?' : String(value)} data={data} className={cls} style={sharedBadgeMetrics} />
    }
    return <span className={cls} style={sharedBadgeMetrics} onClick={handleClick}>{isQuestion ? '?' : value}</span>
  }

  /* ---------- Rect ---------- */
  const RectWithLabel = ({which})=>{
    const isLeft = which==='orig'
    const w = isLeft ? ow : cw
    const h = isLeft ? oh : ch

    const baseRect = (
      <div className={`rect ${!isLeft ? 'copy' : ''}`} style={rectStyle(w,h)}>
        <div className={"shape-label-center "+(!labels[isLeft?'left':'right']?'hidden':'')}>
          {labels[isLeft?'left':'right'] || ''}
        </div>

        {/* Shown pair numbers */}
        {shown==='horizontal' && (
          <Tag id={(isLeft?'o':'c')+"num_h"} value={isLeft?ow:cw} side="top" orient="horizontal" shape={isLeft?'orig':'copy'} />
        )}
        {shown==='vertical' && (
          <Tag id={(isLeft?'o':'c')+"num_v"} value={isLeft?oh:ch} side="left" orient="vertical" shape={isLeft?'orig':'copy'} />
        )}

        {/* Perpendicular: real value on ORIGINAL; “?” distractor on COPY */}
        {isLeft && missingPair==='horizontal' && (
          <Tag id="orig-perp-h" value={ow} side="bottom" orient="horizontal" shape="orig" />
        )}
        {isLeft && missingPair==='vertical' && (
          <Tag id="orig-perp-v" value={oh} side="right" orient="vertical" shape="orig" />
        )}
        {!isLeft && missingPair==='horizontal' && (
          <Tag id="copy-q-h" value={cw} side="bottom" orient="horizontal" shape="copy" isQuestion />
        )}
        {!isLeft && missingPair==='vertical' && (
          <Tag id="copy-q-v" value={ch} side="right" orient="vertical" shape="copy" isQuestion />
        )}

        {/* Click hit zones for step 1 + 7 */}
        <div className={"side-hit top "+(isChosen(isLeft?'orig':'copy','top')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','top')?'good':'')}
             onClick={()=> (step===1? clickSide(isLeft?'orig':'copy','top','horizontal') : step===7? handleMissingClick(isLeft?'orig':'copy','top','horizontal'):null) }/>
        <div className={"side-hit bottom "+(isChosen(isLeft?'orig':'copy','bottom')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','bottom')?'good':'')}
             onClick={()=> (step===1? clickSide(isLeft?'orig':'copy','bottom','horizontal') : step===7? handleMissingClick(isLeft?'orig':'copy','bottom','horizontal'):null) }/>
        <div className={"side-hit left "+(isChosen(isLeft?'orig':'copy','left')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','left')?'good':'')}
             onClick={()=> (step===1? clickSide(isLeft?'orig':'copy','left','vertical') : step===7? handleMissingClick(isLeft?'orig':'copy','left','vertical'):null) }/>
        <div className={"side-hit right "+(isChosen(isLeft?'orig':'copy','right')?'chosen':'')+" "+(isGood(isLeft?'orig':'copy','right')?'good':'')}
             onClick={()=> (step===1? clickSide(isLeft?'orig':'copy','right','vertical') : step===7? handleMissingClick(isLeft?'orig':'copy','right','vertical'):null) }/>
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

  /* ---------- UI ---------- */
  const bigUI = step>=2 && step<=5

  // simplified fraction (if available)
  const simp = useMemo(()=> (num!=null && den!=null) ? reduce(num,den) : null, [num,den])

  return (
    <div className="container">
      <div className={`panes equal ${bigUI ? 'big-ui' : ''}`}>
        {/* LEFT: shapes */}
        <div className="card shape-area">
          <div className="rects" style={sharedBadgeMetrics}>
            <RectWithLabel which="orig" />
            <RectWithLabel which="copy" />
          </div>
          <button className="button primary big-under" onClick={newProblem}>New Problem</button>
        </div>

        {/* RIGHT: steps */}
        <div className={`card right-steps ${bigUI ? 'big-ui' : ''}`}>
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
                    <div className="frac-bar thick"></div>
                    <div>
                      <Slot test={testWord('Original')} onDropContent={onDropFormula('sDEN','Original')}>
                        {slots.sDEN ? <Draggable id={slots.sDEN.id} label={slots.sDEN.label} data={slots.sDEN} /> : '_____'}
                      </Slot>
                    </div>
                  </div>
                </div>
                <div className="chips chips-lg with-borders">
                  {wordBank.map(w => <Draggable key={w.id} id={w.id} label={w.label} data={w} />)}
                </div>
              </div>
            )}

            {(step===3 || step===4) && (
              <div className="section">
                <div className="muted bigger">Drag values from the shapes into the formula.</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:16}}>
                  <div className="fraction-row">
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
                </div>
              </div>
            )}

            {step===5 && (
              <div className="section">
                <div className="muted bigger">Tap Calculate to show the math, then Next.</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:16}}>
                  <div className="fraction-row">
                    <span className="chip static">Scale Factor</span>
                    <span>=</span>
                    <div className="fraction ml-6">
                      <div><span className="chip static">Copy</span></div>
                      <div className="frac-bar"></div>
                      <div><span className="chip static">Original</span></div>
                    </div>
                  </div>
                  <div className="fraction ml-12">
                    <div>{num == null ? '—' : <span className="chip">{num}</span>}</div>
                    <div className="frac-bar"></div>
                    <div>{den == null ? '—' : <span className="chip">{den}</span>}</div>
                  </div>
                </div>
                <div className="chips mt-10">
                  {!calc && <button className="button primary" onClick={doCalculate}>Calculate</button>}
                  {calc && (
                    <div className="calc-steps">
                      <div>= <b>{calc.num}</b> / <b>{calc.den}</b></div>
                      <div>= divide numerator and denominator by <b>{calc.g}</b></div>
                      <div>= <b>{calc.a}</b> / <b>{calc.b}</b></div>
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
                <div className="muted bigger">Which equation correctly finds the copy?</div>
                <div className="chips mt-10 chips-lg with-borders">
                  {eqOptions.map(o=>(
                    <Draggable key={o.id} id={o.id} label={o.text} data={{kind:'word', label:o.text}} />
                  ))}
                </div>
                <div className="chips mt-10">
                  <Slot className="flat wide" test={d=>d?.kind==='word'} onDropContent={onDropEq}>
                    <span className="slot">Drop answer here</span>
                  </Slot>
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
                <div className="muted bigger">We’ll use <b>Original × Scale Factor = Copy</b>.</div>
                <div className="chips mt-8">
                  <span className="badge">Scale Factor: {simp ? `${simp.a}/${simp.b}` : `${num}/${den}`}</span>
                </div>
                <div className="toolbar mt-10">
                  <button className="button success" onClick={()=>{
                    const r = origVals[missingPair] * ((num/den))
                    setMissingResult(r); done(8)
                    setTimeout(()=>{ newProblem() }, 1400)
                  }}>
                    Compute Missing Side
                  </button>
                </div>
                {missingResult!=null && (
                  <div className="chips mt-12">
                    <span className="result-big">Result: {Number.isInteger(missingResult) ? missingResult : (missingResult.toFixed(1))} ✨</span>
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
