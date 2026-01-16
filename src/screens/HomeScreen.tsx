import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSession } from '../hooks/useSession';
import { useStorage } from '../hooks/useStorage';
import { StatsChart } from '../components/StatsChart';
import { DEFAULT_SESSION_NAME } from '../utils/constants';
import rewardService from '../services/rewardService';

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [sessionName, setSessionName] = useState(DEFAULT_SESSION_NAME);
  const [selectedHours, setSelectedHours] = useState<number>(8);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { currentSession, startSession, refreshSession } = useSession();
  const { getTodayStats, getWeekStats, compareWeeks, refreshSessions } = useStorage();

  const [todayStats, setTodayStats] = useState({
    totalHours: 0,
    totalMinutes: 0,
    sessionsCompleted: 0,
    pomodorosCompleted: 0,
  });
  const [weekStats, setWeekStats] = useState<any[]>([]);
  const [weekComparison, setWeekComparison] = useState({
    currentWeek: 0,
    lastWeek: 0,
    percentageChange: 0,
  });
  const [rewardData, setRewardData] = useState({
    todayLevel: 1,
    todayHoursStudied: 0,
    todaySessionsCompleted: 0,
    materialCollection: {} as Record<string, number>,
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    console.log('🚀 HomeScreen mounted, loading initial data');
    loadStats();
    refreshSession();
    refreshSessions();
  }, []);

  useEffect(() => {
    console.log('🔄 Current session check:', currentSession?.status);
    if (!currentSession || currentSession.status !== 'active') {
      console.log('🔄 No active session, refreshing stats...');
      loadStats();
      refreshSessions();
    }
  }, [currentSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Periodic refresh triggered');
      loadStats();
      refreshSessions();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      console.log('📊 Loading stats...');
      
      const today = await getTodayStats();
      const week = await getWeekStats();
      const comparison = await compareWeeks();
      
      // NEW DAILY REWARD SYSTEM
      const rewards = await rewardService.getDailyRewardData();
      console.log('🏆 Reward data:', rewards);
      
      setTodayStats({
        totalHours: today.totalHours,
        totalMinutes: today.totalMinutes,
        sessionsCompleted: today.sessionsCompleted,
        pomodorosCompleted: today.pomodorosCompleted,
      });
      setWeekStats(week);
      setWeekComparison(comparison);
      setRewardData(rewards);
      
      console.log('✅ Stats loaded successfully');
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  const handleStartSession = async () => {
    if (currentSession && currentSession.status === 'active') {
      Alert.alert(
        'Session Active',
        'You already have an active session. Please complete or abandon it first.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!sessionName.trim()) {
      Alert.alert('Error', 'Please enter a session name');
      return;
    }

    let targetHours = selectedHours;
    
    if (showCustomInput) {
      const hours = parseFloat(customHours);
      if (isNaN(hours) || hours < 0.42) {
        Alert.alert('Error', 'Minimum 1 Pomodoro (25 minutes) required');
        return;
      }
      targetHours = hours;
    }

    try {
      setIsLoading(true);
      await startSession(sessionName.trim(), targetHours);
      
      if (navigation) {
        navigation.navigate('Session');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start session');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getComparisonText = () => {
    const { percentageChange } = weekComparison;
    if (percentageChange > 0) {
      return `↑ ${percentageChange.toFixed(1)}% better than last week! 🔥`;
    } else if (percentageChange < 0) {
      return `↓ ${Math.abs(percentageChange).toFixed(1)}% less than last week`;
    }
    return 'Same as last week';
  };

  const getComparisonColor = () => {
    return weekComparison.percentageChange >= 0 ? '#00b894' : '#ff6b6b';
  };

  // Get level info based on today's hours
  const levelInfo = rewardService.getDailyLevelInfo(rewardData.todayLevel);
  const progressToNextLevel = rewardData.todayHoursStudied % 2;
  const progressPercentage = (progressToNextLevel / 2) * 100;

  // Get collected materials
  const collectedMaterials = Object.entries(rewardData.materialCollection)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => {
      const order = ['bronze', 'silver', 'gold', 'platinum', 'pearl', 'diamond', 'emerald', 'ruby'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });

  const hasActiveSession = currentSession && currentSession.status === 'active';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MindHarvest</Text>
        <Text style={styles.headerSubtitle}>Made By Takrim Noor Hamim</Text>
      </View>

      {/* DAILY LEVEL CARD */}
      <View style={styles.rewardCard}>
        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelEmoji}>{levelInfo.emoji}</Text>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelTitle, { color: levelInfo.color }]}>
              Level {rewardData.todayLevel} - {levelInfo.title}
            </Text>
            <Text style={styles.levelSubtitle}>
              {rewardData.todayHoursStudied.toFixed(1)}h studied today • {rewardData.todaySessionsCompleted} sessions
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.levelProgress}>
          <View style={styles.progressBarOuter}>
            <View 
              style={[
                styles.progressBarInner,
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: levelInfo.color 
                }
              ]} 
            />
          </View>
        </View>

        {/* Streak Counter */}
        <View style={styles.streakSection}>
          <View style={styles.streakBox}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakNumber}>{rewardData.currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakEmoji}>🏆</Text>
            <View>
              <Text style={styles.streakNumber}>{rewardData.longestStreak}</Text>
              <Text style={styles.streakLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Material Collection */}
        <View style={styles.materialsSection}>
          <Text style={styles.materialsTitle}>Material Collection</Text>
          {collectedMaterials.length > 0 ? (
            <View style={styles.materialsGrid}>
              {collectedMaterials.map(([material, count]) => {
                const materialInfo = rewardService.getMaterialInfo(material);
                return (
                  <View key={material} style={styles.materialBadge}>
                    <Text style={styles.materialEmoji}>{materialInfo.emoji}</Text>
                    <Text style={styles.materialName}>{materialInfo.name}</Text>
                    {count > 1 && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>x{count}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyMaterials}>
              Complete sessions to collect rare materials! 💎
            </Text>
          )}
        </View>
      </View>

      {/* Today's Progress */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {todayStats.totalHours}h {todayStats.totalMinutes}m
            </Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todayStats.sessionsCompleted}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todayStats.pomodorosCompleted}</Text>
            <Text style={styles.statLabel}>Pomodoros</Text>
          </View>
        </View>
      </View>

      {/* Weekly Chart */}
      <StatsChart weekStats={weekStats} />

      {/* Week Comparison */}
      {weekComparison.currentWeek > 0 && (
        <View style={styles.comparisonCard}>
          <Text style={[styles.comparisonText, { color: getComparisonColor() }]}>
            {getComparisonText()}
          </Text>
          <View style={styles.comparisonDetails}>
            <Text style={styles.comparisonDetailText}>
              This week: {weekComparison.currentWeek}h
            </Text>
            <Text style={styles.comparisonDetailText}>
              Last week: {weekComparison.lastWeek}h
            </Text>
          </View>
        </View>
      )}

      {/* Start New Session */}
      <View style={styles.startSessionCard}>
        <Text style={styles.cardTitle}>Start New Session</Text>

        <TextInput
          style={styles.input}
          placeholder="Session name (e.g., Math Study)"
          placeholderTextColor="#666"
          value={sessionName}
          onChangeText={setSessionName}
          maxLength={50}
        />

        <Text style={styles.label}>Target Duration</Text>
        <View style={styles.durationButtons}>
          {[2, 4, 6, 8].map((hours) => (
            <TouchableOpacity
              key={hours}
              style={[
                styles.durationButtonSmall,
                selectedHours === hours && !showCustomInput && styles.durationButtonActive,
              ]}
              onPress={() => {
                setSelectedHours(hours);
                setShowCustomInput(false);
              }}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  selectedHours === hours && !showCustomInput && styles.durationButtonTextActive,
                ]}
              >
                {hours}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.customButton,
            showCustomInput && styles.customButtonActive,
          ]}
          onPress={() => {
            setShowCustomInput(!showCustomInput);
          }}
        >
          <Text style={[styles.customButtonText, showCustomInput && styles.customButtonTextActive]}>
            ⚙️ Custom Duration
          </Text>
        </TouchableOpacity>

        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Hours (min 0.42 = 25min)"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={customHours}
              onChangeText={setCustomHours}
            />
            <Text style={styles.customHint}>
              1 Pomodoro = 0.42h (25 min)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startButton, (isLoading || hasActiveSession) && styles.startButtonDisabled]}
          onPress={handleStartSession}
          disabled={isLoading || hasActiveSession}
        >
          {isLoading ? (
            <ActivityIndicator color="#0f0f1e" />
          ) : (
            <Text style={styles.startButtonText}>🚀 Start Session</Text>
          )}
        </TouchableOpacity>

        {hasActiveSession && (
          <Text style={styles.warningText}>
            ⚠️ You have an active session running
          </Text>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a8a8ff',
    opacity: 0.9,
    fontWeight: '500',
  },
  rewardCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: -15,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#a8a8ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  levelProgress: {
    marginBottom: 16,
  },
  progressBarOuter: {
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 4,
  },
  streakSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  streakBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a8a8ff',
  },
  streakLabel: {
    fontSize: 11,
    color: '#888',
  },
  materialsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  materialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 12,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materialBadge: {
    width: '31%',
    backgroundColor: '#0f0f1e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  materialEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  materialName: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#a8a8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f0f1e',
  },
  emptyMaterials: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  statsCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a8a8ff',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  comparisonCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  comparisonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  comparisonDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  comparisonDetailText: {
    fontSize: 13,
    color: '#888',
  },
  startSessionCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2a2a3e',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#0f0f1e',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 10,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  durationButtonSmall: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2a2a3e',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
  },
  durationButtonActive: {
    borderColor: '#a8a8ff',
    backgroundColor: '#1f1f3e',
  },
  durationButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#888',
  },
  durationButtonTextActive: {
    color: '#a8a8ff',
  },
  customButton: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2a2a3e',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#0f0f1e',
  },
  customButtonActive: {
    borderColor: '#a8a8ff',
    backgroundColor: '#1f1f3e',
  },
  customButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  customButtonTextActive: {
    color: '#a8a8ff',
  },
  customInputContainer: {
    marginBottom: 18,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#a8a8ff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#0f0f1e',
    color: '#fff',
  },
  customHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#a8a8ff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#0f0f1e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});