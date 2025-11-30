// Zombie Apocalypse - Problem Generators with Randomization

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
  
  // 10 percent to decimal
  const percents = [4, 8, 12, 15, 25, 30, 50, 75, 125, 0.5, 2.5, 7.5, 99, 100, 3, 6, 18, 45, 60, 150];
  percents.forEach(p => {
    problems.push({
      question: `Convert ${p}% to a decimal`,
      correctAnswer: (p / 100).toString(),
      type: 'percent-to-decimal'
    });
  });
  
  return problems.slice(0, 20); // Take first 20
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
      template: (v) => `Food discounted ${v}%. Does your cost increase or decrease?`,
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
      template: (v) => `Medical supplies marked down ${v}%. Does the price increase or decrease?`,
      answer: 'decrease',
      getValue: () => random.discount()
    },
    {
      template: (v) => `You tip ${v}% on ${playerData.favoriteFood || 'food'}. Does the amount you pay increase or decrease?`,
      answer: 'increase',
      getValue: () => random.percent(15, 25)
    },
    {
      template: (v) => `Interest of ${v}% is charged on a loan. Does what you owe increase or decrease?`,
      answer: 'increase',
      getValue: () => random.interest()
    },
    {
      template: (v) => `Population decreased by ${v}% after the outbreak. Did it increase or decrease?`,
      answer: 'decrease',
      getValue: () => random.percentChange()
    },
    {
      template: (v) => `${playerData.friendName} raises prices by ${v}%. Does the cost increase or decrease?`,
      answer: 'increase',
      getValue: () => random.markup()
    },
    {
      template: (v) => `Ammunition is on sale for ${v}% off. Does the price increase or decrease?`,
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
  
  return scenarios.map(s => ({
    question: s.template(s.getValue()),
    correctAnswer: s.answer,
    choices: ['increase', 'decrease'],
    type: 'multiple-choice'
  }));
};

// LEVEL 3: Calculate the Amount (12 scenarios, randomized values)
export const generateLevel3Problem = (playerData) => {
  const scenarios = [
    {
      template: (price, tax) => `Weapons cost $${price}. Sales tax is ${tax}%. How much is the TAX? (Round to nearest cent)`,
      getAnswer: (price, tax) => round(price * tax / 100).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), tax: random.tax() })
    },
    {
      template: (price, discount) => `Medicine marked down ${discount}% from $${price}. How much do you SAVE? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price * discount / 100).toFixed(2),
      getValue: () => ({ price: random.smallItem(), discount: random.discount() })
    },
    {
      template: (sales, comm) => `You earn ${comm}% commission on $${sales} in trades. How much COMMISSION? (Round to nearest cent)`,
      getAnswer: (sales, comm) => round(sales * comm / 100).toFixed(2),
      getValue: () => ({ sales: random.sales(), comm: random.commission() })
    },
    {
      template: (price, tip) => `${playerData.favoriteFood} costs $${price}. You tip ${tip}%. How much is the TIP? (Round to nearest cent)`,
      getAnswer: (price, tip) => round(price * tip / 100).toFixed(2),
      getValue: () => ({ price: random.smallItem(), tip: random.percent(15, 25) })
    },
    {
      template: (price, markup) => `Ammo marked up ${markup}% from $${price}. How much was the MARKUP? (Round to nearest cent)`,
      getAnswer: (price, markup) => round(price * markup / 100).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), markup: random.markup() })
    },
    {
      template: (principal, rate, years) => `You borrowed $${principal} at ${rate}% simple interest for ${years} years. How much INTEREST? (Round to nearest cent)`,
      getAnswer: (principal, rate, years) => round(principal * rate / 100 * years).toFixed(2),
      getValue: () => ({ principal: random.loan(), rate: random.interest(), years: random.years() })
    },
    {
      template: (price, tax) => `Shelter costs $${price}. Tax is ${tax}%. How much is the TAX? (Round to nearest cent)`,
      getAnswer: (price, tax) => round(price * tax / 100).toFixed(2),
      getValue: () => ({ price: random.largeItem(), tax: random.tax() })
    },
    {
      template: (price, discount) => `Supplies discounted ${discount}% from $${price}. How much do you SAVE? (Round to nearest cent)`,
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
      template: (price, markup) => `Gas marked up ${markup}% from $${price}. How much was the MARKUP? (Round to nearest cent)`,
      getAnswer: (price, markup) => round(price * markup / 100).toFixed(2),
      getValue: () => ({ price: random.percent(2, 5), markup: random.markup() })
    },
    {
      template: (price, discount) => `${playerData.cityName} supplies reduced ${discount}% from $${price}. How much SAVED? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price * discount / 100).toFixed(2),
      getValue: () => ({ price: random.largeItem(), discount: random.discount() })
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValue();
    const valuesArray = Object.values(values);
    return {
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      type: 'free-response'
    };
  });
};

