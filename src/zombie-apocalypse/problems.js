// problems.js
// Version: 3.4.1
// Last Updated: December 1, 2024 - 12:05 AM
// Changes: Fixed capitalization, added scaffolding data to problems

// ============================================
// MADLIB COMPONENTS - Zombie Apocalypse Theme
// ============================================

// Helper to capitalize first letter
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const zombieItems = {
  weapons: ['crossbow', 'machete', 'baseball bat', 'flamethrower', 'chainsaw', 'katana', 'riot shield', 'spear'],
  supplies: ['canned food', 'water bottles', 'first aid kit', 'flashlight', 'rope', 'duct tape', 'gasoline', 'batteries'],
  protection: ['body armor', 'helmet', 'gas mask', 'hazmat suit', 'reinforced boots', 'tactical vest'],
  medicine: ['antibiotics', 'pain meds', 'antidote serum', 'bandages', 'insulin', 'antiseptic'],
  tools: ['generator', 'radio', 'walkie-talkie', 'binoculars', 'tent', 'sleeping bag']
};

const locations = [
  'the abandoned Walmart',
  'the fortified pharmacy',
  'the survivor\'s market',
  'the underground bunker',
  'the rooftop trading post',
  'the barricaded warehouse',
  'the safe zone checkpoint',
  'the convoy supply depot'
];

const npcs = [
  'Marcus the weapons dealer',
  'Dr. Chen the medic',
  'Sarah the supply runner',
  'Jackson the mechanic',
  'Officer Rodriguez',
  'Chef Wang',
  'Trader Jake',
  'Nurse Patterson'
];

const discountReasons = [
  'damaged in a zombie attack',
  'desperate to move inventory before relocating',
  'faction alliance discount for Eastway Jaguars',
  'loyalty reward for repeat customers',
  'clearance sale (apocalypse special!)',
  'slightly bloody but still functional',
  'faction friendship discount'
];

const taxReasons = [
  'safe zone protection fee',
  'faction leadership tax',
  'entry tax to the secure area',
  'resource pooling for survival',
  'fortification maintenance fee'
];

const tipReasons = [
  'saved your life last week',
  'keeps finding rare supplies',
  'makes the best post-apocalypse meals',
  'risked their life scouting for you',
  'always shares intel about zombie movements'
];

const loanReasons = [
  'borrowed before the outbreak hit',
  'emergency loan for supplies',
  'weapon loan from another faction',
  'borrowed to repair your shelter'
];

// Utility functions
const random = {
  percent: (min = 1, max = 99) => Math.floor(Math.random() * (max - min + 1)) + min,
  tax: () => Math.floor(Math.random() * 25) + 1,
  discount: () => Math.floor(Math.random() * 66) + 10,
  markup: () => Math.floor(Math.random() * 186) + 15,
  commission: () => Math.floor(Math.random() * 18) + 3,
  interest: () => Math.floor(Math.random() * 14) + 2,
  percentChange: () => Math.floor(Math.random() * 76) + 5,
  smallItem: () => Math.floor(Math.random() * 136) + 15,
  mediumItem: () => Math.floor(Math.random() * 421) + 80,
  largeItem: () => Math.floor(Math.random() * 1001) + 200,
  salary: () => Math.floor(Math.random() * 401) + 200,
  sales: () => Math.floor(Math.random() * 2601) + 400,
  loan: () => Math.floor(Math.random() * 4501) + 500,
  finalMoney: () => Math.floor(Math.random() * 150001) + 50000,
  finalPopulation: () => Math.floor(Math.random() * 1501) + 500,
  years: () => Math.floor(Math.random() * 7) + 2,
  fromArray: (arr) => arr[Math.floor(Math.random() * arr.length)]
};

const round = (num) => Math.round(num * 100) / 100;

// LEVEL 1: Percent to Decimal
export const generateLevel1Bank = () => {
  const problems = [];
  const percentPool = [
    0.5, 1, 2.5, 3, 4, 5, 6, 7.5, 8, 10,
    12, 15, 18, 20, 25, 30, 33, 40, 45, 50,
    60, 66, 75, 80, 90, 99, 100, 110, 125, 150
  ];

  const shuffled = [...percentPool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 20);

  selected.forEach((p) => {
    const decimal = (p / 100).toString();
    problems.push({
      question: `Convert ${p}% to a decimal`,
      correctAnswer: decimal,
      answer: decimal,
      type: 'percent-to-decimal'
    });
  });

  return problems;
};

