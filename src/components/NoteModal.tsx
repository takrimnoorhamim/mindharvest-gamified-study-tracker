
// FILE 2: src/components/NoteModal.tsx
// ============================================

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { APP_CONFIG } from '../utils/constants';

interface NoteModalProps {
  visible: boolean;
  pomodoroNumber: number;
  onSave: (note: string) => void;
  onSkip: () => void;
}

const { width } = Dimensions.get('window');

export const NoteModal: React.FC<NoteModalProps> = ({
  visible,
  pomodoroNumber,
  onSave,
  onSkip,
}) => {
  const [noteText, setNoteText] = useState('');

  const handleSave = () => {
    if (noteText.trim().length >= APP_CONFIG.MIN_NOTE_LENGTH) {
      onSave(noteText.trim());
      setNoteText('');
    }
  };

  const handleSkip = () => {
    setNoteText('');
    onSkip();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleSkip}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.backdrop} />
        
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              📝 Pomodoro {pomodoroNumber} Complete!
            </Text>
            <Text style={styles.subtitle}>
              What did you learn or accomplish?
            </Text>
          </View>

          {/* Input Area */}
          <TextInput
            style={styles.input}
            placeholder="Type your notes here..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={noteText}
            onChangeText={setNoteText}
            maxLength={APP_CONFIG.MAX_NOTE_LENGTH}
            autoFocus
            textAlignVertical="top"
          />

          {/* Character Count */}
          <Text style={styles.charCount}>
            {noteText.length} / {APP_CONFIG.MAX_NOTE_LENGTH}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.saveButton,
                noteText.trim().length < APP_CONFIG.MIN_NOTE_LENGTH && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={noteText.trim().length < APP_CONFIG.MIN_NOTE_LENGTH}
            >
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    minHeight: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  charCount: {
    textAlign: 'right',
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#e0e0e0',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
});