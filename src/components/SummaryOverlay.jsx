import React from 'react'

export default function SummaryOverlay({ open, onClose, attempts, stepHeads }) {
  if (!open) return null

  const grid = (a, i) => {
    if (!a || !a.stepResults) return (
      <div key={i} className="stepbox" style={{ minWidth: 110 }}>
        <div>Q{i + 1}</div>
        <div className="badge">{a?.scoreColor?.toUpperCase() || '—'}</div>
        <div className="muted">{a?.missCount || 0} miss(es)</div>
      </div>
    )
  }

  return (
    <div className="summary-panel" onClick={onClose}>
      <div className="card summary-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Summary</h2>
          <button className="button" onClick={onClose}>Close</button>
        </div>

        {attempts && attempts.length > 0 ? attempts.map((a, i) => (
          <div key={i} className="card" style={{ marginTop: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>Problem {i + 1}</div>
              <div className="badge">{a.scoreColor?.toUpperCase()}</div>
            </div>

            {a.stepResults ? (
              <div className="kv" style={{ marginTop: 8 }}>
                {a.stepHeads?.map((h, idx) => (<div key={'h' + idx} className="col head">{h}</div>))}
                {a.stepResults?.map((s, idx) => {
                  const cls = s.misses === 0 ? 'ok' : (s.misses === 1 ? 'warn' : 'bad')
                  return <div key={'s' + idx} className={"col stepbox " + cls}>{s.misses === 0 ? '✓' : s.misses}</div>
                })}
              </div>
            ) : grid(a, i)}
          </div>
        )) : <div className="muted" style={{ marginTop: 10 }}>No completed problems yet.</div>}
      </div>
    </div>
  )
}
