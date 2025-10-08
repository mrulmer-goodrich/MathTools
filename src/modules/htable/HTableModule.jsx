--- HTableModule.jsx (baseline)
+++ HTableModule.jsx (v10.4.8)
@@ -1,8 +1,4 @@
-///This is now controlling authority as v.10.1.0 and additional changes should be made from this baseline//
-// HTableModule — UG Math Tools v10.4.6 (built off 10.4.2)
-// Previous working copy reference: 10.3.6
-// SpecOp Sync: Language rotator excludes 'XXXX' and only uses valid alts; Post-calc runs on first click; solved-cell blink uses standard style for 2s; overlays cleared; New Problem pulse
-// src/modules/htable/HTableModule.jsx
+// HTableModule — UG Math Tools v10.4.8 (surgical from 10.4.7)
 //Ulmer-Goodrich Productions
 /* eslint-disable react/no-unknown-property */
 import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
@@ -16,18 +12,14 @@
 import { genHProblem } from '../../lib/generator.js'
 import { loadSession, saveSession } from '../../lib/localStorage.js'
 
-// ---- Safe problem wrapper (SpecOp 9.7.x): reject equal scale numbers (e.g., 20 ↔ 20) ----
+// ---- Safe problem wrapper ----
 function _violatesEqualScalePair(p) {
   try {
-    // Interpret common shapes: p.scaleTop/Bottom OR p.sTop/sBottom OR p.headerNum/headerDen
     const a = (p && (p.scaleTop ?? p.sTop ?? p.headerNum));
     const b = (p && (p.scaleBottom ?? p.sBottom ?? p.headerDen));
     return (typeof a === 'number' && typeof b === 'number' && a === b);
-  } catch(_) {
-    return false;
-  }
+  } catch(_) { return false; }
 }
-
 function genSafeProblem(rawGenFn, maxTries = 25) {
   if (typeof rawGenFn !== 'function') return rawGenFn;
   let last = null;
@@ -36,7 +28,6 @@
     last = cand;
     if (!_violatesEqualScalePair(cand)) return cand;
   }
-  // Fallback: if generator kept producing equal pairs, nudge bottom by +1
   if (last && (last.scaleBottom ?? last.sBottom ?? last.headerDen) !== undefined) {
     if (last.scaleBottom !== undefined) last.scaleBottom += 1;
     else if (last.sBottom !== undefined) last.sBottom += 1;
@@ -44,13 +35,10 @@
   }
   return last;
 }
-// ---- End wrapper ----
-
 
 // ────────────────────────────────────────────────────────────────────────────────
-// TAP-ONLY WRAPPERS
+// TAP-ONLY wrappers
 // ────────────────────────────────────────────────────────────────────────────────
-// TAP-ONLY WRAPPERS — SLOT/DRAG
 const Draggable = ({ payload, data, label, onClick, tapAction, ...rest }) => {
   const merged = data ?? payload ?? undefined;
   const handleClick = (e) => {
@@ -71,18 +59,17 @@
   );
 };
 
