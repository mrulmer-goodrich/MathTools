import { rand, choice } from './rng.js'

/* ---------------- SCALE FACTOR (rectangles) ---------------- */
export function genScaleProblem() {
  // pick integer ratio p/q (1..10) giving integer scaled sides (1..100)
  const tryPick = () => {
    for (let i = 0; i < 300; i++) {
      const p = rand(1, 10), q = rand(1, 10)
      if (p === q) continue
      const w = rand(6, 40), h = rand(6, 40) // original
      const W = (w * p) / q, H = (h * p) / q  // copy
      if (Number.isInteger(W) && Number.isInteger(H) && W>=1 && W<=100 && H>=1 && H<=100) {
        return { p, q, w, h, W, H }
      }
    }
    return { p:2, q:1, w:12, h:8, W:24, H:16 }
  }
  const r = tryPick()

  // Choose which pair has values on BOTH shapes (for scale), and which pair has a missing value on Copy
  const scalePair = choice(['horizontal','vertical'])
  const missingPair = scalePair === 'horizontal' ? 'vertical' : 'horizontal'

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    ratio: { p: r.p, q: r.q },
    original: { w: r.w, h: r.h },
    copy: { w: r.W, h: r.H },
    scalePair,        // both sides numbered on both shapes
    missingPair       // original shows number; copy is blank (to solve Part 2)
  }
}

/* ---------------- H-TABLE PROBLEMS ---------------- */

// middle-school friendly unit pairs
const UNIT_PAIRS = [
  ['in', 'cm'], ['cm', 'm'], ['m', 'km'], ['meters','yards'], ['feet','yards'],
  ['minutes','points'], ['minutes','pages'], ['hours','miles'], ['minutes','centimeters'],
  ['liters','cups'], ['tablespoons','cups'], ['grams','ounces'], ['dollars','items'],
  ['points','minutes'], ['pages','hours']
]

const NAMES = ['Alex','Jordan','Taylor','Riley','Sam','Casey','Avery','Morgan','Reese','Jamie','Parker','Quinn','Drew','Hayden','Rowan','Skyler','Elliot','Sage','Kai','Tatum']
const PLACES = [
  'the school track','the robotics lab','the art room','the hiking trail',
  'a city transit map','a cooking club meeting','a blueprint workshop',
  'a model-building contest','the library display','the stadium scoreboard'
]

// Build a long, silly story with explicit scale and one given value.
// We return one paragraph with spans that surround the tokens so the mask can exclude them.
function buildEnglishStory({name, place, a, u1, b, u2, g, givenRowTop}) {
  const hook = [
    `${name} volunteered to help at ${place}, where everything seems to be measured in confusing ways.`,
    `During setup at ${place}, ${name} finds a handwritten note with mysterious measurements.`,
    `It’s a chaotic afternoon at ${place}, and ${name} is trying to make sense of all the numbers.`
  ]
  const context = [
    `Someone scribbled a conversion scale on the whiteboard: `,
    `A crumpled card on the table lists a comparison: `,
    `On the clipboard there’s a neat little ratio: `
  ]
  const why = [
    `Apparently it helps convert for planning and timing, but the sentences go on and on and on.`,
    `It’s supposed to keep track of scoring and timing, but the instructions are ridiculously long.`,
    `It’s meant to relate progress with time, although the description is wildly verbose on purpose.`
  ]
  const ask = givenRowTop
    ? `Later one sentence mentions ${g} ${u1}.`
    : `Later one sentence mentions ${g} ${u2}.`

  // token spans must survive masking
  return [
    choice(hook),
    choice(context),
    `<span class="token-inline">${a} ${u1} = ${b} ${u2}</span>.`,
    choice(why),
    ask,
    ` What is the corresponding value in ${givenRowTop ? u2 : u1}?`
  ].join(' ')
}