// LEVEL 4: Final Costs (12 scenarios, randomized values)
export const generateLevel4Problem = (playerData) => {
  const scenarios = [
    {
      template: (price, tax) => `Food costs $${price}. Sales tax is ${tax}%. What's your TOTAL COST? (Round to nearest cent)`,
      getAnswer: (price, tax) => round(price + (price * tax / 100)).toFixed(2),
      getValue: () => ({ price: random.smallItem(), tax: random.tax() })
    },
    {
      template: (price, discount) => `Shelter normally $${price}, now ${discount}% off. What's the SALE PRICE? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price - (price * discount / 100)).toFixed(2),
      getValue: () => ({ price: random.largeItem(), discount: random.discount() })
    },
    {
      template: (salary, comm, sales) => `Trader earns $${salary}/week plus ${comm}% commission on $${sales}. What's TOTAL INCOME? (Round to nearest cent)`,
      getAnswer: (salary, comm, sales) => round(salary + (sales * comm / 100)).toFixed(2),
      getValue: () => ({ salary: random.salary(), comm: random.commission(), sales: random.sales() })
    },
    {
      template: (price, tip) => `${playerData.favoriteFood} costs $${price}. You leave ${tip}% tip. What's the TOTAL you pay? (Round to nearest cent)`,
      getAnswer: (price, tip) => round(price + (price * tip / 100)).toFixed(2),
      getValue: () => ({ price: random.smallItem(), tip: random.percent(15, 25) })
    },
    {
      template: (price, markup) => `Gas is $${price}/gallon, marked up ${markup}%. What's the NEW PRICE? (Round to nearest cent)`,
      getAnswer: (price, markup) => round(price + (price * markup / 100)).toFixed(2),
      getValue: () => ({ price: random.percent(2, 5), markup: random.markup() })
    },
    {
      template: (principal, rate, years) => `Borrowed $${principal} at ${rate}% simple interest for ${years} years. What's the TOTAL you pay back? (Round to nearest cent)`,
      getAnswer: (principal, rate, years) => round(principal + (principal * rate / 100 * years)).toFixed(2),
      getValue: () => ({ principal: random.loan(), rate: random.interest(), years: random.years() })
    },
    {
      template: (price, tax) => `Weapons cost $${price}. Tax is ${tax}%. What's the TOTAL COST? (Round to nearest cent)`,
      getAnswer: (price, tax) => round(price + (price * tax / 100)).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), tax: random.tax() })
    },
    {
      template: (price, discount) => `Medicine $${price}, on sale ${discount}% off. What's the SALE PRICE? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price - (price * discount / 100)).toFixed(2),
      getValue: () => ({ price: random.smallItem(), discount: random.discount() })
    },
    {
      template: (salary, comm, sales) => `${playerData.friendName} earns $${salary}/week + ${comm}% on $${sales}. TOTAL INCOME? (Round to nearest cent)`,
      getAnswer: (salary, comm, sales) => round(salary + (sales * comm / 100)).toFixed(2),
      getValue: () => ({ salary: random.salary(), comm: random.commission(), sales: random.sales() })
    },
    {
      template: (price, tip) => `Meal is $${price}. ${tip}% tip. What's the TOTAL? (Round to nearest cent)`,
      getAnswer: (price, tip) => round(price + (price * tip / 100)).toFixed(2),
      getValue: () => ({ price: random.smallItem(), tip: random.percent(15, 25) })
    },
    {
      template: (price, markup) => `Supplies cost $${price}, marked up ${markup}%. NEW PRICE? (Round to nearest cent)`,
      getAnswer: (price, markup) => round(price + (price * markup / 100)).toFixed(2),
      getValue: () => ({ price: random.mediumItem(), markup: random.markup() })
    },
    {
      template: (price, discount) => `${playerData.cityName} gear $${price}, ${discount}% off. SALE PRICE? (Round to nearest cent)`,
      getAnswer: (price, discount) => round(price - (price * discount / 100)).toFixed(2),
      getValue: () => ({ price: random.largeItem(), discount: random.discount() })
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValue();
    const valuesArray = Object.values(values);
    return {
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      type: 'free-response'
    };
  });
};

