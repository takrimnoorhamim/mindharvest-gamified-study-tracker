import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class NotificationService {
  private isKeepAwakeActive = false;
  private sound: Audio.Sound | null = null;

  async enableKeepAwake(): Promise<void> {
    try {
      if (!this.isKeepAwakeActive) {
        await activateKeepAwakeAsync();
        this.isKeepAwakeActive = true;
        console.log('Screen will stay awake');
      }
    } catch (error) {
      console.error('Error enabling keep awake:', error);
    }
  }

  async disableKeepAwake(): Promise<void> {
    try {
      if (this.isKeepAwakeActive) {
        deactivateKeepAwake();
        this.isKeepAwakeActive = false;
        console.log('Screen can sleep now');
      }
    } catch (error) {
      console.error('Error disabling keep awake:', error);
    }
  }

  // Play completion sound
  async playCompletionSound(): Promise<void> {
    try {
      // Set audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        // Using system sound - a simple beep
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
      
      this.sound = sound;

      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  // Play alarm for session complete
  async playSessionCompleteSound(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 1.0, numberOfLoops: 2 }
      );
      
      this.sound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  async requestDNDPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      console.log('Please enable Do Not Disturb manually');
      return false;
    }
    return false;
  }

  showBreakNotification(breakDuration: number): void {
    console.log(`Break started: ${breakDuration} seconds`);
  }

  showFocusNotification(): void {
    console.log('Focus time started');
  }

  showCompletionNotification(reward: string): void {
    console.log('Session completed:', reward);
  }

  getBreakMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export default new NotificationService();