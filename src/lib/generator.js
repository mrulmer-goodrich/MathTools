import { rand, choice } from './rng.js'

/* ---------------- SCALE FACTOR (rectangles w/ size cue) ---------------- */
export function genScaleProblem() {
  for (let tries=0; tries<300; tries++){
    const p = rand(1,10), q = rand(1,10)
    if (p===q) continue
    const w = rand(6,40), h = rand(6,40)
    const W = (w*p)/q, H = (h*p)/q
    if (Number.isInteger(W) && Number.isInteger(H) && W>=6 && W<=100 && H>=6 && H<=100){
      const pair = choice(['horizontal','vertical'])
      const part2 = pair==='horizontal' ? 'vertical' : 'horizontal'
      return {
      const _rid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random())
...
id: _rid,

        ratio: {p,q, value: p/q},
        original:{w,h},
        copy:{w:W,h:H},
        shownPair: pair,
        missingPair: part2
      }
    }
  }
  return { id:'fallback', ratio:{p:2,q:1,value:2}, original:{w:12,h:8}, copy:{w:24,h:16}, shownPair:'horizontal', missingPair:'vertical' }
}

/* ---------------- H-TABLE PROBLEMS ---------------- */

const UNIT_PAIRS = [
  ['in','cm'], ['cm','km'], ['m','yd'], ['miles','km'], ['minutes','seconds'],
  ['hours','miles'], ['liters','cups'], ['tablespoons','cups'], ['pages','hours'],
  ['points','minutes'], ['dollars','items'], ['meters','yards']
]

const FIRST = ['Alex','Jordan','Taylor','Riley','Sam','Casey','Avery','Morgan','Reese','Jamie','Parker','Quinn','Sasha','Rowan','Charlie','Emerson','Hayden','Skyler']
const PLACES = ['the school track','a city transit map','a scale drawing of the gym','the robotics lab blueprint','a recipe card for a bake sale','a hiking trail brochure','an art poster resize','a model-car instruction sheet','a library display map']
const MOTIVATIONS = [
  'to estimate how long a lap would take',
  'to convert between the two systems accurately',
  'to check if the plan fits the page',
  'to measure ingredients without the original spoons',
  'to compare the printed map to real distance',
  'to scale the poster to fit a bulletin board',
  'to build a model that matches the instructions',
  'to pace themselves for an upcoming event'
]

const LANGS = [
  'Spanish','French','German','Italian','Swedish','Malay','Swahili',
  'Portuguese','Dutch','Norwegian','Danish','Finnish','Polish','Czech',
  'Slovak','Hungarian','Romanian','Turkish','Greek (Latin)','Croatian',
  'Serbian (Latin)','Catalan','Galician','Estonian','Latvian','Lithuanian',
  'Indonesian','Filipino','Vietnamese'
]
const L = {
  English: ({name,place,why,a,u1,b,u2,g,gRow}) =>
    `${name} is working with ${place} ${why}. A note on the page shows a scale: ${a} ${u1} = ${b} ${u2}. Later in the text, there is ${g} ${gRow==='top'?u1:u2}. What is the corresponding value in ${gRow==='top'?u2:u1}?`,
  Spanish: (o)=>`${o.name} está trabajando con ${o.place} ${o.why}. En la página aparece una escala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Más tarde, hay ${o.g} ${o.gRow==='top'?o.u1:o.u2}. ¿Cuál es el valor correspondiente en ${o.gRow==='top'?o.u2:o.u1}?`,
  French: (o)=>`${o.name} travaille avec ${o.place} ${o.why}. Une échelle indique : ${o.a} ${o.u1} = ${o.b} ${o.u2}. Plus tard, on voit ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Quelle est la valeur correspondante en ${o.gRow==='top'?o.u2:o.u1} ?`,
  German: (o)=>`${o.name} arbeitet mit ${o.place} ${o.why}. Eine Notiz zeigt: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Später steht dort ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Wie groß ist der entsprechende Wert in ${o.gRow==='top'?o.u2:o.u1}?`,
  Italian: (o)=>`${o.name} sta lavorando con ${o.place} ${o.why}. Una nota mostra la scala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Più tardi si legge ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Qual è il valore corrispondente en ${o.gRow==='top'?o.u2:o.u1}?`,
  // ... remaining languages omitted for brevity (same format)
}

export function genHProblem(){
  const [uTop,uBottom] = choice(UNIT_PAIRS)
  const a = rand(1,20), b = rand(1,20)
  const g = rand(1,20)
  const gRow = Math.random()<0.5 ? 'bottom' : 'top'
  const name = choice(FIRST)
  const place = choice(PLACES)
  const why = choice(MOTIVATIONS)

  const payload = { name, place, why, a, u1: uTop, b, u2: uBottom, g, gRow }

  const english = L.English(payload)
  const alts = {}
  for (const lang of Object.keys(L)) {
    if (lang === 'English') continue
    alts[lang] = (L[lang]||L.English)(payload)
  }
  alts.FadeOut = ' '
  alts.BlackOut = ' '

  return {
    
    const _rid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random())
...
id: _rid,

    text: { english, alts },
    units: [uTop, uBottom],
    scale: [a, b],
    given: { row: gRow, value: g },
    altOrder: [...Object.keys(alts)]
  }
}
