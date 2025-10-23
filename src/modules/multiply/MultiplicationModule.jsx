// MultiplicationModule.jsx - v18.0.0 - FINAL VERSION - ALL ISSUES FIXED
import React, { useState, useRef, useEffect } from 'react'

const ErrorOverlay = ({ show }) => {
  if (!show) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(239, 68, 68, 0.2)', zIndex: 9999, pointerEvents: 'none'
    }}>
      <div style={{
        fontSize: '24rem', fontWeight: 900, color: '#ef4444', lineHeight: 1,
        textShadow: '0 0 60px rgba(239, 68, 68, 0.8)', animation: 'errorPulse 0.4s ease-out'
      }}>✗</div>
      <style>{`@keyframes errorPulse { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  )
}

const genProblem = () => {
  const digits1 = Math.random() > 0.5 ? 2 : 3
  const min1 = digits1 === 2 ? 10 : 100
  const max1 = digits1 === 2 ? 99 : 999
  const num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1
  const num2 = Math.floor(Math.random() * 90) + 10
  return { num1, num2 }
}

const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5)

export default function MultiplicationModule({ onProblemComplete, registerReset, updateStats }) {
  const [problem, setProblem] = useState(genProblem())
  const [showError, setShowError] = useState(false)
  const [currentProblemErrors, setCurrentProblemErrors] = useState(0)
  const confettiInterval = useRef(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [phase, setPhase] = useState('SELECT')
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [selectedTop, setSelectedTop] = useState(null)
  const [selectedBottom, setSelectedBottom] = useState(null)
  const [productBeforeCarry, setProductBeforeCarry] = useState(null)
  const [currentAnswer, setCurrentAnswer] = useState(null)
  const [carries, setCarries] = useState({})
  const [placed, setPlaced] = useState({})
  const [addCarries, setAddCarries] = useState({})
  const [addCol, setAddCol] = useState(0)
  const [finalSum, setFinalSum] = useState('')
  const [firstQuestion, setFirstQuestion] = useState(true)

  const { num1, num2 } = problem
  const num1Digits = String(num1).split('').map(Number).reverse()
  const num2Digits = String(num2).split('').map(Number).reverse()
  const correctAnswer = num1 * num2

  const handleError = () => {
    setShowError(true)
    setCurrentProblemErrors(prev => prev + 1)
    setTimeout(() => setShowError(false), 1000)
  }

  const handleReset = () => {
    if (confettiInterval.current) clearInterval(confettiInterval.current)
    setShowConfetti(false)
    
    // Generate new problem
    const newProblem = genProblem()
    setProblem(newProblem)
    
    // Reset all state
    setPhase('SELECT')
    setCurrentRow(0)
    setCurrentCol(0)
    setSelectedTop(null)
    setSelectedBottom(null)
    setProductBeforeCarry(null)
    setCurrentAnswer(null)
    setCarries({})
    setPlaced({})
    setAddCarries({})
    setAddCol(0)
    setFinalSum('')
    setFirstQuestion(true)
    setCurrentProblemErrors(0)
    setIsComplete(false)
  }

  useEffect(() => { registerReset?.('multiply', handleReset) }, [])
  useEffect(() => () => { if (confettiInterval.current) clearInterval(confettiInterval.current) }, [])

  const handleTopClick = (colIdx) => {
    if (phase !== 'SELECT' || selectedTop !== null) return
    if (colIdx !== currentCol) { handleError(); return }
    setSelectedTop(colIdx)
    setFirstQuestion(false)
  }

  const handleBottomClick = (rowIdx) => {
    if (phase !== 'SELECT' || selectedBottom !== null || selectedTop === null) return
    if (rowIdx !== currentRow) { handleError(); return }
    setSelectedBottom(rowIdx)
    setPhase('ANSWER_MULT')
  }

  // FIXED: Get carry at the RESULT position, not the multiplication position
  const getCurrentCarry = () => {
    // For row 0: result goes to column currentCol, so carry at currentCol
    // For row 1: result goes to column currentCol+1, so carry at currentCol+1
    const resultCol = currentRow === 1 ? currentCol + 1 : currentCol
    return carries[`${currentRow}-${resultCol}`] || 0
  }

  const handleMultAnswer = (answer) => {
    const topDigit = num1Digits[selectedTop]
    const bottomDigit = num2Digits[selectedBottom]
    const correct = topDigit * bottomDigit
    
    if (Number(answer) !== correct) { handleError(); return }
    
    const currentCarry = getCurrentCarry()
    setProductBeforeCarry(correct)
    
    if (currentCarry > 0) {
      setPhase('ASK_ADD')
    } else {
      setCurrentAnswer(correct)
      processAnswerPlacement(correct)
    }
  }

  const handleAddChoice = (choice) => {
    if (choice !== 'Add it') { handleError(); return }
    setPhase('ANSWER_ADD')
  }

  const handleAddAnswer = (answer) => {
    const currentCarry = getCurrentCarry()
    const correct = productBeforeCarry + currentCarry
    if (Number(answer) !== correct) { handleError(); return }
    
    setCurrentAnswer(correct)
    processAnswerPlacement(correct)
  }

  const processAnswerPlacement = (answer) => {
    const tens = Math.floor(answer / 10)
    
    if (tens > 0 && currentCol < num1Digits.length - 1) {
      setPhase('PLACE_CARRY')
    } else if (tens > 0 && currentCol === num1Digits.length - 1) {
      setPhase('PLACE_FINAL_TENS')
    } else {
      setPhase('PLACE_ONES')
    }
  }

  const handleCarryClick = (colIdx) => {
    if (phase !== 'PLACE_CARRY') return
    const tens = Math.floor(currentAnswer / 10)
    
    // FIXED: Carry goes to next column in the SAME row's result
    // Row 0: carry goes from resultCol to resultCol+1, which is currentCol to currentCol+1
    // Row 1: carry goes from resultCol to resultCol+1, which is currentCol+1 to currentCol+2
    const expectedCarryCol = currentRow === 1 ? currentCol + 2 : currentCol + 1
    
    if (colIdx !== expectedCarryCol) { handleError(); return }
    
    const newCarries = { ...carries }
    newCarries[`${currentRow}-${colIdx}`] = tens
    setCarries(newCarries)
    setPhase('PLACE_ONES')
  }

  const handlePlaceFinalTens = (colIdx) => {
    if (phase !== 'PLACE_FINAL_TENS') return
    const tens = Math.floor(currentAnswer / 10)
    const expectedCol = currentRow === 1 ? currentCol + 2 : currentCol + 1
    
    if (colIdx !== expectedCol) { handleError(); return }
    
    const newPlaced = { ...placed }
    newPlaced[`${currentRow}-${colIdx}`] = tens
    setPlaced(newPlaced)
    setPhase('PLACE_FINAL_ONES')
  }

  const handlePlaceFinalOnes = (colIdx) => {
    if (phase !== 'PLACE_FINAL_ONES') return
    const ones = currentAnswer % 10
    const expectedCol = currentRow === 1 ? currentCol + 1 : currentCol
    
    if (colIdx !== expectedCol) { handleError(); return }
    
    const newPlaced = { ...placed }
    newPlaced[`${currentRow}-${colIdx}`] = ones
    setPlaced(newPlaced)
    moveToNext()
  }

  const handlePlaceOnes = (colIdx) => {
    if (phase !== 'PLACE_ONES') return
    const ones = currentAnswer % 10
    const expectedCol = currentRow === 1 ? currentCol + 1 : currentCol
    
    if (colIdx !== expectedCol) { handleError(); return }
    
    const newPlaced = { ...placed }
    newPlaced[`${currentRow}-${colIdx}`] = ones
    setPlaced(newPlaced)
    moveToNext()
  }

  const moveToNext = () => {
    setSelectedTop(null)
    setSelectedBottom(null)
    setCurrentAnswer(null)
    setProductBeforeCarry(null)
    
    if (currentCol < num1Digits.length - 1) {
      setCurrentCol(currentCol + 1)
      setPhase('SELECT')
    } else if (currentRow === 0 && num2Digits.length > 1) {
      setCarries({})
      setCurrentRow(1)
      setCurrentCol(0)
      setPhase('ZERO_PROMPT')
    } else {
      setCarries({})
      setPhase('ADD_PROMPT')
      setAddCol(0)
    }
  }

  const handleZeroPrompt = (choice) => {
    if (choice !== 'Add a zero') { handleError(); return }
    setPhase('ZERO_PLACE')
  }

  const handleZeroClick = (colIdx) => {
    if (phase !== 'ZERO_PLACE') return
    if (colIdx !== 0) { handleError(); return }
    
    const newPlaced = { ...placed }
    newPlaced[`1-0`] = 0
    setPlaced(newPlaced)
    setPhase('SELECT')
  }

  const handleAddPrompt = (choice) => {
    if (choice !== 'Add the rows') { handleError(); return }
    setPhase('ADD_SELECT')
  }

  const handleAddSelect = (colIdx) => {
    if (phase !== 'ADD_SELECT') return
    if (colIdx !== addCol) { handleError(); return }
    setPhase('ADD_ANSWER')
  }

  const handleAdditionAnswer = (answer) => {
    const row1Val = placed[`0-${addCol}`] || 0
    const row2Val = placed[`1-${addCol}`] || 0
    const carryVal = addCarries[addCol] || 0
    const correct = row1Val + row2Val + carryVal
    
    if (Number(answer) !== correct) { handleError(); return }
    
    const tens = Math.floor(correct / 10)
    const ones = correct % 10
    
    setCurrentAnswer(correct)
    
    if (tens > 0 && addCol < maxResultDigits - 1) {
      setPhase('ADD_PLACE_CARRY')
    } else {
      const newPlaced = { ...placed }
      newPlaced[`final-${addCol}`] = ones
      setPlaced(newPlaced)
      setCurrentAnswer(null)
      
      if (addCol < maxResultDigits - 1) {
        setAddCol(addCol + 1)
        setPhase('ADD_SELECT')
      } else {
        setPhase('FINAL')
        buildFinalAnswer()
      }
    }
  }

  const handleAddCarryClick = (colIdx) => {
    if (phase !== 'ADD_PLACE_CARRY') return
    const tens = Math.floor(currentAnswer / 10)
    if (colIdx !== addCol + 1) { handleError(); return }
    
    const newCarries = { ...addCarries }
    newCarries[addCol + 1] = tens
    setAddCarries(newCarries)
    setPhase('ADD_PLACE_ONES')
  }

  const handleAddPlaceOnes = (colIdx) => {
    if (phase !== 'ADD_PLACE_ONES') return
    const ones = currentAnswer % 10
    if (colIdx !== addCol) { handleError(); return }
    
    const newPlaced = { ...placed }
    newPlaced[`final-${addCol}`] = ones
    setPlaced(newPlaced)
    setCurrentAnswer(null)
    
    if (addCol < maxResultDigits - 1) {
      setAddCol(addCol + 1)
      setPhase('ADD_SELECT')
    } else {
      setPhase('FINAL')
      buildFinalAnswer()
    }
  }

  const buildFinalAnswer = () => {
    let result = ''
    for (let i = maxResultDigits - 1; i >= 0; i--) {
      const digit = placed[`final-${i}`]
      if (digit !== undefined) result += digit
    }
    setFinalSum(result)
  }

  const handleFinalAnswer = (answer) => {
    if (Number(answer) !== correctAnswer) { handleError(); return }
    
    // FIXED: Mark as complete IMMEDIATELY
    setIsComplete(true)
    
    // Show confetti
    setShowConfetti(true)
    confettiInterval.current = setInterval(() => {
      console.log('🎉')
    }, 100)
    
    setTimeout(() => {
      setShowConfetti(false)
      clearInterval(confettiInterval.current)
      // FIXED: Call these AFTER marking complete
      updateStats?.(currentProblemErrors, true)
      onProblemComplete?.()
    }, 2000)
  }

  const generateMultChoices = () => {
    const topDigit = num1Digits[selectedTop]
    const bottomDigit = num2Digits[selectedBottom]
    const correct = topDigit * bottomDigit
    const choices = [correct]
    
    while (choices.length < 4) {
      let wrong
      if (Math.random() > 0.5) {
        wrong = correct + Math.floor(Math.random() * 5) + 1
      } else {
        wrong = Math.max(0, correct - Math.floor(Math.random() * 5) - 1)
      }
      if (!choices.includes(wrong)) choices.push(wrong)
    }
    
    return shuffle(choices)
  }

  const generateAddChoices = () => {
    const currentCarry = getCurrentCarry()
    const correct = productBeforeCarry + currentCarry
    const choices = [correct]
    
    while (choices.length < 4) {
      let wrong
      if (Math.random() > 0.5) {
        wrong = correct + Math.floor(Math.random() * 5) + 1
      } else {
        wrong = Math.max(0, correct - Math.floor(Math.random() * 5) - 1)
      }
      if (!choices.includes(wrong)) choices.push(wrong)
    }
    
    return shuffle(choices)
  }

  const generateAdditionChoices = () => {
    const row1Val = placed[`0-${addCol}`] || 0
    const row2Val = placed[`1-${addCol}`] || 0
    const carryVal = addCarries[addCol] || 0
    const correct = row1Val + row2Val + carryVal
    const choices = [correct]
    
    while (choices.length < 4) {
      let wrong
      if (Math.random() > 0.5) {
        wrong = correct + Math.floor(Math.random() * 5) + 1
      } else {
        wrong = Math.max(0, correct - Math.floor(Math.random() * 5) - 1)
      }
      if (!choices.includes(wrong)) choices.push(wrong)
    }
    
    return shuffle(choices)
  }

  const generateFinalChoices = () => {
    const correct = correctAnswer
    const choices = [correct]
    
    while (choices.length < 4) {
      let wrong
      if (Math.random() > 0.5) {
        wrong = correct + Math.floor(Math.random() * 50) + 10
      } else {
        wrong = Math.max(0, correct - Math.floor(Math.random() * 50) - 10)
      }
      if (!choices.includes(wrong)) choices.push(wrong)
    }
    
    return shuffle(choices)
  }

  const getQuestion = () => {
    if (phase === 'SELECT' && selectedTop === null) {
      return firstQuestion ? 'What do we multiply first?' : 'What do we multiply next?'
    }
    if (phase === 'SELECT' && selectedTop !== null) {
      return `Now select ${num2Digits[currentRow]} from the bottom.`
    }
    if (phase === 'ANSWER_MULT') {
      const topDigit = num1Digits[selectedTop]
      const bottomDigit = num2Digits[selectedBottom]
      return `What is ${topDigit} × ${bottomDigit}?`
    }
    if (phase === 'ASK_ADD') {
      const currentCarry = getCurrentCarry()
      return `We have ${productBeforeCarry} and a carry of ${currentCarry}. What do we do with the ${currentCarry}?`
    }
    if (phase === 'ANSWER_ADD') {
      const currentCarry = getCurrentCarry()
      return `What is ${productBeforeCarry} + ${currentCarry}?`
    }
    if (phase === 'PLACE_CARRY') {
      const tens = Math.floor(currentAnswer / 10)
      return `We need to carry the ${tens}. Where does it go?`
    }
    if (phase === 'PLACE_FINAL_TENS') {
      const tens = Math.floor(currentAnswer / 10)
      return `Where do I put the ${tens}?`
    }
    if (phase === 'PLACE_FINAL_ONES' || phase === 'PLACE_ONES') {
      const ones = currentAnswer % 10
      return `Where do I put the ${ones}?`
    }
    if (phase === 'ZERO_PROMPT') return "What do we do next?"
    if (phase === 'ZERO_PLACE') return "Where does the zero go?"
    if (phase === 'ADD_PROMPT') return "What do we do now?"
    if (phase === 'ADD_SELECT') {
      return "Click the numbers in the column you want to add."
    }
    if (phase === 'ADD_ANSWER') {
      const row1Val = placed[`0-${addCol}`] || 0
      const row2Val = placed[`1-${addCol}`] || 0
      const carryVal = addCarries[addCol] || 0
      if (carryVal > 0) {
        return `What is ${row1Val} + ${row2Val} + ${carryVal}?`
      }
      return `What is ${row1Val} + ${row2Val}?`
    }
    if (phase === 'ADD_PLACE_CARRY') {
      const tens = Math.floor(currentAnswer / 10)
      return `We need to carry the ${tens}. Where does it go?`
    }
    if (phase === 'ADD_PLACE_ONES') {
      const ones = currentAnswer % 10
      return `Where do I put the ${ones}?`
    }
    if (phase === 'FINAL') return "What is the final answer?"
    return ""
  }

  const maxResultDigits = String(correctAnswer).length
  
  const buildRow = (rowNum) => {
    const result = []
    for (let i = 0; i < maxResultDigits; i++) {
      result.push(placed[`${rowNum}-${i}`])
    }
    return result.reverse()
  }

  const row1 = buildRow(0)
  const row2 = buildRow(1)

  return (
    <>
      <ErrorOverlay show={showError} />
      {showConfetti && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:9999,fontSize:'5rem',display:'flex',flexWrap:'wrap',justifyContent:'space-around',alignContent:'space-around',animation:'confettiFall 2s ease-out'}}>
          {'🎉🎊🎈✨🌟💫⭐'.repeat(20).split('').map((e,i)=><span key={i} style={{animation:`confettiSpin ${Math.random()*2+1}s linear infinite`,opacity:Math.random()}}>{e}</span>)}
        </div>
      )}
      <style>{`
        @keyframes confettiFall { from { transform: translateY(-100vh) rotate(0deg); } to { transform: translateY(100vh) rotate(720deg); } }
        @keyframes confettiSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div className="container">
        <style>{`
          .mult-grid { background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 16px; padding: 32px; display: inline-block; font-family: 'Courier New', monospace; font-size: 2.5rem; font-weight: 700; margin-bottom: 24px; }
          .mult-row { display: flex; gap: 8px; margin-bottom: 8px; justify-content: flex-end; }
          .carry-row { display: flex; gap: 8px; margin-bottom: -8px; justify-content: flex-end; font-size: 1.2rem; color: #ef4444; min-height: 30px; }
          .mult-digit { min-width: 50px; min-height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: transparent; border: none; position: relative; color: #0f172a; }
          .mult-digit.clickable { cursor: pointer; background: #e0f2fe; border: 2px solid #0ea5e9; }
          .mult-digit.selected { background: #3b82f6; color: #fff; border: 3px solid #1e40af; }
          .mult-digit.current-mult { background: #fef3c7 !important; color: #0f172a !important; border: 3px solid #f59e0b !important; box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); animation: pulse-glow 1.5s ease-in-out infinite; }
          .mult-digit.blink { animation: blink-kf 2s ease-in-out infinite; background: #fef3c7; border: 2px dashed #f59e0b; cursor: pointer; color: #0f172a; }
          .mult-digit.add-highlight { background: #fef3c7 !important; border: 2px solid #f59e0b !important; animation: pulse-glow 1.5s ease-in-out infinite; }
          .mult-digit.empty { background: #f1f5f9; border: 2px dashed #cbd5e1; }
          .mult-result { color: #10b981; font-weight: 900; background: transparent; border: none; }
          .mult-line { border-top: 3px solid #0f172a; margin: 12px 0; }
          .mult-times { margin-right: 8px; }
          .answer-btn { display: inline-flex; align-items: center; justify-content: center; padding: 16px 24px; border-radius: 12px; font-weight: 700; font-size: 1.25rem; border: 0; color: #fff; background: linear-gradient(135deg, #0B4B8C, #0C6B4D); box-shadow: 0 8px 16px rgba(11, 75, 140, 0.18); cursor: pointer; min-height: 60px; font-family: inherit; transition: transform 150ms ease; }
          .answer-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
          .answers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; min-height: 140px; }
          .step-title { font-size: 1.5rem; font-weight: 900; color: #0f172a; margin-bottom: 16px; text-align: center; font-family: inherit; padding: 0 16px; }
          .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 1200px; margin: 0 auto; }
          @keyframes blink-kf { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); } 50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.8); } }
          @media (max-width: 600px) { .answers-grid { grid-template-columns: 1fr; } }
        `}</style>

        <div className="card">
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Left side: Math grid - Fixed size */}
            <div style={{ minWidth: '500px', display: 'flex', justifyContent: 'center' }}>
              <div className="mult-grid">
              {/* Carry row for multiplication */}
              {(phase !== 'ADD_PROMPT' && phase !== 'ADD_SELECT' && phase !== 'ADD_ANSWER' && phase !== 'ADD_PLACE_CARRY' && phase !== 'ADD_PLACE_ONES' && phase !== 'FINAL') && (
                <div className="carry-row">
                  {[...Array(maxResultDigits)].map((_, i) => {
                    const col = maxResultDigits - 1 - i
                    // FIXED: Show carry stored at this column for current row
                    const val = carries[`${currentRow}-${col}`] || ''
                    const expectedCarryCol = currentRow === 1 ? currentCol + 2 : currentCol + 1
                    const blink = phase === 'PLACE_CARRY' && col === expectedCarryCol
                    return <div key={i} className={blink ? 'blink' : ''} style={{minWidth:50,minHeight:30,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,cursor:blink?'pointer':'default',background:blink?'#fef3c7':'transparent',border:blink?'2px dashed #f59e0b':'none',color:'#ef4444'}} onClick={()=>blink&&handleCarryClick(col)}>{val}</div>
                  })}
                </div>
              )}

              <div className="mult-row">
                {num1Digits.slice().reverse().map((digit, i) => {
                  const digitIdx = num1Digits.length - 1 - i
                  const clickable = phase === 'SELECT' && selectedTop === null && digitIdx === currentCol
                  const selected = selectedTop === digitIdx
                  const currentlyMultiplying = (phase === 'ANSWER_MULT' || phase === 'ASK_ADD' || phase === 'ANSWER_ADD' || phase === 'PLACE_CARRY' || phase === 'PLACE_ONES' || phase === 'PLACE_FINAL_TENS' || phase === 'PLACE_FINAL_ONES') && selectedTop === digitIdx
                  return <div key={i} className={`mult-digit ${clickable?'clickable':''} ${selected?'selected':''} ${currentlyMultiplying?'current-mult':''}`} onClick={()=>clickable&&handleTopClick(digitIdx)}>{digit}</div>
                })}
              </div>

              <div className="mult-row">
                <div className="mult-digit mult-times">×</div>
                {num2Digits.slice().reverse().map((digit, i) => {
                  const rowIdx = num2Digits.length - 1 - i
                  const clickable = phase === 'SELECT' && selectedTop !== null && selectedBottom === null && rowIdx === currentRow
                  const selected = selectedBottom === rowIdx
                  const currentlyMultiplying = (phase === 'ANSWER_MULT' || phase === 'ASK_ADD' || phase === 'ANSWER_ADD' || phase === 'PLACE_CARRY' || phase === 'PLACE_ONES' || phase === 'PLACE_FINAL_TENS' || phase === 'PLACE_FINAL_ONES') && selectedBottom === rowIdx
                  return <div key={i} className={`mult-digit ${clickable?'clickable':''} ${selected?'selected':''} ${currentlyMultiplying?'current-mult':''}`} onClick={()=>clickable&&handleBottomClick(rowIdx)}>{digit}</div>
                })}
              </div>

              <div className="mult-line" />

              {/* Carry row for addition - positioned above row1 */}
              {(phase === 'ADD_SELECT' || phase === 'ADD_ANSWER' || phase === 'ADD_PLACE_CARRY' || phase === 'ADD_PLACE_ONES') && (
                <div className="carry-row">
                  {[...Array(maxResultDigits)].map((_, i) => {
                    const col = maxResultDigits - 1 - i
                    const val = addCarries[col] || ''
                    const blink = phase === 'ADD_PLACE_CARRY' && col === addCol + 1
                    return <div key={i} className={blink ? 'blink' : ''} style={{minWidth:50,minHeight:30,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,cursor:blink?'pointer':'default',background:blink?'#fef3c7':'transparent',border:blink?'2px dashed #f59e0b':'none',color:'#ef4444'}} onClick={()=>blink&&handleAddCarryClick(col)}>{val}</div>
                  })}
                </div>
              )}

              <div className="mult-row">
                {row1.map((val, i) => {
                  const col = maxResultDigits - 1 - i
                  const blinkOnes = phase === 'PLACE_ONES' && currentRow === 0 && col === currentCol
                  const blinkFinalOnes = phase === 'PLACE_FINAL_ONES' && currentRow === 0 && col === currentCol
                  const blinkFinalTens = phase === 'PLACE_FINAL_TENS' && currentRow === 0 && col === currentCol + 1
                  const blink = blinkOnes || blinkFinalOnes || blinkFinalTens
                  const canClick = blink && val === undefined
                  const addHighlight = phase === 'ADD_SELECT' && col === addCol && val !== undefined
                  
                  return <div key={i} className={`mult-digit ${val!==undefined?'mult-result':'empty'} ${blink&&canClick?'blink':''} ${addHighlight?'add-highlight':''}`} onClick={()=>{
                    if(canClick) {
                      if(blinkOnes) handlePlaceOnes(col)
                      if(blinkFinalOnes) handlePlaceFinalOnes(col)
                      if(blinkFinalTens) handlePlaceFinalTens(col)
                    }
                    if(addHighlight) handleAddSelect(col)
                  }}>{val!==undefined?val:''}</div>
                })}
              </div>

              <div className="mult-row">
                <div className="mult-digit empty"></div>
                {row2.map((val, i) => {
                  const col = maxResultDigits - 1 - i
                  const blinkZero = phase === 'ZERO_PLACE' && col === 0
                  const blinkOnes = phase === 'PLACE_ONES' && currentRow === 1 && col === currentCol + 1
                  const blinkFinalOnes = phase === 'PLACE_FINAL_ONES' && currentRow === 1 && col === currentCol + 1
                  const blinkFinalTens = phase === 'PLACE_FINAL_TENS' && currentRow === 1 && col === currentCol + 2
                  const blink = blinkZero || blinkOnes || blinkFinalOnes || blinkFinalTens
                  const canClick = blink && val === undefined
                  const addHighlight = phase === 'ADD_SELECT' && col === addCol && val !== undefined
                  
                  return <div key={i} className={`mult-digit ${val!==undefined?'mult-result':'empty'} ${blink&&canClick?'blink':''} ${addHighlight?'add-highlight':''}`} onClick={()=>{
                    if(canClick) {
                      if(blinkZero) handleZeroClick(col)
                      if(blinkOnes) handlePlaceOnes(col)
                      if(blinkFinalOnes) handlePlaceFinalOnes(col)
                      if(blinkFinalTens) handlePlaceFinalTens(col)
                    }
                    if(addHighlight) handleAddSelect(col)
                  }}>{val!==undefined?val:''}</div>
                })}
              </div>

              {(phase === 'ADD_PROMPT' || phase === 'ADD_SELECT' || phase === 'ADD_ANSWER' || phase === 'ADD_PLACE_CARRY' || phase === 'ADD_PLACE_ONES' || phase === 'FINAL') && (
                <>
                  <div className="mult-line" />
                  <div className="mult-row">
                    {[...Array(maxResultDigits)].map((_, i) => {
                      const col = maxResultDigits - 1 - i
                      const val = placed[`final-${col}`]
                      const blinkOnes = phase === 'ADD_PLACE_ONES' && col === addCol
                      return <div key={i} className={`mult-digit ${val!==undefined?'mult-result':'empty'} ${blinkOnes?'blink':''}`} onClick={()=>{
                        if(blinkOnes) handleAddPlaceOnes(col)
                      }}>{val!==undefined?val:''}</div>
                    })}
                  </div>
                </>
              )}
            </div>
            </div>

            {/* Right side: Questions and answers - Fixed size */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '450px', minHeight: '400px' }}>
              {phase !== 'FINAL' || !finalSum ? (
                <>
                  <div className="step-title" style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getQuestion()}</div>
                {phase === 'ANSWER_MULT' && (
                  <div className="answers-grid">
                    {shuffle(generateMultChoices()).map((c, i) => <button key={i} className="answer-btn" onClick={()=>handleMultAnswer(c)}>{c}</button>)}
                  </div>
                )}
                {phase === 'ASK_ADD' && (
                  <div className="answers-grid">
                    {shuffle(['Add it', 'Ignore it', 'Subtract it', 'Multiply it']).map((c,i)=><button key={i} className="answer-btn" onClick={()=>handleAddChoice(c)}>{c}</button>)}
                  </div>
                )}
                {phase === 'ANSWER_ADD' && (
                  <div className="answers-grid">
                    {shuffle(generateAddChoices()).map((c, i) => <button key={i} className="answer-btn" onClick={()=>handleAddAnswer(c)}>{c}</button>)}
                  </div>
                )}
                {phase === 'ZERO_PROMPT' && (
                  <div className="answers-grid">
                    {shuffle(['Add a zero', 'Add the rows', 'Carry the 1', 'Multiply again']).map((c,i)=><button key={i} className="answer-btn" onClick={()=>handleZeroPrompt(c)}>{c}</button>)}
                  </div>
                )}
                {phase === 'ADD_PROMPT' && (
                  <div className="answers-grid">
                    {shuffle(['Add the rows', 'Multiply again', 'Subtract them', 'Divide them']).map((c,i)=><button key={i} className="answer-btn" onClick={()=>handleAddPrompt(c)}>{c}</button>)}
                  </div>
                )}
                {phase === 'ADD_ANSWER' && (
                  <div className="answers-grid">
                    {shuffle(generateAdditionChoices()).map((c,i)=><button key={i} className="answer-btn" onClick={()=>handleAdditionAnswer(c)}>{c}</button>)}
                  </div>
                )}
                {phase === 'FINAL' && !isComplete && (
                  <div className="answers-grid">
                    {shuffle(generateFinalChoices()).map((c,i)=><button key={i} className="answer-btn" onClick={()=>handleFinalAnswer(c)}>{c}</button>)}
                  </div>
                )}
              </>
            ) : (
              <div className="step-title" style={{color:'#10b981', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>🎉 Perfect! {num1} × {num2} = {correctAnswer}</div>
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
