import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SessionCard } from '../components/SessionCard';
import { useStorage } from '../hooks/useStorage';
import { Session } from '../types';

interface HistoryScreenProps {
  navigation?: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { allSessions, isLoading, deleteSession, refreshSessions } = useStorage();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSessions();
    setRefreshing(false);
  };

  const handleSessionPress = (session: Session) => {
    const notesText = session.notes.length > 0
      ? session.notes.map((n, i) => `${i + 1}. ${n.content}`).join('\n\n')
      : 'No notes recorded';

    const rewardText = session.reward ? `\n\n🎉 ${session.reward}` : '';

    Alert.alert(
      session.name,
      `Status: ${session.status}\nPomodoros: ${session.pomodorosCompleted}/${session.totalPomodoros}${rewardText}\n\nNotes:\n${notesText}`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteSession = (session: Session) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(session.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>No Sessions Yet</Text>
      <Text style={styles.emptyText}>
        Your study history will appear here.{'\n'}Start your first session!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Study History</Text>
      <Text style={styles.headerSubtitle}>
        {allSessions.length} {allSessions.length === 1 ? 'session' : 'sessions'} total
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => handleSessionPress(item)}
            onDelete={() => handleDeleteSession(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          allSessions.length === 0 ? styles.emptyListContent : styles.listContent
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#a8a8ff"
            colors={['#a8a8ff']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a8a8ff',
    opacity: 0.9,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
});