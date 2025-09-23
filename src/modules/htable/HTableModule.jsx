import React, {useEffect, useMemo, useState} from 'react'
import Draggable from '../../components/DraggableChip.jsx'
import Slot from '../../components/DropSlot.jsx'
import SummaryOverlay from '../../components/SummaryOverlay.jsx'
import { genHProblem } from '../../lib/generator.js'
import { loadSession, saveSession } from '../../lib/localStorage.js'

const STEP_HEADS = [
  'Start','Columns','Units','Scale','Given','Next:×','Multiply','Next:÷','Divide','Simplify'
]

export default function HTableModule(){
  const [session,setSession] = useState(loadSession())
  const [problem,setProblem] = useState(genHProblem())
  const [misses,setMisses] = useState(0)
  const [steps,setSteps] = useState(STEP_HEADS.map(()=>({correct:false,misses:0})))
  const [openSum,setOpenSum] = useState(false)
  const [showEnglish,setShowEnglish] = useState(true)
  const [alt,setAlt] = useState(null)
  const [table,setTable] = useState({ headerTop:'', headerBottom:'', scaleTop:null, scaleBottom:null, givenBottom:null, resultTop:null })

  useEffect(()=>{
    const t = setTimeout(()=>{ setShowEnglish(false); setAlt(problem.altModes[0]) }, 10000)
    return ()=>clearTimeout(t)
  },[problem.id])

  const markMiss = (idx)=>{
    setMisses(m=>m+1)
    setSteps(s=>{ const c=[...s]; c[idx]={...c[idx],misses:c[idx].misses+1}; return c })
  }

  const textBlock = ()=>{
    if(showEnglish) return problem.textEnglish
    if(alt==='FadeOut') return ' '.repeat(100)
    if(alt==='BlackOut') return '████ ███ █████ ███ ███ ██████'
    return `[${alt} version shown — words obscured]`
  }

  const chipsUnits = [
    {id:'u1',label:problem.units[0], kind:'unit', row:'top'},
    {id:'u2',label:problem.units[1], kind:'unit', row:'bottom'},
  ]
  const chipsScale = [
    {id:'s1',label:String(problem.scale[0]), kind:'num', role:'scaleTop', value:problem.scale[0]},
    {id:'s2',label:String(problem.scale[1]), kind:'num', role:'scaleBottom', value:problem.scale[1]},
  ]
  const chipsGiven = [
    {id:'g1',label:String(problem.givenValue.value), kind:'num', role:'givenBottom', value:problem.givenValue.value}
  ]

  const setStepOk = (idx)=> setSteps(s=>{ const c=[...s]; c[idx]={...c[idx],correct:true}; return c })

  const finishProblem = ()=>{
    const scoreColor = misses===0?'green':(misses===1?'yellow':'red')
    const stepResults = steps
    const attempt = { scoreColor, stepResults, stepHeads: STEP_HEADS }
    const nextSession = {...session, attempts:[...session.attempts, attempt]}
    saveSession(nextSession); setSession(nextSession)
    // reset
    setProblem(genHProblem()); setMisses(0); setSteps(STEP_HEADS.map(()=>({correct:false,misses:0})))
    setShowEnglish(true); setAlt(null); setTable({ headerTop:'', headerBottom:'', scaleTop:null, scaleBottom:null, givenBottom:null, resultTop:null })
  }

  // compute logic
  const product = useMemo(()=> table.givenBottom!=null && table.scaleTop!=null ? table.givenBottom * table.scaleTop : null, [table])
  const divided = useMemo(()=> product!=null && table.scaleBottom!=null ? product / table.scaleBottom : null, [product, table])

  return (
    <div className="container">
      <div className="header">
        <div className="brand">H‑Table</div>
        <div className="toolbar">
          <button className="button" onMouseDown={()=>setShowEnglish(true)} onMouseUp={()=>{ setShowEnglish(false); setAlt(problem.altModes[(problem.altModes.indexOf(alt)+1)%problem.altModes.length] || problem.altModes[0]) }}>
            Hold: English
          </button>
          <button className="button" onClick={()=>setOpenSum(true)}>Summary</button>
        </div>
      </div>

      <div className="hpanel">
        <div className="card">
          <div className="subtitle">Word Problem</div>
          <div className="card" style={{minHeight:120}}>{textBlock()}</div>

          <div className="subtitle" style={{marginTop:10}}>Step 1 — What do you do first?</div>
          <div className="chips">
            <Draggable id="start_h" label="Set up an H‑table" data={{kind:'action', action:'start'}} />
            <Draggable id="start_x" label="Add numbers" data={{kind:'action', action:'wrong'}} />
          </div>
          <div className="row">
            <Slot test={(d)=>d.kind==='action' && d.action==='start'} onDropContent={()=>setStepOk(0)}><span>Drop here</span></Slot>
          </div>

          <div className="subtitle" style={{marginTop:10}}>Step 2 — Label the columns</div>
          <div className="chips">
            <Draggable id="col_units" label="Units" data={{kind:'col',label:'Units'}} />
            <Draggable id="col_scale" label="Scale" data={{kind:'col',label:'Scale'}} />
          </div>
          <div className="row" style={{gap:10}}>
            <Slot test={(d)=>d.kind==='col' && d.label} onDropContent={(d)=>{ setTable(t=>({...t, col1:d.label})); setStepOk(1) }}><span>Column 1</span></Slot>
            <Slot test={(d)=>d.kind==='col' && d.label} onDropContent={(d)=>{ setTable(t=>({...t, col2:d.label})); setStepOk(1) }}><span>Column 2</span></Slot>
          </div>

          <div className="subtitle" style={{marginTop:10}}>Step 3 — What are the units?</div>
          <div className="chips">
            {chipsUnits.map(ch=>(<Draggable key={ch.id} id={ch.id} label={ch.label} data={ch} />))}
          </div>
          <table className="htable">
            <thead>
              <tr><th>{table.col1||'Col 1'}</th><th>{table.col2||'Col 2'}</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><Slot test={(d)=>d.kind==='unit' && d.row==='top'} onDropContent={(d)=>{ setTable(t=>({...t, headerTop:d.label})); setStepOk(2) }}>{table.headerTop||'top unit'}</Slot></td>
                <td><Slot test={(d)=>d.kind==='num' && d.role==='scaleTop'} onDropContent={(d)=>{ setTable(t=>({...t, scaleTop:d.value})); setStepOk(3) }}>{table.scaleTop??'—'}</Slot></td>
              </tr>
              <tr>
                <td><Slot test={(d)=>d.kind==='unit' && d.row==='bottom'} onDropContent={(d)=>{ setTable(t=>({...t, headerBottom:d.label})); setStepOk(2) }}>{table.headerBottom||'bottom unit'}</Slot></td>
                <td><Slot test={(d)=>d.kind==='num' && d.role==='scaleBottom'} onDropContent={(d)=>{ setTable(t=>({...t, scaleBottom:d.value})); setStepOk(3) }}>{table.scaleBottom??'—'}</Slot></td>
              </tr>
            </tbody>
          </table>

          <div className="subtitle" style={{marginTop:10}}>Step 5 — What value is given?</div>
          <div className="chips">
            {chipsGiven.map(ch=>(<Draggable key={ch.id} id={ch.id} label={ch.label} data={ch} />))}
          </div>
          <div className="row">
            <Slot test={(d)=>d.kind==='num' && d.role==='givenBottom'} onDropContent={(d)=>{ setTable(t=>({...t, givenBottom:d.value})); setStepOk(4) }}><span>{table.givenBottom??'Drop given here (bottom row)'}</span></Slot>
          </div>

          <div className="subtitle" style={{marginTop:10}}>Step 6 — What do you do next?</div>
          <div className="chips">
            <Draggable id="nx_mul" label="Cross multiply" data={{kind:'act', act:'mul'}} />
            <Draggable id="nx_add" label="Add" data={{kind:'act', act:'add'}} />
          </div>
          <div className="row">
            <Slot test={(d)=>d.kind==='act' && d.act==='mul'} onDropContent={()=>setStepOk(5)}><span>Drop here</span></Slot>
          </div>

          <div className="subtitle" style={{marginTop:10}}>Step 7 — Multiply</div>
          <div className="chips">
            {table.givenBottom!=null && table.scaleTop!=null ? (
              <div className="badge">{table.givenBottom} × {table.scaleTop} = {product??'?'}</div>
            ): <div className="muted">Drag correct numbers to multiply</div>}
          </div>
          <div className="row">
            <Slot test={(d)=>d.kind==='num'} onDropContent={()=>{ if(table.givenBottom!=null && table.scaleTop!=null){ setStepOk(6) } else { /* markMiss(6) */ } }}><span>Confirm multiply</span></Slot>
          </div>

          <div className="subtitle" style={{marginTop:10}}>Step 8 — What’s next?</div>
          <div className="chips">
            <Draggable id="nx_div" label="Divide" data={{kind:'act', act:'div'}} />
            <Draggable id="nx_sub" label="Subtract" data={{kind:'act', act:'sub'}} />
          </div>
          <div className="row">
            <Slot test={(d)=>d.kind==='act' && d.act==='div'} onDropContent={()=>setStepOk(7)}><span>Drop here</span></Slot>
          </div>

          <div className="subtitle" style={{marginTop:10}}>Step 9 — Divide</div>
          <div className="chips">
            {product!=null && table.scaleBottom!=null ? (
              <div className="badge">{product} ÷ {table.scaleBottom} = {divided??'?'}</div>
            ): <div className="muted">Drag divisor to confirm</div>}
          </div>
          <div className="row">
            <Slot test={(d)=>d.kind==='num'} onDropContent={()=>{ if(product!=null && table.scaleBottom!=null){ setStepOk(8) } }}><span>Confirm divide</span></Slot>
          </div>

          <div className="subtitle" style={{marginTop:10}}>Step 10 — Simplify (auto)</div>
          <div className="chips">
            {divided!=null ? <div className="badge">Result: {divided}</div> : <div className="muted">Waiting result</div>}
          </div>
          <div className="toolbar" style={{marginTop:10}}>
            <button className="button primary" disabled={divided==null} onClick={finishProblem}>Submit</button>
          </div>

        </div>

        <div className="card">
          <div className="subtitle">From text (drag-only)</div>
          <div className="chips">
            {/* Expose chips the student must harvest from text */}
            {chipsUnits.concat(chipsScale).concat(chipsGiven).map(ch=>(<Draggable key={ch.id} id={ch.id} label={ch.label} data={ch} />))}
          </div>
          <div className="muted">Note: In the real flow, these would be selected from within the text via drag; for MVP we expose them as chips sourced from the problem text.</div>
          <div className="subtitle" style={{marginTop:16}}>Steps</div>
          <div className="kv">
            {STEP_HEADS.map((h,i)=>(<div key={'h'+i} className="col head">{h}</div>))}
            {steps.map((s,i)=>{
              const cls = s.misses===0 && s.correct?'ok':(s.misses<=1?'warn':'bad')
              return <div key={'s'+i} className={"col stepbox "+cls}>{s.correct?'✓':(s.misses||'')}</div>
            })}
          </div>
        </div>
      </div>

      <SummaryOverlay open={openSum} onClose={()=>setOpenSum(false)} attempts={session.attempts} mode="htable" showSteps />
    </div>
  )
}
