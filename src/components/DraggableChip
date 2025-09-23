import React from 'react'

export default function DraggableChip({id,label,data,onDragStart}){
  return (
    <div className="chip" draggable
      onDragStart={(e)=>{ e.dataTransfer.setData('text/plain', JSON.stringify(data??{id,label})); onDragStart&&onDragStart(e);}}
      aria-grabbed="true"
    >{label}</div>
  )
}
