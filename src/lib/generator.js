import { rand, choice } from './rng.js'

/** Safe UUID (works in browser & Node) */
function uuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {}
  return 'id_' + Math.random().toString(36).slice(2)
}

/* ---------------- SCALE FACTOR (rectangles w/ size cue) ---------------- */
export function genScaleProblem() {
  // pick p/q (1..10) with integer dimensions in 1..100
  for (let tries = 0; tries < 300; tries++) {
    const p = rand(1, 10), q = rand(1, 10)
    if (p === q) continue
    const w = rand(6, 40), h = rand(6, 40)
    const W = (w * p) / q, H = (h * p) / q
    if (Number.isInteger(W) && Number.isInteger(H) && W >= 6 && W <= 100 && H >= 6 && H <= 100) {
      const pair = choice(['horizontal', 'vertical'])
      const part2 = pair === 'horizontal' ? 'vertical' : 'horizontal'
      return {
        id: uuid(),
        ratio: { p, q, value: p / q },
        original: { w, h },
        copy: { w: W, h: H },
        shownPair: pair,     // numbers visible on this pair
        missingPair: part2   // copy missing on this pair
      }
    }
  }
  // Fallback (should rarely hit)
  return {
    id: uuid(),
    ratio: { p: 2, q: 1, value: 2 },
    original: { w: 12, h: 8 },
    copy: { w: 24, h: 16 },
    shownPair: 'horizontal',
    missingPair: 'vertical'
  }
}

/* ---------------- H-TABLE PROBLEMS ---------------- */

// Middle-school friendly unit pairs
const UNIT_PAIRS = [
  ['in','cm'], ['cm','km'], ['m','yd'], ['miles','km'], ['minutes','seconds'],
  ['hours','miles'], ['liters','cups'], ['tablespoons','cups'], ['pages','hours'],
  ['points','minutes'], ['dollars','items'], ['meters','yards']
]

// Names & scene parts
const FIRST = ['Alex','Jordan','Taylor','Riley','Sam','Casey','Avery','Morgan','Reese','Jamie','Parker','Quinn','Sasha','Rowan','Charlie','Emerson','Hayden','Skyler']
const PLACES = [
  'the school track','a city transit map','a scale drawing of the gym','the robotics lab blueprint',
  'a recipe card for a bake sale','a hiking trail brochure','an art poster resize','a model-car instruction sheet',
  'a library display map'
]
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

// Language set (Latin script to avoid font issues)
const LANGS = [
  'Spanish','French','German','Italian','Swedish','Malay','Swahili',
  'Portuguese','Dutch','Norwegian','Danish','Finnish','Polish','Czech',
  'Slovak','Hungarian','Romanian','Turkish','Croatian','Catalan',
  'Indonesian','Filipino','Vietnamese'
]
const ALT_ORDER = [...LANGS, 'FadeOut', 'BlackOut']

