// Zombie Apocalypse - Problem Generators with Randomization
// VERSION: 3.0.0
// Last Updated: November 30, 2024
// Changes: Level 7 rounds DOWN people, Level 6 clearer wording, more zombie-themed problems

// Utility functions for random value generation
const random = {
  percent: (min = 1, max = 99) => Math.floor(Math.random() * (max - min + 1)) + min,
  tax: () => Math.floor(Math.random() * 25) + 1,
  discount: () => Math.floor(Math.random() * 66) + 10, // 10-75%
  markup: () => Math.floor(Math.random() * 186) + 15, // 15-200%
  commission: () => Math.floor(Math.random() * 18) + 3, // 3-20%
  interest: () => Math.floor(Math.random() * 14) + 2, // 2-15%
  percentChange: () => Math.floor(Math.random() * 76) + 5, // 5-80%
  smallItem: () => Math.floor(Math.random() * 136) + 15, // $15-150
  mediumItem: () => Math.floor(Math.random() * 421) + 80, // $80-500
  largeItem: () => Math.floor(Math.random() * 1001) + 200, // $200-1200
  salary: () => Math.floor(Math.random() * 401) + 200, // $200-600
  sales: () => Math.floor(Math.random() * 2601) + 400, // $400-3000
  loan: () => Math.floor(Math.random() * 4501) + 500, // $500-5000
  finalMoney: () => Math.floor(Math.random() * 150001) + 50000, // $50k-200k
  finalPopulation: () => Math.floor(Math.random() * 1501) + 500, // 500-2000
  years: () => Math.floor(Math.random() * 7) + 2, // 2-8 years
};

// Round to 2 decimal places
const round = (num) => Math.round(num * 100) / 100;

