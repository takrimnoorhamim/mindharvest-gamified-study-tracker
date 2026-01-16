import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { SessionScreen } from './src/screens/SessionScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { useSession } from './src/hooks/useSession';

type TabType = 'home' | 'session' | 'history';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { currentSession, refreshSession } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh session when app loads
  useEffect(() => {
    refreshSession();
  }, []);

  // CRITICAL: Monitor session changes and auto-navigate
  useEffect(() => {
    console.log('🔍 Session state changed:', currentSession?.status);
    
    if (currentSession && currentSession.status === 'active') {
      // Active session exists - go to session screen
      console.log('✅ Active session detected, navigating to Session');
      setActiveTab('session');
    } else {
      // No active session - if on session screen, go back to home
      if (activeTab === 'session') {
        console.log('❌ No active session, going back to Home');
        setActiveTab('home');
        // Force complete refresh of home screen
        setRefreshKey(prev => prev + 1);
      }
    }
  }, [currentSession]);

  // Additional effect to force refresh when tab changes
  useEffect(() => {
    if (activeTab === 'home') {
      console.log('🏠 Home tab activated, forcing refresh');
      refreshSession();
      setRefreshKey(prev => prev + 1);
    } else if (activeTab === 'history') {
      console.log('📚 History tab activated, forcing refresh');
      setRefreshKey(prev => prev + 1);
    }
  }, [activeTab]);

  const navigation = {
    navigate: (screen: string) => {
      console.log('🧭 Navigation request:', screen);
      
      if (screen === 'Home') {
        setActiveTab('home');
        refreshSession();
        setRefreshKey(prev => prev + 1);
      } else if (screen === 'Session') {
        setActiveTab('session');
      } else if (screen === 'History') {
        setActiveTab('history');
        setRefreshKey(prev => prev + 1);
      }
    },
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'session':
        return <SessionScreen key={`session-${refreshKey}`} navigation={navigation} />;
      case 'history':
        return <HistoryScreen key={`history-${refreshKey}`} navigation={navigation} />;
      default:
        return <HomeScreen key={`home-${refreshKey}`} navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1e" />
      {renderScreen()}
      
      {activeTab !== 'session' && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'home' && styles.tabButtonActive]}
            onPress={() => {
              console.log('🏠 Home tab pressed');
              setActiveTab('home');
              refreshSession();
              setRefreshKey(prev => prev + 1);
            }}
          >
            <Text style={styles.tabIcon}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
            onPress={() => {
              console.log('📖 History tab pressed');
              setActiveTab('history');
              setRefreshKey(prev => prev + 1);
            }}
          >
            <Text style={styles.tabIcon}>📖</Text>
            <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderTopWidth: 3,
    borderTopColor: '#a8a8ff',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#666',
  },
  tabLabelActive: {
    color: '#a8a8ff',
    fontWeight: '600',
  },
});