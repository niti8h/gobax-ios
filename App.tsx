import React, { useEffect, useState } from 'react';
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
import { SecurityCheckGate } from './src/screens/auth/SecurityCheckGate';
import { SignInPrompt } from './src/components/SignInPrompt';
import * as SecureStore from 'expo-secure-store';

const SIGN_IN_PROMPT_KEY = 'gobax-sign-in-prompt-seen';

type AuthMode = 'login' | 'register' | null;

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    isRestoringSession,
    isSecurityCheckVisible,
    securityCheckUrl,
    securityCheckOrigin,
    completeSecurityCheck,
    cancelSecurityCheck,
    language,
  } = useAuth();

  // Detect web query param for previewing screens
  const getInitialState = () => {
    if (__DEV__ && typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get('screen');
      if (screenParam === 'login') return { mode: 'login' as AuthMode, tab: 'home' as TabKey };
      if (screenParam === 'register') return { mode: 'register' as AuthMode, tab: 'home' as TabKey };
      if (screenParam === 'articles') return { mode: null, tab: 'articles' as TabKey };
      if (screenParam === 'quiz') return { mode: null, tab: 'quiz' as TabKey };
      if (screenParam === 'settings') return { mode: null, tab: 'settings' as TabKey };
    }
    return { mode: null, tab: 'home' as TabKey };
  };

  const initial = getInitialState();
  // Learning content is open to everyone. The sign-in screens only appear
  // when someone chooses to sign in (App Review guideline 5.1.1(v)).
  const [authMode, setAuthMode] = useState<AuthMode>(initial.mode);
  const [activeTab, setActiveTab] = useState<TabKey>(initial.tab);

  useEffect(() => {
    if (isAuthenticated) setAuthMode(null);
  }, [isAuthenticated]);

  // null while loading, so the prompt never flashes for returning users.
  const [promptSeen, setPromptSeen] = useState<boolean | null>(null);
  useEffect(() => {
    SecureStore.getItemAsync(SIGN_IN_PROMPT_KEY)
      .then(value => setPromptSeen(value === '1'))
      .catch(() => setPromptSeen(true));
  }, []);

  const dismissPrompt = () => {
    setPromptSeen(true);
    SecureStore.setItemAsync(SIGN_IN_PROMPT_KEY, '1').catch(() => undefined);
  };

  if (isRestoringSession) {
    return <View style={styles.loadingRoot} />;
  }

  if (isSecurityCheckVisible) {
    return (
      <SecurityCheckGate
        url={securityCheckUrl}
        origin={securityCheckOrigin}
        onVerified={completeSecurityCheck}
        onBack={cancelSecurityCheck}
      />
    );
  }

  if (authMode && !isAuthenticated) {
    return (
      <View style={styles.authRoot}>
        <StarfieldBackground showBorder={true}>
          {authMode === 'login' ? (
            <LoginScreen
              onNavigateToRegister={() => setAuthMode('register')}
              onContinueAsGuest={() => setAuthMode(null)}
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
            isGuest={!isAuthenticated}
            onSignIn={() => setAuthMode('login')}
          />
        )}
      </View>

      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      <SignInPrompt
        visible={promptSeen === false && !isAuthenticated && activeTab === 'home'}
        language={language}
        onSignIn={() => {
          dismissPrompt();
          setAuthMode('login');
        }}
        onSkip={dismissPrompt}
      />
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
