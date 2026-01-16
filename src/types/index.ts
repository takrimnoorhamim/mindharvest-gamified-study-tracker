// ============================================
// FILE 1: src/types/index.ts
// ============================================

export interface Session {
  id: string;
  name: string;
  targetHours: number; // 6 or 8
  startTime: Date;
  endTime?: Date;
  pomodorosCompleted: number;
  totalPomodoros: number; // Always 8 pomodoros per 4 hours
  notes: Note[];
  status: 'active' | 'completed' | 'abandoned';
  reward?: string;
  currentPhase: 'focus' | 'break' | 'idle'; // Current phase
  currentPomodoroStartTime?: Date;
}

export interface Note {
  id: string;
  pomodoroNumber: number;
  content: string;
  timestamp: Date;
}

export interface DayStats {
  date: string; // ISO format YYYY-MM-DD
  totalHours: number;
  totalMinutes: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
  pomodorosCompleted: number;
}

export interface WeekStats {
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  totalSessions: number;
  dailyStats: DayStats[];
  averagePerDay: number;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  phase: 'focus' | 'break';
  currentPomodoro: number;
}

export type SessionDuration = 6 | 8;

export interface StorageKeys {
  SESSIONS: '@focus_app:sessions';
  ACTIVE_SESSION: '@focus_app:active_session';
  STATS: '@focus_app:stats';
  USER_PREFS: '@focus_app:preferences';
}