// LEVEL 2: Increase or Decrease
export const generateLevel2Problem = (playerData) => {
  const scenarios = [
    {
      template: (item, discount, reason) => `${capitalize(item)} is ${discount}% off (${reason}). Does the price increase or decrease?`,
      answer: 'decrease',
      getValues: () => ({
        item: random.fromArray([...zombieItems.weapons, ...zombieItems.supplies]),
        discount: random.discount(),
        reason: random.fromArray(discountReasons)
      })
    },
    {
      template: (item, tax, reason) => `${capitalize(item)} costs extra due to ${tax}% ${reason}. Does your total increase or decrease?`,
      answer: 'increase',
      getValues: () => ({
        item: random.fromArray([...zombieItems.protection, ...zombieItems.medicine]),
        tax: random.tax(),
        reason: random.fromArray(taxReasons)
      })
    },
    {
      template: (npc, tip, reason) => `${npc} ${reason}. You tip ${tip}%. Does what you pay increase or decrease?`,
      answer: 'increase',
      getValues: () => ({
        npc: random.fromArray(npcs),
        tip: random.percent(10, 25),
        reason: random.fromArray(tipReasons)
      })
    },
    {
      template: (item, markup) => `Weapons dealer marks up ${item} by ${markup}% (high demand). Does the price increase or decrease?`,
      answer: 'increase',
      getValues: () => ({
        item: random.fromArray(zombieItems.weapons),
        markup: random.markup()
      })
    },
    {
      template: (decrease) => `Zombie attacks reduced survivor population by ${decrease}%. Did it increase or decrease?`,
      answer: 'decrease',
      getValues: () => ({
        decrease: random.percentChange()
      })
    },
    {
      template: (item, discount, location) => `${capitalize(item)} is on sale at ${location} for ${discount}% off. Does the price increase or decrease?`,
      answer: 'decrease',
      getValues: () => ({
        item: random.fromArray(zombieItems.supplies),
        discount: random.discount(),
        location: random.fromArray(locations)
      })
    },
    {
      template: (rate, reason) => `You ${reason}. Must pay ${rate}% interest. Does what you owe increase or decrease?`,
      answer: 'increase',
      getValues: () => ({
        rate: random.interest(),
        reason: random.fromArray(loanReasons)
      })
    },
    {
      template: (comm, npc) => `${npc} pays you ${comm}% commission for finding supplies. Does your income increase or decrease?`,
      answer: 'increase',
      getValues: () => ({
        comm: random.commission(),
        npc: random.fromArray(npcs)
      })
    },
    {
      template: (item, discount) => `${capitalize(item)} marked down ${discount}% (end-of-world clearance!). Does the price increase or decrease?`,
      answer: 'decrease',
      getValues: () => ({
        item: random.fromArray(zombieItems.tools),
        discount: random.discount()
      })
    },
    {
      template: (increase) => `${playerData.friendName}'s faction grew by ${increase}% after rescue mission. Did population increase or decrease?`,
      answer: 'increase',
      getValues: () => ({
        increase: random.percentChange()
      })
    },
    {
      template: (tax, reason) => `${playerData.cityName} charges ${tax}% ${reason}. Does your cost increase or decrease?`,
      answer: 'increase',
      getValues: () => ({
        tax: random.tax(),
        reason: random.fromArray(taxReasons)
      })
    },
    {
      template: (item, discount, npc) => `${npc} gives you ${discount}% off ${item} (you helped them escape zombies). Does price increase or decrease?`,
      answer: 'decrease',
      getValues: () => ({
        item: random.fromArray(zombieItems.medicine),
        discount: random.discount(),
        npc: random.fromArray(npcs)
      })
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValues();
    const templateParams = Object.values(values);
    return {
      question: s.template(...templateParams),
      correctAnswer: s.answer,
      answer: s.answer,
      choices: ['increase', 'decrease'],
      type: 'multiple-choice'
    };
  });
};

