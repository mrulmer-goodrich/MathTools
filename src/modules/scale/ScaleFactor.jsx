// src/modules/scale/ScaleFactor.jsx — Restored Logic + UX (v3.6.4)
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
        style={{ left:left+'%', width:size+'px', height:(size+4)+'px', background:color,
                 animationDelay:`${delay}s`, animationDuration:`${duration}s`, animationIterationCount:'infinite',
                 transform:`rotate(${rot}deg)` }}
      />
    )
  })
  return <div className="sf-confetti">{pieces}</div>
}

export default function ScaleFactorModule() {
  const [session, setSession] = useState(loadSession() || {})
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
    calcStage: 0, // 0 none, 1 ÷g, 2 a/b, 3 whole(if any), 4 finished
    s5: { f1:null, f2:null, f3:null, origVal:null, computed:false },
    confetti: false,
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
  const [calc, setCalc] = useState(persisted.calc)
  const [calcStage, setCalcStage] = useState(persisted.calcStage || 0)
  const [s5, setS5] = useState(persisted.s5 || { f1:null, f2:null, f3:null, origVal:null, computed:false })
  const [missingResult, setMissingResult] = useState(persisted.missingResult)
  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showConfetti, setShowConfetti] = useState(!!persisted.confetti)

  const timersRef = useRef([])

  // Persist snapshot
  useEffect(()=>{
    const snap = { version: SNAP_VERSION, problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, calc, calcStage, s5, confetti: showConfetti, missingResult }
    const next = { ...(session||{}), scaleSnap: snap }
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

  /* Preset rectangles (not to scale, but consistent) */
  const SMALL = { w: 130, h: 180 }
  const LARGE = { w: 220, h: 300 }
  const origArea = ow*oh, copyArea = cw*ch
  const origPreset = (origArea >= copyArea) ? LARGE : SMALL
  const copyPreset = (copyArea >  origArea) ? LARGE : SMALL
  const rectStyle = (preset)=>({ width: preset.w+'px', height: preset.h+'px' })

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

  const gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y){[x,y]=[y,x%y]}return x||1}
  const startCalcAnimation=()=>{
    if(num==null||den==null){ again(4); return }
    const g=gcd(num,den), a=num/g, b=den/g
    setCalc({num,den,a,b,g})
    setCalcStage(1)
    timersRef.current.forEach(id=>clearTimeout(id)); timersRef.current=[]
    timersRef.current.push(setTimeout(()=>setCalcStage(2), 900))
    if(b===1){
      timersRef.current.push(setTimeout(()=>setCalcStage(3), 1800))
      timersRef.current.push(setTimeout(()=>setCalcStage(4), 2700))
    } else {
      timersRef.current.push(setTimeout(()=>setCalcStage(4), 1800))
    }
  }
  useEffect(()=>()=>{ timersRef.current.forEach(id=>clearTimeout(id)); timersRef.current=[] }, [])

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

  const valueFor = (isLeft, orient) => {
    if (orient==='horizontal') { return isLeft ? ow : (missingPair==='horizontal' ? '?' : cw) }
    return isLeft ? oh : (missingPair==='vertical' ? '?' : ch)
  }

  return (
    <div className="container">
      <div className="panes">
        {/* LEFT */}
        <div className="card shape-area" style={{position:'relative'}}>
          <div className="rects">
            <div className="rect" style={rectStyle(origPreset)}>
              <div className={'side-hit top '+(isChosen('orig','horizontal')?'chosen':'')+(isGood('orig','horizontal')?' good':'')} onClick={()=>clickSide('orig','horizontal','horizontal')} aria-label="Top side of Original"></div>
              <div className={'side-hit left '+(isChosen('orig','vertical')?'chosen':'')+(isGood('orig','vertical')?' good':'')} onClick={()=>clickSide('orig','vertical','vertical')} aria-label="Left side of Original"></div>
              <span className="shape-label-center" style={{bottom:'10px'}}>Original</span>
              <Tag id="o-top" value={valueFor(true,'horizontal')} side="top" orient="horizontal" shapeKey="orig" />
              <Tag id="o-left" value={valueFor(true,'vertical')}   side="left" orient="vertical"   shapeKey="orig" />
            </div>
            <div className="rect copy" style={rectStyle(copyPreset)}>
              <div className={'side-hit top '+(isChosen('copy','horizontal')?'chosen':'')+(isGood('copy','horizontal')?' good':'')} onClick={()=>clickSide('copy','horizontal','horizontal')} aria-label="Top side of Copy"></div>
              <div className={'side-hit left '+(isChosen('copy','vertical')?'chosen':'')+(isGood('copy','vertical')?' good':'')} onClick={()=>clickSide('copy','vertical','vertical')} aria-label="Left side of Copy"></div>
              <span className="shape-label-center" style={{bottom:'10px'}}>Copy</span>
              <Tag id="c-top" value={valueFor(false,'horizontal')} side="top" orient="horizontal" shapeKey="copy" />
              <Tag id="c-left" value={valueFor(false,'vertical')}   side="left" orient="vertical"   shapeKey="copy" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="card right-steps">
          <ol className="muted bigger">
            {STEP_HEADS.map((h,i)=>(<li key={i}><strong>{i+1}.</strong> {h} {steps?.[i]?.done ? '✓' : ''}</li>))}
          </ol>

          {/* Step 1 word bank for labels */}
          <div className="chips with-borders center">
            {['Original','Copy'].map((w,i)=>(<Draggable key={'lab'+i} id={'lab'+i} label={w} data={{kind:'word', label:w}} />))}
          </div>

          {/* Step 2–3 word bank */}
          <div className="chips with-borders center mt-8">
            {['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent'].map((w,i)=>(
              <Draggable key={'w'+i} id={'w'+i} label={w} data={{kind:'word', label:w}} />
            ))}
          </div>

          {/* Step 3 slots */}
          <div className="center mt-8">
            <Slot className="slot" test={d=>d?.kind==='word'} onDropContent={onDropFormula('sSF','Scale Factor')}>Scale Factor</Slot>
            <span className="ml-12">=</span>
            <Slot className="slot" test={d=>d?.kind==='word'} onDropContent={onDropFormula('sNUM','Copy')}>Copy</Slot>
            <span className="ml-12">/</span>
            <Slot className="slot" test={d=>d?.kind==='word'} onDropContent={onDropFormula('sDEN','Original')}>Original</Slot>
          </div>

          {/* Step 4: fraction fill & animation */}
          <div className="section mt-10">
            <div className="fraction-row">
              <div className="fraction mini-frac">
                <div><Slot className="slot" test={d=>d?.kind==='num'} onDropContent={d=>dropValue('num', d)}>{num ?? '—'}</Slot></div>
                <div className="frac-bar narrow"></div>
                <div><Slot className="slot" test={d=>d?.kind==='num'} onDropContent={d=>dropValue('den', d)}>{den ?? '—'}</Slot></div>
              </div>
              {calcStage>=1 && <div className="stack-op"><div className="chip chip-tiny">÷ {calc?.g ?? ''}</div><div className="chip chip-tiny">÷ {calc?.g ?? ''}</div></div>}
              {calcStage>=2 && <div className="fraction mini-frac"><div>{calc?.a ?? '—'}</div><div className="frac-bar narrow"></div><div>{calc?.b ?? '—'}</div></div>}
              {calcStage>=3 && calc?.b===1 && <div className="chip">{calc?.a}</div>}
            </div>
            <div className="mt-8 center">
              <button className="button" disabled={!(num && den) || calcStage>0} onClick={startCalcAnimation}>Calculate</button>
              <button className="button success ml-12" disabled={!(calcStage>=4 || (calcStage>=3 && calc?.b===1))} onClick={()=>{ done(4); next() }}>I Understand</button>
            </div>
            {errorMsg && <div className="error big-red center mt-8">{errorMsg}</div>}
          </div>

          {/* Step 5: compute grid */}
          <div className="section mt-10">
            <div className="right-steps step-title question-xl">Drag the <b>number from the Original</b> you want to multiply, then tap <b>Compute</b>.</div>
            <div className="compute-grid mt-8">
              <div className="col center">
                <Slot className="slot" test={d=>d?.kind==='num'} onDropContent={d=>setS5(prev=>({...prev, origVal: d.value}))}>{s5.origVal ?? '—'}</Slot>
              </div>
              <div className="op">×</div>
              <div className="col center">
                {calc ? <div className="chip">{calc.a}/{calc.b}</div> : (num && den ? <div className="chip">{num}/{den}</div> : <div className="chip">—</div>)}
              </div>
              <div className="op">=</div>
              <div className="col center">
                <div className="chip">{s5.computed ? (missingResult ?? '—') : '—'}</div>
              </div>
            </div>
            <div className="mt-8 center">
              <button className="button success" disabled={!canArmCompute() || showConfetti} onClick={doComputeMissing}>Compute</button>
              <button className="button ml-12" onClick={newProblem}>New Problem</button>
            </div>
          </div>
        </div>
      </div>

      <Confetti show={showConfetti} />

      {openSum && (
        <SummaryOverlay attempts={session?.attempts || []} onClose={()=>setOpenSum(false)} />
      )}
    </div>
  )
}
