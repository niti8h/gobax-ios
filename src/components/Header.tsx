import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  showLangSwitch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showLangSwitch = true }) => {
  const { language, setLanguage } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <View style={styles.container}>
      {showLangSwitch && (
        <TouchableOpacity
          style={styles.langBadge}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.langText}>
            {language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </Text>
        </TouchableOpacity>
      )}

      <Image
        source={require('../../assets/gobax-app-icon.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Gobax logo"
      />

      {/* "Chào mừng đến với" glowing neon cyan */}
      <Text style={styles.subtitleGlow}>
        {language === 'vi' ? 'Chào mừng đến với' : 'Welcome to'}
      </Text>

      {/* "GOBAX" glowing white with cyan halo */}
      <Text style={styles.brandTitle}>GOBAX</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
    paddingBottom: 16,
    position: 'relative',
  },
  langBadge: {
    position: 'absolute',
    top: 10,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langText: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logo: {
    width: 82,
    height: 82,
    marginBottom: 4,
  },
  subtitleGlow: {
    fontSize: 27,
    fontWeight: '800',
    color: '#00FFE0',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
    textShadowColor: '#00F2FE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2.2,
    textAlign: 'center',
    textShadowColor: '#00FFE0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
});
