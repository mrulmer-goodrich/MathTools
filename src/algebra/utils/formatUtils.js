// formatUtils.js - UPDATED: Use · (middot) for multiplication in algebra
// Location: src/algebra/utils/formatUtils.js

/**
 * Formats multiplication for algebra display
 * Uses · (middot) instead of × to avoid confusion with variable x
 * Examples:
 *   "3x" stays "3x" 
 *   "x x" becomes "x · x"
 *   "-8 x" becomes "-8x" (coefficient)
 *   "6 × 8" becomes "6 · 8"
 *   "-9 × -7" becomes "-9 · -7"
 */
export const formatMultiplication = (expression) => {
  if (!expression) return expression;
  
  let formatted = String(expression);
  
  // Replace × with · (middot) for all multiplications
  formatted = formatted.replace(/×/g, '·');
  
  // Replace "x x" with "x · x" 
  formatted = formatted.replace(/\bx\s+x\b/gi, 'x · x');
  
  // Clean up spacing around middot
  formatted = formatted.replace(/\s*·\s*/g, ' · ');
  
  return formatted;
};

/**
 * Validates that a value is not NaN
 * If NaN, returns a fallback value
 */
export const validateNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  console.warn('NaN detected, using fallback:', fallback);
  return fallback;
};

/**
 * Formats an answer choice for display
 * Handles NaN, infinity, and formatting
 */
export const formatAnswerChoice = (value) => {
  // Check for NaN
  if (value === null || value === undefined || 
      (typeof value === 'number' && isNaN(value))) {
    console.error('Invalid answer choice (NaN/null/undefined)');
    return 'Error';
  }
  
  // Check for infinity
  if (!isFinite(value) && typeof value === 'number') {
    return 'Undefined';
  }
  
  // Format multiplication notation
  if (typeof value === 'string') {
    return formatMultiplication(value);
  }
  
  return value;
};

/**
 * Formats problem display text
 * Converts × to · for algebra
 */
export const formatProblemText = (text) => {
  if (!text) return text;
  return formatMultiplication(text);
};

/**
 * Cleans up step-by-step work for display
 */
export const formatStepWork = (work) => {
  if (!work) return work;
  return formatMultiplication(work);
};

/**
 * Validates all choices in a problem
 * Filters out NaN and invalid values
 */
export const validateChoices = (choices) => {
  return choices.filter(choice => {
    // Allow strings
    if (typeof choice === 'string') return true;
    
    // Validate numbers
    if (typeof choice === 'number') {
      return !isNaN(choice) && isFinite(choice);
    }
    
    return false;
  });
};

export default {
  formatMultiplication,
  validateNumber,
  formatAnswerChoice,
  formatProblemText,
  formatStepWork,
  validateChoices
};
