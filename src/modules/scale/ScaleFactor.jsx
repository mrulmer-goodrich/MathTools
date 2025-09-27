// src/modules/scale/ScaleFactor.jsx
import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 7

const STEP_HEADS = [
  'Which rectangle is the Original? Which is the Copy?',
  'Pick the corresponding sides',
  'What is the scale factor formula?',
  'Copy → Numerator',
  'Original → Denominator',
  'Calculate & Simplify',
  'Build missing-side equation',
  'Identify missing side',
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
    picked: false,
    num: null, den: null,
    slots: { sSF:null, sEQ:'=', sNUM:null, sDIV:'/', sDEN:null },
    mSlots: { left:'Original', op:'×', right:'Scale Factor', eq:'=', out:null },
    missingResult: null
  }
  const persisted = (session.scaleSnap && session.scaleSnap.version===SNAP_VERSION)
    ? session.scaleSnap
    : freshSnap

  const [problem, setProblem] = useState(persisted.problem)
  const [step, setStep] = useState(persisted.step)
  const [steps, setSteps] = useState(persisted.steps)
  const [labels, setLabels] = useState(persisted.labels)
  const [picked, setPicked] = useState(persisted.picked)
  const [num, setNum] = useState(persisted.num)
  const [den, setDen] = useState(persisted.den)
  const [slots, setSlots] = useState(persisted.slots)
  const [mSlots, setMSlots] = useState(persisted.mSlots)
  const [missingResult, setMissingResult] = useState(persisted.missingResult)
  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Edge-level picks
  const [firstPick, setFirstPick] = useState(null) // {shape, edge, orient}
  const [chosen, setChosen] = useState({ orig:null, copy:null })

  useEffect(()=>{
    const snap = { version: SNAP_VERSION, problem, step, steps, labels, picked, num, den, slots, mSlots, missingResult }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
    // eslint-disable-next-line
  }, [problem, step, steps, labels, picked, num, den, slots, mSlots, missingResult])

  const miss = (i)=>setSteps(s=>{const c=[...s];c[i].misses++;return c})
  const done = (i)=>setSteps(s=>{const c=[...s];c[i].done=true;return c})
  const next = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))
  const tryAgain = (i, msg='Try Again!') => { miss(i); setErrorMsg(msg); setTimeout(()=>setErrorMsg(''), 1000) }

  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w, ch = problem.copy.h
  const shown = problem.shownPair            // 'horizontal' | 'vertical'
  const missingPair = problem.missingPair    // perpendicular orientation

  const rectStyle = (w,h)=>({
    width: Math.max(120, w*6)+'px',
    height: Math.max(90, h*6)+'px'
  })

  const formulaReady = slots.sSF && slots.sNUM && slots.sDEN
  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }

  const wordBank = useMemo(()=>{
    const src = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    for(let i=src.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [src[i],src[j]]=[src[j],src[i]] }
    return src.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  }, [problem.id])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum = d => d?.kind==='num'

  const dropLabelOnRect = (side) => (d) => {
    if (side==='left' && testWord('Original')(d)) {
      const after = { ...labels, left: 'Original' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else if (side==='right' && testWord('Copy')(d)) {
      const after = { ...labels, right: 'Copy' }
      setLabels(after); if(after.left && after.right){ done(0); next() }
    } else {
      tryAgain(0)
    }
  }

  const clickSide = (shape, edge, orient)=>{
    if(!labels.left || !labels.right){ tryAgain(1); return }
    if(orient !== shown){ tryAgain(1); return }
    if(!firstPick){
      setFirstPick({shape, edge, orient})
      return
    }
    if(firstPick.shape !== shape && firstPick.orient === orient){
      const pair = { orig: (shape==='orig'? firstPick.edge : edge), copy: (shape==='copy'? firstPick.edge : edge) }
      setChosen(pair); setPicked(true); setFirstPick(null); done(1); next()
    } else {
      setFirstPick(null); tryAgain(1)
    }
  }

  const onDropFormula = (slotKey, want) => d => {
    if (!testWord(want)(d)) { tryAgain(2); return }
    const after = { ...slots, [slotKey]: want }
    setSlots(after)
    const ok = after.sSF==='Scale Factor' && after.sNUM==='Copy' && after.sDEN==='Original'
    if(ok){ done(2); next() }
  }

  const dropNum = (where,d)=>{
    if(!testNum(d)) { tryAgain(where==='num'?3:4); return }
    const correctCopy = copyVals[shown], correctOrig = origVals[shown]
    if(where==='num'){
      if(d.value===correctCopy){ setNum(d.value); done(3); next() } else tryAgain(3)
    } else {
      if(d.value===correctOrig){ setDen(d.value); done(4); next() } else tryAgain(4)
    }
  }

  const [calc, setCalc] = useState(null)
  const gcd = (x,y)=>{ x=Math.abs(x); y=Math.abs(y); while(y){ [x,y]=[y,x%y] } return x||1 }
  const doCalculate = ()=>{
    if(num==null || den==null){ tryAgain(5); return }
    const g = gcd(num,den)
    const a = num/g, b=den/g
    const dec = (den!==0) ? (num/den) : null
    setCalc({num,den,a,b,dec})
    done(5)
  }
  const proceedAfterCalc = ()=>{ if(calc) next() }

  const newProblem = ()=>{
    const p = genScaleProblem()
    setProblem(p); setStep(0); setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setLabels({left:null,right:null}); setPicked(false)
    setFirstPick(null); setChosen({orig:null, copy:null})
    setSlots({sSF:null,sEQ:'=',sNUM:null,sDIV:'/',sDEN:null})
    setNum(null); setDen(null); setCalc(null)
    setMSlots({ left:'Original', op:'×', right:'Scale Factor', eq:'=', out:null })
    setMissingResult(null)
  }

  // helpers
  const isChosen = (s,e)=> firstPick && firstPick.shape===s && firstPick.edge===e
  const isGood   = (s,e)=> picked && ((s==='orig' && chosen.orig===e) || (s==='copy' && chosen.copy===e))

  // SIDE NUMBER TAGS
  // - centered on side
  // - shown orientation on both rectangles
  // - ALSO show Original's perpendicular side (for later missing-side calc), but NOT draggable
  // - draggable only at steps >= 3 (for shown pair values)
  const Tag = ({id, value, side, orient, shape}) => {
    const cls = 'side-tag big ' + side
    const isShown = (orient === shown)
    const isPerpOriginal = (shape==='orig' && orient === missingPair)
    const draggableNow = (step >= 3) && isShown
    const common = { className: cls, style: { zIndex: draggableNow ? 40 : 12 } }
    const handleClick = () => {
      if (step===1) {
        // if user clicks the badge during pick step, count it as clicking that side
        if (shape==='orig') clickSide('orig', side, orient)
        else clickSide('copy', side, orient)
      }
    }
    if (draggableNow) {
      return <Draggable id={id} label={String(value)} data={{kind:'num', value}} {...common} />
    }
    // static pill
    return <span {...common} onClick={handleClick}>{value}</span>
  }

  return (
    <div className="container">
      <div className="panes equal">
        {/* LEFT: shapes */}
        <div className="card shape-area">
          <div className="rects">
            {/* Original */}
            <Slot className="rect-slot" test={testWord('Original')} onDropContent={dropLabelOnRect('left')}>
              <div className="rect" style={rectStyle(ow,oh)}>
                <div className={"shape-label-center "+(!labels.left?'hidden':'')}>{labels.left || ''}</div>
                {/* SHOWN orientation number */}
                {shown==='horizontal' && (<Tag id="onum_h" value={ow} side="top" orient="horizontal" shape="orig" />)}
                {shown==='vertical' && (<Tag id="onum_v" value={oh} side="left" orient="vertical" shape="orig" />)}
                {/* PERP Original number also visible (not draggable) */}
                {missingPair==='horizontal' && (<Tag id="onum_h_perp" value={ow} side="top" orient="horizontal" shape="orig" />)}
                {missingPair==='vertical' && (<Tag id="onum_v_perp" value={oh} side="left" orient="vertical" shape="orig" />)}
                {/* Click zones (wide strips) */}
                <div className={"side-hit top "+(isChosen('orig','top')?'chosen':'')+" "+(isGood('orig','top')?'good':'')} onClick={()=>clickSide('orig','top','horizontal')}/>
                <div className={"side-hit bottom "+(isChosen('orig','bottom')?'chosen':'')+" "+(isGood('orig','bottom')?'good':'')} onClick={()=>clickSide('orig','bottom','horizontal')}/>
                <div className={"side-hit left "+(isChosen('orig','left')?'chosen':'')+" "+(isGood('orig','left')?'good':'')} onClick={()=>clickSide('orig','left','vertical')}/>
                <div className={"side-hit right "+(isChosen('orig','right')?'chosen':'')+" "+(isGood('orig','right')?'good':'')} onClick={()=>clickSide('orig','right','vertical')}/>
              </div>
            </Slot>

            {/* Copy */}
            <Slot className="rect-slot" test={testWord('Copy')} onDropContent={dropLabelOnRect('right')}>
              <div className="rect copy" style={rectStyle(cw,ch)}>
                <div className={"shape-label-center "+(!labels.right?'hidden':'')}>{labels.right || ''}</div>
                {shown==='horizontal' && (<Tag id="cnum_h" value={cw} side="top" orient="horizontal" shape="copy" />)}
                {shown==='vertical' && (<Tag id="cnum_v" value={ch} side="left" orient="vertical" shape="copy" />)}
                {/* Copy's perpendicular side intentionally blank (missing) */}
                <div className={"side-hit top "+(isChosen('copy','top')?'chosen':'')+" "+(isGood('copy','top')?'good':'')} onClick={()=>clickSide('copy','top','horizontal')}/>
                <div className={"side-hit bottom "+(isChosen('copy','bottom')?'chosen':'')+" "+(isGood('copy','bottom')?'good':'')} onClick={()=>clickSide('copy','bottom','horizontal')}/>
                <div className={"side-hit left "+(isChosen('copy','left')?'chosen':'')+" "+(isGood('copy','left')?'good':'')} onClick={()=>clickSide('copy','left','vertical')}/>
                <div className={"side-hit right "+(isChosen('copy','right')?'chosen':'')+" "+(isGood('copy','right')?'good':'')} onClick={()=>clickSide('copy','right','vertical')}/>
              </div>
            </Slot>
          </div>
          <button className="button primary big-under" onClick={newProblem}>New Problem</button>
        </div>

        {/* RIGHT: steps */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title question-xl">{STEP_HEADS[step]}</div>

            {step===0 && (
              <div className="section">
                <div className="muted bigger">Drag && drop the words on the correct image.</div>
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
                <div className="muted bigger">Drag && drop the words to build the formula.</div>
                <div className="fraction-row mt-8 big-fraction">
                  <Slot test={testWord('Scale Factor')} onDropContent={onDropFormula('sSF','Scale Factor')}>
                    {slots.sSF || '_____'} 
                  </Slot>
                  <span>=</span>
                  <div className="fraction ml-6">
                    <div>
                      <Slot test={testWord('Copy')} onDropContent={onDropFormula('sNUM','Copy')}>
                        {slots.sNUM || '_____'}
                      </Slot>
                    </div>
                    <div className="frac-bar thick"></div>
                    <div>
                      <Slot test={testWord('Original')} onDropContent={onDropFormula('sDEN','Original')}>
                        {slots.sDEN || '_____'}
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
                <div className="muted bigger">Drag the number for the <b>Copy</b> into the numerator.</div>
                {formulaReady && (
                  <div className="row mt-8 formula-row">
                    <div className="fraction-row big-fraction">
                      <span>Scale Factor =</span>
                      <div className="fraction ml-6">
                        <div>Copy</div>
                        <div className="frac-bar thick"></div>
                        <div>Original</div>
                      </div>
                    </div>
                    <div className="fraction ml-12 big-fraction">
                      <div>
                        <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('num',d)}>
                          {num ?? '—'}
                        </Slot>
                      </div>
                      <div className="frac-bar thick"></div>
                      <div>{den ?? '—'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step===4 && (
              <div className="section">
                <div className="muted bigger">Drag the number for the <b>Original</b> into the denominator.</div>
                {formulaReady && (
                  <div className="row mt-8 formula-row">
                    <div className="fraction-row big-fraction">
                      <span>Scale Factor =</span>
                      <div className="fraction ml-6">
                        <div>Copy</div>
                        <div className="frac-bar thick"></div>
                        <div>Original</div>
                      </div>
                    </div>
                    <div className="fraction ml-12 big-fraction">
                      <div>{num ?? '—'}</div>
                      <div className="frac-bar thick"></div>
                      <div>
                        <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('den',d)}>
                          {den ?? '—'}
                        </Slot>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step===5 && (
              <div className="section">
                <div className="muted bigger">Tap Calculate to show the math, then Next.</div>
                <div className="row mt-8 formula-row">
                  <div className="fraction-row big-fraction">
                    <span>Scale Factor =</span>
                    <div className="fraction ml-6">
                      <div>Copy</div>
                      <div className="frac-bar thick"></div>
                      <div>Original</div>
                    </div>
                  </div>
                  <div className="fraction ml-12 big-fraction">
                    <div>{num ?? '—'}</div>
                    <div className="frac-bar thick"></div>
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
                <div className="chips mt-8 chips-lg with-borders">
                  <Slot className="flat" test={testWord('Original')} onDropContent={()=>done(6)}>
                    <span className="slot">Original</span>
                  </Slot>
                  <span>×</span>
                  <Slot className="flat" test={testWord('Scale Factor')} onDropContent={()=>{}}>
                    <span className="slot">Scale Factor</span>
                  </Slot>
                  <span>=</span>
                  <Slot className="flat" test={testWord('Copy')} onDropContent={()=>{}}>
                    <span className="slot">Copy</span>
                  </Slot>
                </div>
                <div className="chips mt-8 chips-lg with-borders">
                  <Draggable id="wO2" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wSF2" label="Scale Factor" data={{kind:'word',label:'Scale Factor'}} />
                  <Draggable id="wC2" label="Copy" data={{kind:'word',label:'Copy'}} />
                </div>
                <div className="toolbar mt-8">
                  <button className="button primary" onClick={()=>{ done(6); next() }}>Next</button>
                </div>
              </div>
            )}

            {step===7 && (
              <div className="section">
                <div className="muted bigger">Click the side on the Copy that is missing (the other orientation).</div>
                <div className="toolbar mt-8">
                  <button className="button primary" onClick={()=>{ done(7); next() }}>I found it</button>
                </div>
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
