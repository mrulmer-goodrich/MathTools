// src/modules/scale/ScaleFactor.jsx
import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 4

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

  // First/second side picks (edge-level, not just orientation)
  const [firstPick, setFirstPick] = useState(null) // {shape:'orig'|'copy', edge:'top'|'bottom'|'left'|'right', orient:'horizontal'|'vertical'}
  const [chosen, setChosen] = useState({ orig:null, copy:null }) // store exact edges once correct

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

  // fraction/number sources
  const formulaReady = slots.sSF && slots.sNUM && slots.sDEN
  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }

  // word bank (randomized once per problem)
  const wordBank = useMemo(()=>{
    const words = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    // randomize
    for(let i=words.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [words[i],words[j]]=[words[j],words[i]] }
    return words.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  }, [problem.id])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum = d => d?.kind==='num'

  // ----- Label drag & drop directly onto shapes (left pane full-rect slots) -----
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

  // ----- Corresponding sides: require two clicks across rectangles -----
  const clickSide = (shape, edge, orient)=>{
    if(!labels.left || !labels.right){ tryAgain(1); return }
    if(!firstPick){
      setFirstPick({shape, edge, orient})
      return
    }
    const otherShape = firstPick.shape==='orig' ? 'copy' : 'orig'
    const okOther   = (shape===otherShape) && (orient===shown)
    const okFirst   = (firstPick.orient===shown)
    if(okFirst && okOther){
      const pair = { orig: (shape==='orig'? edge : firstPick.edge), copy: (shape==='copy'? edge : firstPick.edge) }
      setChosen(pair)
      setPicked(true); setFirstPick(null); done(1); next()
    } else {
      setFirstPick(null); tryAgain(1)
    }
  }

  // ----- Formula building (words only) -----
  const onDropFormula = (slotKey, want) => d => {
    if (!testWord(want)(d)) { tryAgain(2); return }
    const after = { ...slots, [slotKey]: want }
    setSlots(after)
    const ok = after.sSF==='Scale Factor' && after.sNUM==='Copy' && after.sDEN==='Original'
    if(ok){ done(2); next() }
  }

  // ----- Drag numbers from the shapes (on-image tags) into fraction -----
  const dropNum = (where,d)=>{
    if(!testNum(d)) { tryAgain(where==='num'?3:4); return }
    const correctCopy = copyVals[shown], correctOrig = origVals[shown]
    if(where==='num'){
      if(d.value===correctCopy){ setNum(d.value); done(3); next() } else tryAgain(3)
    } else {
      if(d.value===correctOrig){ setDen(d.value); done(4); next() } else tryAgain(4)
    }
  }

  // ----- Calculate & show math (do not auto-advance) -----
  const [calc, setCalc] = useState(null) // {num, den, a, b, dec}
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

  // make chosen/selected state helpers
  const isChosen = (s,e)=> firstPick && firstPick.shape===s && firstPick.edge===e
  const isGood   = (s,e)=> picked && ((s==='orig' && chosen.orig===e) || (s==='copy' && chosen.copy===e))

  return (
    <div className="container">
      <div className="panes equal">
        {/* LEFT: shapes with full-rect drop zones for labels */}
        <div className="card shape-area">
          <div className="rects">
            {/* Original */}
            <Slot className="rect-slot" test={testWord('Original')} onDropContent={dropLabelOnRect('left')}>
              <div className="rect" style={rectStyle(ow,oh)}>
                <div className={"shape-label-center "+(!labels.left?'hidden':'')}>{labels.left || ''}</div>

                {/* On-image number tags ARE draggable sources */}
                <Draggable id="onum_h" label={String(ow)} data={{kind:'num', value: ow}} className="side-tag top" />
                <Draggable id="onum_v" label={String(oh)} data={{kind:'num', value: oh}} className="side-tag left" />

                {/* Click zones */}
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

                {/* Copy shows only the corresponding number for shown orientation */}
                {shown==='horizontal' && (<Draggable id="cnum_h" label={String(cw)} data={{kind:'num', value: cw}} className="side-tag top" />)}
                {shown==='vertical' && (<Draggable id="cnum_v" label={String(ch)} data={{kind:'num', value: ch}} className="side-tag left" />)}

                {/* Click zones */}
                <div className={"side-hit top "+(isChosen('copy','top')?'chosen':'')+" "+(isGood('copy','top')?'good':'')} onClick={()=>clickSide('copy','top','horizontal')}/>
                <div className={"side-hit bottom "+(isChosen('copy','bottom')?'chosen':'')+" "+(isGood('copy','bottom')?'good':'')} onClick={()=>clickSide('copy','bottom','horizontal')}/>
                <div className={"side-hit left "+(isChosen('copy','left')?'chosen':'')+" "+(isGood('copy','left')?'good':'')} onClick={()=>clickSide('copy','left','vertical')}/>
                <div className={"side-hit right "+(isChosen('copy','right')?'chosen':'')+" "+(isGood('copy','right')?'good':'')} onClick={()=>clickSide('copy','right','vertical')}/>
              </div>
            </Slot>
          </div>

          {/* removed: extra number chips below — students drag numbers directly from the shapes */}

          <button className="button primary big-under" onClick={newProblem}>New Problem</button>
        </div>

        {/* RIGHT: steps */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title question-xl">{STEP_HEADS[step]}</div>

            {/* Step 1: label shapes — drag onto LEFT pane */}
            {step===0 && (
              <div className="section">
                <div className="muted bigger">Drag and drop the words on the correct image.</div>
                <div className="chips mt-10 chips-lg with-borders">
                  <Draggable id="wO" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wC" label="Copy" data={{kind:'word',label:'Copy'}} />
                  {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
                </div>
              </div>
            )}

            {/* Step 2: pick pair by cross-rectangle clicks */}
            {step===1 && (
              <div className="section">
                <div className="muted bigger">Click one side on a rectangle, then click the matching side on the other rectangle.</div>
              </div>
            )}

            {/* Step 3: formula words only */}
            {step===2 && (
              <div className="section">
                <div className="muted bigger">Drag and drop the words to build the formula.</div>
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

            {/* Step 4: Copy → numerator (show formula words at left, numeric fraction next to it) */}
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

            {/* Step 5: Original → denominator (same layout) */}
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

            {/* Step 6: Calculate & show math (no auto-advance) */}
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

            {/* Step 7 */}
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

            {/* Step 8 */}
            {step===7 && (
              <div className="section">
                <div className="muted bigger">Click the side on the Copy that is missing (the other orientation).</div>
                <div className="toolbar mt-8">
                  <button className="button primary" onClick={()=>{ done(7); next() }}>I found it</button>
                </div>
              </div>
            )}

            {/* Step 9 */}
            {step===8 && (
              <div className="section">
                <div className="muted bigger">We’ll use Original × (Copy/Original) to find the Copy’s missing side.</div>
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
