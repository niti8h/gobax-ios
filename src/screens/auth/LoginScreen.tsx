import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { VisualCaptcha } from '../../components/VisualCaptcha';
import { GlowButton } from '../../components/GlowButton';
import { COLORS } from '../../theme/colors';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister, onContinueAsGuest }) => {
  const { login, requestPasswordReset, language } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [expectedCaptcha, setExpectedCaptcha] = useState('4216');
  const [securePassword, setSecurePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage(
        language === 'vi'
          ? 'Vui lòng nhập số điện thoại hoặc Gmail'
          : 'Please enter phone number or Gmail'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        language === 'vi' ? 'Vui lòng nhập mật khẩu' : 'Please enter your password'
      );
      return;
    }

    if (!captchaInput || captchaInput.trim() !== expectedCaptcha) {
      setErrorMessage(
        language === 'vi'
          ? 'Mã xác minh không chính xác. Vui lòng kiểm tra lại.'
          : 'Incorrect verification code. Please check again.'
      );
      return;
    }

    setLoading(true);
    try {
      await login(identifier, password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Notice', 'Please enter your email or phone.');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(resetEmail);
      setResetSent(true);
    } catch (error) {
      Alert.alert(
        language === 'vi' ? 'Không thể gửi yêu cầu' : 'Request failed',
        error instanceof Error ? error.message : 'Unable to request a password reset. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const closeResetModal = () => {
      setResetSent(false);
      setForgotModalVisible(false);
      setResetEmail('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header showLangSwitch={true} />

        {/* Quick Demo Autofill helper badge */}
        {/* <TouchableOpacity
          style={styles.demoFillBadge}
          onPress={handleQuickDemoFill}
          activeOpacity={0.8}
        >
          <Ionicons name="flash" size={13} color="#00FFE0" />
          <Text style={styles.demoFillText}>
            {language === 'vi' ? ' Điền mẫu nhanh (Demo Fill)' : ' Quick Demo Fill'}
          </Text>
        </TouchableOpacity> */}

        {/* Error notification banner */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input 1: Số điện thoại hoặc địa chỉ Gmail */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'vi'
              ? 'Mã người dùng'
              : 'User ID'}
          </Text>
          <TextInput
            style={styles.underlineInput}
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder={
              language === 'vi'
                ? 'Nhập mã người dùng'
                : 'Enter your user ID'
            }
            placeholderTextColor="#4B5563"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Input 2: Mật khẩu */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'vi' ? 'Mật khẩu' : 'Password'}
          </Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.underlineInput, { flex: 1 }]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={
                language === 'vi' ? 'Nhập mật khẩu' : 'Enter password'
              }
              placeholderTextColor="#4B5563"
              secureTextEntry={securePassword}
            />
            <TouchableOpacity
              onPress={() => setSecurePassword(!securePassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={securePassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Input 3: Mã xác minh + Visual Captcha Box */}
        <View style={styles.captchaSection}>
          <View style={styles.captchaInputWrapper}>
            <Text style={styles.label}>
              {language === 'vi' ? 'Mã xác minh' : 'Verification code'}
            </Text>
            <TextInput
              style={styles.underlineInput}
              value={captchaInput}
              onChangeText={(text) => {
                setCaptchaInput(text);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={language === 'vi' ? 'Mã 4 số' : '4-digit code'}
              placeholderTextColor="#4B5563"
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <View style={styles.captchaBoxWrapper}>
            <VisualCaptcha onCodeChange={(code) => setExpectedCaptcha(code)} />
          </View>
        </View>

        {/* Action Button: Đăng nhập (Glowing neon green) */}
        <GlowButton
          title={language === 'vi' ? 'Đăng nhập' : 'Log in'}
          onPress={handleLogin}
          loading={loading}
        />

        {/* Footer Links: Quên mật khẩu? | Đăng ký ngay */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => setForgotModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.blueLink}>
              {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNavigateToRegister}
            activeOpacity={0.7}
          >
            <Text style={styles.blueLink}>
              {language === 'vi' ? 'Đăng ký ngay' : 'Register now'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onContinueAsGuest} style={styles.guestButton} activeOpacity={0.8}>
          <Text style={styles.guestButtonText}>
            {language === 'vi' ? 'Tiếp tục với tư cách khách' : 'Continue as guest'}
          </Text>
        </TouchableOpacity>

        {/* Forgot Password Modal */}
        <Modal
          visible={forgotModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeResetModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {language === 'vi' ? 'Khôi phục mật khẩu' : 'Reset Password'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {language === 'vi'
                  ? 'Nhập email hoặc số điện thoại để nhận mã khôi phục tài khoản.'
                  : 'Enter your email or phone to receive a recovery code.'}
              </Text>

              {resetSent ? (
                <View style={styles.resetSuccessBox}>
                  <Ionicons name="checkmark-circle" size={32} color="#00E676" />
                  <Text style={styles.resetSuccessText}>
                    {language === 'vi'
                      ? 'Đã gửi hướng dẫn khôi phục qua tin nhắn/email!'
                      : 'Recovery instructions sent successfully!'}
                  </Text>
                  <TouchableOpacity style={styles.confirmButton} onPress={closeResetModal}>
                    <Text style={styles.confirmText}>{language === 'vi' ? 'Đóng' : 'Close'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="user@gobax.io"
                    placeholderTextColor="#6B7280"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeResetModal}
                    >
                      <Text style={styles.cancelText}>
                        {language === 'vi' ? 'Hủy' : 'Cancel'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleResetPassword}
                      disabled={loading}
                    >
                      <Text style={styles.confirmText}>
                        {language === 'vi' ? 'Gửi mã' : 'Send Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  demoFillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 224, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.3)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  demoFillText: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    color: '#E5E7EB',
    fontWeight: '500',
    marginBottom: 8,
  },
  underlineInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 2,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    padding: 4,
  },
  captchaSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  captchaInputWrapper: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  captchaBoxWrapper: {
    marginBottom: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
    paddingHorizontal: 2,
  },
  blueLink: {
    color: COLORS.neonBlue,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  guestButton: {
    alignSelf: 'center',
    marginTop: 22,
    paddingVertical: 8,
  },
  guestButtonText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.3)',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00FFE0',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#030712',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  cancelText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#00D06C',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resetSuccessBox: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  resetSuccessText: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
});
