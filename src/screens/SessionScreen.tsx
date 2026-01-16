import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { SessionTimer } from '../components/SessionTimer';
import { NoteModal } from '../components/NoteModal';
import { useSession } from '../hooks/useSession';
import { useTimer } from '../hooks/useTimer';
import notificationService from '../services/notificationService';

interface SessionScreenProps {
  navigation?: any;
}

export const SessionScreen: React.FC<SessionScreenProps> = ({ navigation }) => {
  const {
    currentSession,
    completePomodoro,
    addNote,
    abandonSession,
    updatePhase,
    getNextPhaseDuration,
  } = useSession();

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentPhaseDuration, setCurrentPhaseDuration] = useState(
    getNextPhaseDuration()
  );

  const timer = useTimer({
    initialSeconds: currentPhaseDuration,
    onComplete: handleTimerComplete,
    autoStart: true,
  });

  async function handleTimerComplete() {
    if (!currentSession) return;

    await notificationService.playCompletionSound();

    if (currentSession.currentPhase === 'focus') {
      // Focus complete - show note modal
      setShowNoteModal(true);
    } else {
      // Break complete - start next focus
      await startNextFocus();
    }
  }

  const startNextFocus = async () => {
    await updatePhase('focus');
    const nextDuration = getNextPhaseDuration();
    setCurrentPhaseDuration(nextDuration);
    timer.reset(nextDuration);
    timer.start();
  };

  const startNextBreak = async () => {
    await updatePhase('break');
    const breakDuration = getNextPhaseDuration();
    setCurrentPhaseDuration(breakDuration);
    timer.reset(breakDuration);
    timer.start();
  };

  const handleNoteSave = async (note: string) => {
    try {
      await addNote(note);
      const updatedSession = await completePomodoro();
      setShowNoteModal(false);

      if (updatedSession?.status === 'completed') {
        await notificationService.playSessionCompleteSound();
        Alert.alert(
          updatedSession.reward || 'Congratulations!',
          'You completed your study session! 🎉',
          [
            {
              text: 'Awesome!',
              onPress: () => {
                if (navigation) {
                  navigation.navigate('Home');
                }
              },
            },
          ]
        );
      } else {
        // Start break after pomodoro complete
        await startNextBreak();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleNoteSkip = async () => {
    try {
      const updatedSession = await completePomodoro();
      setShowNoteModal(false);

      if (updatedSession?.status === 'completed') {
        await notificationService.playSessionCompleteSound();
        Alert.alert(
          updatedSession.reward || 'Congratulations!',
          'You completed your study session! 🎉',
          [
            {
              text: 'Awesome!',
              onPress: () => {
                if (navigation) {
                  navigation.navigate('Home');
                }
              },
            },
          ]
        );
      } else {
        // Start break after pomodoro complete
        await startNextBreak();
      }
    } catch (error) {
      console.error('Error skipping note:', error);
    }
  };

  const handleSkipPhase = async () => {
    if (!currentSession) return;

    Alert.alert(
      'Skip Phase',
      `Skip current ${currentSession.currentPhase} and move to next?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: async () => {
            await notificationService.playCompletionSound();
            timer.reset(0); // Stop current timer

            if (currentSession.currentPhase === 'focus') {
              // Focus skip - show note modal (pomodoro will be counted)
              setShowNoteModal(true);
            } else {
              // Break skip - start next focus directly
              await startNextFocus();
            }
          },
        },
      ]
    );
  };

  const handleAbandonSession = async () => {
    Alert.alert(
      'Abandon Session?',
      'Are you sure you want to abandon this session? This will delete all progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ User confirmed abandon');
              
              // Stop timer first
              timer.reset(0);
              
              // Abandon session (this deletes it completely)
              await abandonSession();
              
              console.log('✅ Session abandoned successfully');
              
              // Navigate back to home IMMEDIATELY
              if (navigation) {
                console.log('🏠 Navigating to Home');
                navigation.navigate('Home');
              }
            } catch (error) {
              console.error('❌ Error abandoning session:', error);
              
              // Even on error, go back to home
              if (navigation) {
                console.log('🏠 Force navigating to Home after error');
                navigation.navigate('Home');
              }
            }
          },
        },
      ]
    );
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      handleAbandonSession();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentSession]);

  // If no session, return null (will auto-navigate via App.tsx)
  if (!currentSession) {
    console.log('⚠️ No current session in SessionScreen');
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleSkipPhase}
      >
        <Text style={styles.skipButtonText}>⏭️ Skip</Text>
      </TouchableOpacity>

      <SessionTimer
        formattedTime={timer.formattedTime}
        phase={currentSession.currentPhase === 'break' ? 'break' : 'focus'}
        progress={timer.progress}
        pomodoroNumber={currentSession.pomodorosCompleted + 1}
        totalPomodoros={currentSession.totalPomodoros}
        onPause={timer.pause}
        onResume={timer.resume}
        isPaused={timer.isPaused}
      />

      <NoteModal
        visible={showNoteModal}
        pomodoroNumber={currentSession.pomodorosCompleted + 1}
        onSave={handleNoteSave}
        onSkip={handleNoteSkip}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(168, 168, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
  },
  skipButtonText: {
    color: '#0f0f1e',
    fontSize: 15,
    fontWeight: 'bold',
  },
});