import { rand, choice } from './rng.js'

/* ---------------- SCALE FACTOR (rectangles only) ---------------- */
export function genScaleProblem() {
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
  const shownPair = choice(['horizontal', 'vertical'])
  // unique distractors
  const set = new Set()
  while (set.size < 5) {
    const v = rand(1, 100)
    if (![r.w, r.h, r.W, r.H].includes(v)) set.add(v)
  }

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    ratio: { p: r.p, q: r.q },
    original: { w: r.w, h: r.h },
    copy: { w: r.W, h: r.H },
    shownPair,
    distractors: Array.from(set)
  }
}

/* ---------------- H-TABLE PROBLEMS ---------------- */

const UNIT_PAIRS = [
  ['in', 'cm'], ['cm', 'km'], ['cm', 'miles'], ['hours', 'miles'],
  ['minutes', 'centimeters'], ['liters', 'cups'], ['pages', 'hours'],
  ['points', 'minutes'], ['dollars', 'items'], ['meters', 'yards']
]

const FIRST_NAMES = ['Alex','Jordan','Taylor','Riley','Sam','Casey','Avery','Morgan','Reese','Jamie','Parker','Quinn']
const PLACES = ['a map of California','the school track','a recipe book','the robotics lab','the art room','a hiking trail','a science fair','the library display','a toy catalog','a city transit map']
const SCENARIOS = [
  // Each template should contain: {a}{u1} = {b}{u2} and mentions {g}{u2}
  ({name,place,a,u1,b,u2,g}) =>
    `${name} is working with ${place}. A note shows ${a} ${u1} = ${b} ${u2}. Later, a separate line mentions ${g} ${u2}.`,
  ({name,place,a,u1,b,u2,g}) =>
    `While planning at ${place}, ${name} notices a scale: ${a} ${u1} = ${b} ${u2}. In another sentence there is ${g} ${u2}.`,
  ({name,place,a,u1,b,u2,g}) =>
    `In ${place}, a comparison says ${a} ${u1} equals ${b} ${u2}. Somewhere else it refers to ${g} ${u2}.`
]

const ALT_ORDER = ['Spanish','French','German','Italian','Swedish','Malay','Swahili','FadeOut','BlackOut']

// Language templates – keep units/numbers as-is
const L = {
  English: ({name,place,a,u1,b,u2,g}) =>
    `${name} is working with ${place}. ${a} ${u1} = ${b} ${u2}. Later it mentions ${g} ${u2}. What is the corresponding value in ${u1}?`,
  Spanish: ({name,place,a,u1,b,u2,g}) =>
    `${name} está trabajando con ${place}. ${a} ${u1} = ${b} ${u2}. Más tarde se mencionan ${g} ${u2}. ¿Cuál es el valor correspondiente en ${u1}?`,
  French: ({name,place,a,u1,b,u2,g}) =>
    `${name} travaille avec ${place}. ${a} ${u1} = ${b} ${u2}. Plus tard, on mentionne ${g} ${u2}. Quelle est la valeur correspondante en ${u1} ?`,
  German: ({name,place,a,u1,b,u2,g}) =>
    `${name} arbeitet mit ${place}. ${a} ${u1} = ${b} ${u2}. Später werden ${g} ${u2} erwähnt. Wie groß ist der entsprechende Wert in ${u1}?`,
  Italian: ({name,place,a,u1,b,u2,g}) =>
    `${name} sta lavorando con ${place}. ${a} ${u1} = ${b} ${u2}. Più tardi si citano ${g} ${u2}. Qual è il valore corrispondente in ${u1}?`,
  Swedish: ({name,place,a,u1,b,u2,g}) =>
    `${name} arbetar med ${place}. ${a} ${u1} = ${b} ${u2}. Senare nämns ${g} ${u2}. Vad är motsvarande värde i ${u1}?`,
  Malay: ({name,place,a,u1,b,u2,g}) =>
    `${name} sedang bekerja dengan ${place}. ${a} ${u1} = ${b} ${u2}. Kemudian disebut ${g} ${u2}. Berapakah nilai sepadan dalam ${u1}?`,
  Swahili: ({name,place,a,u1,b,u2,g}) =>
    `${name} anafanya kazi na ${place}. ${a} ${u1} = ${b} ${u2}. Baadaye yanatajwa ${g} ${u2}. Thamani inayolingana katika ${u1} ni ipi?`
}

export function genHProblem() {
  const [uTop, uBottom] = choice(UNIT_PAIRS)
  const a = rand(1, 20)
  const b = rand(1, 20)
  const g = rand(1, 20)
  const name = choice(FIRST_NAMES)
  const place = choice(PLACES)

  const payload = { name, place, a, u1: uTop, b, u2: uBottom, g }

  const english = L.English(payload)
  const alts = {
    Spanish: L.Spanish(payload),
    French: L.French(payload),
    German: L.German(payload),
    Italian: L.Italian(payload),
    Swedish: L.Swedish(payload),
    Malay: L.Malay(payload),
    Swahili: L.Swahili(payload),
    FadeOut: ' ', BlackOut: ' '
  }

  // Also keep a “story” paragraph variant for the initial long version
  const longStory = choice(SCENARIOS)(payload)

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    text: { english, alts, longStory },
    units: [uTop, uBottom],
    scale: [a, b],                 // explicit equals sign should appear visually: `${a} ${uTop} = ${b} ${uBottom}`
    given: { row: 'bottom', value: g },
    altOrder: ALT_ORDER
  }
}
