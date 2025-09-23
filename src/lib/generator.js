import { rand, choice } from './rng.js';

// SCALE FACTOR SHAPES
export function genScaleProblem() {
  // Choose rectangle or right triangle or trapezoid. Keep upright.
  const types = ['rectangle', 'rightTriangle', 'trapezoid'];
  const shapeType = choice(types);

  // ratio p/q in 1..10 ensuring integers 1..20
  let p = rand(1, 10), q = rand(1, 10);

  const makePair = () => {
    for (let tries = 0; tries < 200; tries++) {
      p = rand(1, 10); q = rand(1, 10);
      const base = rand(2, 10);
      const scaled = base * p / q;
      if (Number.isInteger(scaled) && scaled >= 1 && scaled <= 20) {
        return { base, scaled, p, q };
      }
    }
    return { base: 5, scaled: 10, p: 2, q: 1 };
  };

  const a = makePair();
  const b = makePair();
  const c = makePair();

  const originalSides =
    shapeType === 'rectangle'
      ? [a.base, b.base]
      : shapeType === 'rightTriangle'
      ? [a.base, b.base, c.base]
      : [a.base, b.base, c.base, a.base];

  const copySides = originalSides.map((s) => s * a.p / a.q);
  const correspond = originalSides.map((_, i) => i);
  const distractors = [rand(1, 20), rand(1, 20)].filter((x) => !originalSides.includes(x));

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    shapeType,
    original: { sideLengths: originalSides, sidesMeta: ['A', 'B', 'C', 'D'].slice(0, originalSides.length) },
    copy: { sideLengths: copySides, ratio: { p: a.p, q: a.q } },
    correspondenceMap: correspond,
    distractors
  };
}

// H-TABLE PROBLEMS
const unitsPool = [
  ['cm', 'km'], ['cm', 'miles'], ['dollars', '$ per item'], ['hours', 'miles'],
  ['minutes', 'centimeters'], ['liters', 'cups'], ['pages', 'hours'], ['points', 'minutes']
];
const langPool = ['Spanish', 'French', 'German', 'Italian', 'Swedish', 'Malay', 'Swahili', 'FadeOut', 'BlackOut'];

export function genHProblem() {
  const [uTop, uBottom] = choice(unitsPool);
  const a = rand(1, 20);
  const b = rand(1, 20);
  const given = rand(1, 20);

  const text = `A very long and descriptive story about a journey, a map, and a recipe that goes on and on. 
  Somewhere it states that ${a} ${uTop} equals ${b} ${uBottom}. Later it mentions ${given} ${uBottom} in a different sentence.
  The rest of the words are flavor and do not matter for solving the proportional relationship.`;

  return {
    id: crypto.randomUUID?.() || String(Math.random()),
    textEnglish: text,
    altModes: langPool,
    units: [uTop, uBottom],
    scale: [a, b],
    givenValue: { row: 'bottom', value: given }
  };
}
