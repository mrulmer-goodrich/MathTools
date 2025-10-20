import React, { useState, useRef } from 'react'
import { ErrorOverlay } from '../../components/StatsSystem.jsx'
import ugConfetti from '../../lib/confetti.js'

const genProblem = () => {
  const whole = Math.floor(Math.random() * 4) + 1
  const denom = Math.floor(Math.random() * 6) + 2
  const numer = Math.floor(Math.random() * (denom - 1)) + 1
  return { whole, numer, denom }
}

export default function MixedNumbersModule({ onProblemComplete, registerReset, updateStats }) {
  const [problem, setProblem] = useState(genProblem())
  const [step, setStep] = useState(0)
  const [error, setError] = useState(false)
  const [errors, setErrors] = useState(0)
  const [selected, setSelected] = useState({})
  const [done, setDone] = useState(false)

  const chipRef = useRef(null)

  const showError = () => {
    setError(true)
    setErrors(e => e + 1)
    setTimeout(() => setError(false), 1000)
  }

  const handleReset = () => {
    setProblem(genProblem())
    setStep(0)
    setError(false)
    setErrors(0)
    setSelected({})
    setDone(false)
  }

  registerReset?.(handleReset)

  const { whole, numer, denom } = problem
  const correctProduct = whole * denom
  const correctFinalNumerator = correctProduct + numer

  const steps = [
    {
      prompt: "What does M stand for?",
      choices: ["Multiply", "Add", "Divide", "Draw"],
      correct: "Multiply",
      key: 'm'
    },
    {
      prompt: `What two numbers do we multiply?`,
      choices: [whole, denom, numer, 1].map(String),
      correct: [String(whole), String(denom)],
      key: 'mPair'
    },
    {
      prompt: "What does A stand for?",
      choices: ["Add", "Multiply", "Average", "Answer"],
      correct: "Add",
      key: 'a'
    },
    {
      prompt: `What number do we add to ${whole} × ${denom}?`,
      choices: [numer, denom, whole + 1, 1].map(String),
      correct: String(numer),
      key: 'aVal'
    },
    {
      prompt: "What does D stand for?",
      choices: ["Denominator", "Divide", "Double", "Decimal"],
      correct: "Denominator",
      key: 'd'
    },
    {
      prompt: "What is the denominator of the improper fraction?",
      choices: [denom, denom + 1, denom - 1, numer].map(String),
      correct: String(denom),
      key: 'dVal'
    },
    {
      prompt: `What is the numerator of the improper fraction?`,
      choices: [correctFinalNumerator, correctFinalNumerator + 1, denom, numer].map(String),
      correct: String(correctFinalNumerator),
      key: 'finalNum'
    }
  ]

  const handleClick = (choice) => {
    const currStep = steps[step]
    const correct = currStep.correct
    if (Array.isArray(correct)) {
      const nextSet = new Set([...(selected[currStep.key] || []), choice])
      if (nextSet.size < correct.length) {
        setSelected(prev => ({ ...prev, [currStep.key]: [...nextSet] }))
        return
      }
      const isRight = correct.every(c => nextSet.has(c))
      if (!isRight) return showError()
      setSelected(prev => ({ ...prev, [currStep.key]: [...nextSet] }))
    } else {
      if (choice !== correct) return showError()
      setSelected(prev => ({ ...prev, [currStep.key]: choice }))
    }
    nextStep()
  }

  const nextStep = () => {
    if (step === steps.length - 1) {
      ugConfetti.burst()
      updateStats?.(errors, true)
      setDone(true)
      onProblemComplete?.()
    }
    setStep(s => s + 1)
  }

  const renderChoices = (stepObj) => {
    return (
      <div className="chips center with-borders">
        {stepObj.choices.map((c, i) => (
          <div
            key={i}
            className="chip"
            onClick={() => handleClick(c)}
            ref={chipRef}
          >
            {c}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="section center">
      <div className="card" style={{ maxWidth: 560, width: '100%' }}>
        <div className="step-title question-xl center">
          Convert the mixed number to an improper fraction
        </div>
        <div className="center" style={{ fontSize: '1.6rem', fontWeight: 900, margin: '18px 0' }}>
          {whole} <span style={{ fontSize: '1rem', margin: '0 6px' }}>&nbsp;</span>
          <span className="fraction mini-frac">
            <div>{numer}</div>
            <div className="frac-bar"></div>
            <div>{denom}</div>
          </span>
          &nbsp;=&nbsp;
          {done ? (
            <span className="fraction mini-frac" style={{ marginLeft: '10px' }}>
              <div>{correctFinalNumerator}</div>
              <div className="frac-bar"></div>
              <div>{denom}</div>
            </span>
          ) : (
            <span className="fraction mini-frac" style={{ marginLeft: '10px' }}>
              <div>?</div>
              <div className="frac-bar"></div>
              <div>{denom}</div>
            </span>
          )}
        </div>

        <div className="step-title center" style={{ marginBottom: '8px' }}>
          Step {step + 1}: {steps[step].prompt}
        </div>
        {renderChoices(steps[step])}
      </div>
      {error && <ErrorOverlay />}
    </div>
  )
}

