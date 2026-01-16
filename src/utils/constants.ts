
// ============================================
// FILE 2: src/utils/constants.ts
// ============================================

import { SessionDuration } from '../types';

// Pomodoro Configuration
export const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
export const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
export const LONG_BREAK_DURATION = 15 * 60; // 15 minutes in seconds

// Session Configuration
export const POMODOROS_PER_4_HOURS = 8; // Fixed: 8 pomodoros = 4 hours
export const SESSION_DURATIONS: SessionDuration[] = [6, 8];

// Calculate total pomodoros based on target hours
export const calculateTotalPomodoros = (targetHours: number): number => {
  // 8 pomodoros per 4 hours
  return Math.floor((targetHours / 4) * POMODOROS_PER_4_HOURS);
};

// Storage Keys
export const STORAGE_KEYS = {
  SESSIONS: '@focus_app:sessions',
  ACTIVE_SESSION: '@focus_app:active_session',
  STATS: '@focus_app:stats',
  USER_PREFS: '@focus_app:preferences',
} as const;

// Color Themes
export const FOCUS_COLORS = {
  background: '#1a1a2e', // Dark bluish
  primary: '#16213e',
  accent: '#0f3460',
  text: '#e4e4e4',
  timerText: '#ffffff',
  progressBar: '#533483',
};

export const BREAK_COLORS = {
  background: '#ffeaa7', // Warm yellow
  backgroundAlt: '#fdcb6e',
  primary: '#6c5ce7',
  accent: '#a29bfe',
  text: '#2d3436',
  timerText: '#2d3436',
  progressBar: '#00b894',
};

// Motivational Messages for Breaks
export const BREAK_MESSAGES = [
  'Take a short walk and stretch your body',
  'Rest your eyes and look at something far away',
  'Hydrate yourself with water',
  'Do some light stretching exercises',
  'Take deep breaths and relax',
  'Step outside for fresh air',
  'Chat with someone, but avoid screens',
  'Close your eyes and meditate for a moment',
  'Grab a healthy snack',
  'Stand up and move around',
];

// Reward Messages
export const REWARD_MESSAGES = [
  '🎉 Amazing! You completed your session!',
  '🔥 Incredible focus! Session completed!',
  '⭐ Outstanding work! You did it!',
  '🏆 Session complete! You\'re unstoppable!',
  '💪 Fantastic! Another session conquered!',
  '🎯 Perfect! Goal achieved!',
  '✨ Brilliant! You stayed focused!',
  '🌟 Excellent work! Session done!',
];

// App Configuration
export const APP_CONFIG = {
  MIN_NOTE_LENGTH: 3,
  MAX_NOTE_LENGTH: 500,
  MAX_SESSION_NAME_LENGTH: 50,
  NOTIFICATION_CHANNEL_ID: 'focus_app_notifications',
  NOTIFICATION_CHANNEL_NAME: 'Focus Session Notifications',
};

// Time Formatting
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Chart Colors for Dashboard
export const CHART_COLORS = [
  '#6c5ce7', // Purple
  '#00b894', // Green
  '#fdcb6e', // Yellow
  '#e17055', // Orange
  '#0984e3', // Blue
  '#d63031', // Red
  '#a29bfe', // Light purple
];

// Default Values
export const DEFAULT_SESSION_NAME = 'Study Session';
export const DEFAULT_TARGET_HOURS = 8;