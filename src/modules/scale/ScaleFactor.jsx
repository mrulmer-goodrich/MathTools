import React, {useEffect, useMemo, useState} from 'react'
import Fraction from '../../components/Fraction.jsx'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import { genScaleProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'

export default function ScaleFactorModule(){
  const [session,setSession] = useState(loadSession())
  const [problem,setProblem] = useState(genScaleProblem())
  const [misses,setMisses] = useState(0)
  const [stage,setStage] = useState('A')
  const [openSum,setOpenSum] = useState(false)
  const [fraction,setFraction] = useState({num:null,den:null})
  const [labels,setLabels] = useState({left:null,right:null}) // 'Original' | 'Copy'
  const [pair,setPair] = useState(null) // index of chosen pair
  const [simplified,setSimplified] = useState(false)
  const [sf,setSf] = useState(null) // scale factor value as fraction {p,q}
  const [part2,setPart2] = useState({equation:false,sf:false,chosen:false,computed:false})

  useEffect(()=>{ if(!session.settings.keepOnReload){ /* start fresh each load */ } },[])

  const wordChips = [
    {id:'copy', label:'Copy', kind:'word'},
    {id:'original', label:'Original', kind:'word'}
  ]

  const numberChips = useMemo(()=>{
    const vals = [...problem.original.sideLengths, ...problem.copy.sideLengths, ...problem.distractors]
    return vals.map((v,i)=>({id:'n'+i,label:String(v),kind:'num',value:v}))
  },[problem])

  const testWord = (want)=> (data)=> data?.kind==='word' && data.label.toLowerCase()===want
  const testNum = ()=> (data)=> data?.kind==='num'

  const markMiss = ()=> setMisses(m=>m+1)

  const onDropNum = (where,data)=>{
    const v = data.value
    if(where==='num'){ // numerator must be from copy
      // if pair chosen, require copy value of that pair
      const ok = pair==null ? (problem.copy.sideLengths.includes(v)) : (v===problem.copy.sideLengths[pair])
      if(ok){ setFraction(f=>({...f,num:v})) } else { markMiss() }
    } else {
      const ok = pair==null ? (problem.original.sideLengths.includes(v)) : (v===problem.original.sideLengths[pair])
      if(ok){ setFraction(f=>({...f,den:v})) } else { markMiss() }
    }
  }

  const canSubmitPart1 = ()=>{
    const okFrac = fraction.num && fraction.den
    if(!okFrac) return false
    const needsSimp = session.settings.countSimplification && (gcd(fraction.num,fraction.den)!==Math.min(fraction.num,fraction.den))
    return okFrac && (!needsSimp || simplified)
  }

  const gcd = (a,b)=> b===0?a:gcd(b,a%b)

  const doSimplifyStep = (div)=>{
    const n = +fraction.num, d = +fraction.den
    if(n%div!==0 || d%div!==0){ markMiss(); return }
    const nn = n/div, dd = d/div
    setFraction({num:nn, den:dd})
    if(gcd(nn,dd)===1) setSimplified(true)
  }

  const selectPair = (idx)=>{
    setPair(idx)
  }

  const submitPart1 = ()=>{
    const sfFrac = {p:fraction.num, q:fraction.den}
    setSf(sfFrac)
    setStage('F')
  }

  // part 2 compute
  const computePart2 = ()=>{
    if(pair==null){ markMiss(); return }
    const orig = problem.original.sideLengths[pair]
    const value = Math.round((orig*sf.p)/sf.q)
    setPart2(p=>({...p,computed:true, value}))
  }

  const finishProblem = ()=>{
    const missCount = misses
    const scoreColor = missCount===0?'green':(missCount===1?'yellow':'red')
    const attempt = {missCount, scoreColor}
    const nextSession = {...session, attempts:[...session.attempts, attempt]}
    saveSession(nextSession); setSession(nextSession)
    // reset
    setProblem(genScaleProblem()); setMisses(0); setStage('A'); setFraction({num:null,den:null}); setSimplified(false); setPair(null); setSf(null); setPart2({equation:false,sf:false,chosen:false,computed:false})
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">Scale Factor</div>
        <div className="toolbar">
          <button className="button" onClick={()=>setOpenSum(true)}>Summary</button>
        </div>
      </div>

      <div className="panes">
        <div className="card shape-area">
          <div className="row">
            <div className="shape">
              <div className="shape-label">{labels.left||'?'}</div>
              <div className="side-tag a">{problem.original.sideLengths[0]}</div>
              <div className="side-tag b">{problem.original.sideLengths[1]??''}</div>
            </div>
            <div className="shape copy">
              <div className="shape-label">{labels.right||'?'}</div>
              <div className="side-tag a">{problem.copy.sideLengths[0]}</div>
              <div className="side-tag b">{problem.copy.sideLengths[1]??''}</div>
            </div>
          </div>

          <div className="chips">
            {wordChips.map((c)=>(<Draggable key={c.id} id={c.id} label={c.label} data={{...c}} />))}
          </div>

          <div className="row">
            <div>
              <div className="muted">Drop “Copy” on top, “Original” on bottom</div>
              <Fraction numerator={<Slot test={testWord('copy')} onDropContent={()=>{}}><span>Copy</span></Slot>} denominator={<Slot test={testWord('original')} onDropContent={()=>{}}><span>Original</span></Slot>} />
            </div>
            <div style={{marginLeft:20}}>
              <div className="muted">Now place the numbers</div>
              <Fraction numerator={<Slot test={testNum()} onDropContent={(d)=>onDropNum('num',d)}><span>{fraction.num??'—'}</span></Slot>} denominator={<Slot test={testNum()} onDropContent={(d)=>onDropNum('den',d)}><span>{fraction.den??'—'}</span></Slot>} />
            </div>
          </div>

          <div className="chips">
            {numberChips.map((c)=>(<Draggable key={c.id} id={c.id} label={c.label} data={{...c}} />))}
          </div>

          <div className="toolbar" style={{marginTop:8}}>
            <button className="button" onClick={()=>{ if(gcd(fraction.num||1,fraction.den||1)===1){ setSimplified(true) } }}>Are you done?</button>
            <button className="button" onClick={()=>doSimplifyStep(2)}>÷2</button>
            <button className="button" onClick={()=>doSimplifyStep(3)}>÷3</button>
            <button className="button" onClick={()=>doSimplifyStep(5)}>÷5</button>
            <button className="button primary" disabled={!canSubmitPart1()} onClick={submitPart1}>Submit Part 1</button>
          </div>
        </div>

        <div className="card">
          <div className="subtitle">Pick a corresponding pair (click a value on Original then same-index on Copy)</div>
          <div className="grid2">
            {problem.original.sideLengths.map((v,i)=>(
              <button key={'o'+i} className={"button "+(pair===i?'primary':'')} onClick={()=>selectPair(i)}>Original side {i+1}: {v}</button>
            ))}
          </div>
          {stage==='F' && (
            <div style={{marginTop:12}}>
              <div className="subtitle">Part 2 — Missing Side</div>
              <div className="row" style={{gap:8, alignItems:'center'}}>
                <span>Original × SF = Copy</span>
                <span className="code">{(sf?.p||'?')+'/'+(sf?.q||'?')}</span>
              </div>
              <div className="toolbar" style={{marginTop:8}}>
                <button className="button" onClick={computePart2}>Compute Copy for chosen pair</button>
                {part2.computed && <span className="badge">Result: {part2.value}</span>}
                {part2.computed && <button className="button primary" onClick={finishProblem}>Submit Final</button>}
              </div>
            </div>
          )}
        </div>
      </div>

      <SummaryOverlay open={openSum} onClose={()=>setOpenSum(false)} attempts={session.attempts} />
    </div>
  )
}
