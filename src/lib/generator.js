import { rand, choice } from './rng.js'

// ---------- SCALE FACTOR (rectangles only) ----------
export function genScaleProblem() {
  // p/q in 1..10, p ≠ q, ensure scaled integers 1..100
  const pickRatio = () => {
    for (let i = 0; i < 200; i++) {
      const p = rand(1, 10), q = rand(1, 10)
      if (p === q) continue
      const w = rand(2, 50), h = rand(2, 50)
      const W = (w * p) / q, H = (h * p) / q
      if (Number.isInteger(W) && Number.isInteger(H) && W >= 1 && W <= 100 && H >= 1 && H <= 100) {
        return { p, q, w, h, W, H }
      }
    }
    return { p: 2, q: 1, w: 10, h: 6, W: 20, H: 12 }
  }

  const r = pickRatio()
  // Choose which pair shows numbers (horizontal or vertical)
  const shownPair = choice(['horizontal', 'vertical'])

  // Numbers that might appear as distractors (unique, 1..100)
  const distractors = new Set()
  while (distractors.size < 4) {
    const v = rand(1, 100)
    if (![r.w, r.h, r.W, r.H].includes(v)) distractors.add(v)
  }

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    ratio: { p: r.p, q: r.q },
    original: { w: r.w, h: r.h },
    copy: { w: r.W, h: r.H },
    shownPair, // 'horizontal' or 'vertical' is the pair with visible numbers
    distractors: Array.from(distractors)
  }
}

// ---------- H-TABLE PROBLEMS ----------
const unitPairs = [
  ['in', 'cm'], ['cm', 'km'], ['cm', 'miles'], ['hours', 'miles'],
  ['minutes', 'centimeters'], ['liters', 'cups'], ['pages', 'hours'],
  ['points', 'minutes'], ['dollars', 'items'], ['meters', 'yards']
]

const altModes = ['Spanish','French','German','Italian','Swedish','Malay','Swahili','FadeOut','BlackOut']

const translate = (lang, a, u1, b, u2, given) => {
  // Simple, consistent template per language; units remain unchanged so students can still lift them.
  const T = {
    English: `A very wordy situation describes a relationship. ${a} ${u1} = ${b} ${u2}. Later, it mentions ${given} ${u2}. What is the corresponding value in ${u1}?`,
    Spanish: `Un texto muy extenso describe una relación. ${a} ${u1} = ${b} ${u2}. Más tarde menciona ${given} ${u2}. ¿Cuál es el valor correspondiente en ${u1}?`,
    French: `Un long texte décrit une relation. ${a} ${u1} = ${b} ${u2}. Plus tard, il mentionne ${given} ${u2}. Quelle est la valeur correspondante en ${u1} ?`,
    German: `Ein sehr wortreicher Text beschreibt eine Beziehung. ${a} ${u1} = ${b} ${u2}. Später wird ${given} ${u2} erwähnt. Wie groß ist der entsprechende Wert in ${u1}?`,
    Italian: `Un testo molto prolisso descrive una relazione. ${a} ${u1} = ${b} ${u2}. Più tardi viene menzionato ${given} ${u2}. Qual è il valore corrispondente in ${u1}?`,
    Swedish: `En mycket ordrik text beskriver ett samband. ${a} ${u1} = ${b} ${u2}. Senare nämns ${given} ${u2}. Vad är motsvarande värde i ${u1}?`,
    Malay: `Sebuah teks yang panjang menerangkan hubungan. ${a} ${u1} = ${b} ${u2}. Kemudian disebut ${given} ${u2}. Berapakah nilai sepadan dalam ${u1}?`,
    Swahili: `Maelezo marefu yanafafanua uhusiano. ${a} ${u1} = ${b} ${u2}. Baadaye inataja ${given} ${u2}. Je, thamani inayolingana katika ${u1} ni ipi?`
  }
  return T[lang] || T.English
}

export function genHProblem() {
  const [uTop, uBottom] = choice(unitPairs)
  const a = rand(1, 20)
  const b = rand(1, 20)
  const given = rand(1, 20)

  const english = translate('English', a, uTop, b, uBottom, given)
  const alts = {
    Spanish: translate('Spanish', a, uTop, b, uBottom, given),
    French: translate('French', a, uTop, b, uBottom, given),
    German: translate('German', a, uTop, b, uBottom, given),
    Italian: translate('Italian', a, uTop, b, uBottom, given),
    Swedish: translate('Swedish', a, uTop, b, uBottom, given),
    Malay: translate('Malay', a, uTop, b, uBottom, given),
    Swahili: translate('Swahili', a, uTop, b, uBottom, given),
    FadeOut: ' ', BlackOut: '█████████████████████████████████████████████'
  }

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    text: { english, alts },
    units: [uTop, uBottom],
    scale: [a, b], // explicit equals sign will be rendered: `${a} ${uTop} = ${b} ${uBottom}`
    given: { row: 'bottom', value: given },
    altOrder: altModes
  }
}
