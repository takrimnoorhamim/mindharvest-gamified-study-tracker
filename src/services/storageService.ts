// ============================================
// FILE: src/services/storageService.ts
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, DayStats, StorageKeys } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  // Save a single session
  async saveSession(session: Session): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  // Get all sessions
  async getAllSessions(): Promise<Session[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return [];
      
      const sessions = JSON.parse(data);
      // Convert date strings back to Date objects
      return sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
        currentPomodoroStartTime: s.currentPomodoroStartTime 
          ? new Date(s.currentPomodoroStartTime) 
          : undefined,
        notes: s.notes.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  // Get session by ID
  async getSessionById(id: string): Promise<Session | null> {
    try {
      const sessions = await this.getAllSessions();
      return sessions.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Error getting session by ID:', error);
      return null;
    }
  }

  // Delete session
  async deleteSession(id: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== id);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Save active session
  async saveActiveSession(session: Session | null): Promise<void> {
    try {
      if (session === null) {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ACTIVE_SESSION,
          JSON.stringify(session)
        );
      }
    } catch (error) {
      console.error('Error saving active session:', error);
      throw error;
    }
  }

  // Get active session
  async getActiveSession(): Promise<Session | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (!data) return null;
      
      const session = JSON.parse(data);
      return {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        currentPomodoroStartTime: session.currentPomodoroStartTime 
          ? new Date(session.currentPomodoroStartTime) 
          : undefined,
        notes: session.notes.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })),
      };
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  // Save daily stats
  async saveDayStats(stats: DayStats): Promise<void> {
    try {
      const allStats = await this.getAllStats();
      const existingIndex = allStats.findIndex(s => s.date === stats.date);
      
      if (existingIndex >= 0) {
        allStats[existingIndex] = stats;
      } else {
        allStats.push(stats);
      }
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.STATS,
        JSON.stringify(allStats)
      );
    } catch (error) {
      console.error('Error saving stats:', error);
      throw error;
    }
  }

  // Get all stats
  async getAllStats(): Promise<DayStats[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting stats:', error);
      return [];
    }
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.ACTIVE_SESSION,
        STORAGE_KEYS.STATS,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Get item from storage (for reward system)
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  // Set item in storage (for reward system)
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item:', error);
      throw error;
    }
  }
}

export default new StorageService();