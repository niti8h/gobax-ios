import React from 'react';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

interface GobaxLogoProps {
  size?: number;
}

export const GobaxLogo: React.FC<GobaxLogoProps> = ({ size = 86 }) => {
  const center = size / 2;
  const radius = size * 0.36;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Gobax logo">
      <Circle cx="50" cy="50" r="46" fill="#030712" stroke="#F6C453" strokeWidth="2" />
      <Path
        d="M28 31 A29 29 0 0 1 70 24 L76 18 M76 18 L75 31 M76 18 L63 20"
        fill="none"
        stroke="#F8D477"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
      <Path
        d="M72 69 A29 29 0 0 1 30 76 L24 82 M24 82 L25 69 M24 82 L37 80"
        fill="none"
        stroke="#C98A20"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
      <G rotation="-8" origin={`${center}, ${center}`}>
        <SvgText
          x="50"
          y="67"
          fill="#F6C453"
          fontSize="49"
          fontWeight="900"
          textAnchor="middle"
        >
          G
        </SvgText>
      </G>
    </Svg>
  );
};
