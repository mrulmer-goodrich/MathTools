// Complete level data for all 31 levels across 3 modules

export const storyline = {
  modules: {
    1: {
      name: "Base Camp Preparations",
      intro: `Dr. Martinez's first journal entry mentions establishing base camp. "Supplies are critical," she wrote. "The mountains are unforgiving. We must calculate precisely - too little and we perish, too much and we can't move fast enough." Her supply notes are filled with integer calculations...`,
      completion: `The base camp is secure. You've mastered the supply calculations just as Dr. Martinez did. Her next entry reads: "Camp established. The path ahead requires distribution of resources across unknown terrain. The ancient trails show patterns..." A crude map is sketched in the margin.`
    },
    2: {
      name: "Charting the Territory",
      intro: `Dr. Martinez's journal becomes more excited: "We've entered the mapped territory! But it's not what we expected. Every landmark requires solving an equation to pass. The ancients built this as a test. Only those who understand balance and inverse operations can proceed." She sketches balance scales in the margins.`,
      completion: `You've charted the entire territory, just as Dr. Martinez's team did five years ago. But her final entry in this section is troubling: "We've reached the frontier boundary. The markers here are different - inequalities, not equations. The rules... change. Tomorrow we cross into the unknown." The next pages are water-damaged and barely legible.`
    },
    3: {
      name: "The Frontier", 
      intro: `The damaged pages slowly become readable again. Dr. Martinez's handwriting is shakier: "Crossed the boundary. Everything shifts here. Inequality signs flip without warning. We've lost two team members to miscalculations - they're alive but had to turn back. The vault must be close. I can feel it." Her final legible entry: "If you're reading this and I haven't returned, know that I found it. I found—" The rest is torn away.`,
      completion: `You've completed the frontier. You stand where Dr. Martinez stood five years ago. Before you lies an ancient stone door, covered in mathematical symbols. Your badge collection begins to glow, resonating with the carvings. The door rumbles... and opens.`
    }
  },
  levels: {
    // MODULE 1 - Base Camp Preparations
    '1-1': {
      name: "Addition Supplies",
      intro: `"First supply calculation: water. The elevation changes require precise additions of positive and negative values." - Dr. Martinez's notes`
    },
    '1-2': {
      name: "Subtraction Supplies",
      intro: `"Food stores are tricky. Consumption (negative) vs. acquisition (positive). Subtracting negatives means we gain supplies back!" - Dr. Martinez`
    },
    '1-3': {
      name: "Multiplication Supplies",
      intro: `"Rope comes in packs. Negative packs mean debts owed. Calculating total rope requires understanding negative multiplication." - Dr. Martinez`
    },
    '1-4': {
      name: "Division Supplies",
      intro: `"Final inventory check. Dividing resources among team members. Negative divisions reveal interesting patterns..." - Dr. Martinez`
    },
    '1-5': {
      name: "Clear Path",
      intro: `"The trail markers show distribution patterns. Each marker multiplies across all team members. Basic but essential." - Dr. Martinez`
    },
    '1-6': {
      name: "Rocky Trail",
      intro: `"Rocky sections subtract from our progress. Distribution still applies, but watch those negative signs!" - Dr. Martinez`
    },
    '1-7': {
      name: "Dark Forest",
      intro: `"This forest is dangerous. Negative factors multiply EVERYTHING by negative. We must be careful." - Dr. Martinez`
    },
    '1-8': {
      name: "Mixed Terrain",
      intro: `"The terrain mixes positive and negative slopes. When negative meets negative... unexpected results. Beautiful mathematics." - Dr. Martinez`
    },
    '1-9': {
      name: "Sort Supplies",
      intro: `"Camp setup requires organization. Like items together. X-items with X-items. Simple but crucial." - Dr. Martinez`
    },
    '1-10': {
      name: "Organize Gear",
      intro: `"Some gear is excess (subtract it). The remaining tells us what we actually carry forward." - Dr. Martinez`
    },
    '1-11': {
      name: "Complex Packing",
      intro: `"Final packing is complex. Variables AND constants must be combined separately. Everything in its place." - Dr. Martinez`
    },
    '1-12': {
      name: "Final Inventory",
      intro: `"Negative coefficients appear in our final count. Debts and assets. All must be accounted for." - Dr. Martinez`
    },
    '1-13': {
      name: "Pack It Up",
      intro: `"Breaking camp requires distribution THEN combination. Two-step process. Can't skip steps." - Dr. Martinez`
    },
    '1-14': {
      name: "Double Check",
      intro: `"Two distribution points. Both must be handled before combining. Precision matters." - Dr. Martinez`
    },
    '1-15': {
      name: "Ready to Trek",
      intro: `"Final preparations complete. Complex distributions with negatives. If we can solve this, we're ready for anything ahead." - Dr. Martinez. [Her next entry is from weeks later, much further into the mountains...]`
    },

    // MODULE 2 - Charting the Territory
    '2-1': {
      name: "River Crossing",
      intro: `"First landmark: the river. The bridge stones are marked with equations. Solve for X to know which stones are safe." - Dr. Martinez`
    },
    '2-2': {
      name: "Mountain Climb",
      intro: `"The mountain path requires multiplication and division to determine safe holds. Each calculation reveals the next step." - Dr. Martinez`
    },
    '2-3': {
      name: "Shadow Valley",
      intro: `"This valley is dark. Negative coefficients everywhere. The shadows play tricks, but the mathematics doesn't lie." - Dr. Martinez`
    },
    '2-4': {
      name: "Hidden Canyon",
      intro: `"Found a hidden canyon not on any map! Two-step equations guard its passages. Ancients were clever." - Dr. Martinez`
    },
    '2-5': {
      name: "Storm Passage",
      intro: `"Caught in a storm. The wind howls with negative multipliers. Two-step solving in harsh conditions. We press on." - Dr. Martinez`
    },
    '2-6': {
      name: "Fraction Falls",
      intro: `"A waterfall reveals fractional patterns in its flow. The mist creates equations with fractions. Mesmerizing." - Dr. Martinez`
    },
    '2-7': {
      name: "Misty Decimals",
      intro: `"The mist thickens. Decimal values appear in the condensation on rocks. Nature's mathematics revealed." - Dr. Martinez`
    },
    '2-8': {
      name: "Ancient Ruins",
      intro: `"Found ruins! Equations carved in stone require distribution before solving. The ancients understood order of operations." - Dr. Martinez`
    },
    '2-9': {
      name: "Complex Caverns",
      intro: `"Deep in the caverns, equations grow more complex. Distribution, combination, then solution. Like a mathematical dance." - Dr. Martinez`
    },
    '2-10': {
      name: "The Divide",
      intro: `"We've reached The Divide. Variables on both sides of the equations. The boundary between known and unknown territory. Tomorrow... the frontier." - Dr. Martinez [Pages after this are water-damaged]`
    },

    // MODULE 3 - The Frontier
    '3-1': {
      name: "Boundary Markers (Speed Challenge)",
      intro: `[Water damage clears] "...boundary markers use inequalities, not equations. Open circles, closed circles. Directions matter. Must recognize them instantly to survive." - Dr. Martinez`
    },
    '3-2': {
      name: "Reverse Recognition (Speed Challenge)",
      intro: `"The markers can be read both ways. Symbol to image, image to symbol. The ancients test our understanding from all angles." - Dr. Martinez`
    },
    '3-3': {
      name: "Secure Perimeter",
      intro: `"Establishing safe zones requires solving inequalities. The boundary of safety is not a point but a range." - Dr. Martinez`
    },
    '3-4': {
      name: "Shifting Boundaries",
      intro: `"CRITICAL DISCOVERY: When dividing by negative, the inequality FLIPS. Two team members didn't realize this. They had to turn back. We're down to three." - Dr. Martinez [Her handwriting is shaky]`
    },
    '3-5': {
      name: "Twisted Paths",
      intro: `"The paths twist with multi-step inequalities. Sign flips are everywhere. One mistake and the path disappears. We move carefully." - Dr. Martinez`
    },
    '3-6': {
      name: "FINAL FRONTIER",
      intro: `"The vault is ahead. I can see it. But this final challenge... distribution, combination, solving, and sign flips all together. The ultimate test. If you're reading this and I haven't returned, know that I found it. I found—" [The page is torn. The rest is missing. You stand at the same spot she did, five years ago.]`
    }
  }
};

