import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Predefined static star coordinates so rendering is deterministic & performant
const STARS = [
  { x: 30, y: 40, size: 2, opacity: 0.8, color: '#FFFFFF' },
  { x: 95, y: 110, size: 2.5, opacity: 0.9, color: '#00FFE0' },
  { x: 180, y: 65, size: 1.5, opacity: 0.6, color: '#FFFFFF' },
  { x: 260, y: 130, size: 2, opacity: 0.7, color: '#A5F3FC' },
  { x: 330, y: 50, size: 3, opacity: 0.9, color: '#FFFFFF' },
  { x: 50, y: 190, size: 1.5, opacity: 0.5, color: '#FFFFFF' },
  { x: 140, y: 240, size: 2, opacity: 0.8, color: '#FFFFFF' },
  { x: 230, y: 210, size: 3, opacity: 1.0, color: '#00F2FE' },
  { x: 310, y: 260, size: 1.5, opacity: 0.6, color: '#FFFFFF' },
  { x: 80, y: 320, size: 2, opacity: 0.75, color: '#E0F2FE' },
  { x: 20, y: 410, size: 2.5, opacity: 0.9, color: '#FFFFFF' },
  { x: 190, y: 370, size: 1.5, opacity: 0.65, color: '#FFFFFF' },
  { x: 290, y: 350, size: 2, opacity: 0.8, color: '#00FFE0' },
  { x: 345, y: 420, size: 2.5, opacity: 0.7, color: '#FFFFFF' },
  { x: 110, y: 480, size: 1.5, opacity: 0.55, color: '#FFFFFF' },
  { x: 240, y: 460, size: 3, opacity: 0.95, color: '#FFFFFF' },
  { x: 45, y: 550, size: 2, opacity: 0.8, color: '#FFFFFF' },
  { x: 160, y: 580, size: 1.5, opacity: 0.6, color: '#A7F3D0' },
  { x: 280, y: 540, size: 2.5, opacity: 0.85, color: '#00F2FE' },
  { x: 335, y: 610, size: 2, opacity: 0.75, color: '#FFFFFF' },
  { x: 90, y: 660, size: 2.5, opacity: 0.9, color: '#FFFFFF' },
  { x: 210, y: 690, size: 1.5, opacity: 0.6, color: '#FFFFFF' },
  { x: 320, y: 720, size: 2, opacity: 0.8, color: '#00FFE0' },
  { x: 40, y: 760, size: 3, opacity: 0.9, color: '#FFFFFF' },
  { x: 150, y: 780, size: 2, opacity: 0.7, color: '#FFFFFF' },
  { x: 270, y: 790, size: 1.5, opacity: 0.6, color: '#E0F2FE' },
];

export const StarfieldBackground: React.FC<{ children: React.ReactNode; showBorder?: boolean }> = ({
  children,
  showBorder = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Deep space black background */}
      <View style={StyleSheet.absoluteFill} />

      {/* Scattered twinkling cosmic stars */}
      {STARS.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              left: `${((star.x / 375) * 100).toFixed(1)}%` as any,
              top: `${((star.y / 812) * 100).toFixed(1)}%` as any,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: star.color,
              opacity: i % 2 === 0 ? star.opacity : pulseAnim,
              shadowColor: star.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 3,
            },
          ]}
        />
      ))}

      {/* Cyber glowing card container border matching screenshot */}
      <View style={[styles.innerFrame, showBorder && styles.cyberBorder]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
    width: '100%',
  },
  innerFrame: {
    flex: 1,
    overflow: 'hidden',
  },
  cyberBorder: {
    marginHorizontal: 8,
    marginVertical: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 255, 224, 0.45)',
    borderRadius: 22,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
  },
});
