import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius } from '../../constants/theme';

export interface BrandMonogramProps {
  size?: number;
  theme?: 'goldOnNavy' | 'navyOnGold' | 'whiteOnNavy' | 'goldOnWhite';
  style?: ViewStyle;
}

export const BrandMonogram: React.FC<BrandMonogramProps> = ({
  size = 64,
  theme = 'goldOnNavy',
  style,
}) => {
  const getThemeStyles = () => {
    switch (theme) {
      case 'navyOnGold':
        return {
          bg: colors.gold[500],
          border: colors.gold[400],
          text: colors.navy[900],
          accent: colors.navy[800],
          innerRing: colors.gold[300],
        };
      case 'whiteOnNavy':
        return {
          bg: colors.navy[800],
          border: colors.gold[500],
          text: colors.white,
          accent: colors.gold[400],
          innerRing: colors.navy[700],
        };
      case 'goldOnWhite':
        return {
          bg: colors.white,
          border: colors.gold[500],
          text: colors.navy[800],
          accent: colors.gold[500],
          innerRing: colors.gold[100],
        };
      case 'goldOnNavy':
      default:
        return {
          bg: colors.navy[800],
          border: colors.gold[500],
          text: colors.gold[300],
          accent: colors.gold[500],
          innerRing: colors.navy[900],
        };
    }
  };

  const currentTheme = getThemeStyles();
  const radius = size / 2;
  const fontSize = size * 0.42;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.innerCircle,
          {
            width: size * 0.86,
            height: size * 0.86,
            borderRadius: (size * 0.86) / 2,
            borderColor: currentTheme.innerRing,
          },
        ]}
      >
        <Text
          style={[
            styles.monogramText,
            {
              fontSize,
              color: currentTheme.text,
            },
          ]}
        >
          SP
        </Text>
        <View
          style={[
            styles.solarSunbeam,
            {
              width: size * 0.28,
              height: 2,
              backgroundColor: currentTheme.accent,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  innerCircle: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  solarSunbeam: {
    marginTop: 1,
    borderRadius: borderRadius.pill,
  },
});
