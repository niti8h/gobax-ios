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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { VisualCaptcha } from '../../components/VisualCaptcha';
import { GlowButton } from '../../components/GlowButton';
import { COLORS } from '../../theme/colors';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

type TabType = 'mobile' | 'email';

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register, language } = useAuth();

  const [registerType, setRegisterType] = useState<TabType>('mobile');
  const [inputValue, setInputValue] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [expectedCaptcha, setExpectedCaptcha] = useState('6912');
  const [securePassword, setSecurePassword] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalVisible, setForgotModalVisible] = useState(false);

  const handleRegister = async () => {
    setErrorMessage('');

    if (!inputValue.trim()) {
      if (registerType === 'mobile') {
        setErrorMessage(
          language === 'vi'
            ? 'Vui lòng nhập số điện thoại'
            : 'Please enter your phone number'
        );
      } else {
        setErrorMessage(
          language === 'vi' ? 'Vui lòng nhập địa chỉ E-mail' : 'Please enter your E-mail'
        );
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage(
        language === 'vi'
          ? 'Mật khẩu phải có ít nhất 6 ký tự'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    if (!captchaInput || captchaInput.trim() !== expectedCaptcha) {
      setErrorMessage(
        language === 'vi'
          ? 'Mã xác minh hình ảnh không khớp'
          : 'Image verification code does not match'
      );
      return;
    }

    setLoading(true);
    try {
      await register(registerType, inputValue, password, inviteCode);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
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

        {/* Mobile / E-mail Selector Pills matching screenshot */}
        <View style={styles.pillContainer}>
          <TouchableOpacity
            style={[
              styles.pillButton,
              registerType === 'mobile' ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => {
              setRegisterType('mobile');
              setInputValue('');
              setErrorMessage('');
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pillText,
                registerType === 'mobile'
                  ? styles.pillTextActive
                  : styles.pillTextInactive,
              ]}
            >
              Mobile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pillButton,
              registerType === 'email' ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => {
              setRegisterType('email');
              setInputValue('');
              setErrorMessage('');
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pillText,
                registerType === 'email'
                  ? styles.pillTextActive
                  : styles.pillTextInactive,
              ]}
            >
              E-mail
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Autofill */}
        {/* <TouchableOpacity
          style={styles.demoFillBadge}
          onPress={handleQuickDemoFill}
          activeOpacity={0.8}
        >
          <Ionicons name="flash" size={13} color="#00FFE0" />
          <Text style={styles.demoFillText}>
            {language === 'vi' ? ' Điền mẫu đăng ký nhanh' : ' Quick Demo Fill'}
          </Text>
        </TouchableOpacity> */}

        {/* Error notification */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input 1: Điện thoại / E-mail */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {registerType === 'mobile'
              ? language === 'vi'
                ? 'Điện thoại'
                : 'Phone'
              : 'E-mail'}
          </Text>
          <TextInput
            style={styles.underlineInput}
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder={
              registerType === 'mobile'
                ? language === 'vi'
                  ? 'Nhập số điện thoại'
                  : 'Enter phone number'
                : language === 'vi'
                ? 'Nhập địa chỉ email'
                : 'Enter email address'
            }
            placeholderTextColor="#4B5563"
            autoCapitalize="none"
            keyboardType={
              registerType === 'mobile' ? 'phone-pad' : 'email-address'
            }
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
                language === 'vi'
                  ? 'Tối thiểu 6 ký tự'
                  : 'At least 6 characters'
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

        {/* Input 3: Mã xác minh hình ảnh + Visual Captcha Box */}
        {/* Input 3a: Invite Code (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'vi' ? 'Mã mời (Tùy chọn)' : 'Invite Code (Optional)'}
          </Text>
          <TextInput
            style={styles.underlineInput}
            value={inviteCode}
            onChangeText={(text) => {
              setInviteCode(text);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder={language === 'vi' ? 'Nhập mã mời nếu có' : 'Enter invite code if available'}
            placeholderTextColor="#4B5563"
            autoCapitalize="none"
          />
        </View>

        {/* Input 3b: Mã xác minh hình ảnh + Visual Captcha Box */}
        <View style={styles.captchaSection}>
          <View style={styles.captchaInputWrapper}>
            <Text style={styles.label}>
              {language === 'vi'
                ? 'Mã xác minh hình ảnh'
                : 'Image verification code'}
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

        {/* Action Button: Đăng ký ngay (Glowing neon green) */}
        <GlowButton
          title={language === 'vi' ? 'Đăng ký ngay' : 'Register now'}
          onPress={handleRegister}
          loading={loading}
        />

        {/* Footer Links: Quên mật khẩu? | Đăng nhập */}
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
            onPress={onNavigateToLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.blueLink}>
              {language === 'vi' ? 'Đăng nhập' : 'Log in'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          visible={forgotModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setForgotModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {language === 'vi' ? 'Quên mật khẩu' : 'Forgot Password'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {language === 'vi'
                  ? 'Vui lòng quay lại màn hình Đăng nhập để tiến hành khôi phục.'
                  : 'Please return to the login screen to perform account recovery.'}
              </Text>
              <TouchableOpacity
                style={styles.confirmModalBtn}
                onPress={() => {
                  setForgotModalVisible(false);
                  onNavigateToLogin();
                }}
              >
                <Text style={styles.confirmModalBtnText}>
                  {language === 'vi' ? 'Đến Đăng nhập' : 'Go to Login'}
                </Text>
              </TouchableOpacity>
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
  pillContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 20,
    marginTop: 4,
  },
  pillButton: {
    width: 105,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#E2E8F0',
  },
  pillInactive: {
    backgroundColor: '#1E293B',
  },
  pillText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#334155',
  },
  pillTextInactive: {
    color: '#94A3B8',
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
    marginBottom: 18,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00FFE0',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmModalBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#00D06C',
    alignItems: 'center',
  },
  confirmModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
