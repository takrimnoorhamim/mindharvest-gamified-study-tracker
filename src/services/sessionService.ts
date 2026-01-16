import { Session, Note, DayStats } from '../types';
import { 
  REWARD_MESSAGES,
  POMODORO_DURATION,
  SHORT_BREAK_DURATION,
  LONG_BREAK_DURATION,
} from '../utils/constants';
import storageService from './storageService';
import rewardService from './rewardService';

class SessionService {
  // Calculate total pomodoros based on target hours
  calculateTotalPomodoros(targetHours: number): number {
    // Each pomodoro = 25 min focus + 5 min break = 30 min (0.5 hour)
    // So for every hour, we get 2 pomodoros
    return Math.ceil(targetHours * 2);
  }

  createSession(name: string, targetHours: number): Session {
    const totalPomodoros = this.calculateTotalPomodoros(targetHours);
    
    return {
      id: `session_${Date.now()}`,
      name: name.trim() || 'Study Session',
      targetHours,
      startTime: new Date(),
      pomodorosCompleted: 0,
      totalPomodoros,
      notes: [],
      status: 'active',
      currentPhase: 'focus',
    };
  }

  addNoteToSession(session: Session, noteContent: string): Session {
    const note: Note = {
      id: `note_${Date.now()}`,
      pomodoroNumber: session.pomodorosCompleted + 1,
      content: noteContent.trim(),
      timestamp: new Date(),
    };

    return {
      ...session,
      notes: [...session.notes, note],
    };
  }

  completePomodoroInSession(session: Session): Session {
    const updatedSession = {
      ...session,
      pomodorosCompleted: session.pomodorosCompleted + 1,
    };

    console.log(`Pomodoro completed: ${updatedSession.pomodorosCompleted}/${updatedSession.totalPomodoros}`);

    if (updatedSession.pomodorosCompleted >= updatedSession.totalPomodoros) {
      return this.completeSession(updatedSession);
    }

    return updatedSession;
  }

  completeSession(session: Session): Session {
    const randomReward = REWARD_MESSAGES[
      Math.floor(Math.random() * REWARD_MESSAGES.length)
    ];

    console.log('Session completed!', randomReward);

    const completedSession = {
      ...session,
      status: 'completed' as const,
      endTime: new Date(),
      reward: randomReward,
      currentPhase: 'idle' as const,
    };

    // Calculate actual study hours from POMODOROS
    const actualStudyMinutes = completedSession.pomodorosCompleted * 25;
    const actualStudyHours = actualStudyMinutes / 60;
    
    console.log(`🎁 Session completed:`);
    console.log(`   - Pomodoros: ${completedSession.pomodorosCompleted}`);
    console.log(`   - Study time: ${actualStudyMinutes} minutes (${actualStudyHours.toFixed(2)} hours)`);
    console.log(`   - Target was: ${completedSession.targetHours} hours`);
    
    // Award material (async - fire and forget, original behavior)
    rewardService.awardMaterial(actualStudyHours).then(material => {
      console.log(`✅ Material awarded: ${material}`);
    }).catch(error => {
      console.error('❌ Error awarding material:', error);
    });

    return completedSession;
  }

  abandonSession(session: Session): Session {
    return {
      ...session,
      status: 'abandoned',
      endTime: new Date(),
      currentPhase: 'idle',
    };
  }

  getSessionProgress(session: Session): number {
    return (session.pomodorosCompleted / session.totalPomodoros) * 100;
  }

  getNextPhaseDuration(currentPomodoro: number, phase: 'focus' | 'break'): number {
    if (phase === 'focus') {
      return POMODORO_DURATION;
    }
    
    if (currentPomodoro > 0 && currentPomodoro % 4 === 0) {
      return LONG_BREAK_DURATION;
    }
    
    return SHORT_BREAK_DURATION;
  }

  // Helper: Get local date string avoiding timezone issues
  private getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async calculateDayStats(date: string): Promise<DayStats> {
    const sessions = await storageService.getAllSessions();
    
    const daySessions = sessions.filter(s => {
      const sessionDate = this.getLocalDateString(s.startTime);
      return sessionDate === date;
    });

    const completed = daySessions.filter(s => s.status === 'completed');
    const abandoned = daySessions.filter(s => s.status === 'abandoned');
    
    // Calculate FOCUS TIME ONLY (25 min per pomodoro, NO breaks)
    let totalFocusMinutes = 0;
    
    for (const session of completed) {
      // Each pomodoro = 25 min of pure focus time (no breaks)
      const focusMinutes = session.pomodorosCompleted * 25;
      totalFocusMinutes += focusMinutes;
      
      console.log(`Session ${session.id}: ${session.pomodorosCompleted} pomodoros = ${focusMinutes} min focus`);
    }

    // Also count active sessions based on pomodoros done so far
    const activeSessions = daySessions.filter(s => s.status === 'active');
    for (const session of activeSessions) {
      const focusMinutes = session.pomodorosCompleted * 25;
      totalFocusMinutes += focusMinutes;
      
      console.log(`Active session ${session.id}: ${session.pomodorosCompleted} pomodoros = ${focusMinutes} min focus`);
    }

    const totalPomodoros = [...completed, ...activeSessions].reduce(
      (sum, s) => sum + s.pomodorosCompleted, 
      0
    );

    const stats: DayStats = {
      date,
      totalHours: Math.floor(totalFocusMinutes / 60),
      totalMinutes: totalFocusMinutes % 60,
      sessionsCompleted: completed.length,
      sessionsAbandoned: abandoned.length,
      pomodorosCompleted: totalPomodoros,
    };

    console.log(`Day stats for ${date} (FOCUS TIME ONLY):`, stats);

    await storageService.saveDayStats(stats);
    return stats;
  }

  async getWeekStats(startDate: Date): Promise<DayStats[]> {
    const weekStats: DayStats[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = this.getLocalDateString(date);
      
      const dayStats = await this.calculateDayStats(dateString);
      weekStats.push(dayStats);
    }
    
    return weekStats;
  }

  async compareWeeks(currentWeekStart: Date): Promise<{
    currentWeek: number;
    lastWeek: number;
    percentageChange: number;
  }> {
    const currentWeekStats = await this.getWeekStats(currentWeekStart);
    
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekStats = await this.getWeekStats(lastWeekStart);
    
    const currentTotal = currentWeekStats.reduce(
      (sum, s) => sum + s.totalHours + (s.totalMinutes / 60), 
      0
    );
    const lastTotal = lastWeekStats.reduce(
      (sum, s) => sum + s.totalHours + (s.totalMinutes / 60), 
      0
    );
    
    const percentageChange = lastTotal > 0 
      ? ((currentTotal - lastTotal) / lastTotal) * 100 
      : 0;
    
    return {
      currentWeek: Math.floor(currentTotal),
      lastWeek: Math.floor(lastTotal),
      percentageChange,
    };
  }
}

export default new SessionService();