// Parallel templates – numbers/units remain intact, story is coherent
const L = {
  English: ({name,place,why,a,u1,b,u2,g,gRow}) =>
    `${name} is working with ${place} ${why}. A note on the page shows a scale: ${a} ${u1} = ${b} ${u2}. Later in the text, there is ${g} ${gRow==='top'?u1:u2}. What is the corresponding value in ${gRow==='top'?u2:u1}?`,
  Spanish: (o)=>`${o.name} está trabajando con ${o.place} ${o.why}. En la página aparece una escala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Más tarde, hay ${o.g} ${o.gRow==='top'?o.u1:o.u2}. ¿Cuál es el valor correspondiente en ${o.gRow==='top'?o.u2:o.u1}?`,
  French: (o)=>`${o.name} travaille avec ${o.place} ${o.why}. Une échelle indique : ${o.a} ${o.u1} = ${o.b} ${o.u2}. Plus tard, on voit ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Quelle est la valeur correspondante en ${o.gRow==='top'?o.u2:o.u1} ?`,
  German: (o)=>`${o.name} arbeitet mit ${o.place} ${o.why}. Eine Notiz zeigt: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Später steht dort ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Wie groß ist der entsprechende Wert in ${o.gRow==='top'?o.u2:o.u1}?`,
  Italian: (o)=>`${o.name} sta lavorando con ${o.place} ${o.why}. Una nota mostra la scala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Più tardi si legge ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Qual è il valore corrispondente in ${o.gRow==='top'?o.u2:o.u1}?`,
  Swedish: (o)=>`${o.name} arbetar med ${o.place} ${o.why}. En anteckning visar skalan: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Senare nämns ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Vad är motsvarande värde i ${o.gRow==='top'?o.u2:o.u1}?`,
  Malay: (o)=>`${o.name} sedang bekerja dengan ${o.place} ${o.why}. Nota menunjukkan skala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Kemudian terdapat ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Apakah nilai sepadan dalam ${o.gRow==='top'?o.u2:o.u1}?`,
  Swahili: (o)=>`${o.name} anafanya kazi na ${o.place} ${o.why}. Kumbuka inaonyesha kiwango: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Baadaye kuna ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Thamani inayolingana katika ${o.gRow==='top'?o.u2:o.u1} ni ipi?`,
  Portuguese: (o)=>`${o.name} está trabalhando com ${o.place} ${o.why}. Uma nota mostra a escala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Depois aparece ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Qual é o valor correspondente em ${o.gRow==='top'?o.u2:o.u1}?`,
  Dutch: (o)=>`${o.name} werkt met ${o.place} ${o.why}. Een notitie toont de schaal: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Later staat er ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Wat is de overeenkomstige waarde in ${o.gRow==='top'?o.u2:o.u1}?`,
  Norwegian: (o)=>`${o.name} jobber med ${o.place} ${o.why}. En lapp viser skalaen: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Senere står det ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Hva er tilsvarende verdi i ${o.gRow==='top'?o.u2:o.u1}?`,
  Danish: (o)=>`${o.name} arbejder med ${o.place} ${o.why}. En note viser skalaen: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Senere nævnes ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Hvad er den tilsvarende værdi i ${o.gRow==='top'?o.u2:o.u1}?`,
  Finnish: (o)=>`${o.name} työskentelee kohteessa ${o.place} ${o.why}. Muistiinpano näyttää mittakaavan: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Myöhemmin mainitaan ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Mikä on vastaava arvo yksikössä ${o.gRow==='top'?o.u2:o.u1}?`,
  Polish: (o)=>`${o.name} pracuje z ${o.place} ${o.why}. Notatka pokazuje skalę: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Później pojawia się ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Jaka jest wartość odpowiadająca w ${o.gRow==='top'?o.u2:o.u1}?`,
  Czech: (o)=>`${o.name} pracuje s ${o.place} ${o.why}. Poznámka ukazuje měřítko: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Později je uvedeno ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Jaká je odpovídající hodnota v ${o.gRow==='top'?o.u2:o.u1}?`,
  Slovak: (o)=>`${o.name} pracuje s ${o.place} ${o.why}. Poznámka ukazuje mierku: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Neskôr sa spomína ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Aká je zodpovedajúca hodnota v ${o.gRow==='top'?o.u2:o.u1}?`,
  Hungarian: (o)=>`${o.name} a(z) ${o.place} mellett dolgozik ${o.why}. Egy feljegyzés mutatja a skálát: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Később szerepel ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Mennyi az ennek megfelelő érték ${o.gRow==='top'?o.u2:o.u1}-ban/-ben?`,
  Romanian: (o)=>`${o.name} lucrează cu ${o.place} ${o.why}. O notă arată scara: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Mai târziu apare ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Care este valoarea corespunzătoare în ${o.gRow==='top'?o.u2:o.u1}?`,
  Turkish: (o)=>`${o.name}, ${o.place} ile ${o.why}. Bir notta ölçek şöyle: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Daha sonra ${o.g} ${o.gRow==='top'?o.u1:o.u2} geçiyor. ${o.gRow==='top'?o.u2:o.u1} cinsinden karşılık gelen değer nedir?`,
  Croatian: (o)=>`${o.name} radi s ${o.place} ${o.why}. Bilješka pokazuje razmjer: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Kasnije se spominje ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Koja je odgovarajuća vrijednost u ${o.gRow==='top'?o.u2:o.u1}?`,
  Catalan: (o)=>`${o.name} treballa amb ${o.place} ${o.why}. Una nota mostra l’escala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Més tard hi ha ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Quin és el valor corresponent en ${o.gRow==='top'?o.u2:o.u1}?`,
  Indonesian: (o)=>`${o.name} sedang bekerja dengan ${o.place} ${o.why}. Tercantum skala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Kemudian ada ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Berapa nilai padanan dalam ${o.gRow==='top'?o.u2:o.u1}?`,
  Filipino: (o)=>`${o.name} ay nagtatrabaho sa ${o.place} ${o.why}. May tala na nagpapakita ng iskala: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Pagkaraan ay may ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Ano ang katumbas na halaga sa ${o.gRow==='top'?o.u2:o.u1}?`,
  Vietnamese: (o)=>`${o.name} đang làm việc với ${o.place} ${o.why}. Có tỉ lệ: ${o.a} ${o.u1} = ${o.b} ${o.u2}. Sau đó có ${o.g} ${o.gRow==='top'?o.u1:o.u2}. Giá trị tương ứng theo ${o.gRow==='top'?o.u2:o.u1} là bao nhiêu?`
}

/** Create one coherent scenario with aligned translations */
export function genHProblem() {
  const [uTopDefault, uBottomDefault] = choice(UNIT_PAIRS)
  const a = rand(1, 20), b = rand(1, 20)
  const g = rand(1, 20)
  const gRow = Math.random() < 0.5 ? 'bottom' : 'top' // 50/50 as requested
  const name = choice(FIRST)
  const place = choice(PLACES)
  const why = choice(MOTIVATIONS)

  const payload = { name, place, why, a, u1: uTopDefault, b, u2: uBottomDefault, g, gRow }

  const english = L.English(payload)
  const alts = {}
  for (const lang of LANGS) alts[lang] = (L[lang] || L.English)(payload)
  alts.FadeOut = ' '
  alts.BlackOut = ' '

  return {
    id: uuid(),
    text: { english, alts },
    units: [uTopDefault, uBottomDefault],
    scale: [a, b],
    given: { row: gRow, value: g },
    altOrder: ALT_ORDER
  }
}
