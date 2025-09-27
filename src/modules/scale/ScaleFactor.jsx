// src/modules/scale/ScaleFactor.jsx (v3.0.3)
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
  'Fill in the values from the shapes',
  'Fill in the values from the shapes',
  'Calculate & Simplify',
  'Concept check: pick the correct equation',
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
    firstPick: null,
    chosen: { orig:null, copy:null },
    picked: false,
    num: null, den: null,
    slots: { sSF:null, sNUM:null, sDEN:null },
    eqChoice: null,
    missingClicked: false,
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

  const [eqChoice, setEqChoice] = useState(persisted.eqChoice)
  const [missingClicked, setMissingClicked] = useState(persisted.missingClicked)
  const [missingResult, setMissingResult] = useState(persisted.missingResult)

  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [calc, setCalc] = useState(null)

  const saveSnap = ()=>{
    const snap = { version: SNAP_VERSION, problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, eqChoice, missingClicked, missingResult }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
  }
  useEffect(saveSnap, [problem, step, steps, labels, firstPick, chosen, picked, num, den, slots, eqChoice, missingClicked, missingResult]) // eslint-disable-line

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
    let basis = shown==='horizontal' ? Math.min(ow, cw) * SCALE : Math.min(oh, ch) * SCALE
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

  /* ---------- Step 2: corresponding sides ---------- */
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

  /* ---------- Step 4/5 numbers: accept either order ---------- */
  const placeIfCorrect = (where, d) => {
    const correctCopy = copyVals[shown], correctOrig = origVals[shown]
    if(where==='num'){
      if(d.value===correctCopy){ return {n:d.value} }
    }else{
      if(d.value===correctOrig){ return {d:d.value} }
    }
    return null
  }

  const dropNum = (where,d)=>{
    if(!testNum(d)) { again(step===3?3:4); return }
    const placed = placeIfCorrect(where,d)
    if(!placed){ again(step===3?3:4); return }
    const nextNum = placed.n!=null ? placed.n : num
    const nextDen = placed.d!=null ? placed.d : den
    setNum(nextNum); setDen(nextDen)
    if(nextNum!=null && nextDen!=null){
      done(3); done(4); setStep(5)
    }else{
      if(step===3 && nextNum!=null) setStep(4)
    }
  }

  /* ---------- Step 6 calculate ---------- */
  const gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y){[x,y]=[y,x%y]}return x||1}
  const fmt1=(v)=>{
    if (v==null || !isFinite(v)) return ''
    const r = Math.round(v)
    if (Math.abs(v - r) < 1e-9) return String(r)
    return (Math.round(v*10)/10).toFixed(1)
  }
  const doCalculate=()=>{
    if(num==null||den==null){ again(5); return }
    const g=gcd(num,den), a=num/g, b=den/g, dec=(den!==0)?(num/den):null
    setCalc({num,den,a,b,dec,g}); done(5)
  }
  const proceedAfterCalc=()=>{ if(calc) next() }

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
    setEqChoice(null)
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

  /* ---------- Rect ---------- */
  const RectWithLabel = ({which})=>{
    const isLeft = which==='orig'
    const w = isLeft ? ow : cw
    const h = isLeft ? oh : ch
    const baseRect = (
      <div className={`rect ${!isLeft ? 'copy' : ''}`} style={rectStyle(w,h)}>
        <div className={'shape-label-center '+(!labels[isLeft?'left':'right']?'hidden':'')}>{labels[isLeft?'left':'right'] || ''}</div>

        {/* Shown orientation tags */}
        {shown==='horizontal' && (
          <Tag id={(isLeft?'o':'c')+'num_h'} value={isLeft?ow:cw} side="top" orient="horizontal" shape={isLeft?'orig':'copy'} />
        )}
        {shown==='vertical' && (
          <Tag id={(isLeft?'o':'c')+'num_v'} value={isLeft?oh:ch} side="left" orient="vertical" shape={isLeft?'orig':'copy'} />
        )}

        {/* Always show ORIGINAL value on the opposite orientation */}
        {isLeft && missingPair==='horizontal' && (
          <Tag id={'o_opp_h'} value={ow} side="top" orient="horizontal" shape="orig" />
        )}
        {isLeft && missingPair==='vertical' && (
          <Tag id={'o_opp_v'} value={oh} side="left" orient="vertical" shape="orig" />
        )}

        {/* Show ? on the COPY at the opposite orientation */}
        {!isLeft && missingPair==='horizontal' && (
          <span className="side-tag top" style={sharedBadgeMetrics}>?</span>
        )}
        {!isLeft && missingPair==='vertical' && (
          <span className="side-tag left" style={sharedBadgeMetrics}>?</span>
        )}

        {/* Wide click zones */}
        <div className={'side-hit top '+(isChosen(isLeft?'orig':'copy','top')?'chosen':'')+' '+(isGood(isLeft?'orig':'copy','top')?'good':'')}
             onClick={()=> (step===1? clickSide(isLeft?'orig':'copy','top','horizontal') : step===7? handleMissingClick(isLeft?'orig':'copy','top','horizontal'):null) }/>
        <div className={'side-hit bottom '+(isChosen(isLeft?'orig':'copy','bottom')?'chosen':'')+' '+(isGood(isLeft?'orig':'copy','bottom')?'good':'')}
             onClick={()=> (step===1? clickSide(isLeft?'orig':'copy','bottom','horizontal') : step===7? handleMissingClick(isLeft?'orig':'copy','bottom','horizontal'):null) }/>
        <div className={'side-hit left '+(isChosen(isLeft?'orig':'copy','left')?'chosen':'')+' '+(isGood(isLeft?'orig':'copy','left')?'good':'')}
             onClick={()=> (step===1? clickSide(isLeft?'orig':'copy','left','vertical') : step===7? handleMissingClick(isLeft?'orig':'copy','left','vertical'):null) }/>
        <div className={'side-hit right '+(isChosen(isLeft?'orig':'copy','right')?'chosen':'')+' '+(isGood(isLeft?'orig':'copy','right')?'good':'')}
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

  /* ---------- Concept check bank ---------- */
  const concepts = [
    { id:'eq1', label:'Original × Scale Factor = Copy', good:true },
    { id:'eq2', label:'Original ÷ Scale Factor = Copy', good:false },
    { id:'eq3', label:'Copy × Scale Factor = Original', good:false },
  ]

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
                <div className="fraction-row mt-8 no-wrap">
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

            {(step===3 || step===4) && (
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
                      <Slot test={testNum} onDropContent={(d)=>dropNum('num',d)}>
                        {num==null ? '—' : <span className="chip">{num}</span>}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={testNum} onDropContent={(d)=>dropNum('den',d)}>
                        {den==null ? '—' : <span className="chip">{den}</span>}
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
                      <div>= divide numerator and denominator by <b>{calc.g}</b> → <b>{calc.a}</b> / <b>{calc.b}</b></div>
                      {calc.dec!=null && <div>= decimal ≈ <b>{fmt1(calc.dec)}</b></div>}
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
                <div className="muted bigger">How do we calculate the missing side of the Copy?</div>
                <div className="chips mt-8 chips-lg with-borders">
                  {concepts.map(c=>(
                    <Draggable key={c.id} id={c.id} label={c.label} data={{kind:'word', label:c.label, good:c.good}} />
                  ))}
                </div>
                <div className="mt-8">
                  <Slot test={d=>d?.kind==='word'} onDropContent={(d)=>{
                    setEqChoice(d.label);
                    if(d.good){ done(6); next() } else { again(6) }
                  }}>
                    <span className="slot">Drop the correct sentence here</span>
                  </Slot>
                </div>
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
                <div className="muted bigger">Original × Scale Factor = Copy</div>
                <div className="chips mt-8">
                  <span className="badge">Scale Factor = {num} / {den}</span>
                </div>
                <div className="toolbar mt-8">
                  <button className="button success" onClick={()=>{
                    const sf = num/den
                    const origSide = origVals[missingPair]
                    const result = origSide * sf
                    setMissingResult(result); done(8)
                    // auto start new problem after a short beat
                    setTimeout(()=> newProblem(), 1500)
                  }}>
                    Compute Missing Side
                  </button>
                </div>
                {missingResult!=null && (
                  <div className="chips mt-10">
                    <span className="badge">Result: {fmt1(missingResult)}</span>
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