// LEVEL 5: Two-Step Problems (12 scenarios)
export const generateLevel5Problem = (playerData) => {
  const scenarios = [
    {
      template: (price, discount, tax) => `Weapon costs $${price}, marked down ${discount}%. Then ${tax}% sales tax is added. What's your FINAL COST? (Round to nearest cent)`,
      getAnswer: (price, discount, tax) => {
        const afterDiscount = price - (price * discount / 100);
        return round(afterDiscount + (afterDiscount * tax / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.mediumItem(), discount: random.discount(), tax: random.tax() })
    },
    {
      template: (price, tip, tax) => `Meal is $${price}. You leave ${tip}% tip, then add ${tax}% tax to the meal+tip. What's the TOTAL? (Round to nearest cent)`,
      getAnswer: (price, tip, tax) => {
        const withTip = price + (price * tip / 100);
        return round(withTip + (withTip * tax / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.smallItem(), tip: random.percent(15, 25), tax: random.tax() })
    },
    {
      template: (price, markup, discount) => `Supplies cost $${price}, marked up ${markup}%, then put on sale for ${discount}% off. What's the FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (price, markup, discount) => {
        const afterMarkup = price + (price * markup / 100);
        return round(afterMarkup - (afterMarkup * discount / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.mediumItem(), markup: random.markup(), discount: random.discount() })
    },
    {
      template: (salary, comm, sales, fees) => `Trader earns $${salary}/week + ${comm}% commission. This week sold $${sales}, then spent $${fees} on fees. What's NET INCOME? (Round to nearest cent)`,
      getAnswer: (salary, comm, sales, fees) => {
        const income = salary + (sales * comm / 100);
        return round(income - fees).toFixed(2);
      },
      getValue: () => ({ salary: random.salary(), comm: random.commission(), sales: random.sales(), fees: random.percent(50, 150) })
    },
    {
      template: (price, discount, tax) => `${playerData.favoriteFood} costs $${price}, ${discount}% discount, then ${tax}% tax. FINAL COST? (Round to nearest cent)`,
      getAnswer: (price, discount, tax) => {
        const afterDiscount = price - (price * discount / 100);
        return round(afterDiscount + (afterDiscount * tax / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.smallItem(), discount: random.discount(), tax: random.tax() })
    },
    {
      template: (price, markup, discount) => `Gas $${price}, marked up ${markup}%, then ${discount}% sale. FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (price, markup, discount) => {
        const afterMarkup = price + (price * markup / 100);
        return round(afterMarkup - (afterMarkup * discount / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.percent(2, 5), markup: random.markup(), discount: random.discount() })
    },
    {
      template: (price, discount, tax) => `Shelter $${price}, ${discount}% off, then ${tax}% tax. TOTAL? (Round to nearest cent)`,
      getAnswer: (price, discount, tax) => {
        const afterDiscount = price - (price * discount / 100);
        return round(afterDiscount + (afterDiscount * tax / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.largeItem(), discount: random.discount(), tax: random.tax() })
    },
    {
      template: (price, markup, tax) => `Medicine $${price}, marked up ${markup}%, then ${tax}% tax. FINAL COST? (Round to nearest cent)`,
      getAnswer: (price, markup, tax) => {
        const afterMarkup = price + (price * markup / 100);
        return round(afterMarkup + (afterMarkup * tax / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.smallItem(), markup: random.markup(), tax: random.tax() })
    },
    {
      template: (price, discount1, discount2) => `Weapons $${price}, ${discount1}% off, then ANOTHER ${discount2}% off the sale price. FINAL? (Round to nearest cent)`,
      getAnswer: (price, discount1, discount2) => {
        const after1 = price - (price * discount1 / 100);
        return round(after1 - (after1 * discount2 / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.mediumItem(), discount1: random.discount(), discount2: random.percent(10, 40) })
    },
    {
      template: (salary, comm, sales, bonus) => `${playerData.friendName} earns $${salary} + ${comm}% on $${sales}, plus $${bonus} bonus. TOTAL? (Round to nearest cent)`,
      getAnswer: (salary, comm, sales, bonus) => {
        return round(salary + (sales * comm / 100) + bonus).toFixed(2);
      },
      getValue: () => ({ salary: random.salary(), comm: random.commission(), sales: random.sales(), bonus: random.percent(50, 200) })
    },
    {
      template: (price, discount, tax) => `${playerData.cityName} supplies $${price}, ${discount}% off, then ${tax}% tax. FINAL? (Round to nearest cent)`,
      getAnswer: (price, discount, tax) => {
        const afterDiscount = price - (price * discount / 100);
        return round(afterDiscount + (afterDiscount * tax / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.largeItem(), discount: random.discount(), tax: random.tax() })
    },
    {
      template: (price, markup, discount) => `Ammo $${price}, up ${markup}%, then ${discount}% sale. FINAL PRICE? (Round to nearest cent)`,
      getAnswer: (price, markup, discount) => {
        const afterMarkup = price + (price * markup / 100);
        return round(afterMarkup - (afterMarkup * discount / 100)).toFixed(2);
      },
      getValue: () => ({ price: random.mediumItem(), markup: random.markup(), discount: random.discount() })
    }
  ];
  
  return scenarios.map(s => {
    const values = s.getValue();
    const valuesArray = Object.values(values);
    return {
      question: s.template(...valuesArray),
      correctAnswer: s.getAnswer(...valuesArray),
      type: 'free-response'
    };
  });
};

// LEVEL 6: Backwards Problems (12 scenarios)
export const generateLevel6Problem = (playerData) => {
  const scenarios = [
    {
      template: (finalPrice, discount) => `After ${discount}% off, shelter costs $${finalPrice}. What was the ORIGINAL PRICE? (Round to nearest cent)`,
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
      template: (finalPop, decrease) => `Population is ${finalPop} after ${decrease}% decrease. What was the ORIGINAL population?`,
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
      template: (total, salary, comm) => `After earning ${comm}% commission, trader made $${total} total (includes $${salary} base salary). What were TOTAL SALES? (Round to nearest cent)`,
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
      template: (finalPrice, markup) => `After markup of ${markup}%, weapon costs $${finalPrice}. What was the ORIGINAL COST? (Round to nearest cent)`,
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
      template: (totalOwed, rate, years) => `You owe $${totalOwed} total after borrowing money at ${rate}% simple interest for ${years} years. How much did you BORROW? (Round to nearest cent)`,
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
      template: (finalPrice, discount) => `${playerData.favoriteFood} is $${finalPrice} after ${discount}% discount. ORIGINAL PRICE? (Round to nearest cent)`,
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
      template: (finalPop, increase) => `${playerData.cityName} population is ${finalPop} after ${increase}% increase. ORIGINAL? (Round to nearest whole number)`,
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
      template: (finalPrice, markup) => `Supplies cost $${finalPrice} after ${markup}% markup. ORIGINAL? (Round to nearest cent)`,
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
      template: (total, salary, comm) => `${playerData.friendName} earned $${total} ($${salary} salary + ${comm}% commission). SALES AMOUNT? (Round to nearest cent)`,
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
      template: (finalPrice, discount) => `Medicine $${finalPrice} after ${discount}% off. ORIGINAL? (Round to nearest cent)`,
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
      template: (finalPrice, tax) => `After ${tax}% tax, total is $${finalPrice}. What was price BEFORE tax? (Round to nearest cent)`,
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
      template: (finalPop, decrease) => `After outbreak, ${finalPop} survivors remain (${decrease}% decrease). ORIGINAL? (Round to nearest whole number)`,
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
      type: 'free-response'
    };
  });
};

// LEVEL 7: The Final Calculation
export const generateLevel7Problem = (playerData) => {
  const initialPop = random.finalPopulation();
  const decrease = random.percentChange();
  const increase = random.percentChange();
  const moneyPool = random.finalMoney();
  const interestRate = random.interest();
  const years = random.years();
  
  // Calculate step by step
  const afterDecrease = Math.round(initialPop * (1 - decrease / 100));
  const finalPopulation = Math.round(afterDecrease * (1 + increase / 100));
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
    }
  };
};
