// ============================================
// FILE 2: src/utils/validators.ts
// ============================================

import { APP_CONFIG } from './constants';

/**
 * Validate session name
 */
export const validateSessionName = (name: string): {
  isValid: boolean;
  error?: string;
} => {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Session name cannot be empty' };
  }
  
  if (trimmed.length > APP_CONFIG.MAX_SESSION_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Session name too long (max ${APP_CONFIG.MAX_SESSION_NAME_LENGTH} characters)`,
    };
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(trimmed)) {
    return {
      isValid: false,
      error: 'Session name contains invalid characters',
    };
  }
  
  return { isValid: true };
};

/**
 * Validate note content
 */
export const validateNote = (content: string): {
  isValid: boolean;
  error?: string;
} => {
  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Note cannot be empty' };
  }
  
  if (trimmed.length < APP_CONFIG.MIN_NOTE_LENGTH) {
    return {
      isValid: false,
      error: `Note too short (min ${APP_CONFIG.MIN_NOTE_LENGTH} characters)`,
    };
  }
  
  if (trimmed.length > APP_CONFIG.MAX_NOTE_LENGTH) {
    return {
      isValid: false,
      error: `Note too long (max ${APP_CONFIG.MAX_NOTE_LENGTH} characters)`,
    };
  }
  
  return { isValid: true };
};

/**
 * Validate target hours
 */
export const validateTargetHours = (hours: number): {
  isValid: boolean;
  error?: string;
} => {
  if (hours !== 6 && hours !== 8) {
    return {
      isValid: false,
      error: 'Target hours must be either 6 or 8',
    };
  }
  
  return { isValid: true };
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 500); // Max length safety
};

/**
 * Check if value is a positive number
 */
export const isPositiveNumber = (value: any): boolean => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

/**
 * Check if date is valid
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};


