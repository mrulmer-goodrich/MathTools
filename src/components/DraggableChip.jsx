import React from 'react'

export default function DraggableChip({ id, label, data = {}, className = '', style }) {
  const onDragStart = (e) => {
    const payload = JSON.stringify({ id, label, ...data })
    e.dataTransfer.setData('application/json', payload)
    // also set text/plain for broader compatibility
    e.dataTransfer.setData('text/plain', payload)
    e.dataTransfer.effectAllowed = 'copyMove'
  }
  return (
    <div
      className={'chip ' + className}
      draggable
      onDragStart={onDragStart}
      style={style}
      aria-label={label}
      role="button"
    >
      {label}
    </div>
  )
}