// LEVEL 3: Calculate Amount
export const generateLevel3Problem = (playerData) => {
  const allItems = [...zombieItems.weapons, ...zombieItems.supplies, ...zombieItems.protection, ...zombieItems.medicine, ...zombieItems.tools];
  
  const scenarios = [
    {
      template: (item, price, discount, reason) => `${capitalize(item)} costs $${price}. It's ${discount}% off (${reason}). How much do you SAVE? (Round to nearest cent)`,
      getAnswer: (item, price, discount, reason) => round(price * discount / 100).toFixed(2),
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.mediumItem(),
        discount: random.discount(),
        reason: random.fromArray(discountReasons)
      })
    },
    {
      template: (item, price, tax, reason) => `${capitalize(item)} costs $${price}, plus ${tax}% ${reason}. How much is the TAX? (Round to nearest cent)`,
      getAnswer: (item, price, tax, reason) => round(price * tax / 100).toFixed(2),
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.largeItem(),
        tax: random.tax(),
        reason: random.fromArray(taxReasons)
      })
    },
    {
      template: (npc, price, tip, reason) => `${npc} ${reason}. The meal costs $${price}. You tip ${tip}%. How much is the TIP? (Round to nearest cent)`,
      getAnswer: (npc, price, tip, reason) => round(price * tip / 100).toFixed(2),
      getValues: () => ({
        npc: random.fromArray(npcs),
        price: random.smallItem(),
        tip: random.percent(15, 25),
        reason: random.fromArray(tipReasons)
      })
    },
    {
      template: (item, price, markup, location) => `At ${location}, ${item} is marked up ${markup}% from $${price}. How much was the MARKUP? (Round to nearest cent)`,
      getAnswer: (item, price, markup, location) => round(price * markup / 100).toFixed(2),
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.mediumItem(),
        markup: random.markup(),
        location: random.fromArray(locations)
      })
    },
    {
      template: (principal, rate, years, reason) => `You ${reason}. The loan was $${principal} at ${rate}% simple interest for ${years} years. How much INTEREST do you owe? (Round to nearest cent)`,
      getAnswer: (principal, rate, years, reason) => round(principal * rate / 100 * years).toFixed(2),
      getValues: () => ({
        principal: random.loan(),
        rate: random.interest(),
        years: random.years(),
        reason: random.fromArray(loanReasons)
      })
    },
    {
      template: (sales, comm, npc) => `${npc} pays ${comm}% commission on your supply trades. You made $${sales} in sales. How much COMMISSION did you earn? (Round to nearest cent)`,
      getAnswer: (sales, comm, npc) => round(sales * comm / 100).toFixed(2),
      getValues: () => ({
        sales: random.sales(),
        comm: random.commission(),
        npc: random.fromArray(npcs)
      })
    }
  ];
  
  // Generate 12 problems by allowing duplicates
  const problems = [];
  for (let i = 0; i < 12; i++) {
    const s = scenarios[i % scenarios.length];
    const values = s.getValues();
    const valuesArray = Object.values(values);
    problems.push({
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response'
    });
  }
  return problems;
};

