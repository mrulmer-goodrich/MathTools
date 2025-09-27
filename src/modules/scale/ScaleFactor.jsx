// src/modules/scalefactor/ScaleFactorModule.jsx
import React, { useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const STEP_HEADS = [
  'Label shapes',
  'Pick the corresponding sides',
  'Build the formula',
  'Copy → Numerator',
  'Original → Denominator',
  'Calculate Scale',
  'Build missing-side equation',
  'Identify missing side',
  'Compute missing side'
]

export default function ScaleFactorModule() {
  const [session, setSession] = useState(loadSession())
  const [problem, setProblem] = useState(()=>session.scaleSnap?.problem || genScaleProblem())
  const [step, setStep] = useState(session.scaleSnap?.step ?? 0)
  const [steps, setSteps] = useState(session.scaleSnap?.steps || STEP_HEADS.map(()=>({misses:0,done:false})))
  const [openSum, setOpenSum] = useState(false)

  const miss = (i)=>setSteps(s=>{const c=[...s];c[i].misses++;return c})
  const done = (i)=>setSteps(s=>{const c=[...s];c[i].done=true;return c})
  const next = ()=>setStep(s=>Math.min(s+1, STEP_HEADS.length-1))

  // Persist snapshot
  const saveSnap = (extra={})=>{
    const snap = { problem, step, steps, ...extra }
    const nextSession = { ...session, scaleSnap: snap }
    saveSession(nextSession); setSession(nextSession)
  }

  // labels
  const [labels, setLabels] = useState(()=>session.scaleSnap?.labels || { left:null, right:null })
  const [errorMsg, setErrorMsg] = useState('')

  // sizes from generator (copy is p/q times original)
  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w, ch = problem.copy.h
  const shown = problem.shownPair      // 'horizontal' | 'vertical'
  const missingPair = problem.missingPair

  const rectStyle = (w,h)=>({
    width: Math.max(120, w*6)+'px',
    height: Math.max(90, h*6)+'px'
  })

  // cross-rectangle pairing
  const [picked, setPicked] = useState(()=>session.scaleSnap?.picked || false)
  const [firstPick, setFirstPick] = useState(null) // { shape:'orig'|'copy', orient:'horizontal'|'vertical' }

  // fraction word slots
  const [slots, setSlots] = useState(()=>session.scaleSnap?.slots || { sSF:null, sEQ:'=', sNUM:null, sDIV:'/', sDEN:null })
  const formulaReady = slots.sSF && slots.sNUM && slots.sDEN

  // numbers from shapes
  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }
  const [num, setNum] = useState(()=>session.scaleSnap?.num ?? null)
  const [den, setDen] = useState(()=>session.scaleSnap?.den ?? null)

  // part 2
  const [missSide, setMissSide] = useState(()=>session.scaleSnap?.missSide || (missingPair)) // which side is missing on copy
  const [mSlots, setMSlots] = useState(()=>session.scaleSnap?.mSlots || { left:'Original', op:'×', right:'Scale Factor', eq:'=', out:null })
  const [missingResult, setMissingResult] = useState(()=>session.scaleSnap?.missingResult ?? null)

  // word bank (≤10 proportion-related)
  const wordBank = useMemo(()=>{
    const words = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    return words.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  },[])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum = d => d?.kind==='num'
  const tryAgain = (i, msg='Try Again!') => { miss(i); setErrorMsg(msg); setTimeout(()=>setErrorMsg(''), 1400) }

  const onDropFormula = (slotKey, want) => d => {
    if (!testWord(want)(d)) { tryAgain(2); return }
    const after = { ...slots, [slotKey]: want }
    setSlots(after)
    const ok = after.sSF==='Scale Factor' && after.sNUM==='Copy' && after.sDEN==='Original'
    if(ok){ done(2); next(); saveSnap({slots:after}) }
  }

  const dropLabel = (side,d)=>{
    if(!testWord('Original')(d) && !testWord('Copy')(d)){ tryAgain(0); return }
    const after = { ...labels, [side]: d.label }
    setLabels(after)
    if(after.left && after.right && after.left!==after.right){ done(0); next(); saveSnap({labels:after}) }
  }

  const clickSide = (shape, orient)=>{
    if(!labels.left || !labels.right){ tryAgain(1); return }
    if(!firstPick){
      setFirstPick({shape, orient})
      return
    }
    // Must be the other shape, same orientation as the visible-number pair
    const otherShape = firstPick.shape==='orig' ? 'copy' : 'orig'
    const okOther   = (shape===otherShape) && (orient===shown)
    const okFirst   = (firstPick.orient===shown)
    if(okFirst && okOther){
      setPicked(true); setFirstPick(null); done(1); next(); saveSnap({picked:true})
    } else {
      setFirstPick(null); tryAgain(1)
    }
  }

  const dropNum = (where,d)=>{
    if(!testNum(d)) { tryAgain(where==='num'?3:4); return }
    const correctCopy = copyVals[shown], correctOrig = origVals[shown]
    if(where==='num'){
      if(d.value===correctCopy){ setNum(d.value); done(3); next(); saveSnap({num:d.value}) } else tryAgain(3)
    } else {
      if(d.value===correctOrig){ setDen(d.value); done(4); next(); saveSnap({den:d.value}) } else tryAgain(4)
    }
  }

  const doCalculate = ()=>{
    if(num==null || den==null){ tryAgain(5); return }
    done(5); next(); saveSnap()
  }

  const computeMissing = ()=>{
    const sf = num/den
    const origSide = origVals[missingPair]
    const result = origSide * sf
    setMissingResult(result); done(8)
    const missCount = steps.reduce((t,s)=>t+s.misses,0)
    const scoreColor = missCount===0?'green':(missCount===1?'yellow':'red')
    const attempt = { scoreColor, stepResults: steps, stepHeads: STEP_HEADS }
    const nextSession = { ...session, attempts:[...session.attempts, attempt] }
    saveSession(nextSession); setSession(nextSession)
  }

  const newProblem = ()=>{
    const p = genScaleProblem()
    setProblem(p); setStep(0); setSteps(STEP_HEADS.map(()=>({misses:0,done:false})))
    setLabels({left:null,right:null}); setPicked(false)
    setFirstPick(null)
    setSlots({sSF:null,sEQ:'=',sNUM:null,sDIV:'/',sDEN:null})
    setNum(null); setDen(null)
    setMissSide(p.missingPair); setMSlots({ left:'Original', op:'×', right:'Scale Factor', eq:'=', out:null })
    setMissingResult(null)
    saveSnap({ problem:p, step:0 })
  }

  // number chips come from shapes only; revealed after pair is picked
  const shapeNumChips = useMemo(()=>{
    const arr = []
    if(shown==='horizontal'){ arr.push({id:'cn', label:String(cw), kind:'num', value:cw}); arr.push({id:'on', label:String(ow), kind:'num', value:ow}) }
    else { arr.push({id:'cn', label:String(ch), kind:'num', value:ch}); arr.push({id:'on', label:String(oh), kind:'num', value:oh}) }
    return arr
  },[shown, cw,ch, ow,oh])

  return (
    <div className="container">
      <div className="panes equal">
        {/* LEFT: shapes */}
        <div className="card shape-area">
          <div className="rects">
            {/* Original */}
            <div className="rect" style={rectStyle(ow,oh)}>
              <div className={"shape-label "+(!labels.left?'hidden':'')}>{labels.left || 'Label me'}</div>
              {/* Perpendicular tagging on Original */}
              <div className="side-tag top">{ow}</div>
              <div className="side-tag left">{oh}</div>
              {/* Hits */}
              <div className={"side-hit top "+(picked && shown==='horizontal'?'good':'')} onClick={()=>clickSide('orig','horizontal')}/>
              <div className={"side-hit bottom"} onClick={()=>clickSide('orig','horizontal')}/>
              <div className={"side-hit left "+(picked && shown==='vertical'?'good':'')} onClick={()=>clickSide('orig','vertical')}/>
              <div className={"side-hit right"} onClick={()=>clickSide('orig','vertical')}/>
            </div>

            {/* Copy */}
            <div className="rect copy" style={rectStyle(cw,ch)}>
              <div className={"shape-label "+(!labels.right?'hidden':'')}>{labels.right || 'Label me'}</div>
              {/* Copy shows only the corresponding value for shown orientation */}
              {shown==='horizontal' && (<div className="side-tag top">{cw}</div>)}
              {shown==='vertical' && (<div className="side-tag left">{ch}</div>)}
              {/* hits */}
              <div className={"side-hit top "+(picked && shown==='horizontal'?'good':'')} onClick={()=>clickSide('copy','horizontal')}/>
              <div className={"side-hit bottom"} onClick={()=>clickSide('copy','horizontal')}/>
              <div className={"side-hit left "+(picked && shown==='vertical'?'good':'')} onClick={()=>clickSide('copy','vertical')}/>
              <div className={"side-hit right"} onClick={()=>clickSide('copy','vertical')}/>
            </div>
          </div>

          {/* Show number chips after pair is picked */}
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
            <div className="step-title">{STEP_HEADS[step]}</div>

            {/* Step 1: labels */}
            {step===0 && (
              <>
                <div className="muted">Which rectangle is the <b>Original</b>? Which is the <b>Copy</b>? Drag the labels onto the shapes.</div>
                <div className="row" style={{display:'flex',gap:8,marginTop:8}}>
                  <Slot test={testWord('Original')} onDropContent={(d)=>dropLabel('left',d)}>
                    <span className="slot">Left label</span>
                  </Slot>
                  <Slot test={testWord('Copy')} onDropContent={(d)=>dropLabel('right',d)}>
                    <span className="slot">Right label</span>
                  </Slot>
                </div>
                <div className="chips mt-10">
                  <Draggable id="wO" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wC" label="Copy" data={{kind:'word',label:'Copy'}} />
                </div>
              </>
            )}

            {/* Step 2: pick pair by cross-rectangle clicks */}
            {step===1 && (
              <div className="muted">Pick a side on one rectangle, then the matching side on the other. Which sides go together?</div>
            )}

            {/* Step 3: formula words only */}
            {step===2 && (
              <>
                <div className="muted">Let’s build it: <b>Scale Factor = Copy / Original</b>. Drag words only.</div>
                <div className="fraction-row mt-8">
                  {/* "Scale Factor" = [Copy]/[Original] */}
                  <Slot test={testWord('Scale Factor')} onDropContent={onDropFormula('sSF','Scale Factor')}>
                    {slots.sSF || '____'}
                  </Slot>
                  <span>=</span>
                  <div className="fraction ml-6">
                    <div>
                      <Slot test={testWord('Copy')} onDropContent={onDropFormula('sNUM','Copy')}>
                        {slots.sNUM || '____'}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={testWord('Original')} onDropContent={onDropFormula('sDEN','Original')}>
                        {slots.sDEN || '____'}
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
                {/* Persistent formula banner from here on */}
                {formulaReady && (
                  <div className="fraction-row muted mt-8">
                    <span>Scale Factor = </span>
                    <div className="fraction ml-6">
                      <div>{num ?? '—'}</div>
                      <div className="frac-bar"></div>
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
                  <div className="frac-bar"></div>
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
                      <div className="frac-bar"></div>
                      <div>{den ?? '—'}</div>
                    </div>
                  </div>
                )}
                <div className="fraction mt-8">
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar"></div>
                  <div>
                    <Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('den',d)}>
                      {den ?? '—'}
                    </Slot>
                  </div>
                </div>
              </>
            )}

            {/* Step 6: calculate scale */}
            {step===5 && (
              <>
                <div className="muted">We’ll compute and simplify if needed.</div>
                <div className="fraction mt-8">
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar"></div>
                  <div>{den ?? '—'}</div>
                </div>
                <div className="chips mt-8">
                  <button className="button primary" onClick={doCalculate}>Calculate Scale</button>
                </div>
              </>
            )}

            {/* Step 7: build missing-side equation */}
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

            {/* Step 8: identify missing side (click) */}
            {step===7 && (
              <>
                <div className="muted">Click the side on the Copy that is missing (the other orientation).</div>
                <div className="toolbar mt-8">
                  <button className="button primary" onClick={()=>{ done(7); next() }}>I found it</button>
                </div>
              </>
            )}

            {/* Step 9: compute missing side */}
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
