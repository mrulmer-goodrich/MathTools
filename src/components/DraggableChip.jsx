// src/components/DraggableChip.jsx
import React from 'react'

/**
 * Draggable chip/pill.
 * NOTE: This version forwards `className` and `style` so components like
 * ScaleFactor can render absolute-positioned number pills by passing
 * `className="side-tag top"` etc. Without this, pills lose their size/position.
 */
export default function Draggable({
  id,
  label,
  data,
  inline = false,
  className = '',
  style = undefined,
  children = null,
}) {
  const payload = data || { id, label, kind: 'chip' }

  const onDragStart = (e) => {
    const json = JSON.stringify(payload)
    // Set both MIME types so all browsers provide something on drop
    e.dataTransfer.setData('application/json', json)
    e.dataTransfer.setData('text/plain', json)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // Merge our base "chip" class with any caller-provided className (e.g., "side-tag top")
  const cls = ['chip', inline ? 'inline' : '', className].filter(Boolean).join(' ')

  return (
    <span
      draggable
      onDragStart={onDragStart}
      className={cls}
      style={style}
      aria-label={label}
      title={label}
    >
      {label ?? children}
    </span>
  )
}
