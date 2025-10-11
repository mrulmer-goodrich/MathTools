// Helper function to find GCD (Greatest Common Divisor)
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Helper function to reduce a fraction
export function reduceFraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return {
    num: numerator / divisor,
    den: denominator / divisor
  };
}

// Helper function to convert fraction to decimal with smart rounding
export function fractionToDecimal(num, den, maxPlaces = 2) {
  const value = num / den;
  
  // Check if it's a nice decimal (0.5, 0.25, 0.2, etc.)
  const rounded1 = Math.round(value * 10) / 10;
  const rounded2 = Math.round(value * 100) / 100;
  
  if (Math.abs(value - rounded1) < 0.001) {
    return rounded1;
  } else if (Math.abs(value - rounded2) < 0.001) {
    return rounded2;
  }
  
  return parseFloat(value.toFixed(maxPlaces));
}