-// blinkWrap default prevents No-Undef
 const Slot = ({ accept, children, className='', blinkWrap=false, onClick, validator, test, ...rest }) => {
   const handleClick = (e) => { onClick?.(e); };
   const testFn = test ?? ((d) => {
-    const t = (d?.type ?? d?.kind ?? "").toString();
+    const t = (d?.type ?? d?.kind ?? '').toString();
     const listOk = Array.isArray(accept) && accept.length > 0 ? accept.includes(t) : true;
-    const valOk = typeof validator === "function" ? !!validator(d) : true;
+    const valOk  = typeof validator === 'function' ? !!validator(d) : true;
     return listOk && valOk;
   });
   return (
     <div
-      className={`slot-wrap ${blinkWrap ? 'ptable-blink-wrap' : ''} ${className}`}
+      className={\`slot-wrap \${blinkWrap ? 'ptable-blink-wrap' : ''} \${className}\`}
       onClick={handleClick}
       onDragOver={(e)=>e.preventDefault()}
     >
@@ -96,7 +83,6 @@
 // ────────────────────────────────────────────────────────────────────────────────
 // Spec scaffolding & helpers
 // ────────────────────────────────────────────────────────────────────────────────
-// STEP TITLES
 const STEP_TITLES = [
   "What's the first step to solve the problem?",
   "What always goes in the first column?",
@@ -151,7 +137,7 @@
       const c = Number(q?.given?.value);
       if([a,b,c].some(n=>Number.isNaN(n))) return false;
       const set = new Set([a,b,c]);
-      return set.size===3; // all three numbers must be unique
+      return set.size===3;
     }catch{ return false }
   };
   while(tries<50 && (!saneProblem(p) || !uniqueTriple(p))){ p = genHProblem(); tries++; }
@@ -159,43 +145,27 @@
 };
 
 const shuffle = (arr)=> arr.slice().sort(()=>Math.random()-0.5);
-
-
-/** Guard: enforce 4-choice render without crashing */
-const _assertFour = (arr, tag) => {
-  try {
-    if (!Array.isArray(arr) || arr.length !== 4) {
-      console.warn('Choice count not 4 for', tag, Array.isArray(arr)?arr.length:arr);
-    }
-  } catch {}
-  return arr;
-};
+const _assertFour = (arr, tag) => { try { if (!Array.isArray(arr) || arr.length !== 4) { console.warn('Choice count not 4 for', tag, Array.isArray(arr)?arr.length:arr); } } catch {} return arr; };
 
 // ────────────────────────────────────────────────────────────────────────────────
 // Component
 // ────────────────────────────────────────────────────────────────────────────────
-// STEP LOGIC (0–11)
 export default function HTableModule(){
   const H_SNAP_VERSION = 22;
 
   const persisted = loadSession() || {};
   const snap = (persisted.hSnap && persisted.hSnap.version===H_SNAP_VERSION) ? persisted.hSnap : null;
 
-  
-  // STEP 8: four-choice conceptual prompt
   const STEP8_CHOICES = [
     { id: 'cm', label: 'Cross Multiply', correct: true },
     { id: 'add', label: 'Add all the numbers', correct: false },
     { id: 'avg', label: 'Find the average', correct: false },
-    { id: 'sub', label: 'Subtract the smaller from larger', correct: false },
+    { id: 'sub', label: 'Subtract the numbers', correct: false },
   ];
 
-  const chooseNext8 = (choice) => {
-    if (!choice || !choice.correct) { miss(8); return; }
-    setDone(8);
-    next();
-  };
-const [session, setSession] = useState(persisted || { attempts: [] });
+  const chooseNext8 = (choice) => { if (!choice || !choice.correct) { miss(8); return; } setDone(8); next(); };
+
+  const [session, setSession] = useState(persisted || { attempts: [] });
   const [problem, setProblem] = useState(() => (snap?.problem) || genSaneHProblem());
   const [table, setTable] = useState(() => (snap?.table) || {
     head1:'', head2:'',
@@ -206,45 +176,56 @@
   });
 
   const [step, setStep] = useState(snap?.step ?? 0);
-  const [steps, setSteps] = useState(
-    snap?.steps || STEP_TITLES.map(()=>({misses:0,done:false}))
-  );
-
+  const [steps, setSteps] = useState(snap?.steps || STEP_TITLES.map(()=>({misses:0,done:false})));
+
+  // Summary state exists but stays off in 10.4.8
   const [openSum, setOpenSum] = useState(false);
+
   const [mathStrip, setMathStrip] = useState({ a:null, b:null, divisor:null, result:null, showResult:false });
   const [confettiOn, setConfettiOn] = useState(false);
-  // v10.2.0 — Language rotation state
+
+  // Language rotation state
   const [rotLang, setRotLang] = useState('English');
-  const [rotationOrder, setRotationOrder] = useState([]); // excludes English, includes 'XXXX'
+  const [rotationOrder, setRotationOrder] = useState([]); // includes 'XXXX'
   const [isHoldingEnglish, setIsHoldingEnglish] = useState(false);
   const [rotationId, setRotationId] = useState(null);
+  const prevLangRef = useRef('English'); // remember language before hold
+
   const [npBlink, setNpBlink] = useState(false);
   const npBlinkRef = useRef(null);
   const postCalcAppliedRef = useRef(false);
 
-
-  // 2s blink
   const [blinkKey, setBlinkKey] = useState(null);
   const [blinkUnits, setBlinkUnits] = useState(false);
+
+  // Geometry/overlay refs & state — DECLARED ONCE (fix double-declare build error)
+  const gridRef = useRef(null);
+  const refs = { uTop: useRef(null), sTop: useRef(null), vTop: useRef(null), uBottom: useRef(null), sBottom: useRef(null), vBottom: useRef(null) };
+  const [highlightKeys, setHighlightKeys] = useState([]);
+  const [oval, setOval] = useState(null);
+  const [tripleUL, setTripleUL] = useState(null);
+  const [lines, setLines] = useState({ v1Left:0, v2Left:0, vTop:0, vHeight:0, hTop:0, gridW:0 });
 
   // Persist
   useEffect(()=>{
     const nextState = { ...(session||{}), hSnap:{ version:H_SNAP_VERSION, problem, table, step, steps } };
     saveSession(nextState); setSession(nextState);
   },[problem, table, step, steps]);
-  // v10.2.0 — initialize rotation order on problem change
+
+  // Initialize rotation order on problem change — include 'XXXX'
   useEffect(() => {
     try {
-      // Build from actual available alts; ignore placeholders & empties
       const altsObj = (problem?.text?.alts) || {};
-      const keys = Object.keys(altsObj).filter(k => typeof altsObj[k] === 'string' && altsObj[k].trim().length > 0);
-      const pool = keys.filter(l => l !== 'English' && l !== 'XXXX');
+      const keys = Object.keys(altsObj).filter(k => typeof altsObj[k] === 'string' && k.trim().length > 0);
+      const pool = keys.filter(l => l !== 'English'); // allow XXXX if present
       setRotationOrder(pool);
       setRotLang('English');
       setIsHoldingEnglish(false);
+      prevLangRef.current = pool[0] || 'English';
     } catch {}
   }, [problem?.id, JSON.stringify(problem?.text?.alts)]);
-// Helpers
+
+  // Helpers
   const miss = (idx)=>setSteps(s=>{ const c=[...s]; if(c[idx]) c[idx].misses++; return c; });
   const setDone = (idx)=>setSteps(s=>{ const c=[...s]; if(c[idx]) c[idx].done=true; return c; });
   const next = ()=>setStep(s=>Math.min(s+1, STEP_TITLES.length-1));
@@ -276,28 +257,27 @@
   };
 
   // Step 0
-  const handleStep0 = (choice) => {
-    if (!choice?.correct) { miss(0); return; }
-    setDone(0); next();
-  };
-
-  // Step 1: first column must be Units
-  const tapHeader1 = (d) => {
-    if (step !== 1) return;
-    if (d?.v !== 'Units'){ miss(1); return; }
-    setTable(t => ({ ...t, head1: 'Units' }));
-setDone(1); next();
-  };
-
-  // Step 2: second column must be Scale Numbers
-  const tapHeader2 = (d) => {
-    if (step !== 2) return;
-    if (d?.v !== 'ScaleNumbers'){ miss(2); return; }
-    setTable(t => ({ ...t, head2: 'Scale Numbers' }));
-    setDone(2); next();
-  };
-
-  // Choice pools
+  const handleStep0 = (choice) => { if (!choice?.correct) { miss(0); return; } setDone(0); next(); };
+
+  // Randomize once per problem; no in-render shuffle
+  const step0Choices = useMemo(() => shuffle(STEP1_CHOICES), [problem?.id]);
+
+  // Step 1/2 stable header choices
+  const step1HeaderChoices = useMemo(() => shuffle([
+    { id:'col_units', label:'Units', kind:'col', v:'Units' },
+    { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
+    { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
+    { id:'col_rates',  label:'Rates',  kind:'col', v:'Rates' },
+  ]), [problem?.id]);
+
+  const step2HeaderChoices = useMemo(() => shuffle([
+    { id:'col_units', label:'Units', kind:'col', v:'Units' },
+    { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
+    { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
+    { id:'col_rates',  label:'Rates',  kind:'col', v:'Rates' },
+  ]), [problem?.id]);
+
+  // Unit choices
   const unitChoices = useMemo(()=>{
     const correct = Array.from(new Set(problem.units || [])).slice(0,2);
     const cat = unitCategory(correct[0] || '');
@@ -312,7 +292,7 @@
     return shuffle(full.map((u,i)=>({ id:'u'+i, label:u, kind:'unit' })));
   },[problem]);
 
-  // Include all problem numbers in choices (as requested), plus a few distractors
+  // Number choice pools
   const numbersTopScale = useMemo(()=>{
     const v = Number(problem?.scale?.[0]);
     const set = new Set([v, ...allProblemNumbers]);
@@ -336,7 +316,6 @@
       if (exists) return prev;
       const nextSel = [...prev, d];
 
-      // Immediate feedback on each correct selection (brief blink)
       setBlinkUnits(true);
       setTimeout(()=>setBlinkUnits(false), 800);
 
@@ -345,7 +324,6 @@
         const botObj = nextSel.find(x=> (x.label||x.u||'').toLowerCase() === canonicalBottomUnit);
         setTable(t=>({ ...t, uTop:(topObj?.label||topObj?.u||''), uBottom:(botObj?.label||botObj?.u||'') }));
 
-        // Full 2s blink once both are chosen
         setBlinkUnits(true);
         setTimeout(()=>{ setBlinkUnits(false); setDone(3); next(); }, 2000);
       }
@@ -372,52 +350,36 @@
     });
   };
 
-  // Step 6/7 flow: other value from problem (choices include all problem numbers but only the correct is accepted)
   const [pickedOther, setPickedOther] = useState(null);
   const otherValueChoices = useMemo(()=>{
-  const correct = Number(problem?.given?.value);
-  const sTop = Number(problem?.scale?.[0]);
-  const sBottom = Number(problem?.scale?.[1]);
-
-  const pool = new Set();
-  if (Number.isFinite(correct)) pool.add(correct);
-  if (Number.isFinite(sTop) && sTop !== correct) pool.add(sTop);
-  if (Number.isFinite(sBottom) && sBottom !== correct) pool.add(sBottom);
-
-  const base = Number.isFinite(correct) ? correct : 5;
-  let tries = 0;
-  while (pool.size < 4 && tries < 60) {
-    const distractor = Math.max(1, base + Math.round((Math.random() * 8) - 4));
-    if (distractor !== correct && distractor !== sTop && distractor !== sBottom) {
-      pool.add(distractor);
+    const correct = Number(problem?.given?.value);
+    const sTop = Number(problem?.scale?.[0]);
+    const sBottom = Number(problem?.scale?.[1]);
+
+    const pool = new Set();
+    if (Number.isFinite(correct)) pool.add(correct);
+    if (Number.isFinite(sTop) && sTop !== correct) pool.add(sTop);
+    if (Number.isFinite(sBottom) && sBottom !== correct) pool.add(sBottom);
+
+    const base = Number.isFinite(correct) ? correct : 5;
+    let tries = 0;
+    while (pool.size < 4 && tries < 60) {
+      const distractor = Math.max(1, base + Math.round((Math.random() * 8) - 4));
+      if (distractor !== correct && distractor !== sTop && distractor !== sBottom) pool.add(distractor);
+      tries++;
     }
-    tries++;
-  }
-
-  const arr = Array.from(pool).slice(0, 4).map((v, i) => ({
-    id: `ov${i}`,
-    value: v,
-    label: String(v),
-    correct: v === correct
-  }));
-
-  return shuffle(_assertFour(arr, "Step6-OtherValue"));
-}, [problem?.id, problem?.scale, problem?.given]);
-
-  const chooseOtherValue = (choice) => {
-    if (step!==6) return;
-    if (!choice?.correct){ miss(6); return; }
-    setPickedOther(choice);
-    setDone(6);
-    next();
-  };
+
+    const arr = Array.from(pool).slice(0, 4).map((v, i) => ({ id: \`ov\${i}\`, value: v, label: String(v), correct: v === correct }));
+    return shuffle(_assertFour(arr, 'Step6-OtherValue'));
+  }, [problem?.id, problem?.scale, problem?.given]);
+
+  const chooseOtherValue = (choice) => { if (step!==6) return; if (!choice?.correct){ miss(6); return; } setPickedOther(choice); setDone(6); next(); };
 
   const tapPlaceValueTop = () => {
     if (step!==7) return;
     const ok = pickedOther && rowIsGivenUnit(table.uTop);
     if (!ok){ miss(7); return; }
     setTable(t => ({ ...t, vTop: Number(pickedOther.value) }));
-    // No pre/post blink here per request; go straight ahead
     setDone(7); next();
   };
   const tapPlaceValueBottom = () => {
@@ -425,22 +387,12 @@
     const ok = pickedOther && rowIsGivenUnit(table.uBottom);
     if (!ok){ miss(7); return; }
     setTable(t => ({ ...t, vBottom: Number(pickedOther.value) }));
-    // No pre/post blink here per request; go straight ahead
     setDone(7); next();
   };
 
-  // Geometry for overlays
-  const gridRef = useRef(null);
-  const refs = {
-    uTop: useRef(null), sTop: useRef(null), vTop: useRef(null),
-    uBottom: useRef(null), sBottom: useRef(null), vBottom: useRef(null)
-  };
-  const [lines, setLines] = useState({ v1Left:0, v2Left:0, vTop:0, vHeight:0, hTop:0, gridW:0 });
-  const [oval, setOval] = useState(null);
-  const [tripleUL, setTripleUL] = useState(null);
+  // Geometry/measure
   const measure = ()=>{
-    const g = gridRef.current;
-    if(!g) return;
+    const g = gridRef.current; if(!g) return;
     const gr = g.getBoundingClientRect();
     const r_uTop    = refs.uTop.current?.getBoundingClientRect();
     const r_sTop    = refs.sTop.current?.getBoundingClientRect();
@@ -449,8 +401,7 @@
     const r_sBottom = refs.sBottom.current?.getBoundingClientRect();
     const r_vBottom = refs.vBottom.current?.getBoundingClientRect();
     if(!(r_sTop && r_vTop && r_uTop && r_uBottom && r_sBottom && r_vBottom)) {
-      setLines(l=>({ ...l, gridW: gr.width }));
-      return;
+      setLines(l=>({ ...l, gridW: gr.width })); return;
     }
     const v1 = (r_uTop.right + r_sTop.left)/2 - gr.left;
     const v2 = (r_sTop.right + r_vTop.left)/2 - gr.left;
@@ -468,7 +419,8 @@
   };
   useLayoutEffect(()=>{ measure() },[step, table.uTop, table.uBottom, table.sTop, table.sBottom, table.vTop, table.vBottom]);
   useEffect(()=>{ const onResize = ()=>measure(); window.addEventListener('resize', onResize); return ()=>window.removeEventListener('resize', onResize); },[]);
-  // v10.2.0 — single 15s rotation interval
+
+  // Language rotation interval
   useEffect(() => {
     if (rotationId) { clearInterval(rotationId); setRotationId(null); }
     const id = setInterval(() => {
@@ -484,54 +436,39 @@
     return () => clearInterval(id);
   }, [JSON.stringify(rotationOrder), isHoldingEnglish]);
 
-
-  const [highlightKeys, setHighlightKeys] = useState([]);
-  useLayoutEffect(()=>{
-    if(!highlightKeys.length){ setOval(null); return }
-    const g = gridRef.current; if(!g) return;
-    const gr = g.getBoundingClientRect();
-    const centers = highlightKeys.map(k=>{
-      const r = refs[k].current?.getBoundingClientRect();
-      if(!r) return null;
-      return { x: (r.left + r.right)/2 - gr.left, y: (r.top + r.bottom)/2 - gr.top };
-    }).filter(Boolean);
-    if(centers.length!==2){ setOval(null); return }
-    const [a,b] = centers;
-    const midX = (a.x + b.x)/2;
-    const midY = (a.y + b.y)/2;
-    const dx = b.x - a.x, dy = b.y - a.y;
-    const len = Math.sqrt(dx*dx + dy*dy) + 140;
-    const rot = Math.atan2(dy, dx) * 180/Math.PI;
-    setOval({ left: midX, top: midY, len, rot });
-  },[highlightKeys]);
-
-  
-  // v10.2.0 — press-and-hold English handlers
-  const holdDownEnglish = () => { setIsHoldingEnglish(true); setRotLang('English'); };
-  const holdUpEnglish   = () => { setIsHoldingEnglish(false); };
+  // Press-and-hold English — instant resume on release
+  const holdDownEnglish = () => {
+    prevLangRef.current = rotLang === 'English' ? (rotationOrder[0] || 'English') : rotLang;
+    setIsHoldingEnglish(true);
+    setRotLang('English');
+  };
+  const holdUpEnglish   = () => {
+    setIsHoldingEnglish(false);
+    const nextLang = prevLangRef.current;
+    if (nextLang && nextLang !== 'English') setRotLang(nextLang);
+  };
 
   const givenRow = (table.vBottom!=null) ? 'bottom' : (table.vTop!=null ? 'top' : null);
 
-  // Options for step 9 tile selection (explicit tiles like "17 × 6")
+  // Cross-multiply
   const crossPair = useMemo(()=>{
     if(!givenRow || table.sTop==null || table.sBottom==null) return null;
     const v = (givenRow==='top') ? table.vTop : table.vBottom;
     const sOpp = (givenRow==='top') ? table.sBottom : table.sTop;
     if (v==null || sOpp==null) return null;
-    return { a:v, b:sOpp, label:`${v} × ${sOpp}`, keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sBottom':'sTop'] };
+    return { a:v, b:sOpp, label:\`\${v} × \${sOpp}\`, keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sBottom':'sTop'] };
   },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom]);
 
   const wrongPairs = useMemo(()=>{
     const list = [];
     const v = (givenRow==='top') ? table.vTop : table.vBottom;
     const sSame = (givenRow==='top') ? table.sTop : table.sBottom;
-    if (v!=null && sSame!=null) list.push({ a:v, b:sSame, label:`${v} × ${sSame}`, keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sTop':'sBottom'] });
-    if (table.sTop!=null && table.sBottom!=null) list.push({ a:table.sTop, b:table.sBottom, label:`${table.sTop} × ${table.sBottom}`, keys:['sTop','sBottom'] });
+    if (v!=null && sSame!=null) list.push({ a:v, b:sSame, label:\`\${v} × \${sSame}\`, keys: [(givenRow==='top')?'vTop':'vBottom', (givenRow==='top')?'sTop':'sBottom'] });
+    if (table.sTop!=null && table.sBottom!=null) list.push({ a:table.sTop, b:table.sBottom, label:\`\${table.sTop} × \${table.sBottom}\`, keys:['sTop','sBottom'] });
     const vOpp = (givenRow==='top') ? table.vBottom : table.vTop;
-    if (vOpp!=null && sSame!=null) list.push({ a:vOpp, b:sSame, label:`${vOpp} × ${sSame}`, keys: [(givenRow==='top')?'vBottom':'vTop', (givenRow==='top')?'sTop':'sBottom'] });
-    // ensure a "random multiple combo"
-    if (table.sTop!=null && v!=null) list.push({ a:v, b:1, label:`${v} × 1`, keys: [] });
-    const seen=new Set(); const uniq=[]; for(const p of list){ if(!p) continue; const k=`${p.a}×${p.b}`; if(seen.has(k)) continue; if(crossPair && p.a===crossPair.a && p.b===crossPair.b) continue; seen.add(k); uniq.push(p);} return shuffle(uniq).slice(0,4);
+    if (vOpp!=null && sSame!=null) list.push({ a:vOpp, b:sSame, label:\`\${vOpp} × \${sSame}\`, keys: [(givenRow==='top')?'vBottom':'vTop', (givenRow==='top')?'sTop':'sBottom'] });
+    if (table.sTop!=null && v!=null) list.push({ a:v, b:1, label:\`\${v} × 1\`, keys: [] });
+    const seen=new Set(); const uniq=[]; for(const p of list){ if(!p) continue; const k=\`\${p.a}×\${p.b}\`; if(seen.has(k)) continue; if(crossPair && p.a===crossPair.a && p.b===crossPair.b) continue; seen.add(k); uniq.push(p);} return shuffle(uniq).slice(0,4);
   },[givenRow, table.sTop, table.sBottom, table.vTop, table.vBottom]);
 
   const chooseMultiply = (pair)=>{
@@ -547,13 +484,13 @@
 
   const divideChoices = useMemo(()=>{
     if (table.sTop==null || table.sBottom==null) return [];
-    const correctScale = (givenRow==='top') ? table.sTop : table.sBottom;   // same-row scale
-    const wrongScale   = (givenRow==='top') ? table.sBottom : table.sTop;   // opposite-row scale
+    const correctScale = (givenRow==='top') ? table.sTop : table.sBottom;
+    const wrongScale   = (givenRow==='top') ? table.sBottom : table.sTop;
     return shuffle([
-      { label: `Divide by ${correctScale}`, value: correctScale, correct: true },
-      { label: `Divide by ${wrongScale}`, value: wrongScale, correct: false },
-      { label: `Multiply by ${correctScale}`, value: null, correct: false },
-      { label: `Multiply by ${wrongScale}`, value: null, correct: false },
+      { label: \`Divide by \${correctScale}\`, value: correctScale, correct: true },
+      { label: \`Divide by \${wrongScale}\`, value: wrongScale, correct: false },
+      { label: \`Multiply by \${correctScale}\`, value: null, correct: false },
+      { label: \`Multiply by \${wrongScale}\`, value: null, correct: false },
     ]);
   },[givenRow, table.sTop, table.sBottom]);
 
@@ -576,70 +513,48 @@
     setDone(10); next();
   };
 
-  
-const holdEnglishDown = () => { setIsHoldingEnglish(true); setRotLang('English'); };
-const holdEnglishUp   = () => { setIsHoldingEnglish(false); setRotLang(prev => {
-  if (!rotationOrder?.length) return prev;
-  if (prev === 'English') return rotationOrder[0];
-  const idx = rotationOrder.indexOf(prev);
-  return (idx === -1 || idx === rotationOrder.length - 1) ? rotationOrder[0] : rotationOrder[idx + 1];
-}); };
-function applyPostCalculateEffects() {
-  if (postCalcAppliedRef.current) return;
-  postCalcAppliedRef.current = true;
-
-  // Stop prior blinking & overlays
-  setBlinkUnits(false);
-  setBlinkKey(null);
-  if (typeof setHighlightKeys === 'function') setHighlightKeys([]);
-  setOval(null);
-  setTripleUL(null);
-
-  // Ensure equation strip is visible on first Calculate
-  setMathStrip(s => ({ ...s, showResult: true }));
-
-  // Insert result; pick solved cell
-  const rGlobal = Number(mathStrip?.result);
-  const unknownTop = table.vTop==null && table.sTop!=null && table.sBottom!=null && table.vBottom!=null;
-  const unknownBottom = table.vBottom==null && table.sTop!=null && table.sBottom!=null && table.vTop!=null;
-  let solvedKey = null;
-  setTable(t => {
-    const r = Number.isFinite(rGlobal) ? rGlobal : Number(t?.result);
-    if (unknownTop){ solvedKey = 'vTop';    return { ...t, vTop: Number(r), solvedRow: 'top' }; }
-    if (unknownBottom){ solvedKey = 'vBottom'; return { ...t, vBottom: Number(r), solvedRow: 'bottom' }; }
-    return t;
-  });
-
-  // Start blinking on solved cell (module-yellow style) — continuous until New Problem
-  if (solvedKey) { setBlinkKey(solvedKey); }
-// Confetti & summary
-  setOpenSum(true);
-  setConfettiOn(true);
-  setTimeout(() => setConfettiOn(false), 3500);
-
-  // Mark done & schedule New Problem blinking
-  setDone(11);
-  if (npBlinkRef.current) clearTimeout(npBlinkRef.current);
-  setNpBlink(false);
-  npBlinkRef.current = setTimeout(() => setNpBlink(true), 3000);
-
-  setOpenSum(true);
-  setConfettiOn(true);
-  setTimeout(() => setConfettiOn(false), 3500);
-
-  // Mark done & schedule New Problem blinking
-  setDone(11);
-  if (npBlinkRef.current) clearTimeout(npBlinkRef.current);
-  setNpBlink(false);
-  npBlinkRef.current = setTimeout(() => setNpBlink(true), 3000);
-}
-
-const onCalculate = () => {
-  applyPostCalculateEffects();
-};
+  // Post-calc effects (Summary disabled)
+  function applyPostCalculateEffects() {
+    if (postCalcAppliedRef.current) return;
+    postCalcAppliedRef.current = true;
+
+    setBlinkUnits(false);
+    setBlinkKey(null);
+    if (typeof setHighlightKeys === 'function') setHighlightKeys([]);
+    setOval(null);
+    setTripleUL(null);
+
+    setMathStrip(s => ({ ...s, showResult: true }));
+
+    const rGlobal = Number(mathStrip?.result);
+    const unknownTop = table.vTop==null && table.sTop!=null && table.sBottom!=null && table.vBottom!=null;
+    const unknownBottom = table.vBottom==null && table.sTop!=null && table.sBottom!=null && table.vTop!=null;
+    let solvedKey = null;
+    setTable(t => {
+      const r = Number.isFinite(rGlobal) ? rGlobal : Number(t?.result);
+      if (unknownTop){ solvedKey = 'vTop';    return { ...t, vTop: Number(r), solvedRow: 'top' }; }
+      if (unknownBottom){ solvedKey = 'vBottom'; return { ...t, vBottom: Number(r), solvedRow: 'bottom' }; }
+      return t;
+    });
+    if (solvedKey) { setBlinkKey(solvedKey); }
+
+    // Summary overlay OFF:
+    setOpenSum(false);
+
+    setConfettiOn(true);
+    setTimeout(() => setConfettiOn(false), 3500);
+
+    setDone(11);
+    if (npBlinkRef.current) clearTimeout(npBlinkRef.current);
+    setNpBlink(false);
+    npBlinkRef.current = setTimeout(() => setNpBlink(true), 3000);
+  }
+  const onCalculate = () => { applyPostCalculateEffects(); };
+
+  // Reset
   const resetProblem = ()=>{
     postCalcAppliedRef.current = false; setNpBlink(false);
-  setProblem(genSaneHProblem());
+    setProblem(genSaneHProblem());
     setTable({
       head1:'', head2:'',
       uTop:'', uBottom:'',
@@ -658,15 +573,10 @@
   };
 
   const ROW_H = 88;
-  const lineColor = '#0f172a';
   const isBlink = (k)=> blinkKey === k;
-
-  // Blink cue logic: align to spec classes/hooks
   const needWildBlink = (key)=> {
     if (step===4 && key==='sTop'    && table.sTop==null) return true;
     if (step===5 && key==='sBottom' && table.sBottom==null) return true;
-    // DO NOT pre-blink target cells on step 7 (user should choose without hints)
-    // if (step===7) { ... }  // removed per request
     if (step===9 && Array.isArray(highlightKeys) && highlightKeys.includes(key)) return true;
     return false;
   };
@@ -678,196 +588,97 @@
     (needWildBlink(key) ? 'ptable-blink-hard blink-bg' : ''),
   ].filter(Boolean).join(' ');
 
-  
-  // v10.2.0 — narrative selection and XXXX masking
   const langLabel = rotLang;
 
   function maskToXXXX(str) {
-  if (!str) return str;
-  const [u1, u2] = problem?.units || [];
-  const [a, b] = problem?.scale || [];
-  const givenVal = problem?.given?.value;
-  const otherUnit = (problem?.given?.row === 'top' ? u2 : u1) || (problem?.other?.unit || '');
-  const tokens = [String(a), String(b), '=', u1, u2, otherUnit, String(givenVal)].filter(Boolean);
-  const pre='\uE000', post='\uE001';
-  const placeholders = {};
-  let s = String(str);
-  tokens.forEach((tok, i) => { const key = pre+i+post; placeholders[key]=tok; s = s.split(tok).join(key); });
-  // Replace letters without Unicode property escapes: heuristic = chars where lower!=upper
-  s = Array.from(s).map(ch => {
-    try { return (ch.toLowerCase() !== ch.toUpperCase()) ? 'X' : ch; } catch { return ch; }
-  }).join('');
-  Object.keys(placeholders).forEach(k => { s = s.split(k).join(placeholders[k]); });
-  return s;
-}
-
-
-
-
-function narrativeFor(lang) {
+    if (!str) return str;
+    const [u1, u2] = problem?.units || [];
+    const [a, b] = problem?.scale || [];
+    const givenVal = problem?.given?.value;
+    const otherUnit = (problem?.given?.row === 'top' ? u2 : u1) || (problem?.other?.unit || '');
+    const tokens = [String(a), String(b), '=', u1, u2, otherUnit, String(givenVal)].filter(Boolean);
+    const pre='\uE000', post='\uE001';
+    const placeholders = {};
+    let s = String(str);
+    tokens.forEach((tok, i) => { const key = pre+i+post; placeholders[key]=tok; s = s.split(tok).join(key); });
+    s = Array.from(s).map(ch => { try { return (ch.toLowerCase() !== ch.toUpperCase()) ? 'X' : ch; } catch { return ch; } }).join('');
+    Object.keys(placeholders).forEach(k => { s = s.split(k).join(placeholders[k]); });
+    return s;
+  }
+  function narrativeFor(lang) {
     const english = problem?.text?.english || '';
     if (lang === 'English') return english;
     if (lang === 'XXXX') return maskToXXXX(english);
     const alt = problem?.text?.alts?.[lang];
     return (typeof alt === 'string') ? alt : english;
   }
-
   function enforceEquals(s){ return (s||'').replace(/↔/g,'='); }
   const displayText = enforceEquals(narrativeFor(rotLang));
 
-  // ──────────────────────────────────────────────────────────────────────────────
-  // UI + RIGHT PANEL
-  // ──────────────────────────────────────────────────────────────────────────────
   return (
     <div className="container" style={{position:'relative'}}>
       <style>{`
         .problem-banner { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 10px; }
         .problem-title { font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 6px; }
         .problem-body { font-size: inherit; color: inherit; }
-
-        /* Keyframes are provided globally by the app shell. Do not declare inline here. */
-/* .ptable-blink relies on the global @keyframes ptable-blink-kf */
-.ptable-blink { animation: ptable-blink-kf 2s ease-out 0s 1; }
-
+        .ptable-blink { animation: ptable-blink-kf 2s ease-out 0s 1; }
         .hl { border: none !important; background: radial-gradient(circle at 50% 50%, rgba(59,130,246,.18), rgba(59,130,246,0) 60%); outline: none !important; }
-
-        .hcell .empty, .hcell .slot, .hcell .slot.empty, .hhead .empty {
-          min-height: ${ROW_H}px !important;
-          height: ${ROW_H}px !important;
-        }
-
-        /* v10.0.1 — HTable cell centering & uniform text */
+        .hcell .empty, .hcell .slot, .hcell .slot.empty, .hhead .empty { min-height: ${ROW_H}px !important; height: ${ROW_H}px !important; }
         .hcell, .hhead { display:flex; align-items:center; justify-content:center; text-align:center; }
         .hcell .slot, .hcell .empty, .hhead .empty { display:flex; align-items:center; justify-content:center; text-align:center; }
         .hcell, .hhead, .hcell .slot, .hhead .empty { font-family: inherit; font-weight: 600; font-size: 1.25rem; }
-
-
         .right-footer { position: sticky; bottom: 0; background: #fff; padding: 8px 0 0; display: flex; gap: 8px; justify-content: center; }
         .button.secondary { background: #e2e8f0; color: #0f172a; }
-        /* === v9.7.2 panel swap (module-local, no global changes) === */
-        .panes { display: flex; gap: 12px; align-items: flex-start; }
+        .panes { display: flex; gap: 24px; align-items: flex-start; }
         .card { flex: 1 1 0; min-width: 0; }
-        .card.right-steps { order: 1; } /* prompts appear visually on the LEFT */
-        .card.hgrid-card  { order: 2; } /* H-table appears visually on the RIGHT */
-
-        @media (max-width: 720px) {
-          .panes { flex-direction: column; }
-          .card.right-steps, .card.hgrid-card { order: initial; }
-        }
-        /* === v9.7.3 visual tweaks === */
-        .panes { gap: 24px; } /* more space between cards */
-        .card.right-steps { font-size: 1.06rem; } /* match P-Table right card feel */
-        .card.right-steps .chip,
-        .card.right-steps .button { font-size: 1.06rem; }
+        .card.right-steps { order: 1; }
+        .card.hgrid-card  { order: 2; }
+        @media (max-width: 720px) { .panes { flex-direction: column; } .card.right-steps, .card.hgrid-card { order: initial; } }
+        .card.right-steps { font-size: 1.06rem; }
+        .card.right-steps .chip, .card.right-steps .button { font-size: 1.06rem; }
         .right-footer { margin-top: 12px; }
-
-        /* Lock blink look to the first-step style; remove stray center stripes */
         .ptable-blink-hard.blink-bg { background: transparent !important; }
-        .ptable-blink-hard.blink-bg::before,
-        .ptable-blink-hard.blink-bg::after { display: none !important; }
-.hcell, .hhead {
-  display: flex !important;
-  align-items: center !important;
-  justify-content: center !important;
-  text-align: center !important;
-}
-.hcell > *, .hhead > * {
-  display: flex;
-  align-items: center;
-  justify-content: center;
-}
-.eq-display {
-  font-size: 1.6rem;
-  font-weight: 700;
-  display: flex;
-  align-items: center;
-  justify-content: center;
-  gap: 0.6rem;
-  padding: 0.5rem 0;
-}
-.eq-display .frac {
-  display: inline-grid;
-  grid-template-rows: auto 2px auto;
-  align-items: center;
-  justify-items: center;
-}
-.eq-display .frac .bar {
-  width: 100%;
-  height: 2px;
-  background: #0f172a;
-  margin: 0.15rem 0;
-}
-.eq-display .eq { font-weight: 800; }
-.eq-display .res { font-weight: 900; }
-.hgrid > *:nth-child(3n) { font-size: inherit; }
-
-/* Optional 1000ms fade (commented-out)
-.narrative-fade-zone.fade-out-1000 { opacity: 0; transition: opacity 1000ms linear; }
-.narrative-fade-zone.fade-in-1000  { opacity: 1; transition: opacity 1000ms linear; }
-.no-fade { opacity: 1 !important; }
-*/
-
-
-  .action-blink { animation: ptable-blink-kf 2s ease-out 0s infinite; }
-.action-blink-strong { 
-  animation: np-strong 1.2s ease-in-out 0s infinite;
-}
-@keyframes np-strong {
-  0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,.25); }
-  50%  { transform: scale(1.06); box-shadow: 0 0 0 10px rgba(59,130,246,.15); }
-  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,.25); }
-}
-`}
-</style>
+        .ptable-blink-hard.blink-bg::before, .ptable-blink-hard.blink-bg::after { display: none !important; }
+        .eq-display { font-size: 1.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 0.5rem 0; }
+        .eq-display .frac { display: inline-grid; grid-template-rows: auto 2px auto; align-items: center; justify-items: center; }
+        .eq-display .frac .bar { width: 100%; height: 2px; background: #0f172a; margin: 0.15rem 0; }
+        .eq-display .eq { font-weight: 800; }
+        .eq-display .res { font-weight: 900; }
+        .action-blink { animation: ptable-blink-kf 2s ease-out 0s infinite; }
+        .action-blink-strong { animation: np-strong 1.2s ease-in-out 0s infinite; }
+        @keyframes np-strong { 0%{ transform:scale(1); box-shadow:0 0 0 0 rgba(59,130,246,.25);} 50%{ transform:scale(1.06); box-shadow:0 0 0 10px rgba(59,130,246,.15);} 100%{ transform:scale(1); box-shadow:0 0 0 0 rgba(59,130,246,.25);} }
+      `}</style>
 
       <div className="panes">
