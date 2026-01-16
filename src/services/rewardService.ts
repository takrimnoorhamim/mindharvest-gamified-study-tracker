import storageService from './storageService';
import { Session } from '../types';

interface DailyRewardData {
  todayLevel: number;
  todayHoursStudied: number;
  todaySessionsCompleted: number;
  materialCollection: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
}

interface MaterialInfo {
  name: string;
  emoji: string;
  color: string;
  minHours: number;
  maxHours: number;
}

class RewardService {
  private readonly MATERIALS_KEY = '@focus_app:materials';

  // 24 Hour-Based Material Tiers
  private MATERIALS: MaterialInfo[] = [
    { name: 'Copper', emoji: '🟤', color: '#b87333', minHours: 0.42, maxHours: 1 },
    { name: 'Bronze', emoji: '🥉', color: '#cd7f32', minHours: 1, maxHours: 2 },
    { name: 'Silver', emoji: '🥈', color: '#c0c0c0', minHours: 2, maxHours: 3 },
    { name: 'Gold', emoji: '🥇', color: '#ffd700', minHours: 3, maxHours: 4 },
    { name: 'Platinum', emoji: '⚪', color: '#e5e4e2', minHours: 4, maxHours: 5 },
    { name: 'Pearl', emoji: '🦪', color: '#f0ead6', minHours: 5, maxHours: 6 },
    { name: 'Jade', emoji: '💚', color: '#00a86b', minHours: 6, maxHours: 7 },
    { name: 'Sapphire', emoji: '💙', color: '#0f52ba', minHours: 7, maxHours: 8 },
    { name: 'Emerald', emoji: '💚', color: '#50c878', minHours: 8, maxHours: 9 },
    { name: 'Ruby', emoji: '❤️', color: '#e0115f', minHours: 9, maxHours: 10 },
    { name: 'Diamond', emoji: '💎', color: '#b9f2ff', minHours: 10, maxHours: 11 },
    { name: 'Opal', emoji: '🌈', color: '#a8c3bc', minHours: 11, maxHours: 12 },
    { name: 'Topaz', emoji: '🟡', color: '#ffcc00', minHours: 12, maxHours: 13 },
    { name: 'Amethyst', emoji: '💜', color: '#9966cc', minHours: 13, maxHours: 14 },
    { name: 'Turquoise', emoji: '🩵', color: '#40e0d0', minHours: 14, maxHours: 15 },
    { name: 'Onyx', emoji: '⚫', color: '#353839', minHours: 15, maxHours: 16 },
    { name: 'Quartz', emoji: '⚪', color: '#f8f8f8', minHours: 16, maxHours: 17 },
    { name: 'Moonstone', emoji: '🌙', color: '#d4d4f7', minHours: 17, maxHours: 18 },
    { name: 'Citrine', emoji: '🟠', color: '#e4d00a', minHours: 18, maxHours: 19 },
    { name: 'Garnet', emoji: '🔴', color: '#9a2a2a', minHours: 19, maxHours: 20 },
    { name: 'Aquamarine', emoji: '🩵', color: '#7fffd4', minHours: 20, maxHours: 21 },
    { name: 'Obsidian', emoji: '⚫', color: '#000000', minHours: 21, maxHours: 22 },
    { name: 'Alexandrite', emoji: '💎', color: '#ca3767', minHours: 22, maxHours: 23 },
    { name: 'Celestite', emoji: '✨', color: '#b0c4de', minHours: 23, maxHours: 24 },
  ];

