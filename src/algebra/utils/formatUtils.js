// formatUtils.js - Utilities for proper math notation
// Location: src/algebra/utils/formatUtils.js

/**
 * Formats multiplication to use * instead of adjacent variables
 * Examples:
 *   "3x" stays "3x" 
 *   "x x" becomes "x * x"
 *   "-8 x x" becomes "-8 * x"
 *   "6 × 8" stays "6 × 8"
 */
export const formatMultiplication = (expression) => {
  if (!expression) return expression;
  
  // Replace "x x" with "x * x" 
  let formatted = expression.replace(/\bx\s+x\b/g, 'x * x');
  
  // Replace "number x" with "number * x" (but keep coefficient notation like "3x")
  // This catches cases like "-8 x" but not "3x"
  formatted = formatted.replace(/(\d)\s+x\b/g, '$1 * x');
  
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
  formatStepWork,
  validateChoices
};