-        {/* H-GRID RENDER */}
-{/* LEFT CARD: Problem + H-table */}
+        {/* LEFT CARD: Problem + Press for English */}
         <div className="card hgrid-card">
           <div className="section">
-
-            {/* Problem (natural text only) */}
             <div className="problem-banner">
               <div className="problem-title">Problem <span className="lang-badge" style={{float:"right", fontWeight:600}}>Language: {langLabel}</span></div>
-              <div className="problem-body" style={{whiteSpace:'pre-wrap'}}>
-                {displayText}
-              </div>
-    <div className="problem-controls" style={{display:'flex', justifyContent:'center', marginTop:8}}>
-      <button
-        type="button"
-        className="button button-contrast"
-        onMouseDown={holdEnglishDown}
-        onMouseUp={holdEnglishUp}
-        onMouseLeave={holdEnglishUp}
-        onTouchStart={holdEnglishDown}
-        onTouchEnd={holdEnglishUp}
-        onPointerDown={holdEnglishDown}
-        onPointerUp={holdEnglishUp}
-        onPointerCancel={holdEnglishUp}
-      >
-        Press for English
-      </button>
-    </div>
-
+              <div className="problem-body" style={{whiteSpace:'pre-wrap'}}>{displayText}</div>
+
+              {/* Press for English — hover neutralized via your CSS .no-hover */}
+              <div className="problem-controls" style={{display:'flex', justifyContent:'center', marginTop:8}}>
+                <button
+                  type="button"
+                  className="button button-contrast no-hover"
+                  onMouseDown={holdDownEnglish}
+                  onMouseUp={holdUpEnglish}
+                  onTouchStart={holdDownEnglish}
+                  onTouchEnd={holdUpEnglish}
+                  onPointerDown={holdDownEnglish}
+                  onPointerUp={holdUpEnglish}
+                  onPointerCancel={holdUpEnglish}
+                >
+                  Press for English
+                </button>
+              </div>
             </div>
 