  // Daily level progression based on HOURS STUDIED (resets every day)
  private DAILY_LEVELS = [
    { level: 1, title: 'Seed', emoji: '🌾', color: '#95a5a6', hoursNeeded: 0 },
    { level: 2, title: 'Sprout', emoji: '🌱', color: '#1abc9c', hoursNeeded: 1 },
    { level: 3, title: 'Seedling', emoji: '🌿', color: '#16a085', hoursNeeded: 2 },
    { level: 4, title: 'Sapling', emoji: '🪴', color: '#27ae60', hoursNeeded: 4 },
    { level: 5, title: 'Young Tree', emoji: '🌳', color: '#2ecc71', hoursNeeded: 6 },
    { level: 6, title: 'Mighty Oak', emoji: '🌲', color: '#229954', hoursNeeded: 8 },
    { level: 7, title: 'Ancient Tree', emoji: '🌴', color: '#1e8449', hoursNeeded: 10 },
    { level: 8, title: 'Forest Guardian', emoji: '🏞️', color: '#186a3b', hoursNeeded: 12 },
    { level: 9, title: 'Mystic Grove', emoji: '🌄', color: '#0e4b24', hoursNeeded: 14 },
    { level: 10, title: 'Sacred Woods', emoji: '⛰️', color: '#0b5345', hoursNeeded: 16 },
    { level: 11, title: 'Eternal Forest', emoji: '🌌', color: '#145a32', hoursNeeded: 18 },
    { level: 12, title: 'World Tree', emoji: '🌍', color: '#186a3b', hoursNeeded: 20 },
    { level: 13, title: 'Cosmic Tree', emoji: '✨', color: '#1e8449', hoursNeeded: 22 },
    { level: 14, title: 'Legendary Yggdrasil', emoji: '🔱', color: '#27ae60', hoursNeeded: 24 },
  ];

