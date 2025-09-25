import React from 'react'

export default function SummaryOverlay({ open, onClose, attempts = [], stepHeads = [] }){
  if(!open) return null
  return (
    <div className="summary-panel" role="dialog" aria-modal="true" aria-label="Session Summary">
      <div className="summary-card card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{margin:0}}>Summary</h2>
          <button className="button" onClick={onClose}>Close</button>
        </div>
        <div style={{marginTop:12}}>
          {attempts.length===0 && <div className="muted">No completed attempts yet.</div>}
          {attempts.map((a,idx)=>(
            <div key={idx} style={{marginBottom:16}}>
              <div className="kv">
                <div className="kv col head">Attempt</div>
                <div className="kv col">{idx+1}</div>
                <div className="kv col head">Score</div>
                <div className="kv col">{a.scoreColor}</div>
                <div className="kv col head">Steps</div>
                <div className="kv col" style={{gridColumn:'span 7'}}>
                  <div style={{display:'grid',gridTemplateColumns:`repeat(${stepHeads.length},1fr)`,gap:6}}>
                    {a.stepResults?.map((s,i)=>{
                      const cls = s.done ? (s.misses===0?'stepbox ok':(s.misses===1?'stepbox warn':'stepbox bad')) : 'stepbox'
                      return <div key={i} className={cls} title={stepHeads[i]}>{i+1}</div>
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