-            {/* H-table visible AFTER step 0 */}
+            {/* H-table (visual) */}
             {step>=1 && (
               <div className="hwrap" style={{position:'relative', marginTop:12}}>
-                
-{/* Equation display (Step 11+ when result shown) */}
-{ (step >= 10 && (mathStrip?.a!=null && mathStrip?.b!=null && mathStrip?.divisor!=null)) && (
-  <div className="eq-display">
-    <span className="frac">
-      <span className="num">{String(mathStrip?.a ?? '')} × {String(mathStrip?.b ?? '')}</span>
-      <span className="bar"></span>
-      <span className="den">{String(mathStrip?.divisor ?? '')}</span>
-    </span>
-    <span className="eq"> = </span>
-    <span className="res">{ mathStrip?.showResult ? String(mathStrip?.result ?? '') : null }</span>
-  </div>
-)}
-<div ref={gridRef} className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, position:'relative'}}>
+                <div ref={gridRef} className="hgrid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, position:'relative'}}>
                   {/* Headers */}
                   <div className="hhead" style={{height:ROW_H}}>
                     <Slot accept={["header"]} blinkWrap={step===1 && !table.head1} className={`${!table.head1 ? "empty" : ""}`}>
@@ -883,8 +694,7 @@
                       </div>
                     </Slot>
                   </div>
