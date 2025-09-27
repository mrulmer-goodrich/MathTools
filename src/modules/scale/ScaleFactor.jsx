// src/modules/scale/ScaleFactor.jsx
import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 2

const STEP_HEADS = [
  'Which rectangle is the Original? Which is the Copy?',
  'Pick the corresponding sides',
  'What is the scale factor formula?',
  'Copy → Numerator',
  'Original → Denominator',
  'Calculate Scale',
  'Build missing-side equation',
  'Identify missing side',
  'Compute missing side'
]

export default function ScaleFactorModule() {
  const [session, setSession] = useState(loadSession())

  // Reset persisted snapshot if version changed
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
  const persisted = session.scaleSnap && session.scaleSnap.version===SNAP_VERSION ? session.scaleSnap : freshSnap

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
  const [firstPick, setFirstPick] = useState(null)

  useEffect(()=>{
    const snap = { version: SNAP_VERSION, problem, step, steps, labels, picked, num, den, slots, mSlots, missingResult }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
    // eslint-disable-next-line
  }, [problem, step, steps, labels, picked, num, den, slots, mSlots, missingResult])

  const miss = (i)=>setSteps(s=>{const c=[...s];c[i].misses++;return c})
  const done = (i)=>setSteps(s=>{const c=[...s];c[i].done=true;return c})
  const next = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))
  const tryAgain = (i, msg='Try Again!') => { miss(i); setErrorMsg(msg); setTimeout(()=>setErrorMsg(''), 1200) }

  // sizes from generator (copy is p/q times original)
  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w, ch = problem.copy.h
  const shown = problem.shownPair      // 'horizontal' | 'vertical'
  const missingPair = problem.missingPair

  const rectStyle = (w,h)=>({
    width: Math.max(120, w*6)+'px',
    height: Math.max(90, h*6)+'px'
  })

  // fraction word slots
  const formulaReady = slots.sSF && slots.sNUM && slots.sDEN
  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }

  // word bank
  const wordBank = useMemo(()=>{
    const words = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    return words.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  },[])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum = d => d?.kind==='num'

  const dropLabelOnRect = (side) => (d) => {
    if (side==='left' && testWord('Original')(d)) {
      const after = { ...labels, left: 'Original' }
      setLabels(after)
      if(after.left && after.right){ done(0); next() }
    } else if (side==='right' && testWord('Copy')(d)) {
      const after = { ...labels, right: 'Copy' }
      setLabels(after)
      if(after.left && after.right){ done(0); next() }
    } else {
      tryAgain(0)
    }
  }

  // Corresponding sides: two clicks cross-rect
  const clickSide = (shape, orient)=>{
    if(!labels.left || !labels.right){ tryAgain(1); return }
    if(!firstPick){
      setFirstPick({shape, orient})
      return
    }
    const otherShape = firstPick.shape==='orig' ? 'copy' : 'orig'
    const okOther   = (shape===otherShape) && (orient===shown)
    const okFirst   = (firstPick.orient===shown)
    if(okFirst && okOther){
      setPicked(true); setFirstPick(null); done(1); next()
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

  const doCalculate = ()=>{
    if(num==null || den==null){ tryAgain(5); return }
    done(5); next()
  }

  const computeMissing = ()=>{
    const sf = num/den
    const origSide = origVals[missingPair]
    const result = origSide * sf
    setMissingResult(result); done(8)
  }

  const newProblem = ()=>{
    const p = genScaleProblem()
    setProblem(p); setStep(0); setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setLabels({left:null,right:null}); setPicked(false)
    setFirstPick(null)
    setSlots({sSF:null,sEQ:'=',sNUM:null,sDIV:'/',sDEN:null})
    setNum(null); setDen(null)
    setMSlots({ left:'Original', op:'×', right:'Scale Factor', eq:'=', out:null })
    setMissingResult(null)
  }

  const shapeNumChips = useMemo(()=>{
    const arr = []
    if(shown==='horizontal'){ arr.push({id:'cn', label:String(cw), kind:'num', value:cw}); arr.push({id:'on', label:String(ow), kind:'num', value:ow}) }
    else { arr.push({id:'cn', label:String(ch), kind:'num', value:ch}); arr.push({id:'on', label:String(oh), kind:'num', value:oh}) }
    return arr
  },[shown, cw,ch, ow,oh])

  return (
    <div className="container">
      <div className="panes equal">
        {/* LEFT: shapes with full-rect drop zones for labels */}
        <div className="card shape-area">
          <div className="rects">
            <Slot className="rect-slot" test={testWord('Original')} onDropContent={dropLabelOnRect('left')}>
              <div className="rect" style={rectStyle(ow,oh)}>
                <div className={"shape-label-center "+(!labels.left?'hidden':'')}>{labels.left || ''}</div>
                <div className="side-tag top">{ow}</div>
                <div className="side-tag left">{oh}</div>
                <div className={"side-hit top "+(picked && shown==='horizontal'?'good':'')} onClick={()=>clickSide('orig','horizontal')}/>
                <div className={"side-hit bottom"} onClick={()=>clickSide('orig','horizontal')}/>
                <div className={"side-hit left "+(picked && shown==='vertical'?'good':'')} onClick={()=>clickSide('orig','vertical')}/>
                <div className={"side-hit right"} onClick={()=>clickSide('orig','vertical')}/>
              </div>
            </Slot>

            <Slot className="rect-slot" test={testWord('Copy')} onDropContent={dropLabelOnRect('right')}>
              <div className="rect copy" style={rectStyle(cw,ch)}>
                <div className={"shape-label-center "+(!labels.right?'hidden':'')}>{labels.right || ''}</div>
                {shown==='horizontal' && (<div className="side-tag top">{cw}</div>)}
                {shown==='vertical' && (<div className="side-tag left">{ch}</div>)}
                <div className={"side-hit top "+(picked && shown==='horizontal'?'good':'')} onClick={()=>clickSide('copy','horizontal')}/>
                <div className={"side-hit bottom"} onClick={()=>clickSide('copy','horizontal')}/>
                <div className={"side-hit left "+(picked && shown==='vertical'?'good':'')} onClick={()=>clickSide('copy','vertical')}/>
                <div className={"side-hit right"} onClick={()=>clickSide('copy','vertical')}/>
              </div>
            </Slot>
          </div>

          {picked && (
            <div className="chips center mt-10">
              {shapeNumChips.map(c=><Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
            </div>
          )}

          <button className="button primary big-under" onClick={newProblem}>New Problem</button>
        </div>

        {/* RIGHT: steps */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title question-lg">{STEP_HEADS[step]}</div>

            {/* Step 1: label shapes — drag onto LEFT pane */}
            {step===0 && (
              <div className="chips mt-10">
                <Draggable id="wO" label="Original" data={{kind:'word',label:'Original'}} />
                <Draggable id="wC" label="Copy" data={{kind:'word',label:'Copy'}} />
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {/* Step 2: pick pair by cross-rectangle clicks */}
            {step===1 && (
              <div className="muted">Pick one side on a rectangle, then click the corresponding side on the other rectangle.</div>
            )}

            {/* Step 3: formula words only */}
            {step===2 && (
              <>
                <div className="muted">What is the scale factor formula?</div>
                <div className="fraction-row mt-8">
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
                <div className="chips">
                  {wordBank.map(w=><Draggable key={w.id} id={w.id} label={w.label} data={w} />)}
                </div>
              </>
            )}

            {/* Step 4: Copy → numerator */}
            {step===3 && (
              <>
                <div className="muted">Drag the number for the <b>Copy</b> into the numerator.</div>
                {formulaReady && (
                  <div className="fraction-row muted mt-8">
                    <span>Scale Factor = </span>
                    <div className="fraction ml-6">
                      <div>{num ?? '—'}</div>
                      <div className="frac-bar thick"></div>
                      <div>{den ?? '—'}</div>
                    </div>
                  </div>
                )}
                <div className="fraction mt-8">
                  <div>
                    <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('num',d)}>
                      {num ?? '—'}
                    </Slot>
                  </div>
                  <div className="frac-bar thick"></div>
                  <div>{den ?? '—'}</div>
                </div>
              </>
            )}

            {/* Step 5: Original → denominator */}
            {step===4 && (
              <>
                <div className="muted">Drag the number for the <b>Original</b> into the denominator.</div>
                {formulaReady && (
                  <div className="fraction-row muted mt-8">
                    <span>Scale Factor = </span>
                    <div className="fraction ml-6">
                      <div>{num ?? '—'}</div>
                      <div className="frac-bar thick"></div>
                      <div>{den ?? '—'}</div>
                    </div>
                  </div>
                )}
                <div className="fraction mt-8">
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar thick"></div>
                  <div>
                    <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('den',d)}>
                      {den ?? '—'}
                    </Slot>
                  </div>
                </div>
              </>
            )}

            {/* Step 6 */}
            {step===5 && (
              <>
                <div className="muted">We’ll compute and simplify if needed.</div>
                <div className="fraction mt-8">
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar thick"></div>
                  <div>{den ?? '—'}</div>
                </div>
                <div className="chips mt-8">
                  <button className="button primary" onClick={doCalculate}>Calculate Scale</button>
                </div>
              </>
            )}

            {/* Step 7 */}
            {step===6 && (
              <>
                <div className="muted">Drag words to build: Original × Scale Factor = Copy</div>
                <div className="chips mt-8">
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
                <div className="chips mt-8">
                  <Draggable id="wO2" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wSF2" label="Scale Factor" data={{kind:'word',label:'Scale Factor'}} />
                  <Draggable id="wC2" label="Copy" data={{kind:'word',label:'Copy'}} />
                </div>
                <div className="toolbar mt-8">
                  <button className="button primary" onClick={()=>{ done(6); next() }}>Confirm</button>
                </div>
              </>
            )}

            {/* Step 8 */}
            {step===7 && (
              <>
                <div className="muted">Click the side on the Copy that is missing (the other orientation).</div>
                <div className="toolbar mt-8">
                  <button className="button primary" onClick={()=>{ done(7); next() }}>I found it</button>
                </div>
              </>
            )}

            {/* Step 9 */}
            {step===8 && (
              <>
                <div className="muted">We’ll use Original × (Copy/Original) to find the Copy’s missing side.</div>
                <div className="toolbar mt-8">
                  <button className="button success" onClick={computeMissing}>
                    Compute Missing Side
                  </button>
                </div>
                {missingResult!=null && (
                  <div className="chips mt-10">
                    <span className="badge">Result: {missingResult}</span>
                  </div>
                )}
              </>
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
