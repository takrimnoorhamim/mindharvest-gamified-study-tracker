// ============================================
// FILE 1: src/components/SessionTimer.tsx
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { FOCUS_COLORS, BREAK_COLORS, BREAK_MESSAGES } from '../utils/constants';

interface SessionTimerProps {
  formattedTime: string;
  phase: 'focus' | 'break';
  progress: number;
  pomodoroNumber: number;
  totalPomodoros: number;
  onPause?: () => void;
  onResume?: () => void;
  isPaused: boolean;
}

const { width, height } = Dimensions.get('window');

export const SessionTimer: React.FC<SessionTimerProps> = ({
  formattedTime,
  phase,
  progress,
  pomodoroNumber,
  totalPomodoros,
  onPause,
  onResume,
  isPaused,
}) => {
  const colors = phase === 'focus' ? FOCUS_COLORS : BREAK_COLORS;
  const breakMessage = phase === 'break' 
    ? BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)]
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${progress}%`,
              backgroundColor: colors.progressBar,
            }
          ]} 
        />
      </View>

      {/* Phase Indicator */}
      <Text style={[styles.phaseText, { color: colors.text }]}>
        {phase === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
      </Text>

      {/* Pomodoro Counter */}
      <Text style={[styles.pomodoroCounter, { color: colors.text }]}>
        Pomodoro {pomodoroNumber} / {totalPomodoros}
      </Text>

      {/* Main Timer Display */}
      <View style={styles.timerCircle}>
        <Text style={[styles.timerText, { color: colors.timerText }]}>
          {formattedTime}
        </Text>
      </View>

      {/* Break Message */}
      {phase === 'break' && breakMessage && (
        <View style={styles.messageContainer}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            {breakMessage}
          </Text>
          <Text style={[styles.messageSubtext, { color: colors.text }]}>
            (Don't scroll through your phone!)
          </Text>
        </View>
      )}

      {/* Pause/Resume Button */}
      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: colors.primary }]}
        onPress={isPaused ? onResume : onPause}
      >
        <Text style={[styles.controlButtonText, { color: colors.text }]}>
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    height: height,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  pomodoroCounter: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
    opacity: 0.8,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  messageContainer: {
    paddingHorizontal: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  messageSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  controlButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});