-                  <div className="hhead" style={{height:ROW_H}}>{/* blank */}</div>
-
+                  <div className="hhead" style={{height:ROW_H}} />
                   {/* Row 1 */}
                   <div ref={refs.uTop} className="hcell" style={{height:ROW_H}}>
                     <Slot blinkWrap={blinkUnits} className={`${!table.uTop ? "empty" : ""}`}>
@@ -921,12 +731,12 @@
                     </Slot>
                   </div>
 
-                  {/* H lines */}
-                  <div style={{position:'absolute', pointerEvents:'none', left:0, top:(lines.hTop||0), width:(lines.gridW||0), borderTop:`5px solid ${lineColor}`}} />
-                  <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v1Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />
-                  <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v2Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${lineColor}`}} />
-
-                  {/* Red oval (Step 9) */}
+                  {/* H & V lines */}
+                  <div style={{position:'absolute', pointerEvents:'none', left:0, top:(lines.hTop||0), width:(lines.gridW||0), borderTop:`5px solid ${'#0f172a'}`}} />
+                  <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v1Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${'#0f172a'}`}} />
+                  <div style={{position:'absolute', pointerEvents:'none', top:(lines.vTop||0), left:(lines.v2Left||0), height:(lines.vHeight||0), borderLeft:`5px solid ${'#0f172a'}`}} />
+
+                  {/* Red overlays */}
                   {oval && (
                     <div
                       style={{
@@ -938,7 +748,6 @@
                       }}
                     />
                   )}
