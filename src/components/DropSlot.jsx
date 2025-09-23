import React, {useState} from 'react'

export default function DropSlot({accept,test,onDropContent,children,style}){
  const [glow,setGlow] = useState(false)
  return (
    <div className={"slot "+(glow?'glow':'')} style={style}
      onDragOver={(e)=>{ 
        const txt = e.dataTransfer.getData('text/plain')
        if(!txt){ e.preventDefault(); return }
        try{
          const data = JSON.parse(txt)
          if(!test || test(data)){ e.preventDefault(); setGlow(true) }
        }catch{}
      }}
      onDragLeave={()=>setGlow(false)}
      onDrop={(e)=>{
        e.preventDefault(); setGlow(false)
        try{
          const data = JSON.parse(e.dataTransfer.getData('text/plain'))
          if(!test || test(data)){ onDropContent&&onDropContent(data) }
        }catch{}
      }}
    >{children}</div>
  )
}