  // Get today's reward data
  async getDailyRewardData(): Promise<DailyRewardData> {
    try {
      const sessions = await storageService.getAllSessions();
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`📅 Current date: ${today}`);
      console.log(`📚 Total sessions in storage: ${sessions.length}`);
      
      // Get TODAY'S completed sessions ONLY (strict date match)
      const todaySessions = sessions.filter(s => {
        const sessionDate = s.startTime.toISOString().split('T')[0];
        const isToday = sessionDate === today;
        const isCompleted = s.status === 'completed';
        
        if (isCompleted) {
          console.log(`  Session ${s.id}: date=${sessionDate}, isToday=${isToday}`);
        }
        
        return isToday && isCompleted;
      });

      console.log(`✅ Today's completed sessions: ${todaySessions.length}`);

      // Calculate total hours studied TODAY ONLY (focus time only, no breaks)
      let totalStudyMinutes = 0;
      for (const session of todaySessions) {
        // Each pomodoro = 25 min of actual study
        const studyMinutes = session.pomodorosCompleted * 25;
        totalStudyMinutes += studyMinutes;
        console.log(`  → Session: ${session.pomodorosCompleted} pomodoros = ${studyMinutes} min`);
      }
      const totalStudyHours = totalStudyMinutes / 60;

      // Calculate today's level based on hours studied TODAY
      const todayLevel = this.calculateDailyLevel(totalStudyHours);
      
      // Get material collection (persistent across days)
      const materialCollection = await this.getMaterialCollection();
      
      // Calculate streak
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const streak = this.calculateStreak(completedSessions);

      console.log(`📊 TODAY's progress: ${totalStudyHours.toFixed(2)}h → Level ${todayLevel}`);

      return {
        todayLevel,
        todayHoursStudied: parseFloat(totalStudyHours.toFixed(2)),
        todaySessionsCompleted: todaySessions.length,
        materialCollection,
        currentStreak: streak.current,
        longestStreak: streak.longest,
      };
    } catch (error) {
      console.error('Error getting daily reward data:', error);
      return {
        todayLevel: 1,
        todayHoursStudied: 0,
        todaySessionsCompleted: 0,
        materialCollection: {},
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  }

  // Calculate today's level based on HOURS studied
  private calculateDailyLevel(hoursStudied: number): number {
    for (let i = this.DAILY_LEVELS.length - 1; i >= 0; i--) {
      if (hoursStudied >= this.DAILY_LEVELS[i].hoursNeeded) {
        return this.DAILY_LEVELS[i].level;
      }
    }
    return 1;
  }

  // Get level info
  getDailyLevelInfo(level: number): {
    title: string;
    emoji: string;
    color: string;
    nextLevelHours?: number;
  } {
    const levelData = this.DAILY_LEVELS.find(l => l.level === level) || this.DAILY_LEVELS[0];
    const nextLevel = this.DAILY_LEVELS.find(l => l.level === level + 1);
    
    return {
      title: levelData.title,
      emoji: levelData.emoji,
      color: levelData.color,
      nextLevelHours: nextLevel?.hoursNeeded,
    };
  }

  // Award material based on EXACT session duration in hours
  async awardMaterial(sessionHours: number): Promise<string> {
    try {
      console.log(`🎁 Awarding material for ${sessionHours.toFixed(2)}h session...`);
      
      // Find the appropriate material tier based on hours
      let awardedMaterialInfo: MaterialInfo | null = null;
      
      for (const material of this.MATERIALS) {
        if (sessionHours >= material.minHours && sessionHours < material.maxHours) {
          awardedMaterialInfo = material;
          break;
        }
      }
      
      // If session is 24h or more, give the highest tier
      if (!awardedMaterialInfo && sessionHours >= 24) {
        awardedMaterialInfo = this.MATERIALS[this.MATERIALS.length - 1];
      }
      
      // Fallback to Copper if somehow nothing matches
      if (!awardedMaterialInfo) {
        awardedMaterialInfo = this.MATERIALS[0];
      }

      const materialKey = awardedMaterialInfo.name.toLowerCase();
      
      // Add to collection
      const collection = await this.getMaterialCollection();
      collection[materialKey] = (collection[materialKey] || 0) + 1;
      await this.saveMaterialCollection(collection);

      console.log(`✅ Awarded ${awardedMaterialInfo.name} ${awardedMaterialInfo.emoji}! Total: ${collection[materialKey]}`);
      return materialKey;
    } catch (error) {
      console.error('Error awarding material:', error);
      return 'copper';
    }
  }

  // Get material collection from storage
  private async getMaterialCollection(): Promise<Record<string, number>> {
    try {
      const data = await storageService.getItem(this.MATERIALS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  // Save material collection
  private async saveMaterialCollection(collection: Record<string, number>): Promise<void> {
    try {
      await storageService.setItem(this.MATERIALS_KEY, JSON.stringify(collection));
    } catch (error) {
      console.error('Error saving material collection:', error);
    }
  }

  // Get material info by key
  getMaterialInfo(materialKey: string): MaterialInfo {
    const material = this.MATERIALS.find(m => m.name.toLowerCase() === materialKey);
    return material || this.MATERIALS[0];
  }

  // Calculate daily streak
  private calculateStreak(sessions: Session[]): { current: number; longest: number } {
    if (sessions.length === 0) return { current: 0, longest: 0 };

    // Sort by date (newest first)
    const sorted = [...sessions].sort((a, b) => 
      b.startTime.getTime() - a.startTime.getTime()
    );

    // Get unique dates
    const dates = [...new Set(sorted.map(s => 
      s.startTime.toISOString().split('T')[0]
    ))];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if studied today or yesterday
    const lastDate = dates[0];
    const daysDiff = this.getDaysDifference(lastDate, today);
    
    if (daysDiff > 1) {
      // Streak broken
      currentStreak = 0;
    } else {
      // Calculate current streak
      for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const diff = this.getDaysDifference(dates[i], dates[i - 1]);
          if (diff === 1) {
            tempStreak++;
          } else {
            break;
          }
        }
      }
      currentStreak = tempStreak;
    }

    // Calculate longest streak
    tempStreak = 0;
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = this.getDaysDifference(dates[i], dates[i - 1]);
        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  private getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default new RewardService();