-                  {/* Red triple underline (Step 10) */}
                   {tripleUL && (
                     <div style={{position:'absolute', left: tripleUL.left, top: tripleUL.top, width: tripleUL.width, height:18, pointerEvents:'none'}}>
                       <div style={{borderTop:'3px solid #ef4444', marginTop:0}} />
@@ -949,56 +758,67 @@
                 </div>
               </div>
             )}
-
           </div>
         </div>
 
-        {/* RIGHT SIDE – prompts only */}
+        {/* RIGHT SIDE – prompts + equation strip + Calculate (moved here) */}
         <div className="card right-steps">
           <div className="section">
+
+            {/* Equation strip ON RIGHT; inline Calculate button */}
+            {(step >= 10 && (mathStrip?.a!=null && mathStrip?.b!=null && mathStrip?.divisor!=null)) && (
+              <div className="eq-display" style={{marginBottom:8}}>
+                <span className="frac">
+                  <span className="num">{String(mathStrip?.a ?? '')} × {String(mathStrip?.b ?? '')}</span>
+                  <span className="bar"></span>
+                  <span className="den">{String(mathStrip?.divisor ?? '')}</span>
+                </span>
+                <span className="eq"> = </span>
+                {mathStrip?.showResult ? (
+                  <span className="res">{ String(mathStrip?.result ?? '') }</span>
+                ) : (
+                  <button
+                    type="button"
+                    className="button action-blink-strong"
+                    onClick={onCalculate}
+                    disabled={ ( (table?.vTop == null) === (table?.vBottom == null) ) }
+                  >
+                    Calculate
+                  </button>
+                )}
+              </div>
+            )}
+
             <div className="step-title">{STEP_TITLES[step]}</div>
 
