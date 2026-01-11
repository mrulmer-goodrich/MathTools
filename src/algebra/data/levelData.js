// Complete level data for all 37 levels - FIXED VERSION
// Keeps ALL storyline data, updates level IDs to match problemGenerators

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
    // CONTINUING WITH RENUMBERED LEVELS (was 2-1, now 1-16)
    '1-16': {
      name: "River Crossing",
      intro: `"First landmark: the river. The bridge stones are marked with equations. Solve for X to know which stones are safe." - Dr. Martinez`
    },
    '1-17': {
      name: "Mountain Climb",
      intro: `"The mountain path requires multiplication and division to determine safe holds. Each calculation reveals the next step." - Dr. Martinez`
    },
    '1-18': {
      name: "Shadow Valley",
      intro: `"This valley is dark. Negative coefficients everywhere. The shadows play tricks, but the mathematics doesn't lie." - Dr. Martinez`
    },
    '1-19': {
      name: "Hidden Canyon",
      intro: `"Found a hidden canyon not on any map! Two-step equations guard its passages. Ancients were clever." - Dr. Martinez`
    },
    '1-20': {
      name: "Storm Passage",
      intro: `"Caught in a storm. The wind howls with negative multipliers. Two-step solving in harsh conditions. We press on." - Dr. Martinez`
    },
    '1-21': {
      name: "Fraction Falls",
      intro: `"A waterfall reveals fractional patterns in its flow. The mist creates equations with fractions. Mesmerizing." - Dr. Martinez`
    },
    '1-22': {
      name: "Misty Decimals",
      intro: `"The mist thickens. Decimal values appear in the condensation on rocks. Nature's mathematics revealed." - Dr. Martinez`
    },
    '1-23': {
      name: "Ancient Ruins",
      intro: `"Found ruins! Equations carved in stone require distribution before solving. The ancients understood order of operations." - Dr. Martinez`
    },
    '1-24': {
      name: "Complex Caverns",
      intro: `"Deep in the caverns, equations grow more complex. Distribution, combination, then solution. Like a mathematical dance." - Dr. Martinez`
    },
    '1-25': {
      name: "The Divide",
      intro: `"We've reached The Divide. Variables on both sides of the equations. The boundary between known and unknown territory. Tomorrow... the frontier." - Dr. Martinez [Pages after this are water-damaged]`
    },
    // NEW LEVELS 26-31 (The Vault section - these need new story intros)
    '1-26': {
      name: "Outer Vault Approach",
      intro: `[Damaged pages continue] "...vault entrance requires solving equations with constants and variables on both sides. The door responds only to perfect solutions." - Dr. Martinez`
    },
    '1-27': {
      name: "Inner Chamber",
      intro: `"Inside now. Distribution must be perfect. The walls shift with each calculation. One mistake and we start over." - Dr. Martinez`
    },
    '1-28': {
      name: "Combination Lock",
      intro: `"Multi-step combinations everywhere. Like terms must be gathered before solving. The ancients' final defense." - Dr. Martinez`
    },
    '1-29': {
      name: "Puzzle Chamber",
      intro: `"This room tests everything: distribution, combination, variables on both sides. My team is exhausted but determined." - Dr. Martinez`
    },
    '1-30': {
      name: "Vault Antechamber",
      intro: `"Almost there. Distribution on BOTH sides of equations. The complexity is staggering. Beautiful." - Dr. Martinez [Her handwriting shows excitement]`
    },
    '1-31': {
      name: "THE VAULT",
      intro: `"The final door. Every skill required. If I can solve this... the vault will open. Here goes everything." - Dr. Martinez [This is her last equation-focused entry]`
    },
    // FRONTIER LEVELS 32-37 (was 3-1 to 3-6)
    '1-32': {
      name: "Boundary Markers",
      intro: `[Water damage clears] "...boundary markers use inequalities, not equations. Open circles, closed circles. Directions matter. Must recognize them instantly to survive." - Dr. Martinez`
    },
    '1-33': {
      name: "Reverse Recognition",
      intro: `"The markers can be read both ways. Symbol to image, image to symbol. The ancients test our understanding from all angles." - Dr. Martinez`
    },
    '1-34': {
      name: "Secure Perimeter",
      intro: `"Establishing safe zones requires solving inequalities. The boundary of safety is not a point but a range." - Dr. Martinez`
    },
    '1-35': {
      name: "Shifting Boundaries",
      intro: `"CRITICAL DISCOVERY: When dividing by negative, the inequality FLIPS. Two team members didn't realize this. They had to turn back. We're down to three." - Dr. Martinez [Her handwriting is shaky]`
    },
    '1-36': {
      name: "Twisted Paths",
      intro: `"The paths twist with multi-step inequalities. Sign flips are everywhere. One mistake and the path disappears. We move carefully." - Dr. Martinez`
    },
    '1-37': {
      name: "FINAL FRONTIER",
      intro: `"The vault is ahead. I can see it. But this final challenge... distribution, combination, solving, and sign flips all together. The ultimate test. If you're reading this and I haven't returned, know that I found it. I found—" [The page is torn. The rest is missing. You stand at the same spot she did, five years ago.]`
    }
  }
};

