import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { StarfieldBackground } from './src/components/StarfieldBackground';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { BottomNavBar, TabKey } from './src/components/BottomNavBar';
import { HomeScreen } from './src/screens/main/HomeScreen';
import { ArticlesScreen } from './src/screens/main/ArticlesScreen';
import { QuizScreen } from './src/screens/main/QuizScreen';
import { SettingsScreen } from './src/screens/main/SettingsScreen';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isRestoringSession } = useAuth();

  // Detect web query param for previewing screens
  const getInitialState = () => {
    if (__DEV__ && typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get('screen');
      if (screenParam === 'register') return { mode: 'register', authed: false, tab: 'home' as TabKey };
      if (screenParam === 'home') return { mode: 'login', authed: true, tab: 'home' as TabKey };
      if (screenParam === 'articles') return { mode: 'login', authed: true, tab: 'articles' as TabKey };
      if (screenParam === 'quiz') return { mode: 'login', authed: true, tab: 'quiz' as TabKey };
      if (screenParam === 'settings') return { mode: 'login', authed: true, tab: 'settings' as TabKey };
    }
    return { mode: 'login', authed: false, tab: 'home' as TabKey };
  };

  const initial = getInitialState();
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initial.mode as any);
  const [activeTab, setActiveTab] = useState<TabKey>(initial.tab);
  const [isGuest, setIsGuest] = useState(false);

  if (isRestoringSession) {
    return <View style={styles.loadingRoot} />;
  }

  if (!isAuthenticated && !isGuest && !initial.authed) {
    return (
      <View style={styles.authRoot}>
        <StarfieldBackground showBorder={true}>
          {authMode === 'login' ? (
            <LoginScreen
              onNavigateToRegister={() => setAuthMode('register')}
              onContinueAsGuest={() => setIsGuest(true)}
            />
          ) : (
            <RegisterScreen onNavigateToLogin={() => setAuthMode('login')} />
          )}
        </StarfieldBackground>
      </View>
    );
  }

  // Authenticated or guest state: show the educational app.
  return (
    <View style={styles.mainContainer}>
      <View style={styles.screenWrapper}>
        {activeTab === 'home' && <HomeScreen onNavigateTab={setActiveTab} />}
        {activeTab === 'articles' && <ArticlesScreen />}
        {activeTab === 'quiz' && <QuizScreen />}
        {activeTab === 'settings' && (
          <SettingsScreen
            isGuest={isGuest}
            onGuestLogout={() => setIsGuest(false)}
          />
        )}
      </View>

      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: '#030712',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#030712',
  },
  screenWrapper: {
    flex: 1,
  },
});
