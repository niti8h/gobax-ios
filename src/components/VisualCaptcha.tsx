import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface VisualCaptchaProps {
  onCodeChange: (code: string) => void;
}

// Background noise characters matching the screenshot
const NOISE_CHARS = [
  { char: 'm', x: 8, y: 12, color: '#a3715c', size: 10 },
  { char: 'w', x: 14, y: 8, color: '#888888', size: 9 },
  { char: '7', x: 12, y: 22, color: '#7ba098', size: 11 },
  { char: 'e', x: 45, y: 6, color: '#4caf50', size: 11 },
  { char: 'k', x: 38, y: 28, color: '#00838f', size: 10 },
  { char: 'd', x: 70, y: 6, color: '#e57373', size: 10 },
  { char: '2', x: 68, y: 12, color: '#689f38', size: 9 },
  { char: 'y', x: 72, y: 26, color: '#d32f2f', size: 10 },
  { char: 't', x: 105, y: 24, color: '#0288d1', size: 10 },
  { char: 'd', x: 120, y: 8, color: '#81c784', size: 11 },
  { char: 'c', x: 135, y: 28, color: '#43a047', size: 10 },
  { char: 'n', x: 142, y: 27, color: '#388e3c', size: 9 },
  { char: '5', x: 138, y: 14, color: '#aed581', size: 9 },
];

export const VisualCaptcha: React.FC<VisualCaptchaProps> = ({ onCodeChange }) => {
  const [captchaCode, setCaptchaCode] = useState<string>('4216');
  const [digitColors, setDigitColors] = useState<string[]>([
    '#2e7d32',
    '#1b5e20',
    '#2e7d32',
    '#1b5e20',
  ]);

  const generateNewCaptcha = () => {
    // Generate 4 random digits
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    onCodeChange(code);

    // Randomize digit color palette between emerald green and deep cyber indigo
    const palettes = [
      ['#2e7d32', '#1b5e20', '#2e7d32', '#1b5e20'],
      ['#3949ab', '#1a237e', '#4527a0', '#283593'],
      ['#2e7d32', '#33691e', '#1b5e20', '#2e7d32'],
    ];
    const chosen = palettes[Math.floor(Math.random() * palettes.length)];
    setDigitColors(chosen);
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={generateNewCaptcha}
      style={styles.container}
    >
      {/* Background noise characters */}
      {NOISE_CHARS.map((item, idx) => (
        <Text
          key={idx}
          style={[
            styles.noiseChar,
            {
              left: item.x,
              top: item.y,
              color: item.color,
              fontSize: item.size,
            },
          ]}
        >
          {item.char}
        </Text>
      ))}

      {/* Main 4 Captcha Digits with distortions */}
      <View style={styles.digitRow}>
        {captchaCode.split('').map((char, index) => {
          const rotations = ['-14deg', '8deg', '-6deg', '12deg'];
          const offsets = [2, -3, 3, -2];
          return (
            <Text
              key={index}
              style={[
                styles.digit,
                {
                  color: digitColors[index] || '#1b5e20',
                  transform: [
                    { rotate: rotations[index % 4] },
                    { translateY: offsets[index % 4] },
                  ],
                },
              ]}
            >
              {char}
            </Text>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 135,
    height: 46,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noiseChar: {
    position: 'absolute',
    fontWeight: '300',
    opacity: 0.45,
  },
  digitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',
    paddingHorizontal: 4,
  },
  digit: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
