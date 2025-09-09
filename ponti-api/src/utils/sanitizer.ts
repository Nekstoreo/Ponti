import validator from 'validator';

/**
 * Sanitizes input data to prevent XSS and other injection attacks
 */
export const sanitizeInput = (input: any): any => {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }

  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeString(key)] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

/**
 * Sanitizes a string value
 */
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }

  // Escape HTML entities to prevent XSS
  let sanitized = validator.escape(str);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
};

/**
 * Sanitizes email input
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') {
    return email;
  }

  return validator.normalizeEmail(email.trim()) || email.trim();
};

/**
 * Sanitizes numeric input
 */
export const sanitizeNumber = (value: any): number | null => {
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  if (typeof value === 'string') {
    const num = parseFloat(value.trim());
    return isNaN(num) ? null : num;
  }

  return null;
};

/**
 * Sanitizes boolean input
 */
export const sanitizeBoolean = (value: any): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return null;
};