// LEVEL 1: Percent ↔ Decimal Conversion (20 problems)
export const generateLevel1Bank = () => {
  const problems = [];

  // Percent to decimal conversion bank (expanded & randomized)
  const percentPool = [
    0.5, 1, 2.5, 3, 4, 5, 6, 7.5, 8, 10,
    12, 15, 18, 20, 25, 30, 33, 40, 45, 50,
    60, 66, 75, 80, 90, 99, 100, 110, 125, 150
  ];

  // Shuffle and select 20 distinct values each playthrough
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

// LEVEL 2: Increase/Decrease/No Change (12 scenarios, randomized values)
export const generateLevel2Problem = (playerData) => {
  const scenarios = [
    {
      template: (v) => `Weapons marked up ${v}%. Does the price increase or decrease?`,
      answer: 'increase',
      getValue: () => random.markup()
    },
    {
      template: (v) => `Zombie repellent discounted ${v}%. Does your cost increase or decrease?`,
      answer: 'decrease',
      getValue: () => random.discount()
    },
    {
      template: (v) => `Sales tax is ${v}%. Does your total increase or decrease?`,
      answer: 'increase',
      getValue: () => random.tax()
    },
    {
      template: (v) => `You earn ${v}% commission on trades. Does your income increase or decrease?`,
      answer: 'increase',
      getValue: () => random.commission()
    },
    {
      template: (v) => `Antidote marked down ${v}%. Does the price increase or decrease?`,
      answer: 'decrease',
      getValue: () => random.discount()
    },
    {
      template: (v) => `You tip ${v}% on shelter fees. Does the amount you pay increase or decrease?`,
      answer: 'increase',
      getValue: () => random.percent(15, 25)
    },
    {
      template: (v) => `Interest of ${v}% is charged on a loan. Does what you owe increase or decrease?`,
      answer: 'increase',
      getValue: () => random.interest()
    },
    {
      template: (v) => `Population decreased by ${v}% after zombie wave. Did it increase or decrease?`,
      answer: 'decrease',
      getValue: () => random.percentChange()
    },
    {
      template: (v) => `${playerData.friendName} raises prices by ${v}%. Does the cost increase or decrease?`,
      answer: 'increase',
      getValue: () => random.markup()
    },
    {
      template: (v) => `Barricade materials on sale for ${v}% off. Does the price increase or decrease?`,
      answer: 'decrease',
      getValue: () => random.discount()
    },
    {
      template: (v) => `${playerData.cityName} charges ${v}% tax on all trades. Does your total increase or decrease?`,
      answer: 'increase',
      getValue: () => random.tax()
    },
    {
      template: (v) => `Shelter costs drop by ${v}%. Does the price increase or decrease?`,
      answer: 'decrease',
      getValue: () => random.percentChange()
    }
  ];
  
  return scenarios.map(s => {
    const value = s.getValue();
    const correct = s.answer;
    return {
      question: s.template(value),
      correctAnswer: correct,
      answer: correct,
      choices: ['increase', 'decrease'],
      type: 'multiple-choice'
    };
  });
};

// LEVEL 3: Calculate the Amount (12 scenarios, randomized values with MORE zombie theme)
export const generateLevel3Problem = (playerData) => {
  const scenarios = [
    {
      template: (price, tax) => `Crossbow costs $${price}. Sales tax is ${tax}%. How much is the TAX? (Round to nearest cent)`,
      getAnswer: (price, tax) => round(price * tax / 100).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), tax: random.tax() })
    },
    {
      template: (price, discount) => `Zombie antidote marked down ${discount}% from $${price}. How much do you SAVE? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price * discount / 100).toFixed(2),
      getValue: () => ({ price: random.smallItem(), discount: random.discount() })
    },
    {
      template: (sales, comm) => `You earn ${comm}% commission on $${sales} in weapon trades. How much COMMISSION? (Round to nearest cent)`,
      getAnswer: (sales, comm) => round(sales * comm / 100).toFixed(2),
      getValue: () => ({ sales: random.sales(), comm: random.commission() })
    },
    {
      template: (price, tip) => `Rations cost $${price}. You tip ${tip}%. How much is the TIP? (Round to nearest cent)`,
      getAnswer: (price, tip) => round(price * tip / 100).toFixed(2),
      getValue: () => ({ price: random.smallItem(), tip: random.percent(15, 25) })
    },
    {
      template: (price, markup) => `Flamethrower marked up ${markup}% from $${price}. How much was the MARKUP? (Round to nearest cent)`,
      getAnswer: (price, markup) => round(price * markup / 100).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), markup: random.markup() })
    },
    {
      template: (principal, rate, years) => `You borrowed $${principal} at ${rate}% simple interest for ${years} years. How much INTEREST? (Round to nearest cent)`,
      getAnswer: (principal, rate, years) => round(principal * rate / 100 * years).toFixed(2),
      getValue: () => ({ principal: random.loan(), rate: random.interest(), years: random.years() })
    },
    {
      template: (price, tax) => `Safe house rental is $${price}. Tax is ${tax}%. How much is the TAX? (Round to nearest cent)`,
      getAnswer: (price, tax) => round(price * tax / 100).toFixed(2),
      getValue: () => ({ price: random.largeItem(), tax: random.tax() })
    },
    {
      template: (price, discount) => `Survival kit discounted ${discount}% from $${price}. How much do you SAVE? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price * discount / 100).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), discount: random.discount() })
    },
    {
      template: (sales, comm) => `${playerData.friendName} earns ${comm}% commission on $${sales}. How much COMMISSION? (Round to nearest cent)`,
      getAnswer: (sales, comm) => round(sales * comm / 100).toFixed(2),
      getValue: () => ({ sales: random.sales(), comm: random.commission() })
    },
    {
      template: (price, tip) => `Meal is $${price}. You leave ${tip}% tip. How much is the TIP? (Round to nearest cent)`,
      getAnswer: (price, tip) => round(price * tip / 100).toFixed(2),
      getValue: () => ({ price: random.smallItem(), tip: random.percent(15, 25) })
    },
    {
      template: (price, markup) => `Fuel marked up ${markup}% from $${price}. How much was the MARKUP? (Round to nearest cent)`,
      getAnswer: (price, markup) => round(price * markup / 100).toFixed(2),
      getValue: () => ({ price: random.percent(2, 5), markup: random.markup() })
    },
    {
      template: (price, discount) => `${playerData.cityName} supplies reduced ${discount}% from $${price}. How much SAVED? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price * discount / 100).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), discount: random.discount() })
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValue();
    const valuesArray = Object.values(values);
    return {
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response'
    };
  });
};

// LEVEL 4: Two-Step Calculations (10 scenarios)
export const generateLevel4Problem = (playerData) => {
  const scenarios = [
    {
      template: (price, discount, tax) => `Weapon is $${price}. Discount is ${discount}%. Tax is ${tax}%. What's the FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (price, discount, tax) => {
        const afterDiscount = price - (price * discount / 100);
        const final = afterDiscount + (afterDiscount * tax / 100);
        return round(final).toFixed(2);
      },
      getValue: () => ({ price: random.mediumItem(), discount: random.discount(), tax: random.tax() })
    },
    {
      template: (price, markup, discount) => `Supplies cost $${price}, marked up ${markup}%, then discounted ${discount}%. FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (price, markup, discount) => {
        const afterMarkup = price + (price * markup / 100);
        const final = afterMarkup - (afterMarkup * discount / 100);
        return round(final).toFixed(2);
      },
      getValue: () => ({ price: random.smallItem(), markup: random.markup(), discount: random.discount() })
    },
    {
      template: (salary, comm, sales) => `${playerData.friendName}'s salary is $${salary} + ${comm}% commission on $${sales}. TOTAL EARNED? (Round to nearest cent)`,
      getAnswer: (salary, comm, sales) => {
        const commAmount = sales * comm / 100;
        const total = salary + commAmount;
        return round(total).toFixed(2);
      },
      getValue: () => ({ salary: random.salary(), comm: random.commission(), sales: random.sales() })
    },
    {
      template: (price, tax, tip) => `Meal costs $${price}. Tax is ${tax}%. You tip ${tip}% on the total. HOW MUCH TOTAL? (Round to nearest cent)`,
      getAnswer: (price, tax, tip) => {
        const afterTax = price + (price * tax / 100);
        const final = afterTax + (afterTax * tip / 100);
        return round(final).toFixed(2);
      },
      getValue: () => ({ price: random.smallItem(), tax: random.tax(), tip: random.percent(15, 25) })
    },
    {
      template: (principal, rate1, rate2, years) => `Borrowed $${principal}. First ${years} years at ${rate1}%, next ${years} years at ${rate2}%. TOTAL INTEREST? (Round to nearest cent)`,
      getAnswer: (principal, rate1, rate2, years) => {
        const interest1 = principal * rate1 / 100 * years;
        const interest2 = principal * rate2 / 100 * years;
        return round(interest1 + interest2).toFixed(2);
      },
      getValue: () => ({ principal: random.loan(), rate1: random.interest(), rate2: random.interest(), years: random.years() / 2 })
    },
    {
      template: (price, discount, tax) => `Armor costs $${price}, ${discount}% off, plus ${tax}% tax on discounted price. FINAL? (Round to nearest cent)`,
      getAnswer: (price, discount, tax) => {
        const afterDiscount = price - (price * discount / 100);
        const final = afterDiscount + (afterDiscount * tax / 100);
        return round(final).toFixed(2);
      },
      getValue: () => ({ price: random.mediumItem(), discount: random.discount(), tax: random.tax() })
    },
    {
      template: (price, markup, tax) => `Supplies marked up ${markup}% from $${price}, then ${tax}% tax added. FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (price, markup, tax) => {
        const afterMarkup = price + (price * markup / 100);
        const final = afterMarkup + (afterMarkup * tax / 100);
        return round(final).toFixed(2);
      },
      getValue: () => ({ price: random.smallItem(), markup: random.markup(), tax: random.tax() })
    },
    {
      template: (salary, comm, sales) => `Salary $${salary}, ${comm}% commission on $${sales}. TOTAL INCOME? (Round to nearest cent)`,
      getAnswer: (salary, comm, sales) => {
        const commAmount = sales * comm / 100;
        return round(salary + commAmount).toFixed(2);
      },
      getValue: () => ({ salary: random.salary(), comm: random.commission(), sales: random.sales() })
    },
    {
      template: (pop, dec1, dec2) => `${playerData.cityName} had ${pop} people. Lost ${dec1}% in wave 1, then ${dec2}% of survivors in wave 2. HOW MANY LEFT? (Round down)`,
      getAnswer: (pop, dec1, dec2) => {
        const afterWave1 = pop - (pop * dec1 / 100);
        const afterWave2 = afterWave1 - (afterWave1 * dec2 / 100);
        return Math.floor(afterWave2).toString();
      },
      getValue: () => ({ pop: random.finalPopulation(), dec1: random.percentChange(), dec2: random.percentChange() })
    },
    {
      template: (price, discount, tax) => `Item $${price}, ${discount}% discount, ${tax}% tax on sale price. FINAL? (Round to nearest cent)`,
      getAnswer: (price, discount, tax) => {
        const afterDiscount = price - (price * discount / 100);
        const final = afterDiscount + (afterDiscount * tax / 100);
        return round(final).toFixed(2);
      },
      getValue: () => ({ price: random.mediumItem(), discount: random.discount(), tax: random.tax() })
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValue();
    const valuesArray = Object.values(values);
    return {
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response'
    };
  });
};

// LEVEL 5: Multi-Step Problems (SIMPLIFIED - single unwinding step)
export const generateLevel5Problem = (playerData) => {
  const scenarios = [
    {
      template: (finalPrice, discount) => `Weapon costs $${finalPrice} AFTER ${discount}% discount. What was ORIGINAL price? (Round to nearest cent)`,
      getAnswer: (finalPrice, discount) => {
        const original = finalPrice / (1 - discount / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.mediumItem();
        const discount = random.discount();
        const finalPrice = round(original - (original * discount / 100));
        return { finalPrice, discount };
      }
    },
    {
      template: (finalPrice, markup) => `Supplies cost $${finalPrice} AFTER ${markup}% markup. What was ORIGINAL price? (Round to nearest cent)`,
      getAnswer: (finalPrice, markup) => {
        const original = finalPrice / (1 + markup / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.smallItem();
        const markup = random.markup();
        const finalPrice = round(original + (original * markup / 100));
        return { finalPrice, markup };
      }
    },
    {
      template: (finalPop, increase) => `${playerData.cityName} has ${finalPop} survivors AFTER ${increase}% increase. ORIGINAL population? (Round to nearest whole)`,
      getAnswer: (finalPop, increase) => {
        const original = finalPop / (1 + increase / 100);
        return Math.round(original).toString();
      },
      getValue: () => {
        const original = random.finalPopulation();
        const increase = random.percentChange();
        const finalPop = Math.round(original + (original * increase / 100));
        return { finalPop, increase };
      }
    },
    {
      template: (total, salary, comm) => `You earned $${total} (salary $${salary} + ${comm}% commission). How much in SALES? (Round to nearest cent)`,
      getAnswer: (total, salary, comm) => {
        const commAmount = total - salary;
        const sales = commAmount / (comm / 100);
        return round(sales).toFixed(2);
      },
      getValue: () => {
        const salary = random.salary();
        const comm = random.commission();
        const sales = random.sales();
        const total = round(salary + (sales * comm / 100));
        return { total, salary, comm };
      }
    },
    {
      template: (finalPrice, tax) => `Total is $${finalPrice} AFTER ${tax}% tax. Price BEFORE tax? (Round to nearest cent)`,
      getAnswer: (finalPrice, tax) => {
        const original = finalPrice / (1 + tax / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.mediumItem();
        const tax = random.tax();
        const finalPrice = round(original + (original * tax / 100));
        return { finalPrice, tax };
      }
    },
    {
      template: (finalPop, decrease) => `After outbreak, ${finalPop} survivors remain (${decrease}% decrease). ORIGINAL population? (Round to nearest whole)`,
      getAnswer: (finalPop, decrease) => {
        const original = finalPop / (1 - decrease / 100);
        return Math.round(original).toString();
      },
      getValue: () => {
        const original = random.finalPopulation();
        const decrease = random.percentChange();
        const finalPop = Math.round(original - (original * decrease / 100));
        return { finalPop, decrease };
      }
    },
    {
      template: (finalPrice, discount) => `Antidote costs $${finalPrice} AFTER ${discount}% discount. ORIGINAL price? (Round to nearest cent)`,
      getAnswer: (finalPrice, discount) => {
        const original = finalPrice / (1 - discount / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.smallItem();
        const discount = random.discount();
        const finalPrice = round(original - (original * discount / 100));
        return { finalPrice, discount };
      }
    },
    {
      template: (total, salary, comm) => `${playerData.friendName} earned $${total} ($${salary} salary + ${comm}% commission). SALES amount? (Round to nearest cent)`,
      getAnswer: (total, salary, comm) => {
        const commAmount = total - salary;
        const sales = commAmount / (comm / 100);
        return round(sales).toFixed(2);
      },
      getValue: () => {
        const salary = random.salary();
        const comm = random.commission();
        const sales = random.sales();
        const total = round(salary + (sales * comm / 100));
        return { total, salary, comm };
      }
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValue();
    const valuesArray = Object.values(values);
    return {
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response'
    };
  });
};

// LEVEL 6: Working Backwards (12 scenarios) - IMPROVED WORDING
export const generateLevel6Problem = (playerData) => {
  const scenarios = [
    {
      template: (finalPrice, discount) => `Shelter costs $${finalPrice} AFTER a ${discount}% discount was applied. What was the price BEFORE the discount? (Round to nearest cent)`,
      getAnswer: (finalPrice, discount) => {
        const original = finalPrice / (1 - discount / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.largeItem();
        const discount = random.discount();
        const finalPrice = round(original - (original * discount / 100));
        return { finalPrice, discount };
      }
    },
    {
      template: (finalPrice, tax) => `You paid $${finalPrice} AFTER ${tax}% sales tax was added. What was the price BEFORE tax? (Round to nearest cent)`,
      getAnswer: (finalPrice, tax) => {
        const original = finalPrice / (1 + tax / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.mediumItem();
        const tax = random.tax();
        const finalPrice = round(original + (original * tax / 100));
        return { finalPrice, tax };
      }
    },
    {
      template: (total, salary, comm) => `${playerData.friendName} earned $${total} TOTAL (this includes a base salary of $${salary} plus ${comm}% commission). How much were the SALES? (Round to nearest cent)`,
      getAnswer: (total, salary, comm) => {
        const commAmount = total - salary;
        const sales = commAmount / (comm / 100);
        return round(sales).toFixed(2);
      },
      getValue: () => {
        const salary = random.salary();
        const comm = random.commission();
        const sales = random.sales();
        const total = round(salary + (sales * comm / 100));
        return { total, salary, comm };
      }
    },
    {
      template: (finalPrice, markup) => `Weapon costs $${finalPrice} AFTER a ${markup}% markup was added. What was the ORIGINAL COST before markup? (Round to nearest cent)`,
      getAnswer: (finalPrice, markup) => {
        const original = finalPrice / (1 + markup / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.mediumItem();
        const markup = random.markup();
        const finalPrice = round(original + (original * markup / 100));
        return { finalPrice, markup };
      }
    },
    {
      template: (totalOwed, rate, years) => `You owe $${totalOwed} TOTAL after borrowing money at ${rate}% simple interest for ${years} years. How much did you BORROW originally? (Round to nearest cent)`,
      getAnswer: (totalOwed, rate, years) => {
        const principal = totalOwed / (1 + (rate / 100 * years));
        return round(principal).toFixed(2);
      },
      getValue: () => {
        const principal = random.loan();
        const rate = random.interest();
        const years = random.years();
        const totalOwed = round(principal + (principal * rate / 100 * years));
        return { totalOwed, rate, years };
      }
    },
    {
      template: (finalPrice, discount) => `Medicine costs $${finalPrice} AFTER ${discount}% discount. What was ORIGINAL PRICE before discount? (Round to nearest cent)`,
      getAnswer: (finalPrice, discount) => {
        const original = finalPrice / (1 - discount / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.smallItem();
        const discount = random.discount();
        const finalPrice = round(original - (original * discount / 100));
        return { finalPrice, discount };
      }
    },
    {
      template: (finalPop, increase) => `${playerData.cityName} population is ${finalPop} AFTER a ${increase}% increase. What was ORIGINAL population? (Round to nearest whole number)`,
      getAnswer: (finalPop, increase) => {
        const original = finalPop / (1 + increase / 100);
        return Math.round(original).toString();
      },
      getValue: () => {
        const original = random.finalPopulation();
        const increase = random.percentChange();
        const finalPop = Math.round(original + (original * increase / 100));
        return { finalPop, increase };
      }
    },
    {
      template: (finalPrice, markup) => `Supplies cost $${finalPrice} AFTER ${markup}% markup. What was ORIGINAL price before markup? (Round to nearest cent)`,
      getAnswer: (finalPrice, markup) => {
        const original = finalPrice / (1 + markup / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.mediumItem();
        const markup = random.markup();
        const finalPrice = round(original + (original * markup / 100));
        return { finalPrice, markup };
      }
    },
    {
      template: (total, salary, comm) => `You earned $${total} TOTAL (base salary $${salary} + ${comm}% commission). How much in SALES? (Round to nearest cent)`,
      getAnswer: (total, salary, comm) => {
        const commAmount = total - salary;
        const sales = commAmount / (comm / 100);
        return round(sales).toFixed(2);
      },
      getValue: () => {
        const salary = random.salary();
        const comm = random.commission();
        const sales = random.sales();
        const total = round(salary + (sales * comm / 100));
        return { total, salary, comm };
      }
    },
    {
      template: (finalPrice, discount) => `Antidote costs $${finalPrice} AFTER ${discount}% off. What was ORIGINAL price? (Round to nearest cent)`,
      getAnswer: (finalPrice, discount) => {
        const original = finalPrice / (1 - discount / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.smallItem();
        const discount = random.discount();
        const finalPrice = round(original - (original * discount / 100));
        return { finalPrice, discount };
      }
    },
    {
      template: (finalPrice, tax) => `AFTER ${tax}% tax added, total is $${finalPrice}. What was price BEFORE tax? (Round to nearest cent)`,
      getAnswer: (finalPrice, tax) => {
        const original = finalPrice / (1 + tax / 100);
        return round(original).toFixed(2);
      },
      getValue: () => {
        const original = random.mediumItem();
        const tax = random.tax();
        const finalPrice = round(original + (original * tax / 100));
        return { finalPrice, tax };
      }
    },
    {
      template: (finalPop, decrease) => `After outbreak, ${finalPop} survivors remain (this is AFTER a ${decrease}% decrease). What was ORIGINAL population? (Round to nearest whole number)`,
      getAnswer: (finalPop, decrease) => {
        const original = finalPop / (1 - decrease / 100);
        return Math.round(original).toString();
      },
      getValue: () => {
        const original = random.finalPopulation();
        const decrease = random.percentChange();
        const finalPop = Math.round(original - (original * decrease / 100));
        return { finalPop, decrease };
      }
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValue();
    const valuesArray = Object.values(values);
    return {
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      answer: s.getAnswer(...valuesArray),
      type: 'free-response'
    };
  });
};

// LEVEL 7: The Final Calculation - CRITICAL FIX: Round DOWN people!
export const generateLevel7Problem = (playerData) => {
  const initialPop = random.finalPopulation();
  const decrease = random.percentChange();
  const increase = random.percentChange();
  const moneyPool = random.finalMoney();
  const interestRate = random.interest();
  const years = random.years();
  
  // Calculate step by step - ROUND DOWN for people (can't have partial people!)
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
    showWork: {
      initialPop,
      decrease,
      afterDecrease,
      increase,
      finalPopulation,
      moneyPool,
      interestRate,
      years,
      totalMoney: round(totalMoney).toFixed(2),
      perPerson: round(perPerson).toFixed(2)
    },
    requiresWholeNumber: true, // Flag for validation
    populationWarning: "Remember: You can't have a partial person! If calculations result in decimals, round DOWN. A partial person means the zombies got them!"
  };
};
