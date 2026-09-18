import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
            Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

interface SettingsScreenProps {
  isGuest?: boolean;
  onGuestLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ isGuest = false, onGuestLogout }) => {
  const insets = useSafeAreaInsets();
  const { user, logout, deleteAccount, language, setLanguage } = useAuth();

  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'VND' | 'EUR'>('USD');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
    onGuestLogout?.();
  };

  const openPolicy = (url: string) => {
    Linking.openURL(url);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      language === 'vi' ? 'Xóa tài khoản?' : 'Delete account?',
      language === 'vi'
        ? 'Yêu cầu xóa tài khoản sẽ được tiếp nhận. Tài khoản sẽ bị xóa sau 7 ngày nếu bạn không đăng nhập lại.'
        : 'Your deletion request will be received. Your account will be deleted after 7 days if you do not log in again.',
      [
        { text: language === 'vi' ? 'Hủy' : 'Cancel', style: 'cancel' },
        {
          text: language === 'vi' ? 'Xóa tài khoản' : 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error) {
              Alert.alert(
                language === 'vi' ? 'Không thể xóa tài khoản' : 'Could not delete account',
                error instanceof Error
                  ? error.message
                  : language === 'vi'
                    ? 'Vui lòng thử lại sau.'
                    : 'Please try again later.',
              );
              return;
            }

            Alert.alert(
              language === 'vi' ? 'Đã nhận yêu cầu' : 'Request received',
              language === 'vi'
                ? 'Tài khoản của bạn sẽ bị xóa sau 7 ngày nếu bạn không đăng nhập lại.'
                : 'Your account will be deleted after 7 days if you do not log in again.',
            );
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenSubtitle}>
            {language === 'vi' ? 'Quản lý tài khoản' : 'Account Settings'}
          </Text>
          <Text style={styles.screenTitle}>
            {language === 'vi' ? 'Cài đặt' : 'Settings'}
          </Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'G'}
              </Text>
            </View>

            <View style={styles.profileDetails}>
              <Text style={styles.userName}>{user?.name || 'Learner'}</Text>
              <Text style={styles.userEmail}>{user?.email || user?.phone}</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {language === 'vi' ? 'Tùy chọn ứng dụng' : 'Preferences'}
          </Text>

          <View style={styles.settingCard}>
            {/* Language Selection */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <Ionicons name="globe-outline" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>
                    {language === 'vi' ? 'Ngôn ngữ' : 'Language'}
                  </Text>
                  <Text style={styles.settingSub}>
                    {language === 'vi' ? 'Tiếng Việt' : 'English'}
                  </Text>
                </View>
              </View>
              <View style={styles.langPillGroup}>
                <TouchableOpacity
                  style={[
                    styles.langOptionPill,
                    language === 'vi' && styles.langOptionPillActive,
                  ]}
                  onPress={() => setLanguage('vi')}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      language === 'vi' && styles.langOptionTextActive,
                    ]}
                  >
                    VI
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.langOptionPill,
                    language === 'en' && styles.langOptionPillActive,
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      language === 'en' && styles.langOptionTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Currency Selection */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Ionicons name="cash-outline" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>
                    {language === 'vi' ? 'Đơn vị tiền tệ' : 'Fiat Currency'}
                  </Text>
                  <Text style={styles.settingSub}>{selectedCurrency}</Text>
                </View>
              </View>
              <View style={styles.langPillGroup}>
                {(['USD', 'VND', 'EUR'] as const).map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.langOptionPill,
                      selectedCurrency === curr && styles.langOptionPillActive,
                    ]}
                    onPress={() => setSelectedCurrency(curr)}
                  >
                    <Text
                      style={[
                        styles.langOptionText,
                        selectedCurrency === curr && styles.langOptionTextActive,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {language === 'vi' ? 'Thông tin' : 'About'}
          </Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(100, 116, 139, 0.12)' }]}>
                  <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Gobax Version</Text>
                  <Text style={styles.settingSub}>v1.0.0 (Production build)</Text>
                </View>
              </View>
              <Text style={styles.upToDateText}>Latest</Text>
            </View>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => openPolicy('https://gobax.099909.workers.dev/privacy')}>
            <Text style={styles.legalLinkText}>
              {language === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPolicy('https://gobax.099909.workers.dev/term-and-condtions')}>
            <Text style={styles.legalLinkText}>
              {language === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Use'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isGuest && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={22} color="#F97316" />
            <Text style={styles.deleteButtonText}>
              {language === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutButtonText}>
            {language === 'vi' ? 'Đăng xuất' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out" size={32} color="#EF4444" />
            </View>

            <Text style={styles.modalTitle}>
              {language === 'vi' ? 'Xác nhận đăng xuất?' : 'Confirm Log Out?'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {language === 'vi'
                ? 'Bạn sẽ quay lại màn hình đăng nhập của Gobax. Phiên đăng nhập hiện tại sẽ kết thúc.'
                : 'You will return to the Gobax login screen. Your current session will end.'}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutButton}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmLogoutText}>
                  {language === 'vi' ? 'Đăng xuất ngay' : 'Log Out Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
  },
  screenSubtitle: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileCard: {
    backgroundColor: '#0B0F19',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 255, 224, 0.25)',
    padding: 18,
    marginBottom: 24,
    shadowColor: '#00FFE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 30px rgba(0, 255, 224, 0.12)',
        }
      : {}),
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#00FFE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#00FFE0',
    fontSize: 24,
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
  },
  uidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uidText: {
    color: '#64748B',
    fontSize: 12,
  },
  copiedText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  settingCard: {
    backgroundColor: '#0B0F19',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  langPillGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  langOptionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  langOptionPillActive: {
    backgroundColor: '#00D06C',
    borderColor: '#00E676',
  },
  langOptionText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  langOptionTextActive: {
    color: '#FFFFFF',
  },
  upToDateText: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    gap: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 18,
  },
  legalLinkText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.45)',
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#FB923C',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
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
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: 24,
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmLogoutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmLogoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
