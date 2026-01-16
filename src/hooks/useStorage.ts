// FILE 3: src/hooks/useStorage.ts
// ============================================

import { useState, useEffect } from 'react';
import { Session, DayStats } from '../types';
import storageService from '../services/storageService';
import sessionService from '../services/sessionService';

export const useStorage = () => {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all sessions
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const sessions = await storageService.getAllSessions();
      // Sort by date (newest first)
      sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
      
      console.log('📚 Loaded sessions:', sessions.length);
      console.log('✅ Completed:', sessions.filter(s => s.status === 'completed').length);
      console.log('❌ Abandoned:', sessions.filter(s => s.status === 'abandoned').length);
      
      setAllSessions(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Delete a session
  const deleteSession = async (id: string) => {
    try {
      await storageService.deleteSession(id);
      await loadSessions(); // Refresh list
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  };

  // Get completed sessions only (for rewards/achievements)
  const getCompletedSessions = (): Session[] => {
    return allSessions.filter(s => s.status === 'completed');
  };

  // Get sessions by date
  const getSessionsByDate = (date: string): Session[] => {
    return allSessions.filter(s => {
      const year = s.startTime.getFullYear();
      const month = String(s.startTime.getMonth() + 1).padStart(2, '0');
      const day = String(s.startTime.getDate()).padStart(2, '0');
      const sessionDate = `${year}-${month}-${day}`;
      return sessionDate === date;
    });
  };

  // Get today's stats
  const getTodayStats = async (): Promise<DayStats> => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    return await sessionService.calculateDayStats(todayString);
  };

  // Get week stats
  const getWeekStats = async (): Promise<DayStats[]> => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    
    return await sessionService.getWeekStats(startOfWeek);
  };

  // Compare weeks
  const compareWeeks = async () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    return await sessionService.compareWeeks(startOfWeek);
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      await storageService.clearAllData();
      await loadSessions();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  // Get session by ID
  const getSessionById = async (id: string): Promise<Session | null> => {
    return await storageService.getSessionById(id);
  };

  return {
    allSessions,
    isLoading,
    deleteSession,
    getCompletedSessions,
    getSessionsByDate,
    getTodayStats,
    getWeekStats,
    compareWeeks,
    clearAllData,
    getSessionById,
    refreshSessions: loadSessions,
  };
};