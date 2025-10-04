// src/modules/htable/HTableModule.jsx — OpSpec v9.3.0 (MASTER)
// Full-file replacement; follows UG Math Tools Operational Spec v9.3.0.
// Implements: 12-step (no prefixes), Step-4 two-tap auto-place + ~2s blink, Step-7/8 split with cell-tap destination,
// tap+drag parity via local wrappers, central blink map (2/3/5/6/8), randomization lock. Confetti unchanged.

import React, { useEffect, useMemo, useRef, useState } from "react";
import DraggableBase from "../../components/DraggableChip.jsx";
import DropSlotBase from "../../components/DropSlot.jsx";
import SummaryOverlay from "../../components/SummaryOverlay.jsx";
import { genHProblem } from "../../lib/generator.js";
import { loadSession, saveSession } from "../../lib/localStorage.js";

// ---------------- Tap-pick store (PTables style) ----------------
const _pickStore = { data:null, set(d){this.data=d||null;}, peek(){return this.data;}, clear(){this.data=null;} };

const Draggable = ({ payload, data, onClick, ...rest }) => {
  const merged = data ?? payload ?? undefined;
  const handleClick = (e) => { _pickStore.set(merged); onClick?.(e); };
  return <DraggableBase data={merged} onClick={handleClick} role="button" tabIndex={0} {...rest} />;
};

const Slot = ({ accept, onDrop, validator, test, onDropContent, onClick, children, blinkWrap=false, ...rest }) => {
  const testFn = test ?? ((d) => {
    const t = (d?.type ?? d?.kind ?? "").toString();
    const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
    const valOk = typeof validator === "function" ? !!validator(d) : true;
    return listOk && valOk;
  });
  const onDropContentFn = onDropContent ?? onDrop;
  const handleClick = (e) => {
    const picked = _pickStore.peek();
    if (picked && testFn(picked)) { try { onDropContentFn?.(picked); } catch {} ; _pickStore.clear(); }
    onClick?.(e);
  };
  return (
    <div className={`slot-wrap ${blinkWrap ? 'ptable-blink-wrap' : ''}`} onClick={handleClick}>
      <DropSlotBase test={testFn} onDropContent={onDropContentFn} {...rest}>{children}</DropSlotBase>
    </div>
  );
};
// ---------------- end wrappers ----------------

// ---- STEP TITLES (NO PREFIXES; SENTINEL ONCE) ----
const STEP_TITLES = [
  "What’s the first step to solve the problem?",
  "What goes in the first column?",
  "What goes in the next column?",
  "What are the two units in the problem? (click two)",
  "What value goes here? (top row scale)",
  "What value goes here? (bottom row scale)",
  "What’s the other value from the problem? (4 options)",
  "Where should this value go? (click cell in the table)",
  "What do we do now?",
  "Which numbers are we multiplying?",
  "What do we do next?",
  "Calculate",
];

// ---- Helpers & constants ----
const toLower = (s)=> (s||"").toLowerCase();
const shuffle = (arr)=>arr.slice().sort(()=>Math.random()-0.5);
const unitCategory=(u="")=>{
  const s=(u||"").toLowerCase();
  const cats = {
    length: ["mm","millimeter","millimeters","cm","centimeter","centimeters","m","meter","meters","km","kilometer","kilometers","in","inch","inches","ft","foot","feet","yd","yard","yards","mi","mile","miles"],
    time: ["sec","secs","second","seconds","min","mins","minute","minutes","hour","hours","day","days","week","weeks","year","years"],
    volume: ["tsp","tsps","teaspoon","teaspoons","tbsp","tbsps","tablespoon","tablespoons","cup","cups","quart","quarts","qt","qts","gallon","gallons","liter","liters","l","milliliter","milliliters","ml"],
    mass: ["gram","grams","g","kilogram","kilograms","kg","pound","pounds","lb","lbs"],
    count: ["item","items","page","pages","point","points"],
    money: ["dollar","dollars","$","euro","euros"]
  };
  for (const [k,v] of Object.entries(cats)) if(v.includes(s)) return k;
  return null;
};
const saneProblem=(p)=>{
  try{
    const [u1,u2]=p?.units||[]; const c1=unitCategory(u1), c2=unitCategory(u2);
    return !!(c1 && c2 && c1===c2);
  }catch{return false}
};
const genSaneHProblem=()=>{ let tries=0,p=genHProblem(); while(!saneProblem(p) && tries<50){p=genHProblem(); tries++;} return p; };

