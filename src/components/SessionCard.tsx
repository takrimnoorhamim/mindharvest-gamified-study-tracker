// FILE 3: src/components/SessionCard.tsx
// ============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Session } from '../types';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
  onDelete: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
  onDelete,
}) => {
  const formatDate = (date: Date): string => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return sessionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: sessionDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatDuration = (start: Date, end?: Date): string => {
    if (!end) return 'In progress...';
    const duration = end.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'completed':
        return '#00b894';
      case 'abandoned':
        return '#d63031';
      default:
        return '#fdcb6e';
    }
  };

  const getStatusIcon = () => {
    switch (session.status) {
      case 'completed':
        return '✓';
      case 'abandoned':
        return '✗';
      default:
        return '⏳';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.sessionName} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={styles.dateText}>{formatDate(session.startTime)}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pomodoros</Text>
          <Text style={styles.statValue}>
            {session.pomodorosCompleted} / {session.totalPomodoros}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>
            {formatDuration(session.startTime, session.endTime)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Notes</Text>
          <Text style={styles.statValue}>{session.notes.length}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${(session.pomodorosCompleted / session.totalPomodoros) * 100}%`,
                backgroundColor: getStatusColor(),
              }
            ]} 
          />
        </View>
      </View>

      {/* Reward */}
      {session.reward && (
        <Text style={styles.rewardText}>{session.reward}</Text>
      )}

      {/* Delete Button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // FIXED: Changed from #1a1a2e to #fff
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#999', // FIXED: Changed from #666 to #999 for better contrast
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#888', // FIXED: Changed from #999 to #888
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e4e4e4', // FIXED: Changed from #333 to #e4e4e4
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2a2a3e', // FIXED: Changed from #e0e0e0 to darker shade
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rewardText: {
    fontSize: 14,
    color: '#a8a8ff', // FIXED: Changed from #6c5ce7 to match app theme
    fontWeight: '600',
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#ff6b6b', // FIXED: Changed from #d63031 to softer red
    fontSize: 13,
  },
});