// LEVEL 4: Final Price After Discount/Tax
export const generateLevel4Problem = (playerData) => {
  const allItems = [...zombieItems.weapons, ...zombieItems.supplies, ...zombieItems.protection, ...zombieItems.medicine, ...zombieItems.tools];
  
  const scenarios = [
    {
      template: (item, price, discount, reason) => `${capitalize(item)} costs $${price}, ${discount}% off (${reason}). What's the FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (item, price, discount, reason) => round(price - (price * discount / 100)).toFixed(2),
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.mediumItem(),
        discount: random.discount(),
        reason: random.fromArray(discountReasons)
      })
    },
    {
      template: (item, price, tax, reason) => `${capitalize(item)} costs $${price} plus ${tax}% ${reason}. What's the FINAL TOTAL? (Round to nearest cent)`,
      getAnswer: (item, price, tax, reason) => round(price + (price * tax / 100)).toFixed(2),
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.largeItem(),
        tax: random.tax(),
        reason: random.fromArray(taxReasons)
      })
    },
    {
      template: (npc, price, tip, reason) => `${npc} ${reason}. The service costs $${price}. You tip ${tip}%. What's the FINAL amount you pay? (Round to nearest cent)`,
      getAnswer: (npc, price, tip, reason) => round(price + (price * tip / 100)).toFixed(2),
      getValues: () => ({
        npc: random.fromArray(npcs),
        price: random.smallItem(),
        tip: random.percent(15, 25),
        reason: random.fromArray(tipReasons)
      })
    },
    {
      template: (item, price, markup, location) => `At ${location}, ${item} was originally $${price}, marked up ${markup}%. What's the FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (item, price, markup, location) => round(price + (price * markup / 100)).toFixed(2),
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.mediumItem(),
        markup: random.markup(),
        location: random.fromArray(locations)
      })
    }
  ];
  
  const problems = [];
  for (let i = 0; i < 10; i++) {
    const s = scenarios[i % scenarios.length];
    const values = s.getValues();
    const valuesArray = Object.values(values);
    
    // Build scaffolding for Level 4
    const item = values.item;
    const price = values.price;
    let scaffoldSteps = null;
    
    if (s.template.toString().includes('off')) {
      // Discount scenario
      const discount = values.discount;
      const discountAmount = round(price * discount / 100);
      const final = round(price - discountAmount);
      
      scaffoldSteps = {
        step1: { question: "How much do you SAVE?", answer: discountAmount.toFixed(2) },
        step2: { question: "Do you add or subtract the discount?", answer: "subtract", choices: ["add", "subtract", "neither"] },
        step3: { question: "What is the FINAL PRICE?", answer: final.toFixed(2) }
      };
    } else if (s.template.toString().includes('marked up')) {
      // Markup scenario
      const markup = values.markup;
      const markupAmount = round(price * markup / 100);
      const final = round(price + markupAmount);
      
      scaffoldSteps = {
        step1: { question: "How much is the MARKUP?", answer: markupAmount.toFixed(2) },
        step2: { question: "Do you add or subtract the markup?", answer: "add", choices: ["add", "subtract", "neither"] },
        step3: { question: "What is the FINAL PRICE?", answer: final.toFixed(2) }
      };
    } else if (s.template.toString().includes('tax') || s.template.toString().includes('tip')) {
      // Tax or tip scenario
      const percent = values.tax || values.tip;
      const amount = round(price * percent / 100);
      const final = round(price + amount);
      const label = values.tax ? 'TAX' : 'TIP';
      
      scaffoldSteps = {
        step1: { question: `How much is the ${label}?`, answer: amount.toFixed(2) },
        step2: { question: `Do you add or subtract the ${label.toLowerCase()}?`, answer: "add", choices: ["add", "subtract", "neither"] },
        step3: { question: "What is the FINAL TOTAL?", answer: final.toFixed(2) }
      };
    }
    
    problems.push({
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response',
      scaffoldSteps: scaffoldSteps
    });
  }
  return problems;
};

// LEVEL 5: Basic Two-Step
export const generateLevel5Problem = (playerData) => {
  const allItems = [...zombieItems.weapons, ...zombieItems.supplies, ...zombieItems.protection, ...zombieItems.medicine, ...zombieItems.tools];
  
  const scenarios = [
    {
      template: (item, price, discount, tax, reason) => `${capitalize(item)} costs $${price}, ${discount}% off, then ${tax}% ${reason} added. What's the FINAL TOTAL? (Round to nearest cent)`,
      getAnswer: (item, price, discount, tax, reason) => {
        const afterDiscount = price - (price * discount / 100);
        const final = afterDiscount + (afterDiscount * tax / 100);
        return round(final).toFixed(2);
      },
      getScaffold: (item, price, discount, tax, reason) => {
        const discountAmount = round(price * discount / 100);
        const afterDiscount = round(price - discountAmount);
        const taxAmount = round(afterDiscount * tax / 100);
        const final = round(afterDiscount + taxAmount);
        
        return {
          step1: { 
            question: "What is the discount amount (amount SAVED)?", 
            answer: discountAmount.toFixed(2) 
          },
          step2: { 
            question: "Do we add or subtract the discount from the Original?", 
            answer: "subtract", 
            choices: ["add", "subtract", "neither"] 
          },
          step3: { 
            question: "What is the new discounted price?", 
            answer: afterDiscount.toFixed(2) 
          },
          step4: { 
            question: "Which amount are we putting tax on?", 
            answer: afterDiscount.toFixed(2), 
            choices: [price.toFixed(2), afterDiscount.toFixed(2), discountAmount.toFixed(2)] 
          },
          step5: { 
            question: "Do we add or subtract tax?", 
            answer: "add", 
            choices: ["add", "subtract", "neither"] 
          },
          step6: { 
            question: "What is the final amount?", 
            answer: final.toFixed(2) 
          }
        };
      },
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.mediumItem(),
        discount: random.discount(),
        tax: random.tax(),
        reason: random.fromArray(taxReasons)
      })
    },
    {
      template: (item, price, markup, discount, location) => `At ${location}, ${item} was marked up ${markup}% from $${price}, then given a ${discount}% clearance discount. FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (item, price, markup, discount, location) => {
        const afterMarkup = price + (price * markup / 100);
        const final = afterMarkup - (afterMarkup * discount / 100);
        return round(final).toFixed(2);
      },
      getScaffold: (item, price, markup, discount, location) => {
        const markupAmount = round(price * markup / 100);
        const afterMarkup = round(price + markupAmount);
        const discountAmount = round(afterMarkup * discount / 100);
        const final = round(afterMarkup - discountAmount);
        
        return {
          step1: { question: "What is the markup amount?", answer: markupAmount.toFixed(2) },
          step2: { question: "Add or subtract from original?", answer: "add", choices: ["add", "subtract", "neither"] },
          step3: { question: "Price after markup?", answer: afterMarkup.toFixed(2) },
          step4: { question: "Which price gets the discount?", answer: afterMarkup.toFixed(2), choices: [price.toFixed(2), afterMarkup.toFixed(2), markupAmount.toFixed(2)] },
          step5: { question: "Add or subtract discount?", answer: "subtract", choices: ["add", "subtract", "neither"] },
          step6: { question: "FINAL PRICE?", answer: final.toFixed(2) }
        };
      },
      getValues: () => ({
        item: random.fromArray(allItems),
        price: random.smallItem(),
        markup: random.markup(),
        discount: random.discount(),
        location: random.fromArray(locations)
      })
    },
    {
      template: (npc, price, tax, tip, reason) => `${npc} ${reason}. The meal costs $${price}, plus ${tax}% tax. Then you tip ${tip}% on the total. How much do you PAY? (Round to nearest cent)`,
      getAnswer: (npc, price, tax, tip, reason) => {
        const afterTax = price + (price * tax / 100);
        const final = afterTax + (afterTax * tip / 100);
        return round(final).toFixed(2);
      },
      getScaffold: (npc, price, tax, tip, reason) => {
        const taxAmount = round(price * tax / 100);
        const afterTax = round(price + taxAmount);
        const tipAmount = round(afterTax * tip / 100);
        const final = round(afterTax + tipAmount);
        
        return {
          step1: { question: "Tax amount?", answer: taxAmount.toFixed(2) },
          step2: { question: "Add or subtract tax?", answer: "add", choices: ["add", "subtract", "neither"] },
          step3: { question: "Price after tax?", answer: afterTax.toFixed(2) },
          step4: { question: "Which amount do you tip on?", answer: afterTax.toFixed(2), choices: [price.toFixed(2), afterTax.toFixed(2), taxAmount.toFixed(2)] },
          step5: { question: "Add or subtract tip?", answer: "add", choices: ["add", "subtract", "neither"] },
          step6: { question: "FINAL total you pay?", answer: final.toFixed(2) }
        };
      },
      getValues: () => ({
        npc: random.fromArray(npcs),
        price: random.smallItem(),
        tax: random.tax(),
        tip: random.percent(15, 20),
        reason: random.fromArray(tipReasons)
      })
    }
  ];
  
  const problems = [];
  for (let i = 0; i < 8; i++) {
    const s = scenarios[i % scenarios.length];
    const values = s.getValues();
    const valuesArray = Object.values(values);
    problems.push({
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response',
      scaffoldSteps: s.getScaffold(...valuesArray)
    });
  }
  return problems;
};

// LEVEL 6: Single Unwinding
export const generateLevel6Problem = (playerData) => {
  const allItems = [...zombieItems.weapons, ...zombieItems.supplies, ...zombieItems.protection, ...zombieItems.medicine, ...zombieItems.tools];
  
  const scenarios = [
    {
      template: (item, finalPrice, discount, reason) => `${capitalize(item)} costs $${finalPrice} AFTER a ${discount}% discount was applied (${reason}). What was the ORIGINAL price BEFORE the discount? (Round to nearest cent)`,
      getAnswer: (item, finalPrice, discount, reason) => round(finalPrice / (1 - discount / 100)).toFixed(2),
      getValues: () => {
        const original = random.mediumItem();
        const discount = random.discount();
        const finalPrice = round(original - (original * discount / 100));
        return {
          item: random.fromArray(allItems),
          finalPrice,
          discount,
          reason: random.fromArray(discountReasons)
        };
      }
    },
    {
      template: (item, finalPrice, tax, location) => `You paid $${finalPrice} total for ${item} at ${location} AFTER ${tax}% tax was added. What was the price BEFORE tax? (Round to nearest cent)`,
      getAnswer: (item, finalPrice, tax, location) => round(finalPrice / (1 + tax / 100)).toFixed(2),
      getValues: () => {
        const original = random.largeItem();
        const tax = random.tax();
        const finalPrice = round(original + (original * tax / 100));
        return {
          item: random.fromArray(allItems),
          finalPrice,
          tax,
          location: random.fromArray(locations)
        };
      }
    },
    {
      template: (npc, total, salary, comm) => `${npc} earned $${total} TOTAL (base pay $${salary} + ${comm}% commission on trades). How much in SALES? (Round to nearest cent)`,
      getAnswer: (npc, total, salary, comm) => {
        const commAmount = total - salary;
        return round(commAmount / (comm / 100)).toFixed(2);
      },
      getValues: () => {
        const salary = random.salary();
        const comm = random.commission();
        const sales = random.sales();
        const total = round(salary + (sales * comm / 100));
        return { npc: random.fromArray(npcs), total, salary, comm };
      }
    },
    {
      template: (item, finalPrice, markup, npc) => `${npc} sells ${item} for $${finalPrice} AFTER marking it up ${markup}%. ORIGINAL cost BEFORE markup? (Round to nearest cent)`,
      getAnswer: (item, finalPrice, markup, npc) => round(finalPrice / (1 + markup / 100)).toFixed(2),
      getValues: () => {
        const original = random.mediumItem();
        const markup = random.markup();
        const finalPrice = round(original + (original * markup / 100));
        return {
          item: random.fromArray(allItems),
          finalPrice,
          markup,
          npc: random.fromArray(npcs)
        };
      }
    }
  ];
  
  const problems = [];
  for (let i = 0; i < 12; i++) {
    const s = scenarios[i % scenarios.length];
    const values = s.getValues();
    const valuesArray = Object.values(values);
    problems.push({
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response'
    });
  }
  return problems;
};

// LEVEL 7: Finale
export const generateLevel7Problem = (playerData) => {
  const initialPop = random.finalPopulation();
  const decrease = random.percentChange();
  const increase = random.percentChange();
  const moneyPool = random.finalMoney();
  const interestRate = random.interest();
  const years = random.years();
  
  const afterDecrease = Math.floor(initialPop * (1 - decrease / 100));
  const finalPopulation = Math.floor(afterDecrease * (1 + increase / 100));
  const interest = moneyPool * (interestRate / 100) * years;
  const totalMoney = moneyPool + interest;
  const perPerson = totalMoney / finalPopulation;
  
  const question = `Before the outbreak, ${playerData.cityName} had ${initialPop} survivors.

During the first wave, the population decreased by ${decrease}%.

After ${playerData.friendName} discovered a cure, the population grew by ${increase}%.

The survivors pooled all remaining money: $${moneyPool.toLocaleString()}. This was invested at ${interestRate}% simple interest for ${years} years to rebuild.

At the end of this period, the total money will be split equally among all survivors.

How much will EACH PERSON receive? (Round to the nearest cent)`;
  
  return {
    question,
    correctAnswer: round(perPerson).toFixed(2),
    answer: round(perPerson).toFixed(2),
    type: 'free-response',
    scaffoldSteps: {
      step1: { 
        question: "After the first wave, how many survivors remained? (Round DOWN - no partial people!)", 
        answer: afterDecrease.toString() 
      },
      step2: { 
        question: "After the cure, how many total survivors? (Round DOWN)", 
        answer: finalPopulation.toString() 
      },
      step3: { 
        question: "How much interest was earned on the money?", 
        answer: round(interest).toFixed(2) 
      },
      step4: { 
        question: "What is the total money (original + interest)?", 
        answer: round(totalMoney).toFixed(2) 
      },
      step5: { 
        question: "How much does EACH PERSON receive?", 
        answer: round(perPerson).toFixed(2) 
      }
    },
    showWork: {
      initialPop,
      decrease,
      afterDecrease,
      increase,
      finalPopulation,
      moneyPool,
      interestRate,
      years,
      interest: round(interest).toFixed(2),
      totalMoney: round(totalMoney).toFixed(2),
      perPerson: round(perPerson).toFixed(2)
    },
    requiresWholeNumber: true,
    populationWarning: "Remember: You can't have a partial person! If there's only part of someone left, the zombies got them and they're turning. You CAN'T count them as a survivor! Always round DOWN when calculating people."
  };
};
