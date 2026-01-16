// ============================================
// FILE 1: src/utils/timeUtils.ts
// ============================================

import { DAYS_OF_WEEK, MONTHS } from './constants';

/**
 * Format seconds to MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds to HH:MM:SS
 */
export const formatTimeLong = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get relative date string (Today, Yesterday, X days ago)
 */
export const getRelativeDateString = (date: Date): string => {
  const now = new Date();
  const inputDate = new Date(date);
  
  // Reset time to midnight for accurate day comparison
  now.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - inputDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  
  // Return formatted date for older entries
  return formatDate(inputDate);
};

/**
 * Format date as "Jan 15, 2024"
 */
export const formatDate = (date: Date): string => {
  const month = MONTHS[date.getMonth()].slice(0, 3);
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  
  if (year === currentYear) {
    return `${month} ${day}`;
  }
  return `${month} ${day}, ${year}`;
};

/**
 * Format date as "Monday, January 15"
 */
export const formatDateLong = (date: Date): string => {
  const dayName = DAYS_OF_WEEK[date.getDay()];
  const monthName = MONTHS[date.getMonth()];
  const day = date.getDate();
  
  return `${dayName}, ${monthName} ${day}`;
};

/**
 * Get ISO date string (YYYY-MM-DD)
 */
export const getISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Calculate duration between two dates
 */
export const calculateDuration = (start: Date, end: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} => {
  const diffMs = end.getTime() - start.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds, totalSeconds };
};

/**
 * Format duration as human readable string
 */
export const formatDuration = (start: Date, end: Date): string => {
  const { hours, minutes } = calculateDuration(start, end);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get start of week (Sunday)
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of week (Saturday)
 */
export const getEndOfWeek = (date: Date = new Date()): Date => {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get array of dates for current week
 */
export const getWeekDates = (startDate: Date = getStartOfWeek()): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get time of day greeting
 */
export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};