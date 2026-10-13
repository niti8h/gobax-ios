import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SignInPromptProps {
  visible: boolean;
  language: 'vi' | 'en';
  onSignIn: () => void;
  onSkip: () => void;
}

// Shown once, on first launch. Signing in is optional (App Review guideline
// 5.1.1(v)), so "Continue without account" is as prominent as "Sign in" and
// closes the prompt with every feature still available.
export const SignInPrompt: React.FC<SignInPromptProps> = ({ visible, language, onSignIn, onSkip }) => {
  const vi = language === 'vi';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="person-circle-outline" size={36} color="#00D06C" />
          </View>
          <Text style={styles.title}>{vi ? 'Chào mừng đến với Gobax' : 'Welcome to Gobax'}</Text>
          <Text style={styles.body}>
            {vi
              ? 'Đăng nhập để lưu điểm và tiến độ học tập. Bạn cũng có thể dùng mọi tính năng mà không cần tài khoản.'
              : 'Sign in to save your points and learning progress. You can also use every feature without an account.'}
          </Text>

          <TouchableOpacity style={styles.primary} onPress={onSignIn} activeOpacity={0.85}>
            <Text style={styles.primaryText}>{vi ? 'Đăng nhập hoặc tạo tài khoản' : 'Sign in or create account'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={onSkip} activeOpacity={0.85}>
            <Text style={styles.secondaryText}>{vi ? 'Tiếp tục không cần tài khoản' : 'Continue without account'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 7, 18, 0.78)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#0B1220',
    borderColor: 'rgba(0, 208, 108, 0.25)',
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 420,
    padding: 24,
    width: '100%',
  },
  iconWrap: { alignItems: 'center', marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  body: { color: '#CBD5E1', fontSize: 15, lineHeight: 21, marginTop: 10, textAlign: 'center' },
  primary: {
    alignItems: 'center',
    backgroundColor: '#00D06C',
    borderRadius: 12,
    marginTop: 22,
    paddingVertical: 14,
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondary: {
    alignItems: 'center',
    borderColor: 'rgba(148, 163, 184, 0.45)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
  },
  secondaryText: { color: '#E2E8F0', fontSize: 16, fontWeight: '700' },
});
