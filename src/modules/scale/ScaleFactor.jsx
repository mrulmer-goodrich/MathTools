import React, { useMemo, useState } from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const STEP_HEADS = [
  'Build the formula', 'Label shapes', 'Pick the corresponding sides', 'Copy → Numerator', 'Original → Denominator', 'Calculate Scale',
  'Build missing-side equation', 'Identify missing side', 'Compute missing side'
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

  const saveSnap = (extra={})=>{
    const snap = { problem, step, steps, ...extra }
    const nextSession = { ...session, scaleSnap: snap }
    saveSession(nextSession); setSession(nextSession)
  }

  const [labels, setLabels] = useState(()=>session.scaleSnap?.labels || { left:null, right:null })

  const ow = problem.original.w, oh = problem.original.h
  const cw = problem.copy.w, ch = problem.copy.h
  const shown = problem.shownPair
  const missingPair = problem.missingPair

  const rectStyle = (w,h)=>({ width: Math.max(120, w*6)+'px', height: Math.max(90, h*6)+'px' })

  const [picked, setPicked] = useState(()=>session.scaleSnap?.picked || false)

  const [slots, setSlots] = useState(()=>session.scaleSnap?.slots || { sSF:null, sEQ:'=', sNUM:null, sDIV:'/', sDEN:null })

  const copyVals = { horizontal: cw, vertical: ch }
  const origVals = { horizontal: ow, vertical: oh }
  const [num, setNum] = useState(()=>session.scaleSnap?.num ?? null)
  const [den, setDen] = useState(()=>session.scaleSnap?.den ?? null)

  const [missSide, setMissSide] = useState(()=>session.scaleSnap?.missSide || (missingPair))
  const [mSlots, setMSlots] = useState(()=>session.scaleSnap?.mSlots || { left:'Original', op:'×', right:'Scale Factor', eq:'=', out:null })
  const [missingResult, setMissingResult] = useState(()=>session.scaleSnap?.missingResult ?? null)

  const wordBank = useMemo(()=>{
    const words = ['Scale Factor','Copy','Original','Proportion','Ratio','Corresponding','Similar','Figure','Image','Equivalent']
    return words.map((w,i)=>({ id:'w'+i, label:w, kind:'word' }))
  },[])

  const testWord = want => d => d?.kind==='word' && d.label===want
  const testNum = d => d?.kind==='num'

  const onDropFormula = (slotKey, want) => d => {
    if (!testWord(want)(d)) { miss(0); return }
    setSlots(prev=>({...prev, [slotKey]: want }))
    const after = { ...slots, [slotKey]: want }
    const ok = after.sSF==='Scale Factor' && after.sNUM==='Copy' && after.sDEN==='Original'
    if(ok){ done(0); next(); saveSnap({slots:after}) }
  }

  const dropLabel = (side,d)=>{
    if(!testWord('Original')(d) && !testWord('Copy')(d)){ miss(1); return }
    setLabels(prev=>({...prev, [side]: d.label }))
    const after = { ...labels, [side]: d.label }
    if(after.left && after.right && after.left!==after.right){ done(1); next(); saveSnap({labels:after}) }
  }

  const clickSide = (which)=>{
    if(!labels.left || !labels.right){ miss(2); return }
    if(which===shown){ setPicked(true); done(2); next(); saveSnap({picked:true}) } else { miss(2) }
  }

  const dropNum = (where,d)=>{
    if(!testNum(d)) { miss(where==='num'?3:4); return }
    const correctCopy = copyVals[shown], correctOrig = origVals[shown]
    if(where==='num'){
      if(d.value===correctCopy){ setNum(d.value); done(3); next(); saveSnap({num:d.value}) } else miss(3)
    } else {
      if(d.value===correctOrig){ setDen(d.value); done(4); next(); saveSnap({den:d.value}) } else miss(4)
    }
  }

  const doCalculate = ()=>{
    if(num==null || den==null){ miss(5); return }
    done(5); next(); saveSnap()
  }

  const computeMissing = ()=>{
    const origSide = origVals[missingPair]
    const sf = num/den
    const result = origSide * sf
    setMissingResult(result)
    done(8)
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
    setSlots({sSF:null,sEQ:'=',sNUM:null,sDIV:'/',sDEN:null})
    setNum(null); setDen(null)
    setMissSide(p.missingPair); setMSlots({ left:'Original', op:'×', right:'Scale Factor', eq:'=', out:null })
    setMissingResult(null)
    saveSnap({ problem:p, step:0 })
  }

  const shapeNumChips = useMemo(()=>{
    const arr = []
    if(shown==='horizontal'){ arr.push({id:'cn', label:String(cw), kind:'num', value:cw}); arr.push({id:'on', label:String(ow), kind:'num', value:ow}) }
    else { arr.push({id:'cn', label:String(ch), kind:'num', value:ch}); arr.push({id:'on', label:String(oh), kind:'num', value:oh}) }
    return arr
  },[shown, cw,ch, ow,oh])

  return (
    <div className="container">
      <div className="panes">
        <div className="card shape-area">
          <div className="rects">
            <div className="rect" style={rectStyle(ow,oh)}>
              <div className={'shape-label '+(!labels.left?'hidden':'')}>{labels.left || 'Label me'}</div>
              {shown==='horizontal' && (<><div className="side-tag top">{ow}</div><div className="side-tag bottom">{ow}</div></>)}
              {shown==='vertical' && (<><div className="side-tag left">{oh}</div><div className="side-tag right">{oh}</div></>)}
              <div className={'side-hit top '+(picked && shown==='horizontal'?'good':'')} onClick={()=>clickSide('horizontal')}/>
              <div className={'side-hit bottom '+(picked && shown==='horizontal'?'good':'')} onClick={()=>clickSide('horizontal')}/>
              <div className={'side-hit left '+(picked && shown==='vertical'?'good':'')} onClick={()=>clickSide('vertical')}/>
              <div className={'side-hit right '+(picked && shown==='vertical'?'good':'')} onClick={()=>clickSide('vertical')}/>
            </div>

            <div className="rect copy" style={rectStyle(cw,ch)}>
              <div className={'shape-label '+(!labels.right?'hidden':'')}>{labels.right || 'Label me'}</div>
              {shown==='horizontal' && (<><div className="side-tag top">{cw}</div><div className="side-tag bottom">{cw}</div></>)}
              {shown==='vertical' && (<><div className="side-tag left">{ch}</div><div className="side-tag right">{ch}</div></>)}
            </div>
          </div>

          {picked && (
            <div className="chips" style={{justifyContent:'center', marginTop:10}}>
              {shapeNumChips.map(c=><Draggable key={c.id} id={c.id} label={c.label} data={c} />)}
            </div>
          )}

          <button className="button primary big-under" onClick={newProblem}>New Problem</button>
        </div>

        <div className="card right-steps">
          <div className="step-panel">
            <div className="step-title">{STEP_HEADS[step]}</div>

            {step===0 && (
              <>
                <div className="muted">Drag the words into the fraction (no numbers).</div>
                <div className="fraction-row" style={{marginTop:8}}>
                  <Slot test={testWord('Scale Factor')} onDropContent={onDropFormula('sSF','Scale Factor')}>{slots.sSF || '____'}</Slot>
                  <span>=</span>
                  <div className="fraction" style={{marginLeft:6}}>
                    <div><Slot test={testWord('Copy')} onDropContent={onDropFormula('sNUM','Copy')}>{slots.sNUM || '____'}</Slot></div>
                    <div className="frac-bar"></div>
                    <div><Slot test={testWord('Original')} onDropContent={onDropFormula('sDEN','Original')}>{slots.sDEN || '____'}</Slot></div>
                  </div>
                </div>
                <div className="chips">
                  {wordBank.map(w=><Draggable key={w.id} id={w.id} label={w.label} data={w} />)}
                </div>
              </>
            )}

            {step===1 && (
              <>
                <div className="muted">Drag “Original” onto the left rectangle and “Copy” onto the right.</div>
                <div className="row" style={{display:'flex',gap:8,marginTop:8}}>
                  <Slot test={testWord('Original')} onDropContent={(d)=>dropLabel('left',d)}><span className="slot">Left label</span></Slot>
                  <Slot test={testWord('Copy')} onDropContent={(d)=>dropLabel('right',d)}><span className="slot">Right label</span></Slot>
                </div>
                <div className="chips" style={{marginTop:10}}>
                  <Draggable id="wO" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wC" label="Copy" data={{kind:'word',label:'Copy'}} />
                </div>
              </>
            )}

            {step===2 && (
              <div className="muted">Click either one of the numbered side pairs on the rectangles.</div>
            )}

            {step===3 && (
              <>
                <div className="muted">Drag the <b>Copy</b> side value into the numerator.</div>
                <div className="fraction" style={{marginTop:8}}>
                  <div><Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('num',d)}>{num ?? '—'}</div>
                  <div className="frac-bar"></div>
                  <div>{den ?? '—'}</div>
                </div>
              </>
            )}

            {step===4 and (
              <>
                <div className="muted">Drag the <b>Original</b> side value into the denominator.</div>
                <div className="fraction" style={{marginTop:8}}>
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar"></div>
                  <div><Slot test={d=>d?.kind==='num'} onDropContent={(d)=>dropNum('den',d)}>{den ?? '—'}</Slot></div>
                </div>
              </>
            )}

            {step===5 and (
              <>
                <div className="muted">We’ll compute and simplify if needed.</div>
                <div className="fraction" style={{marginTop:8}}>
                  <div>{num ?? '—'}</div>
                  <div className="frac-bar"></div>
                  <div>{den ?? '—'}</div>
                </div>
                <div className="chips" style={{marginTop:8}}>
                  <button className="button primary" onClick={doCalculate}>Calculate Scale</button>
                </div>
              </>
            )}

            {step===6 and (
              <>
                <div className="muted">Drag words to build: Original × Scale Factor = Copy</div>
                <div className="chips" style={{marginTop:8}}>
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
                <div className="chips" style={{marginTop:8}}>
                  <Draggable id="wO2" label="Original" data={{kind:'word',label:'Original'}} />
                  <Draggable id="wSF2" label="Scale Factor" data={{kind:'word',label:'Scale Factor'}} />
                  <Draggable id="wC2" label="Copy" data={{kind:'word',label:'Copy'}} />
                </div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={()=>{ done(6); next() }}>Confirm</button>
                </div>
              </>
            )}

            {step===7 and (
              <>
                <div className="muted">Click the side on the Copy that is missing (the other orientation).</div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button primary" onClick={()=>{ done(7); next() }}>I found it</button>
                </div>
              </>
            )}

            {step===8 and (
              <>
                <div className="muted">We’ll use Original × (Copy/Original) to find the Copy’s missing side.</div>
                <div className="toolbar" style={{marginTop:8}}>
                  <button className="button success" onClick={computeMissing}>
                    Compute Missing Side
                  </button>
                </div>
                {missingResult!=null and (
                  <div className="chips" style={{marginTop:10}}>
                    <span className="badge">Result: {missingResult}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <button className="button primary floating-summary" onClick={()=>setOpenSum(true)}>Summary</button>
      <SummaryOverlay open={openSum} onClose={()=>setOpenSum(false)} attempts={session.attempts} stepHeads={STEP_HEADS} />
    </div>
  )
}