export default function HTableModule(){
  const H_SNAP_VERSION = 15;
  const [session, setSession] = useState(loadSession() || { attempts: [] });

  const _persist = session?.hSnap?.version===H_SNAP_VERSION ? session.hSnap : null;

  const [problem, setProblem] = useState(()=> _persist?.problem || genSaneHProblem());
  const [table, setTable]     = useState(()=> _persist?.table || ({
    head1:"", head2:"", // headers (Units, Scale Numbers)
    uTop:"", uBottom:"", // unit labels per row
    sTop:null, sBottom:null, // scale numbers
    vTop:null, vBottom:null, // values
    product:null, divisor:null, result:null
  }));
  const [step, setStep]       = useState(_persist?.step ?? 0);
  const [steps, setSteps]     = useState(_persist?.steps || STEP_TITLES.map(()=>({misses:0,done:false})));
  const [openSum, setOpenSum] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);

  // Derived from problem
  const canonicalTopUnit    = toLower(problem?.units?.[0] || "");
  const canonicalBottomUnit = toLower(problem?.units?.[1] || "");
  const [sA, sB] = problem?.scale || [null,null];
  const givenRow = problem?.given?.row || "top";
  const givenUnitLabel = (givenRow === "top" ? problem?.units?.[0] : problem?.units?.[1]) || "";

  const expectedScaleForRowUnit = (rowUnitLabel) => {
    const u = toLower(rowUnitLabel);
    if (!u) return null;
    if (u === canonicalTopUnit)    return sA ?? null;
    if (u === canonicalBottomUnit) return sB ?? null;
    return null;
  };
  const rowIsGivenUnit = (rowUnitLabel)=> toLower(rowUnitLabel) === toLower(givenUnitLabel);

  // Persistence
  useEffect(()=>{
    const next = { ...(session||{}), hSnap:{ version:H_SNAP_VERSION, problem, table, step, steps } };
    saveSession(next); setSession(next);
  },[problem, table, step, steps]);

  // Common helpers
  const miss    = (idx)=>setSteps(s=>{const c=[...s]; if(c[idx]) c[idx].misses++; return c;});
  const setDone = (idx)=>setSteps(s=>{const c=[...s]; if(c[idx]) c[idx].done=true; return c;});
  const next    = ()=>setStep(s=>Math.min(s+1, STEP_TITLES.length-1));

  // Blink mapping (central; indices: step 1.. etc)
  const blink = useMemo(()=>({
    header1: step===1,
    header2: step===2,
    sTop:    step===4,
    sBottom: step===5,
    vDest:   step===7,
  }),[step]);

  // Choice pools
  const headerChoices = useMemo(()=>[
    { type:"header", id:"Units", label:"Units" },
    { type:"header", id:"ScaleNumbers", label:"Scale Numbers" }
  ],[]);

  const unitChoices = useMemo(()=>{
    const u = (problem?.units || []).map((u,i)=>({ type:"unit", id:`u${i}`, label:String(u) }));
    return u; // no distractors
  },[problem?.id]);

  const scaleChoices = useMemo(()=>{
    const pool = [{ type:"scale", id:"sTop", value: sA }, { type:"scale", id:"sBottom", value: sB }];
    return pool;
  },[problem?.id]);

  const otherValueChoices = useMemo(()=>{
    const explicitOther = problem?.other?.value;
    const correct = ((explicitOther !== undefined && explicitOther !== null) ? explicitOther : problem?.given?.value);
    const cNum = Number(correct);
    const d1 = cNum + 1;
    const d2 = cNum + 2;
    const d3 = (Number(sA)||1) * (Number(sB)||2);
    const arr = [
      { type:"valuePick", id:"ov-correct", value:cNum, correct:true, label:String(cNum) },
      { type:"valuePick", id:"ov-d1", value:d1, correct:false, label:String(d1) },
      { type:"valuePick", id:"ov-d2", value:d2, correct:false, label:String(d2) },
      { type:"valuePick", id:"ov-d3", value:d3, correct:false, label:String(d3) },
    ];
    return arr;
  },[problem?.id]);

  // Accept/validate
  const acceptHeader1 = (d)=> d?.type==="header" && d?.id==="Units" && !table.head1;
  const acceptHeader2 = (d)=> d?.type==="header" && d?.id==="ScaleNumbers" && !table.head2;

  const acceptScaleTop = (d)=> d?.type==="scale" && table.uTop && (Number(d.value) === Number(expectedScaleForRowUnit(table.uTop)));
  const acceptScaleBottom = (d)=> d?.type==="scale" && table.uBottom && (Number(d.value) === Number(expectedScaleForRowUnit(table.uBottom)));

  // Step-1 choices (simple MCQ)
  const STEP1_CHOICES = [
    { id:"drawH", label:"Draw an H-Table", correct:true },
    { id:"proportion", label:"Make a Proportion", correct:false },
    { id:"convert", label:"Convert Units First", correct:false },
    { id:"guess", label:"Just Guess", correct:false },
  ];
  const handleStep1 = (id)=>{ if(id==="drawH"){ setDone(0); next(); } else { miss(0); } };

  // Step-2/3: headers
  const dropHeader1 = (d)=>{ if(!acceptHeader1(d)){ miss(1); return; } setTable(t=>({ ...t, head1:"Units" })); setDone(1); next(); };
  const dropHeader2 = (d)=>{ if(!acceptHeader2(d)){ miss(2); return; } setTable(t=>({ ...t, head2:"Scale Numbers" })); setDone(2); next(); };

  // Step-4: two taps on correct units → auto-place top then bottom + ~2s blink
  const [pickedUnits, setPickedUnits] = useState([]);
  const handlePickUnit = (u)=>{
    const low = toLower(u?.label||"");
    if(low!==canonicalTopUnit && low!==canonicalBottomUnit){ miss(3); return; }
    setPickedUnits(prev=>{
      const ids = prev.map(x=>x.label.toLowerCase());
      if(ids.includes(low)) return prev;
      const nextArr = [...prev, u];
      if(nextArr.length===2){
        const topObj = nextArr.find(x=>toLower(x.label)===canonicalTopUnit);
        const botObj = nextArr.find(x=>toLower(x.label)===canonicalBottomUnit);
        setTable(t=>({ ...t, uTop: topObj?.label||"", uBottom: botObj?.label||"" }));
        setTimeout(()=>{ setDone(3); next(); }, 2000);
      }
      return nextArr;
    });
  };

  // Step-5/6: place scale numbers
  const placeScaleTop = (d)=>{ if(!acceptScaleTop(d)){ miss(4); return; }
    setTable(t=>{ const t2 = { ...t, sTop: Number(d.value) }; if(t2.sTop!=null && t2.sBottom!=null){ setDone(4); setDone(5); setStep(6); next(); } return t2; });
  };
  const placeScaleBottom = (d)=>{ if(!acceptScaleBottom(d)){ miss(5); return; }
    setTable(t=>{ const t2 = { ...t, sBottom: Number(d.value) }; if(t2.sTop!=null && t2.sBottom!=null){ setDone(4); setDone(5); setStep(6); next(); } return t2; });
  };

  // Step-7: pick other value (4 options)
  const [pickedOther, setPickedOther] = useState(null);
  const pickOtherValue = (choice)=>{ setPickedOther(choice); setDone(6); next(); };

  // Step-8: tap destination cell
  const tapPlaceTop = ()=>{
    if(step!==7){ return; }
    if(!(pickedOther && !table.vTop && !rowIsGivenUnit(table.uTop))){ miss(7); return; }
    setTable(t=>({ ...t, vTop: Number(pickedOther.value) })); setDone(7); next();
  };
  const tapPlaceBottom = ()=>{
    if(step!==7){ return; }
    if(!(pickedOther && !table.vBottom && !rowIsGivenUnit(table.uBottom))){ miss(7); return; }
    setTable(t=>({ ...t, vBottom: Number(pickedOther.value) })); setDone(7); next();
  };

  // Step 9-12 math strip
  const [mathStrip, setMathStrip] = useState({ a:null, b:null, divisor:null, result:null, showResult:false });
  useEffect(()=>{
    const sT = Number(table.sTop), sB = Number(table.sBottom);
    const vT = table.vTop, vB = table.vBottom;
    const knownPair = (vT!=null && sB!=null) || (vB!=null && sT!=null);
    if(knownPair){
      const a = vT!=null ? vT : sT;
      const b = vB!=null ? vB : sB;
      const product = Number(a) * Number(b);
      const divisor = vT!=null ? sT : sB;
      setMathStrip({ a, b, divisor, result: (divisor? (product/divisor): null), showResult: step>=11 });
    }
  },[table.sTop, table.sBottom, table.vTop, table.vBottom, step]);

  const doCrossMultiply = ()=>{ setDone(8); next(); };
  const confirmWhichMultiply = ()=>{ setDone(9); next(); };
  const doDivide = ()=>{ setDone(10); next(); };
  const doCalculate = ()=>{
    setDone(11);
    setConfettiOn(true);
    setTimeout(()=>setConfettiOn(false), 3000);
  };

  // UI helpers
  const ROW_H = 54;
  const h1Blink = blink.header1;
  const h2Blink = blink.header2;
  const destBlink = blink.vDest;

  return (
    <div className="htable-module" style={{padding:"12px"}}>
      <h2 style={{margin:"8px 0"}}>{STEP_TITLES[step]}</h2>

      {step===0 && (
        <div className="choices four-grid">
          {STEP1_CHOICES.map(c=>(
            <button key={c.id} className="ugx-htable-btn" onClick={()=>handleStep1(c.id)}>{c.label}</button>
          ))}
        </div>
      )}

      {step===1 && (
        <div className="header-choices">
          <p>Drag or tap the correct item for the first column header.</p>
          <div className="row chips">
            {headerChoices.map(ch=>(
              <Draggable key={ch.id} data={ch}><span className="chip">{ch.label}</span></Draggable>
            ))}
          </div>
        </div>
      )}

      {step===2 && (
        <div className="header-choices">
          <p>Drag or tap the correct item for the next column header.</p>
          <div className="row chips">
            {headerChoices.map(ch=>(
              <Draggable key={ch.id} data={ch}><span className="chip">{ch.label}</span></Draggable>
            ))}
          </div>
        </div>
      )}

      {step===3 && (
        <div className="unit-choices">
          <p>Click the two correct units from the problem (they will auto‑place).</p>
          <div className="row chips">
            {unitChoices.map(u=>(
              <button key={u.id} className="ugx-htable-btn" onClick={()=>handlePickUnit(u)}>{u.label}</button>
            ))}
          </div>
        </div>
      )}

      {step===6 && (
        <div className="other-value-choices">
          <p>Pick the other value from the problem.</p>
          <div className="row chips">
            {otherValueChoices.map(o=>(
              <button key={o.id} className="ugx-htable-btn" onClick={()=>pickOtherValue(o)}>{o.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* The H Table */}
      <div className="htable" style={{display:"grid", gridTemplateColumns:"160px 160px 160px", gap:"8px", marginTop:"12px"}}>
        {/* Header Row */}
        <div className="hcell header" style={{height:40}}>
          <Slot className={`header-slot ${h1Blink ? "ptable-blink-wrap":""}`} accept={["header"]} onDropContent={dropHeader1}>
            <span>{table.head1 || ""}</span>
          </Slot>
        </div>
        <div className="hcell header" style={{height:40}}>
          <Slot className={`header-slot ${h2Blink ? "ptable-blink-wrap":""}`} accept={["header"]} onDropContent={dropHeader2}>
            <span>{table.head2 || ""}</span>
          </Slot>
        </div>
        <div className="hcell header" style={{height:40}}>
          <span>Values</span>
        </div>

        {/* Row 1 (Top) */}
        <div className="hcell" style={{height:ROW_H}}>
          <Slot className={`${!table.uTop?"empty":""}`}>
            <span style={{fontSize:18}}>{table.uTop}</span>
          </Slot>
        </div>
        <div className="hcell" style={{height:ROW_H}}>
          <Slot className={`${table.sTop==null?"empty":""} ${blink.sTop?"ptable-blink-wrap":""}`}
                test={acceptScaleTop}
                onDropContent={placeScaleTop}>
            <span style={{fontSize:20}}>{table.sTop ?? ""}</span>
          </Slot>
        </div>
        <div className="hcell" style={{height:ROW_H}}>
          <Slot className={`${table.vTop==null?"empty":""} ${destBlink?"ptable-blink-wrap":""}`}
                onClick={tapPlaceTop}>
            <span style={{fontSize:20}}>{table.vTop ?? ""}</span>
          </Slot>
        </div>

        {/* Row 2 (Bottom) */}
        <div className="hcell" style={{height:ROW_H}}>
          <Slot className={`${!table.uBottom?"empty":""}`}>
            <span style={{fontSize:18}}>{table.uBottom}</span>
          </Slot>
        </div>
        <div className="hcell" style={{height:ROW_H}}>
          <Slot className={`${table.sBottom==null?"empty":""} ${blink.sBottom?"ptable-blink-wrap":""}`}
                test={acceptScaleBottom}
                onDropContent={placeScaleBottom}>
            <span style={{fontSize:20}}>{table.sBottom ?? ""}</span>
          </Slot>
        </div>
        <div className="hcell" style={{height:ROW_H}}>
          <Slot className={`${table.vBottom==null?"empty":""} ${destBlink?"ptable-blink-wrap":""}`}
                onClick={tapPlaceBottom}>
            <span style={{fontSize:20}}>{table.vBottom ?? ""}</span>
          </Slot>
        </div>
      </div>

      {/* Step 5/6 chip pools for scale values */}
      {(step===4 || step===5) && (
        <div style={{marginTop:12}}>
          <p>Drag or tap the correct scale number to each row.</p>
          <div className="row chips">
            {scaleChoices.map(s=>(
              <Draggable key={s.id} data={s}><span className="chip">{String(s.value)}</span></Draggable>
            ))}
          </div>
        </div>
      )}

      {/* Step 9–12 controls */}
      {step>=8 && (
        <div className="math-controls" style={{marginTop:12, display:"flex", gap:8, flexWrap:"wrap"}}>
          {step===8 && <button className="ugx-htable-btn" onClick={doCrossMultiply}>Cross Multiply</button>}
          {step===9 && <button className="ugx-htable-btn" onClick={confirmWhichMultiply}>Confirm Numbers</button>}
          {step===10 && <button className="ugx-htable-btn" onClick={doDivide}>Divide</button>}
          {step===11 && <button className="ugx-htable-btn" onClick={doCalculate}>Calculate</button>}
        </div>
      )}

      <div style={{marginTop:16}}>
        <button className="ugx-htable-btn" onClick={()=>setOpenSum(true)}>Open Summary</button>
      </div>
      {openSum && <SummaryOverlay onClose={()=>setOpenSum(false)} problem={problem} table={table} />}
    </div>
  );
}