export const levels = {
  // MODULE 1 LEVELS
  '1-1': {
    id: '1-1',
    module: 1,
    number: 1,
    name: "Addition Supplies",
    skill: "Adding positive and negative integers",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null,
    phaseBadge: 'backpack', // Earned after 1-4
    exampleProblem: {
      easy: "-8 + 15 = ?",
      notEasy: "12.5 + (-7.5) = ?"
    }
  },
  '1-2': {
    id: '1-2',
    module: 1,
    number: 2,
    name: "Subtraction Supplies",
    skill: "Subtracting integers (including subtracting negatives)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "8 - (-5) = ?",
      notEasy: "15.5 - (-7.25) = ?"
    }
  },
  '1-3': {
    id: '1-3',
    module: 1,
    number: 3,
    name: "Multiplication Supplies",
    skill: "Multiplying integers (positive and negative)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "-6 × 8 = ?",
      notEasy: "1.5 × (-4) = ?"
    }
  },
  '1-4': {
    id: '1-4',
    module: 1,
    number: 4,
    name: "Division Supplies",
    skill: "Dividing integers (positive and negative)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: 'backpack',
    exampleProblem: {
      easy: "-32 ÷ (-8) = ?",
      notEasy: "15.6 ÷ (-4) = ?"
    }
  },
  '1-5': {
    id: '1-5',
    module: 1,
    number: 5,
    name: "Clear Path",
    skill: "Basic distribution with positive numbers",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "3(x + 5)",
      notEasy: "(1/2)(n + 8)"
    }
  },
  '1-6': {
    id: '1-6',
    module: 1,
    number: 6,
    name: "Rocky Trail",
    skill: "Distribution with subtraction in parentheses",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "4(x - 3)",
      notEasy: "(2/3)(y - 9)"
    }
  },
  '1-7': {
    id: '1-7',
    module: 1,
    number: 7,
    name: "Dark Forest",
    skill: "Negative coefficient outside parentheses",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "-2(x + 5)",
      notEasy: "-(1/3)(z + 12)"
    }
  },
  '1-8': {
    id: '1-8',
    module: 1,
    number: 8,
    name: "Mixed Terrain",
    skill: "Mixed negatives inside parentheses",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: 'compass',
    exampleProblem: {
      easy: "-4(x - 2)",
      notEasy: "-(2/5)(n - 10)"
    }
  },
  '1-9': {
    id: '1-9',
    module: 1,
    number: 9,
    name: "Sort Supplies",
    skill: "Basic combining like terms",
    inputMethod: "colorCoding",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "5x + 3x",
      notEasy: "(1/2)y + (1/4)y"
    }
  },
  '1-10': {
    id: '1-10',
    module: 1,
    number: 10,
    name: "Organize Gear",
    skill: "Combining with subtraction",
    inputMethod: "colorCoding",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "8x - 3x",
      notEasy: "(3/4)m - (1/4)m"
    }
  },
  '1-11': {
    id: '1-11',
    module: 1,
    number: 11,
    name: "Complex Packing",
    skill: "Combining like terms AND constants",
    inputMethod: "colorCoding",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "4x + 7 - 2x + 3",
      notEasy: "(1/2)y + 6 + (1/4)y - 2"
    }
  },
  '1-12': {
    id: '1-12',
    module: 1,
    number: 12,
    name: "Final Inventory",
    skill: "Combining with negative coefficients",
    inputMethod: "colorCoding",
    problemsRequired: 6,
    badge: 'campingGear',
    exampleProblem: {
      easy: "-3x + 5x - 4 + 2",
      notEasy: "-(1/3)w + (2/3)w - 5 + 2"
    }
  },
  '1-13': {
    id: '1-13',
    module: 1,
    number: 13,
    name: "Pack It Up",
    skill: "Distribute then combine (single distribution)",
    inputMethod: "multiStep",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "2(x + 4) + 3x",
      notEasy: "(1/2)(y + 8) + 3y"
    }
  },
  '1-14': {
    id: '1-14',
    module: 1,
    number: 14,
    name: "Double Check",
    skill: "Two distributions then combine",
    inputMethod: "multiStep",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "3(x + 2) + 2(x - 1)",
      notEasy: "(1/2)(m + 6) + (1/3)(m - 3)"
    }
  },
  '1-15': {
    id: '1-15',
    module: 1,
    number: 15,
    name: "Ready to Trek",
    skill: "Complex simplification with negatives",
    inputMethod: "multiStep",
    problemsRequired: 6,
    badge: 'trailMap',
    moduleBadge: 'baseCampMaster',
    exampleProblem: {
      easy: "-2(3x - 4) + 5x - 3",
      notEasy: "-(1/2)(p - 8) + (3/4)(p + 4)"
    }
  },

  // MODULE 2 LEVELS
  '2-1': {
    id: '2-1',
    module: 2,
    number: 1,
    name: "River Crossing",
    skill: "One-step equations (addition/subtraction)",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "x + 7 = 15",
      notEasy: "y + (1/2) = (3/4)"
    }
  },
  '2-2': {
    id: '2-2',
    module: 2,
    number: 2,
    name: "Mountain Climb",
    skill: "One-step equations (multiplication/division)",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "4x = 20",
      notEasy: "(1/2)y = 8"
    }
  },
  '2-3': {
    id: '2-3',
    module: 2,
    number: 3,
    name: "Shadow Valley",
    skill: "One-step with negatives",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: 'binoculars',
    exampleProblem: {
      easy: "-x = 8",
      notEasy: "-y = (3/4)"
    }
  },
  '2-4': {
    id: '2-4',
    module: 2,
    number: 4,
    name: "Hidden Canyon",
    skill: "Basic two-step equations",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "2x + 5 = 13",
      notEasy: "(1/2)y + 3 = 8"
    }
  },
  '2-5': {
    id: '2-5',
    module: 2,
    number: 5,
    name: "Storm Passage",
    skill: "Two-step with negative coefficients",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "-2x + 9 = 3",
      notEasy: "-(1/2)p + 6 = 4"
    }
  },
  '2-6': {
    id: '2-6',
    module: 2,
    number: 6,
    name: "Fraction Falls",
    skill: "Two-step with fractions",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "(1/2)x + 4 = 10",
      notEasy: "(3/4)y - 6 = 3"
    }
  },
  '2-7': {
    id: '2-7',
    module: 2,
    number: 7,
    name: "Misty Decimals",
    skill: "Two-step with decimals",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: 'climbingRope',
    exampleProblem: {
      easy: "1.5x + 3 = 9",
      notEasy: "3.5y + 2.5 = 12"
    }
  },
  '2-8': {
    id: '2-8',
    module: 2,
    number: 8,
    name: "Ancient Ruins",
    skill: "Distribution needed before solving",
    inputMethod: "multiStep",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "3(x + 4) = 21",
      notEasy: "(1/2)(y + 8) = 10"
    }
  },
  '2-9': {
    id: '2-9',
    module: 2,
    number: 9,
    name: "Complex Caverns",
    skill: "Distribute AND combine before solving",
    inputMethod: "multiStep",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "2(x + 3) + 4x = 24",
      notEasy: "(1/2)(m + 6) + 2m = 13"
    }
  },
  '2-10': {
    id: '2-10',
    module: 2,
    number: 10,
    name: "The Divide",
    skill: "Variables on both sides",
    inputMethod: "balanceScale",
    problemsRequired: 6,
    badge: 'pickaxe',
    moduleBadge: 'territoryMapper',
    exampleProblem: {
      easy: "5x + 4 = 2x + 13",
      notEasy: "(1/2)y + 6 = (1/4)y + 9"
    }
  },

  // MODULE 3 LEVELS
  '3-1': {
    id: '3-1',
    module: 3,
    number: 1,
    name: "Boundary Markers",
    skill: "Match inequality to number line (SPEED ROUND)",
    inputMethod: "clickToSelect",
    problemsRequired: 15, // Speed round has more problems
    badge: null,
    exampleProblem: {
      easy: "x ≥ 3 → select correct number line",
      notEasy: "x ≥ 3 → select correct number line" // Same for both
    }
  },
  '3-2': {
    id: '3-2',
    module: 3,
    number: 2,
    name: "Reverse Recognition",
    skill: "Match number line to inequality (SPEED ROUND)",
    inputMethod: "clickToSelect",
    problemsRequired: 15, // Speed round
    badge: null,
    exampleProblem: {
      easy: "Number line → select inequality",
      notEasy: "Number line → select inequality" // Same for both
    }
  },
  '3-3': {
    id: '3-3',
    module: 3,
    number: 3,
    name: "Secure Perimeter",
    skill: "Two-step inequalities (no sign flip)",
    inputMethod: "balanceScalePlusNumberLine",
    problemsRequired: 6,
    badge: 'borderFlag',
    exampleProblem: {
      easy: "2x + 3 < 11",
      notEasy: "(1/2)y + 5 > 9"
    }
  },
  '3-4': {
    id: '3-4',
    module: 3,
    number: 4,
    name: "Shifting Boundaries",
    skill: "Inequalities with sign flip (dividing by negative)",
    inputMethod: "balanceScalePlusNumberLine",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "-2x < 8",
      notEasy: "-(1/2)y > 4"
    }
  },
  '3-5': {
    id: '3-5',
    module: 3,
    number: 5,
    name: "Twisted Paths",
    skill: "Multi-step with sign flip",
    inputMethod: "balanceScalePlusNumberLine",
    problemsRequired: 6,
    badge: null,
    exampleProblem: {
      easy: "-2x + 5 < 13",
      notEasy: "-(1/2)m + 6 > 2"
    }
  },
  '3-6': {
    id: '3-6',
    module: 3,
    number: 6,
    name: "FINAL FRONTIER",
    skill: "Complex inequalities (distribution, combining, sign flip)",
    inputMethod: "multiStep",
    problemsRequired: 6,
    badge: 'telescope',
    moduleBadge: 'frontierExplorer',
    finalModule: true,
    exampleProblem: {
      easy: "-2(x - 3) + 4 < 16",
      notEasy: "-(1/2)(p - 8) + (3/4)p < 10"
    }
  }
};

export default levels;