export const levels = {
  // LEVELS 1-4: Integer Operations
  '1-1': {
    id: '1-1',
    module: 1,
    number: 1,
    name: "Addition Supplies",
    skill: "Adding positive and negative integers",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-2': {
    id: '1-2',
    module: 1,
    number: 2,
    name: "Subtraction Supplies",
    skill: "Subtracting integers (including subtracting negatives)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-3': {
    id: '1-3',
    module: 1,
    number: 3,
    name: "Multiplication Supplies",
    skill: "Multiplying integers (positive and negative)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-4': {
    id: '1-4',
    module: 1,
    number: 4,
    name: "Division Supplies",
    skill: "Dividing integers (positive and negative)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '⚡ Operations Master'
  },

  // LEVELS 5-8: Distributive Property
  '1-5': {
    id: '1-5',
    module: 1,
    number: 5,
    name: "Clear Path",
    skill: "Basic distribution with positive numbers",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-6': {
    id: '1-6',
    module: 1,
    number: 6,
    name: "Rocky Trail",
    skill: "Distribution with subtraction in parentheses",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-7': {
    id: '1-7',
    module: 1,
    number: 7,
    name: "Dark Forest",
    skill: "Negative coefficient outside parentheses",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-8': {
    id: '1-8',
    module: 1,
    number: 8,
    name: "Mixed Terrain",
    skill: "Mixed negatives inside and outside parentheses",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '🧭 Distribution Expert'
  },

  // LEVELS 9-12: Combining Like Terms
  '1-9': {
    id: '1-9',
    module: 1,
    number: 9,
    name: "Sort Supplies",
    skill: "Basic combining like terms",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-10': {
    id: '1-10',
    module: 1,
    number: 10,
    name: "Organize Gear",
    skill: "Identifying and ignoring unlike terms",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-11': {
    id: '1-11',
    module: 1,
    number: 11,
    name: "Complex Packing",
    skill: "Multiple like terms to combine",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-12': {
    id: '1-12',
    module: 1,
    number: 12,
    name: "Final Inventory",
    skill: "Subtracting like terms (including negatives)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '⛺ Camping Expert'
  },

  // LEVELS 13-15: Simplifying Expressions
  '1-13': {
    id: '1-13',
    module: 1,
    number: 13,
    name: "Pack It Up",
    skill: "Distribute then combine",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-14': {
    id: '1-14',
    module: 1,
    number: 14,
    name: "Double Check",
    skill: "Distribute with subtraction then combine",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-15': {
    id: '1-15',
    module: 1,
    number: 15,
    name: "Ready to Trek",
    skill: "Negative outside, distribute, combine",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },

  // LEVEL 16: Summit - END OF BASE CAMP (Module 1)
  '1-16': {
    id: '1-16',
    module: 1,
    number: 16,
    name: "Summit",
    skill: "Complex simplification with trailing constants",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '🏔️ Base Camp Complete'
  },

  // LEVELS 17-20: One-Step Equations (Territory Begins - Module 2)
  '1-17': {
    id: '1-17',
    module: 2,
    number: 17,
    name: "River Crossing",
    skill: "One-step add/sub equations",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-18': {
    id: '1-18',
    module: 2,
    number: 18,
    name: "Bridge Building",
    skill: "One-step mult/div equations",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-19': {
    id: '1-19',
    module: 2,
    number: 19,
    name: "Canyon Leap",
    skill: "One-step add/sub equations with negatives",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-20': {
    id: '1-20',
    module: 2,
    number: 20,
    name: "Waterfall",
    skill: "One-step mult/div equations with negatives",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '🌊 Equations Expert'
  },

  // LEVELS 21-24: Two-Step Equations
  '1-21': {
    id: '1-21',
    module: 1,
    number: 21,
    name: "Fraction Falls",
    skill: "Two-step equations",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-22': {
    id: '1-22',
    module: 1,
    number: 22,
    name: "Misty Decimals",
    skill: "Two-step equations",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-23': {
    id: '1-23',
    module: 1,
    number: 23,
    name: "Ancient Ruins",
    skill: "Distribution in equations",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-24': {
    id: '1-24',
    module: 1,
    number: 24,
    name: "Complex Caverns",
    skill: "Distribute, combine, then solve",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '🪂 Cave Explorer'
  },
  '1-25': {
    id: '1-25',
    module: 1,
    number: 25,
    name: "The Divide",
    skill: "Variables on both sides",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },

  // LEVELS 26-31: THE VAULT (Advanced Multi-Step)
  '1-26': {
    id: '1-26',
    module: 1,
    number: 26,
    name: "Outer Vault Approach",
    skill: "Constants and variables both sides",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-27': {
    id: '1-27',
    module: 1,
    number: 27,
    name: "Inner Chamber",
    skill: "Distribution with variables both sides",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-28': {
    id: '1-28',
    module: 1,
    number: 28,
    name: "Combination Lock",
    skill: "Combine like terms then solve",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '🗺️ Vault Navigator'
  },
  '1-29': {
    id: '1-29',
    module: 1,
    number: 29,
    name: "Puzzle Chamber",
    skill: "All skills: distribute, combine, solve",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-30': {
    id: '1-30',
    module: 1,
    number: 30,
    name: "Vault Antechamber",
    skill: "Distribute both sides, then solve",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-31': {
    id: '1-31',
    module: 1,
    number: 31,
    name: "THE VAULT",
    skill: "Ultimate equation challenge",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '🏆 Vault Master'
  },

  // LEVELS 32-37: THE FRONTIER (Inequalities)
  '1-32': {
    id: '1-32',
    module: 1,
    number: 32,
    name: "Boundary Markers",
    skill: "Match inequality to number line",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-33': {
    id: '1-33',
    module: 1,
    number: 33,
    name: "Reverse Recognition",
    skill: "Match number line to inequality",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-34': {
    id: '1-34',
    module: 1,
    number: 34,
    name: "Secure Perimeter",
    skill: "Two-step inequalities (no flip)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-35': {
    id: '1-35',
    module: 1,
    number: 35,
    name: "Shifting Boundaries",
    skill: "Inequalities with sign flip",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-36': {
    id: '1-36',
    module: 1,
    number: 36,
    name: "Twisted Paths",
    skill: "Multi-step with sign flip",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: null
  },
  '1-37': {
    id: '1-37',
    module: 1,
    number: 37,
    name: "FINAL FRONTIER",
    skill: "Complex inequalities (all skills + flip)",
    inputMethod: "clickToSelect",
    problemsRequired: 6,
    badge: '🌟 Frontier Explorer'
  }
};

export default levels;