-            {/* RIGHT-PANEL: STEP 0 — START */}
+            {/* RIGHT-PANEL: STEP 0 */}
             {step===0 && (
               <div className="chips with-borders center">
-                {STEP1_CHOICES.map(c => (
+                {step0Choices.map(c => (
                   <button key={c.id} className="chip" onClick={()=>handleStep0(c)}>{c.label}</button>
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 0 — END */}
-
-            {/* RIGHT-PANEL: STEP 1 — START */}
+
+            {/* RIGHT-PANEL: STEP 1 */}
             {step===1 && (
               <div className="chips with-borders center" style={{marginTop:8}}>
-                {shuffle([
-                  { id:'col_units', label:'Units', kind:'col', v:'Units' },
-                  { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
-                  { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
-                  { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
-                ]).map((h, idx) => (
+                {step1HeaderChoices.map((h, idx) => (
                   <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} tapAction={(e,d)=>tapHeader1(d)} />
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 1 — END */}
-
-            {/* RIGHT-PANEL: STEP 2 — START */}
+
+            {/* RIGHT-PANEL: STEP 2 */}
             {step===2 && (
               <div className="chips with-borders center" style={{marginTop:8}}>
-                {shuffle([
-                  { id:'col_units', label:'Units', kind:'col', v:'Units' },
-                  { id:'col_scale', label:'Scale Numbers', kind:'col', v:'ScaleNumbers' },
-                  { id:'col_totals', label:'Totals', kind:'col', v:'Totals' },
-                  { id:'col_rates', label:'Rates', kind:'col', v:'Rates' },
-                ]).map((h, idx) => (
+                {step2HeaderChoices.map((h, idx) => (
                   <Draggable key={h.id ?? idx} id={h.id ?? idx} label={h.label} data={h} tapAction={(e,d)=>tapHeader2(d)} />
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 2 — END */}
-
-            {/* RIGHT-PANEL: STEP 3 — START */}
+
+            {/* RIGHT-PANEL: STEP 3 */}
             {step===3 && (
               <div className="chips center mt-8">
                 {unitChoices.map(c => (
@@ -1006,77 +826,59 @@
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 3 — END */}
-
-            {/* RIGHT-PANEL: STEP 4 — START */}
+
+            {/* RIGHT-PANEL: STEP 4 */}
             {step===4 && (
               <div className="chips center mt-8">
-                {shuffle(numbersTopScale).map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleTop(d)} />)}
-              </div>
-            )}
-            {/* RIGHT-PANEL: STEP 4 — END */}
-
-            {/* RIGHT-PANEL: STEP 5 — START */}
+                {numbersTopScale.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleTop(d)} />)}
+              </div>
+            )}
+
+            {/* RIGHT-PANEL: STEP 5 */}
             {step===5 && (
               <div className="chips center mt-8">
-                {shuffle(numbersBottomScale).map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleBottom(d)} />)}
-              </div>
-            )}
-            {/* RIGHT-PANEL: STEP 5 — END */}
-
-            {/* RIGHT-PANEL: STEP 6 — START */}
+                {numbersBottomScale.map(c => <Draggable key={c.id} id={c.id} label={c.label} data={c} tapAction={(e,d)=>tapScaleBottom(d)} />)}
+              </div>
+            )}
+
+            {/* RIGHT-PANEL: STEP 6 */}
             {step===6 && (
               <div className="chips with-borders center mt-8">
-                {shuffle(otherValueChoices).map(c => (
+                {otherValueChoices.map(c => (
                   <button key={c.id} className="chip" onClick={() => { chooseOtherValue(c); }}>{c.label}</button>
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 6 — END */}
-
-            {/* RIGHT-PANEL: STEP 7 — START (user taps a cell on left; no pre-blink) */}
-            {step===7 && (<div className="problem-body">Tap the correct cell in the table.</div>)}
-            {/* RIGHT-PANEL: STEP 7 — END */}
-
-            {/* RIGHT-PANEL: STEP 8 — START */}            {/* RIGHT-PANEL: STEP 8 — START */}
+
+            {/* RIGHT-PANEL: STEP 7 */}
+            {step===7 && (<div className="problem-body">Tap the cell where you should place the value.</div>)}
+
+            {/* RIGHT-PANEL: STEP 8 */}
             {step===8 && (
               <div className="chips with-borders center mt-8">
-                {shuffle(_assertFour(STEP8_CHOICES, "Step8")).map((opt,idx)=>(
-                  <button key={opt.id || idx} className="chip" onClick={()=>chooseNext8(opt)}>
-                    {opt.label}
-                  </button>
+                {_assertFour(STEP8_CHOICES, "Step8").map((opt,idx)=>(
+                  <button key={opt.id || idx} className="chip" onClick={()=>chooseNext8(opt)}>{opt.label}</button>
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 8 — END */}
-
-            {/* RIGHT-PANEL: STEP 9 — START */}
+
+            {/* RIGHT-PANEL: STEP 9 */}
             {step===9 && (
               <div className="chips with-borders center mt-8">
-                {shuffle([crossPair, ...wrongPairs].filter(Boolean)).slice(0,4).map((pair,idx)=>(
+                {[crossPair, ...wrongPairs].filter(Boolean).slice(0,4).map((pair,idx)=>(
                   <button key={idx} className="chip" onClick={()=>chooseMultiply(pair)}>{pair.label}</button>
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 9 — END */}
-
-            {/* RIGHT-PANEL: STEP 10 — START */}
+
+            {/* RIGHT-PANEL: STEP 10 */}
             {step===10 && (
               <div className="chips with-borders center mt-8">
-                {shuffle(divideChoices).map((c,idx)=>(
+                {divideChoices.map((c,idx)=>(
                   <button key={idx} className="chip" onClick={()=>chooseDivideByNumber(c)}>{c.label}</button>
                 ))}
               </div>
             )}
-            {/* RIGHT-PANEL: STEP 10 — END */}
-
-            {/* RIGHT-PANEL: STEP 11 — START */}
-            {step>=11 && (
-              <div className="center" style={{marginTop:12}}>
-                <button  className="button" onClick={onCalculate} disabled={( (table?.vTop == null) === (table?.vBottom == null) )}>Calculate</button>
-              </div>
-            )}
-            {/* RIGHT-PANEL: STEP 11 — END */}
 
             {/* Sticky footer controls */}
             <div className="right-footer">
@@ -1092,8 +894,8 @@
         </div>
       </div>
 
-      {/* Summary overlay + confetti (single burst per summary) */}
-      {openSum && (
+      {/* Summary overlay stays OFF in 10.4.8 */}
+      {false && openSum && (
         <SummaryOverlay
           open={openSum}
           onClose={()=>setOpenSum(false)}
