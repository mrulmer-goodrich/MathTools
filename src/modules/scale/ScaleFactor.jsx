// src/modules/scale/ScaleFactor.jsx — FULL REPLACEMENT (v3.6.3)
/*
  Changes from 3.6.2 -> 3.6.3
  - Step 4 row compaction: narrower fractions + stacked ÷g chips (reduced padding/width) to prevent wrap.
  - Step 5 copy clarified: explicitly tells learners to drag the number from the Original.
  - Scale factor display on Step 5 shows WHOLE NUMBER when denom==1.
*/

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 18

const STEP_HEADS = [
  'Label the rectangles',
  'Pick the corresponding sides that have values',
  'Build the scale factor formula (words)',
  'Fill the values from the shapes',
  'Calculate & Simplify',
  'Now we can compute the length of the missing side'
]

/* --- continuous confetti --- */
function Confetti({show}){
  if(!show) return null
  const COUNT = 90
  const pieces = Array.from({length:COUNT}).map((_,i)=>{
    const left = Math.random()*100
    const delay = Math.random()*2
    const duration = 3.8 + Math.random()*2.2
    const size = 6 + Math.floor(Math.random()*8)
    const rot = Math.floor(Math.random()*360)
    const colors = ['#16a34a','#06b6d4','#f59e0b','#ef4444','#8b5cf6','#0ea5e9']
    const color = colors[i % colors.length]
    return (
      <div key={i}
        className="sf-confetti-piece"
        style={{
          left: left+'%',
          width: size+'px',
          height: (size+4)+'px',
          background: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          animationIterationCount: 'infinite',
          transform: `rotate(${rot}deg)`
        }}
      />
    )
  })
  return <div className="sf-confetti">{pieces}</div>
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
    calc: null,
    calcStage: 0,       // 0 none, 1 show ÷g, 2 show simplified, 3 show whole(if any), 4 finished
    // Step 5 state
    s5: { f1:null, f2:null, f3:null, origVal:null, computed:false },
    confetti: false,
    missingResult: null
  }

  const persisted = (session.scaleSnap && session.scaleSnap.version===SNAP_VERSION)
    ? session.scaleSnap
    : freshSnap

  const [problem, setProblem] = useState(persisted.problem)
  const [step, setStep] = useState(persisted.step)
  const [steps, setSteps] = useState(persisted.steps)
  const [labels, setLabels] = useState(persisted.labels)

  const [firstPick, setFirstPick] = useState(persisted.firstPick)
  const [chosen, setChosen]       = useState(persisted.chosen)
  const [picked, setPicked]       = useState(persisted.picked)

  const [num, setNum] = useState(persisted.num)
  const [den, setDen] = useState(persisted.den)
  const [slots, setSlots] = useState(persisted.slots)

  const [calc, setCalc] = useState(persisted.calc)
  const [calcStage, setCalcStage] = useState(persisted.calcStage || 0)

  const [s5, setS5] = useState(persisted.s5 || { f1:null, f2:null, f3:null, origVal:null, computed:false })
  const [missingResult, setMissingResult]   = useState(persisted.missingResult)
  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showConfetti, setShowConfetti] = useState(!!persisted.confetti)

  const timersRef = useRef([])

  // Persist snapshot
  useEffect(()=>{
    const snap = { version: SNAP_VERSION, problem, step, steps, labels,
      firstPick, chosen, picked, num, den, slots, calc, calcStage, s5, confetti: showConfetti, missingResult }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
  }, [problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, calc, calcStage, s5, showConfetti, missingResult]) // eslint-disable-line

  const miss  = (i)=>setSteps(s=>{const c=[...s];c[i].misses++;return c})
  const done  = (i)=>setSteps(s=>{const c=[...s];c[i].done=true;return c})
  const next  = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))
  const again = (i,msg='Try Again!')=>{ miss(i); setErrorMsg(msg); setTimeout(()=>setErrorMsg(''), 1200) }

  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w,     ch = problem.copy.h
  const shown       = problem.shownPair          // 'horizontal' | 'vertical'
  const missingPair = problem.missingPair        // opposite

  /* ---------- RECTANGLE PRESETS (not to scale) ---------- */
  const SMALL = { w: 130, h: 180 }
  const LARGE = { w: 220, h: 300 }
  const origArea = ow*oh, copyArea = cw*ch
  const origPreset = (origArea >= copyArea) ? LARGE : SMALL
  const copyPreset = (copyArea >  origArea) ? LARGE : SMALL
  const rectStyle = (preset)=>({ width: preset.w+'px', height: preset.h+'px' })

  /* ---------- Shared badge metrics (same size) ---------- */
  const sharedBadgeMetrics = useMemo(()=>{
    const basis = Math.max(SMALL.w, SMALL.h) * 0.5
    const font = Math.max(18, Math.min(28, Math.floor(basis/6)))
    const padV = Math.round(font*0.45)
    const padH = Math.round(font*0.65)
    const border = 4
    const outerH = font + (2*padV) + border
    const offset = Math.ceil(outerH/2)
    return {
      '--badge-font': `${font}px`,
      '--badge-pad-v': `${padV}px`,
      '--badge-pad-h': `${padH}px`,
      '--badge-offset': `${offset}px`,
      paddingTop: `${offset+6}px`,
      paddingLeft: `${offset+6}px`,
      paddingRight: `${offset+6}px`,
      paddingBottom: `${offset+6}px`
    }
  }, [])

  const origVals = { horizontal: ow, vertical: oh }
  const copyVals = { horizontal: cw, vertical: ch }

  const wordBank = useMemo(()=>{
    const src = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    for(let i=src.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [src[i],src[j]]=[src[j],src[i]] }
    return src.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  }, [problem.id])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum  = d => d?.kind==='num'

  /* ---------- Helpers ---------- */
  const dropLabelOnRect = (side) => (d) => {
    if (side==='left' && testWord('Original')(d)) {
      const after = { ...labels, left: 'Original' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else if (side==='right' && testWord('Copy')(d)) {
      const after = { ...labels, right: 'Copy' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else { again(0) }
  }

  const clickSide = (shape, edge, orient)=>{
    if(step!==1){ return }
    if(!labels.left || !labels.right){ again(1); return }
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

  // Step 2: words
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

  // Step 3: values (either order)
  const dropValue = (where, d)=>{
    if(!testNum(d)) { again(3); return }
    const correctCopy = copyVals[shown], correctOrig = origVals[shown]
    if(where==='num'){
      if(d.value===correctCopy){ setNum(d.value) } else { again(3); return }
    } else {
      if(d.value===correctOrig){ setDen(d.value) } else { again(3); return }
    }
    setTimeout(()=>{
      const hasNum = (where==='num' ? d.value : num) != null
      const hasDen = (where!=='num' ? d.value : den) != null
      if(hasNum && hasDen){ done(3); next() }
    }, 0)
  }

  // Step 4: calculate & simplify (row + staged)
  const gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y){[x,y]=[y,x%y]}return x||1}
  const startCalcAnimation=()=>{
    if(num==null||den==null){ again(4); return }
    const g=gcd(num,den), a=num/g, b=den/g
    setCalc({num,den,a,b,g})
    setCalcStage(1) // show ÷(GCD) momentarily
    timersRef.current.forEach(id=>clearTimeout(id)); timersRef.current=[]
    timersRef.current.push(setTimeout(()=>setCalcStage(2), 900))
    if(b===1){
      timersRef.current.push(setTimeout(()=>setCalcStage(3), 1800))
      timersRef.current.push(setTimeout(()=>setCalcStage(4), 2700))
    } else {
      timersRef.current.push(setTimeout(()=>setCalcStage(4), 1800))
    }
  }

  useEffect(()=>{
    return () => { timersRef.current.forEach(id=>clearTimeout(id)); timersRef.current=[] }
  }, [])

  const newProblem=()=>{
    timersRef.current.forEach(id=>clearTimeout(id)); timersRef.current=[]
    const p=genScaleProblem()
    setProblem(p); setStep(0); setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setLabels({left:null,right:null})
    setFirstPick(null); setChosen({orig:null,copy:null}); setPicked(false)
    setSlots({sSF:null,sNUM:null,sDEN:null})
    setNum(null); setDen(null); setCalc(null); setCalcStage(0)
    setS5({ f1:null, f2:null, f3:null, origVal:null, computed:false })
    setMissingResult(null); setShowConfetti(false)
  }

  /* ---------- Step 5 helpers ---------- */
  const onDropS5Word = (slotKey, want) => (d) => {
    if (!testWord(want)(d)) { again(5); return }
    setS5(prev => ({ ...prev, [slotKey]: d }))
  }

  const onDropS5OrigVal = (d) => {
    if (!testNum(d)) { again(5); return }
    const correct = origVals[missingPair]
    if (d.value !== correct) { again(5); return }
    setS5(prev => ({ ...prev, origVal: d.value }))
  }

  const wordsOK = s5.f1?.label==='Original' && s5.f2?.label==='Scale Factor' && s5.f3?.label==='Copy'
  const canArmCompute = () => {
    const haveOrig = s5.origVal != null
    return wordsOK && haveOrig && (calc || (num!=null && den!=null))
  }

  const doComputeMissing = () => {
    const sf = (calc ? (calc.a/ calc.b) : (num/den))
    const origSide = origVals[missingPair]
    const result = Math.round((origSide * sf + Number.EPSILON) * 10) / 10
    setMissingResult(result)
    setS5(prev => ({ ...prev, computed:true }))
    setShowConfetti(true)
    done(5)
  }

  /* ---------- Pill / Tag ---------- */
  const Tag = ({ id, value, side, orient, shapeKey }) => {
    const cls = 'side-tag ' + side
    const displayVal = (value==='?' && !isNaN(missingResult) && shapeKey==='copy' && ((orient==='horizontal' && missingPair==='horizontal') || (orient==='vertical' && missingPair==='vertical')))
      ? missingResult
      : value
    const draggableNow = (step >= 3) && (displayVal !== '?' && displayVal != null && displayVal !== '')
    const onClick = () => { if(step===1) clickSide(shapeKey, side, orient) }
    if (draggableNow) {
      return (
        <span className={cls} onClick={onClick} style={{fontSize:'var(--badge-font)', padding:`var(--badge-pad-v) var(--badge-pad-h)`}}>
          <Draggable id={id} label={String(displayVal)} data={{ kind: 'num', value: displayVal }} />
        </span>
      )
    }
    return (
      <span className={cls} onClick={onClick} style={{fontSize:'var(--badge-font)', padding:`var(--badge-pad-v) var(--badge-pad-h)`}}>
        {displayVal}
      </span>
    )
  }

  // value helper
  const valueFor = (isLeft, orient) => {
    if (orient==='horizontal') {
      if (isLeft) return ow
      return (missingPair==='horizontal') ? '?' : cw
    } else {
      if (isLeft) return oh
      return (missingPair==='vertical') ? '?' : ch
    }
  }

  /* ---------- Rect ---------- */
  const RectWithLabel = ({which})=>{
    const isLeft = which==='orig'
    const shapeKey = isLeft ? 'orig' : 'copy'
    const preset = isLeft ? origPreset : copyPreset

    const hitCls = (side, orient) => {
      const chosen = isChosen(shapeKey, side)
      const good   = isGood(shapeKey, side)
      return `side-hit ${side}${chosen?' chosen':''}${good?' good':''}`
    }

    const baseRect = (
      <div className={`rect ${!isLeft ? 'copy' : ''}`} style={rectStyle(preset)}>
        <div className={"shape-label-center "+(!labels[isLeft?'left':'right']?'hidden':'')}>{labels[isLeft?'left':'right'] || ''}</div>

        {/* Horizontal pill (top) */}
        <Tag id={(isLeft?'o':'c')+"num_h"} value={valueFor(isLeft,'horizontal')} side="top" orient="horizontal" shapeKey={shapeKey} />

        {/* Vertical pill (left) */}
        <Tag id={(isLeft?'o':'c')+"num_v"} value={valueFor(isLeft,'vertical')} side="left" orient="vertical" shapeKey={shapeKey} />

        {/* WIDE click strips (Step 1 only) */}
        <div className={hitCls('top','horizontal')} onClick={()=>{ if (step===1) clickSide(shapeKey,'top','horizontal') }} />
        <div className={hitCls('left','vertical')} onClick={()=>{ if (step===1) clickSide(shapeKey,'left','vertical') }} />
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

  /* ---------- Render ---------- */
  const newBtnClass = "button primary big-under" + (missingResult!=null ? " flash" : "")

  const MiniFraction = ({top, bottom}) => (
    <div className="fraction mini-frac">
      <div><span className="chip chip-tiny">{top}</span></div>
      <div className="frac-bar narrow"></div>
      <div><span className="chip chip-tiny">{bottom}</span></div>
    </div>
  )

  const StackedDivide = ({ g, visible }) => (
  <div className={visible ? 'stack-op sf-fade' : 'stack-op sf-hidden'} aria-hidden={!visible}>
    <span className="chip chip-tiny">{"÷\u202F" + (g ?? "")}</span>
    <span className="chip chip-tiny">{"÷\u202F" + (g ?? "")}</span>
  </div>
)

  const stage1 = calcStage>=1
  const stage2 = calcStage>=2
  const stage3 = calcStage>=3 && calc?.b===1
  const stageDone = calcStage>=4 || (calcStage>=3 && calc && calc.b!==1)

  const sfString = calc
    ? (calc.b===1 ? `${calc.a}` : `${calc.a}/${calc.b}`)
    : (num && den ? `${num}/${den}` : '—')

  return (
    <div className="container">
      <Confetti show={showConfetti} />

      <div className="panes equal">
        {/* LEFT: shapes */}
        <div className="card shape-area">
          <div className="rects" style={sharedBadgeMetrics}>
            <RectWithLabel which="orig" />
            <RectWithLabel which="copy" />
          </div>
          <button className={newBtnClass} onClick={newProblem}>New Problem</button>
        </div>

        {/* RIGHT: steps */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title question-xl">{STEP_HEADS[step]}</div>

            {/* Step 0 */}
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

            {/* Step 1 */}
            {step===1 && (
              <div className="section">
                <div className="muted bigger">Click one side on a rectangle, then click the matching side on the other rectangle.</div>
              </div>
            )}

            {/* Step 2: words */}
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
                  {wordBank.map(w=><Draggable key={w.id} id={w.id} label={w.label} data={w} />)}
                </div>
              </div>
            )}

            {/* Step 3: values (either order) */}
            {step===3 && (
              <div className="section">
                <div className="muted bigger">Drag values from the shapes into the formula.</div>
                <div className="row mt-8" style={{alignItems:'center', flexWrap:'wrap', gap:12}}>
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
                      <Slot test={testNum} onDropContent={(d)=>dropValue('num',d)}>
                        {num == null ? '—' : <span className="chip">{num}</span>}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={testNum} onDropContent={(d)=>dropValue('den',d)}>
                        {den == null ? '—' : <span className="chip">{den}</span>}
                      </Slot>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: calculate & simplify (single-row + confirm) */}
            {step===4 && (
              <div className="section">
                <div className="muted bigger">Tap Calculate, watch the simplification appear from left to right, then confirm.</div>
                <div className="calc-row mt-8">
                  <MiniFraction top={num} bottom={den} />
                  {<StackedDivide g={calc?.g} visible={calcStage>=1} />}
                  <span className={calcStage>=2 ? 'sf-fade' : 'sf-hidden'} aria-hidden={!(calcStage>=2)}>=</span>
                  <div className={calcStage>=2 ? 'sf-fade' : 'sf-hidden'} aria-hidden={!(calcStage>=2)}>
                    <MiniFraction top={calc?.a ?? '—'} bottom={calc?.b ?? '—'} />
                  </div>
                  {calc?.b===1 && (
                    <>
                      <span className={calcStage>=3 ? 'sf-fade' : 'sf-hidden'} aria-hidden={!(calcStage>=3)}>=</span>
                      <div className={calcStage>=3 ? 'sf-fade' : 'sf-hidden'} aria-hidden={!(calcStage>=3)}>
                        <span className="chip chip-tiny">{calc?.a ?? '—'}</span>
                      </div>
                    </>
                  )}
                  {!calc && <button className="button primary" onClick={startCalcAnimation}>Calculate</button>}
                  {calc && (
                    <button className="button primary" disabled={!((calcStage>=4) || (calc && calc.b!==1 && calcStage>=3))} onClick={()=>{ done(4); next(); }}>
                      I understand
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: compute missing side (clear grid) */}
            {step===5 && (
              <div className="section">
                <div className="muted bigger">Drag the number from the <b>Original</b> (left rectangle) that matches the missing side, then press Compute.</div>

                {/* Formula words row */}
                <div className="fraction-row mt-8 big-fraction">
                  <div>
                    <Slot test={testWord('Original')} onDropContent={onDropS5Word('f1','Original')}>
                      {s5.f1 ? <Draggable id="s5f1" label={s5.f1.label} data={s5.f1} /> : '_____'}
                    </Slot>
                  </div>
                  <span>×</span>
                  <div>
                    <Slot test={testWord('Scale Factor')} onDropContent={onDropS5Word('f2','Scale Factor')}>
                      {s5.f2 ? <Draggable id="s5f2" label={s5.f2.label} data={s5.f2} /> : '_____'}
                    </Slot>
                  </div>
                  <span>=</span>
                  <div>
                    <Slot test={testWord('Copy')} onDropContent={onDropS5Word('f3','Copy')}>
                      {s5.f3 ? <Draggable id="s5f3" label={s5.f3.label} data={s5.f3} /> : '_____'}
                    </Slot>
                  </div>
                </div>

                {/* Word chips (randomized each problem) */}
                <div className="chips chips-lg with-borders mt-10">
                  {['Original','Scale Factor','Copy'].sort(()=>Math.random()-0.5).map((w,i)=>(
                    <Draggable key={'s5w'+i} id={'s5w'+i} label={w} data={{kind:'word', label:w}} />
                  ))}
                </div>

                {/* Plug in numbers */}
                <div className="muted bigger mt-10">Plug in the numbers:</div>
                <div className="compute-grid mt-8">
                  <div className="col">
                    <div className="muted small">Original</div>
                    <Slot test={testNum} onDropContent={onDropS5OrigVal}>
                      {s5.origVal == null ? '—' : <span className="chip">{s5.origVal}</span>}
                    </Slot>
                  </div>
                  <div className="op">×</div>
                  <div className="col">
                    <div className="muted small">Scale Factor</div>
                    <div className={wordsOK ? 'sf-fade' : 'sf-hidden'}>
                      <span className="chip">{sfString}</span>
                    </div>
                  </div>
                  <div className="op">=</div>
                  <div className="col">
                    <div className="muted small">Copy</div>
                    <div>
                      {s5.computed && missingResult!=null ? <span className="chip" style={{fontSize:'22px'}}>{Number.isInteger(missingResult) ? missingResult : missingResult.toFixed(1)}</span> : '—'}
                    </div>
                  </div>
                </div>
                <div className="center mt-10">
                  <button
                    className={"button success " + (canArmCompute() ? "flash" : "")}
                    disabled={!canArmCompute()}
                    onClick={doComputeMissing}
                  >
                    Compute
                  </button>
                </div>
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
