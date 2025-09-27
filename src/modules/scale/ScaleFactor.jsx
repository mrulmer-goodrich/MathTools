// src/modules/scale/ScaleFactor.jsx (v3.0.7)
// Single-file drop-in. No external libs.
// Fixes vs. v3.0.2:
// - Always-rendered perpendicular original side (draggable; no "ghost").
// - All number chips (including '?') are draggable on value-fill steps.
// - Inline simplify display using ÷ GCD, and result uses reduced fraction.
// - Copy's "missing" side displayed as a '?' chip on the COPY rectangle.
// - Randomized concept-check options (simple, no gating).
// - Bigger, persistent pill styling preserved inside slots (uses .chip from CSS).
// - Keeps New Problem button flashing after success; no auto-advance.
// - Step text tweaks per latest notes.

import React, { useEffect, useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const SNAP_VERSION = 12

const STEP_HEADS = [
  'Label the rectangles',
  'Pick the corresponding sides that have values',
  'Build the scale factor formula (words)',
  'Fill the formula (values) — numerator',
  'Fill the formula (values) — denominator',
  'Calculate & simplify',
  'What value are we solving for?',
  'Compute the missing side'
]

export default function ScaleFactorModule() {
  const [session, setSession] = useState(loadSession())

  // ---------- snapshot ----------
  const freshSnap = {
    version: SNAP_VERSION,
    problem: genScaleProblem(),
    step: 0,
    labels: { left:null, right:null },
    firstPick: null,
    chosen: { orig:null, copy:null }, picked:false,
    slots: { sSF:null, sNUM:null, sDEN:null },
    num: null, den: null, calc: null,
    missingResult: null,
    celebrate: false
  }
  const persisted = (session.scaleSnap && session.scaleSnap.version===SNAP_VERSION)
    ? session.scaleSnap : freshSnap

  const [problem, setProblem] = useState(persisted.problem)
  const [step, setStep] = useState(persisted.step)
  const [labels, setLabels] = useState(persisted.labels)
  const [firstPick, setFirstPick] = useState(persisted.firstPick)
  const [chosen, setChosen] = useState(persisted.chosen)
  const [picked, setPicked] = useState(persisted.picked)
  const [slots, setSlots] = useState(persisted.slots)
  const [num, setNum] = useState(persisted.num)
  const [den, setDen] = useState(persisted.den)
  const [calc, setCalc] = useState(persisted.calc)
  const [missingResult, setMissingResult] = useState(persisted.missingResult)
  const [celebrate, setCelebrate] = useState(persisted.celebrate)

  const [openSum, setOpenSum] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // persist
  useEffect(()=>{
    const snap = { version: SNAP_VERSION, problem, step, labels, firstPick, chosen, picked, slots, num, den, calc, missingResult, celebrate }
    const next = { ...session, scaleSnap: snap }
    saveSession(next); setSession(next)
    // eslint-disable-next-line
  }, [problem, step, labels, firstPick, chosen, picked, slots, num, den, calc, missingResult, celebrate])

  // ---------- problem helpers ----------
  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w,     ch = problem.copy.h
  const shown = problem.shownPair          // 'horizontal'|'vertical'
  const missingPair = problem.missingPair  // opposite of shown

  // sizes
  const SCALE = 6
  const rectStyle = (w,h)=>({ width:Math.max(110,w*SCALE)+'px', height:Math.max(90,h*SCALE)+'px' })

  // shared pill metrics
  const sharedBadgeMetrics = useMemo(()=>{
    const basis = (shown==='horizontal'? Math.min(ow,cw):Math.min(oh,ch)) * SCALE
    const font = Math.max(18, Math.min(26, Math.floor(basis/6)))
    const padV = Math.round(font*0.45)
    const padH = Math.round(font*0.65)
    return { '--badge-font':`${font}px`, '--badge-pad-v':`${padV}px`, '--badge-pad-h':`${padH}px` }
  }, [ow,oh,cw,ch,shown])

  // bank
  const wordBank = useMemo(()=>{
    const base = ['Scale Factor','Copy','Original']
    return base.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  }, [problem.id])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum  = d => d?.kind==='num'

  const again = (msg)=>{ setErrorMsg(msg||'Try Again'); setTimeout(()=>setErrorMsg(''), 1000) }

  // ---------- step 0: labels ----------
  const dropLabelOnRect = side => d => {
    if (!testWord(side==='left'?'Original':'Copy')(d)) return again()
    const next = { ...labels, [side]: d.label }
    setLabels(next)
    if (next.left && next.right) setStep(1)
  }

  // ---------- step 1: correspondence ----------
  const clickSide=(shape, edge, orient)=>{
    if(step!==1) return
    if(orient!==shown){ again('Pick the sides that have values'); return }
    if(!firstPick){ setFirstPick({shape,edge,orient}); return }
    if(firstPick.shape===shape || firstPick.orient!==orient){ setFirstPick(null); again(); return }
    const pair = { orig:(shape==='orig'? firstPick.edge : edge), copy:(shape==='copy'? firstPick.edge : edge) }
    setChosen(pair); setPicked(true); setFirstPick(null); setStep(2)
  }

  // ---------- formula (words) ----------
  const onDropFormula = (slotKey, want) => (d) => {
    if (!testWord(want)(d)) return again()
    setSlots(prev=>({ ...prev, [slotKey]: d }))
    const nxt = { ...slots, [slotKey]: d }
    if (nxt.sSF && nxt.sNUM && nxt.sDEN) setStep(3)
  }

  // ---------- numeric drops ----------
  const dropNum = (where,d)=>{
    if(!testNum(d)) return again()
    if(where==='num'){ setNum(d.value); if(den!=null) setStep(5); else setStep(4) }
    else { setDen(d.value); if(num!=null) setStep(5) }
  }

  // ---------- calculate ----------
  const gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y){[x,y]=[y,x%y]}return x||1}
  const doCalculate = ()=>{
    if(num==null||den==null) return
    const g=gcd(num,den), a=num/g, b=den/g
    setCalc({num,den,a,b,g})
  }

  // ---------- new problem ----------
  const newProblem = ()=>{
    setProblem(genScaleProblem())
    setStep(0); setLabels({left:null,right:null}); setFirstPick(null)
    setChosen({orig:null,copy:null}); setPicked(false)
    setSlots({ sSF:null, sNUM:null, sDEN:null })
    setNum(null); setDen(null); setCalc(null)
    setMissingResult(null); setCelebrate(false)
  }

  // ---------- Tag (number chip) ----------
  const Tag = ({id, value, side, orient, shape}) => {
    const isShown = (orient===shown)
    const isMissing = (value==='?')
    const draggableNow = (step>=3 && step<=4) // allow distractors too
    const handleClick = ()=>{
      if(step===1) clickSide(shape,side,orient)
    }
    // Make all values draggable in steps 3–4 (including '?')
    if (draggableNow || isMissing) {
      return <Draggable id={id} label={String(value)} data={{kind:'num', value}} className="side-tag" style={sharedBadgeMetrics} />
    }
    // Regular badge (clickable at step 1)
    return <span className={"side-tag "+side} style={sharedBadgeMetrics} onClick={handleClick}>{value}</span>
  }

  // ---------- Rect ----------
  const RectWithLabel = ({which}) => {
    const isLeft = which==='orig'
    const w = isLeft ? ow : cw
    const h = isLeft ? oh : ch
    const base = (
      <div className={`rect ${!isLeft ? 'copy' : ''}`} style={rectStyle(w,h)}>
        <div className="shape-label-center">{labels[isLeft?'left':'right'] || ''}</div>

        {/* show the SHOWN pair as chips */}
        {shown==='horizontal' && (
          <Tag id={(isLeft?'o':'c')+"num_h"} value={isLeft?ow:cw} side="top" orient="horizontal" shape={isLeft?'orig':'copy'} />
        )}
        {shown==='vertical' && (
          <Tag id={(isLeft?'o':'c')+"num_v"} value={isLeft?oh:ch} side="left" orient="vertical" shape={isLeft?'orig':'copy'} />
        )}

        {/* Always show the perpendicular ORIGINAL value (draggable on steps 3–4) */}
        {isLeft && missingPair==='horizontal' && (
          <Tag id="orig_perp_h" value={oh} side="left" orient="vertical" shape="orig" />
        )}
        {isLeft && missingPair==='vertical' && (
          <Tag id="orig_perp_v" value={ow} side="top" orient="horizontal" shape="orig" />
        )}

        {/* The copy's perpendicular side is the UNKNOWN we solve for */}
        {!isLeft && missingPair==='horizontal' && (
          <Tag id="copy_missing_h" value="?" side="left" orient="horizontal" shape="copy" />
        )}
        {!isLeft && missingPair==='vertical' && (
          <Tag id="copy_missing_v" value="?" side="top" orient="vertical" shape="copy" />
        )}

        {/* Wide click zones for step 1 */}
        <div className="side-hit top" onClick={()=>clickSide(isLeft?'orig':'copy','top','horizontal')} />
        <div className="side-hit bottom" onClick={()=>clickSide(isLeft?'orig':'copy','bottom','horizontal')} />
        <div className="side-hit left" onClick={()=>clickSide(isLeft?'orig':'copy','left','vertical')} />
        <div className="side-hit right" onClick={()=>clickSide(isLeft?'orig':'copy','right','vertical')} />
      </div>
    )
    // labels are placed via right panel; rectangles themselves are not slots after step 0
    return base
  }

  // ---------- UI ----------
  return (
    <div className="container">
      <div className="panes equal">
        {/* LEFT: shapes */}
        <div className="card shape-area">
          <div className="rects" style={sharedBadgeMetrics}>
            <RectWithLabel which="orig" />
            <RectWithLabel which="copy" />
          </div>
          <button className={"button primary big-under "+(celebrate?'flash':'')} onClick={newProblem}>New Problem</button>
        </div>

        {/* RIGHT */}
        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title question-xl">{STEP_HEADS[step]}</div>

            {step===0 && (
              <div className="section">
                <div className="muted bigger">Drag and drop the words onto the rectangles.</div>
                <div className="chips mt-10 chips-lg with-borders">
                  <Draggable id="wO" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wC" label="Copy" data={{kind:'word',label:'Copy'}} />
                </div>
              </div>
            )}

            {step===1 && (
              <div className="section">
                <div className="muted bigger">Click one side on a rectangle, then click the matching side on the other rectangle.</div>
                {errorMsg && <div className="error big-red mt-8">{errorMsg}</div>}
              </div>
            )}

            {step===2 && (
              <div className="section">
                <div className="muted bigger">Drag the words to build the formula.</div>
                <div className="fraction-row mt-8 big-fraction nowrap">
                  <Slot test={testWord('Scale Factor')} onDropContent={onDropFormula('sSF','Scale Factor')}>
                    {slots.sSF ? <span className="chip">{slots.sSF.label}</span> : '_____'}
                  </Slot>
                  <span>=</span>
                  <div className="fraction ml-6">
                    <div>
                      <Slot test={testWord('Copy')} onDropContent={onDropFormula('sNUM','Copy')}>
                        {slots.sNUM ? <span className="chip">{slots.sNUM.label}</span> : '_____'}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={testWord('Original')} onDropContent={onDropFormula('sDEN','Original')}>
                        {slots.sDEN ? <span className="chip">{slots.sDEN.label}</span> : '_____'}
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
                <div className="muted bigger">Fill in the values from the shapes.</div>
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
                        {num == null ? '—' : <span className="chip">{num}</span>}
                      </Slot>
                    </div>
                    <div className="frac-bar"></div>
                    <div>{den == null ? '—' : <span className="chip">{den}</span>}</div>
                  </div>
                </div>
              </div>
            )}

            {step===4 && (
              <div className="section">
                <div className="muted bigger">Fill in the values from the shapes.</div>
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
                    <div>{num == null ? '—' : <span className="chip">{num}</span>}</div>
                    <div className="frac-bar"></div>
                    <div>
                      <Slot test={testNum} onDropContent={(d)=>dropNum('den',d)}>
                        {den == null ? '—' : <span className="chip">{den}</span>}
                      </Slot>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step===5 && (
              <div className="section">
                <div className="muted bigger">Tap Calculate to simplify.</div>
                <div className="row mt-8" style={{alignItems:'center', gap:12}}>
                  <button className="button primary" onClick={doCalculate}>Calculate</button>
                </div>
                {calc && (
                  <div className="mt-10">
                    <div className="muted bigger">Divide numerator and denominator by <b>{calc.g}</b>:</div>
                    <div className="fraction-row mt-8 big-fraction">
                      <div className="chip">{calc.num}</div>
                      <span>÷</span>
                      <div className="chip">{calc.g}</div>
                      <span>/</span>
                      <div className="chip">{calc.den}</div>
                      <span>÷</span>
                      <div className="chip">{calc.g}</div>
                      <span>=</span>
                      <div className="chip">{calc.a}</div>
                      <span>/</span>
                      <div className="chip">{calc.b}</div>
                    </div>
                    <div className="toolbar mt-10">
                      <button className="button primary" onClick={()=>setStep(6)}>Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step===6 && (
              <div className="section">
                <div className="muted bigger">What value are we solving for?</div>
                <div className="chips mt-8 chips-lg with-borders">
                  {['Original','Copy','Scale Factor','÷'].sort(()=>Math.random()-0.5).map((w,i)=>
                    <Draggable key={i} id={'cc'+i} label={w} data={{kind:'word',label:w}} />)}
                </div>
                <div className="toolbar mt-10">
                  <button className="button primary" onClick={()=>setStep(7)}>Next</button>
                </div>
              </div>
            )}

            {step===7 && (
              <div className="section">
                <div className="muted bigger">Use the reduced scale factor.</div>
                <div className="row mt-8" style={{alignItems:'center', gap:14}}>
                  <div className="chip">Original × {calc ? `${calc.a}/${calc.b}` : 'SF'} = Copy</div>
                  <button className="button success" onClick={()=>{
                    const sf = calc ? (calc.a/calc.b) : (num/den)
                    const origSide = (problem.original[missingPair]) // the known original on missing orientation
                    const result = Math.round(origSide*sf*100)/100
                    setMissingResult(result); setCelebrate(true)
                  }}>Compute Missing Side</button>
                </div>
                {missingResult!=null && (
                  <div className="chips mt-10">
                    <span className="badge" style={{fontSize:'1.4rem'}}>Result: <b>{missingResult}</b></span>
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