// Parallel templates for many languages (Latin alphabet only to keep it simple)
const LANGS = {
  Spanish: ({name,place,a,u1,b,u2,g,givenRowTop}) =>
    `${name} ayuda en ${place}. <span class="token-inline">${a} ${u1} = ${b} ${u2}</span>. Luego se mencionan ${givenRowTop?g+' '+u1:g+' '+u2}. ¿Cuál es el valor correspondiente en ${givenRowTop?u2:u1}?`,
  French: ({name,place,a,u1,b,u2,g,givenRowTop}) =>
    `${name} travaille à ${place}. <span class="token-inline">${a} ${u1} = ${b} ${u2}</span>. Plus tard, on parle de ${givenRowTop?g+' '+u1:g+' '+u2}. Quelle est la valeur correspondante en ${givenRowTop?u2:u1} ?`,
  German: ({name,place,a,u1,b,u2,g,givenRowTop}) =>
    `${name} hilft bei ${place}. <span class="token-inline">${a} ${u1} = ${b} ${u2}</span>. Später wird ${givenRowTop?g+' '+u1:g+' '+u2} erwähnt. Wie groß ist der entsprechende Wert in ${givenRowTop?u2:u1}?`,
  Italian: ({name,place,a,u1,b,u2,g,givenRowTop}) =>
    `${name} sta aiutando a ${place}. <span class="token-inline">${a} ${u1} = ${b} ${u2}</span>. Più tardi si citano ${givenRowTop?g+' '+u1:g+' '+u2}. Qual è il valore corrispondente in ${givenRowTop?u2:u1}?`,
  Swedish: ({name,place,a,u1,b,u2,g,givenRowTop}) =>
    `${name} hjälper till på ${place}. <span class="token-inline">${a} ${u1} = ${b} ${u2}</span>. Senare nämns ${givenRowTop?g+' '+u1:g+' '+u2}. Vad är motsvarande värde i ${givenRowTop?u2:u1}?`,
  Malay:   ({name,place,a,u1,b,u2,g,givenRowTop}) =>
    `${name} membantu di ${place}. <span class="token-inline">${a} ${u1} = ${b} ${u2}</span>. Kemudian disebut ${givenRowTop?g+' '+u1:g+' '+u2}. Apakah nilai sepadan dalam ${givenRowTop?u2:u1}?`,
  Swahili: ({name,place,a,u1,b,u2,g,givenRowTop}) =>
    `${name} anasaidia katika ${place}. <span class="token-inline">${a} ${u1} = ${b} ${u2}</span>. Baadaye yanatajwa ${givenRowTop?g+' '+u1:g+' '+u2}. Thamani inayolingana katika ${givenRowTop?u2:u1} ni ipi?`,
  Portuguese: p => `${p.name} está ajudando em ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Depois menciona ${p.g} ${p.givenRowTop?p.u1:p.u2}. Qual é o valor correspondente em ${p.givenRowTop?p.u2:p.u1}?`,
  Dutch: p => `${p.name} helpt bij ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Later wordt ${p.g} ${p.givenRowTop?p.u1:p.u2} genoemd. Wat is de overeenkomstige waarde in ${p.givenRowTop?p.u2:p.u1}?`,
  Danish: p => `${p.name} hjælper ved ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Senere nævnes ${p.g} ${p.givenRowTop?p.u1:p.u2}. Hvad er den tilsvarende værdi i ${p.givenRowTop?p.u2:p.u1}?`,
  Norwegian: p => `${p.name} hjelper til ved ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Senere nevnes ${p.g} ${p.givenRowTop?p.u1:p.u2}. Hva er tilsvarende verdi i ${p.givenRowTop?p.u2:p.u1}?`,
  Finnish: p => `${p.name} auttaa paikassa ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Myöhemmin mainitaan ${p.g} ${p.givenRowTop?p.u1:p.u2}. Mikä on vastaava arvo yksikössä ${p.givenRowTop?p.u2:p.u1}?`,
  Polish: p => `${p.name} pomaga w ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Później wspomina się ${p.g} ${p.givenRowTop?p.u1:p.u2}. Jaka jest wartość odpowiadająca w ${p.givenRowTop?p.u2:p.u1}?`,
  Romanian: p => `${p.name} ajută la ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Mai târziu se menționează ${p.g} ${p.givenRowTop?p.u1:p.u2}. Care este valoarea corespunzătoare în ${p.givenRowTop?p.u2:p.u1}?`,
  Turkish: p => `${p.name} ${p.place} yerinde yardımcı oluyor. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Daha sonra ${p.g} ${p.givenRowTop?p.u1:p.u2} geçiyor. ${p.givenRowTop?p.u2:p.u1} cinsinden karşılık gelen değer nedir?`,
  Indonesian: p => `${p.name} membantu di ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Kemudian disebut ${p.g} ${p.givenRowTop?p.u1:p.u2}. Berapa nilai yang setara dalam ${p.givenRowTop?p.u2:p.u1}?`,
  Filipino: p => `${p.name} ay tumutulong sa ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Paglaon ay binanggit ang ${p.g} ${p.givenRowTop?p.u1:p.u2}. Ano ang katumbas na halaga sa ${p.givenRowTop?p.u2:p.u1}?`,
  Afrikaans: p => `${p.name} help by ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Later word ${p.g} ${p.givenRowTop?p.u1:p.u2} genoem. Wat is die ooreenstemmende waarde in ${p.givenRowTop?p.u2:p.u1}?`,
  Catalan: p => `${p.name} ajuda a ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Més tard es menciona ${p.g} ${p.givenRowTop?p.u1:p.u2}. Quin és el valor corresponent en ${p.givenRowTop?p.u2:p.u1}?`,
  Croatian: p => `${p.name} pomaže na ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Kasnije se spominje ${p.g} ${p.givenRowTop?p.u1:p.u2}. Koja je odgovarajuća vrijednost u ${p.givenRowTop?p.u2:p.u1}?`,
  Slovak: p => `${p.name} pomáha na ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Neskôr sa spomenie ${p.g} ${p.givenRowTop?p.u1:p.u2}. Aká je zodpovedajúca hodnota v ${p.givenRowTop?p.u2:p.u1}?`,
  Slovenian: p => `${p.name} pomaga pri ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Kasneje je omenjeno ${p.g} ${p.givenRowTop?p.u1:p.u2}. Kakšna je ustrezna vrednost v ${p.givenRowTop?p.u2:p.u1}?`,
  Czech: p => `${p.name} pomáhá na ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Později se zmiňuje ${p.g} ${p.givenRowTop?p.u1:p.u2}. Jaká je odpovídající hodnota v ${p.givenRowTop?p.u2:p.u1}?`,
  Hungarian: p => `${p.name} segít a(z) ${p.place} helyszínen. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Később megemlítik: ${p.g} ${p.givenRowTop?p.u1:p.u2}. Mennyi a megfelelő érték ${p.givenRowTop?p.u2:p.u1} egységben?`,
  Albanian: p => `${p.name} po ndihmon në ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Më vonë përmenden ${p.g} ${p.givenRowTop?p.u1:p.u2}. Cili është vlera përkatëse në ${p.givenRowTop?p.u2:p.u1}?`,
  Estonian: p => `${p.name} aitab kohas ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Hiljem mainitakse ${p.g} ${p.givenRowTop?p.u1:p.u2}. Mis on vastav väärtus ühikus ${p.givenRowTop?p.u2:p.u1}?`,
  Latvian: p => `${p.name} palīdz ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Vēlāk tiek minēts ${p.g} ${p.givenRowTop?p.u1:p.u2}. Kāda ir atbilstošā vērtība ${p.givenRowTop?p.u2:p.u1}?`,
  Lithuanian: p => `${p.name} padeda ${p.place}. <span class="token-inline">${p.a} ${p.u1} = ${p.b} ${p.u2}</span>. Vėliau paminima ${p.g} ${p.givenRowTop?p.u1:p.u2}. Kokia atitinkama vertė ${p.givenRowTop?p.u2:p.u1}?`,
}

const ALT_ORDER = Object.keys(LANGS).concat(['FadeOut','BlackOut'])

export function genHProblem(){
  const [u1, u2] = choice(UNIT_PAIRS)
  const a = rand(1,20), b = rand(1,20)
  const g = rand(1,20)
  const name = choice(NAMES)
  const place = choice(PLACES)
  const givenRowTop = Math.random() < 0.5  // 50/50 as requested

  const base = {name, place, a, u1, b, u2, g, givenRowTop}

  const english = buildEnglishStory(base)
  const alts = {}
  for(const k of Object.keys(LANGS)){
    alts[k] = LANGS[k](base)
  }

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    text: { english, alts },
    units: [u1, u2],
    scale: [a, b],         // a u1 = b u2
    given: { top: givenRowTop, value: givenRowTop ? g : g }, // store value and top/bottom flag
    altOrder: ALT_ORDER
  }
}
