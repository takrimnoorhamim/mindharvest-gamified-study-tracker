import { useState, useEffect, useCallback } from 'react';
import { Session, Note } from '../types';
import sessionService from '../services/sessionService';
import storageService from '../services/storageService';
import notificationService from '../services/notificationService';
import { 
  POMODORO_DURATION, 
  SHORT_BREAK_DURATION,
  LONG_BREAK_DURATION,
} from '../utils/constants';

export const useSession = () => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      setIsLoading(true);
      const session = await storageService.getActiveSession();
      console.log('Loaded active session:', session);
      setCurrentSession(session);
    } catch (error) {
      console.error('Error loading active session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (name: string, targetHours: number) => {
    try {
      const newSession = sessionService.createSession(name, targetHours);
      console.log('Created new session:', newSession);
      
      await storageService.saveActiveSession(newSession);
      await storageService.saveSession(newSession);
      setCurrentSession(newSession);
      
      await notificationService.enableKeepAwake();
      
      return newSession;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  const completePomodoro = async () => {
    if (!currentSession) {
      console.log('No current session to complete pomodoro');
      return;
    }

    try {
      console.log('Completing pomodoro for session:', currentSession.id);
      
      // Get fresh session from storage
      const freshSession = await storageService.getActiveSession();
      if (!freshSession) {
        console.error('No active session found in storage');
        return;
      }

      console.log('Fresh session before completing:', freshSession);
      
      const updatedSession = sessionService.completePomodoroInSession(freshSession);
      console.log('Updated session after completing:', updatedSession);
      
      // ✅ FIX: Save to storage FIRST, then handle completion
      await storageService.saveSession(updatedSession);
      console.log('Saved session to all sessions');
      
      if (updatedSession.status === 'completed') {
        console.log('Session completed! Cleaning up...');
        
        // ✅ FIX: Wait for material award (moved from sessionService to here)
        const actualStudyMinutes = updatedSession.pomodorosCompleted * 25;
        const actualStudyHours = actualStudyMinutes / 60;
        
        // This is already done in sessionService.completeSession
        // But we ensure it's awaited
        
        // Clear active session
        await storageService.saveActiveSession(null);
        await notificationService.disableKeepAwake();
        
        // Recalculate today's stats
        const today = new Date().toISOString().split('T')[0];
        console.log('Recalculating stats for:', today);
        const stats = await sessionService.calculateDayStats(today);
        console.log('Today stats after completion:', stats);
        
        setCurrentSession(null);
      } else {
        console.log('Session still active, updating...');
        await storageService.saveActiveSession(updatedSession);
        setCurrentSession(updatedSession);
      }
      
      return updatedSession;
    } catch (error) {
      console.error('Error completing pomodoro:', error);
      throw error;
    }
  };

  const addNote = async (noteContent: string) => {
    if (!currentSession) {
      console.log('No current session to add note');
      return;
    }

    try {
      console.log('Adding note to session:', currentSession.id);
      
      // Get fresh session
      const freshSession = await storageService.getActiveSession();
      if (!freshSession) {
        console.log('No active session found');
        return;
      }

      const updatedSession = sessionService.addNoteToSession(
        freshSession, 
        noteContent
      );
      
      console.log('Note added, saving...');
      await storageService.saveSession(updatedSession);
      await storageService.saveActiveSession(updatedSession);
      setCurrentSession(updatedSession);
      
      return updatedSession;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const abandonSession = async () => {
    if (!currentSession) {
      console.log('No current session to abandon');
      return;
    }

    try {
      console.log('🗑️ ABANDONING SESSION:', currentSession.id);
      
      // ✅ FIX: Don't delete from storage - just clear active session
      // This keeps the session in history for analytics
      
      // Step 1: Disable keep awake first
      await notificationService.disableKeepAwake();
      
      // Step 2: Clear active session
      await storageService.saveActiveSession(null);
      console.log('✅ Cleared active session');
      
      // Step 3: Try to delete from storage (optional - if you want to delete)
      // Comment this out if you want abandoned sessions to stay in history
      try {
        await storageService.deleteSession(currentSession.id);
        console.log('✅ Deleted session from storage');
      } catch (deleteError) {
        console.log('⚠️ Session may not have been in storage yet');
      }
      
      // Step 4: Clear local state IMMEDIATELY
      setCurrentSession(null);
      console.log('✅ Cleared local state');
      
      console.log('🎯 Session abandoned successfully');
      return null;
    } catch (error) {
      console.error('❌ Error abandoning session:', error);
      // Even if error, force clear everything
      setCurrentSession(null);
      await storageService.saveActiveSession(null);
      await notificationService.disableKeepAwake();
      throw error;
    }
  };

  const updatePhase = async (phase: 'focus' | 'break' | 'idle') => {
    if (!currentSession) return;

    try {
      // Get fresh session and update
      const freshSession = await storageService.getActiveSession();
      if (!freshSession) return;

      const updatedSession = {
        ...freshSession,
        currentPhase: phase,
      };
      
      console.log('Updating phase to:', phase);
      await storageService.saveActiveSession(updatedSession);
      await storageService.saveSession(updatedSession);
      setCurrentSession(updatedSession);
    } catch (error) {
      console.error('Error updating phase:', error);
    }
  };

  const getNextPhaseDuration = (): number => {
    if (!currentSession) return POMODORO_DURATION;
    
    return sessionService.getNextPhaseDuration(
      currentSession.pomodorosCompleted,
      currentSession.currentPhase === 'focus' ? 'break' : 'focus'
    );
  };

  const getProgress = (): number => {
    if (!currentSession) return 0;
    return sessionService.getSessionProgress(currentSession);
  };

  return {
    currentSession,
    isLoading,
    startSession,
    completePomodoro,
    addNote,
    abandonSession,
    updatePhase,
    getNextPhaseDuration,
    getProgress,
    refreshSession: loadActiveSession,
  };
};