import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BrandMonogram } from './BrandMonogram';
import { colors } from '../../constants/colors';
import { BRAND } from '../../constants/brand';
import { spacing } from '../../constants/theme';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'onDark' | 'onLight';
  showSubtitle?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'onDark',
  showSubtitle = true,
  style,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 40,
          titleSize: 14,
          subSize: 9,
          gap: spacing.xs,
          letterSpacing: 1.5,
        };
      case 'lg':
        return {
          iconSize: 84,
          titleSize: 22,
          subSize: 12,
          gap: spacing.md,
          letterSpacing: 3,
        };
      case 'md':
      default:
        return {
          iconSize: 64,
          titleSize: 18,
          subSize: 11,
          gap: spacing.sm,
          letterSpacing: 2,
        };
    }
  };

  const dim = getDimensions();
  const isDarkBg = variant === 'onDark';

  return (
    <View style={[styles.container, style]}>
      <BrandMonogram
        size={dim.iconSize}
        theme={isDarkBg ? 'goldOnNavy' : 'whiteOnNavy'}
      />

      <View style={[styles.textWrapper, { marginTop: dim.gap }]}>
        <Text
          style={[
            styles.titleText,
            {
              fontSize: dim.titleSize,
              letterSpacing: dim.letterSpacing,
              color: isDarkBg ? colors.white : colors.navy[800],
            },
          ]}
        >
          {BRAND.name.toUpperCase()}
        </Text>

        {showSubtitle ? (
          <View style={styles.subtitleRow}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: isDarkBg ? colors.gold[500] : colors.gold[600] },
              ]}
            />
            <Text
              style={[
                styles.sinceText,
                {
                  fontSize: dim.subSize,
                  color: isDarkBg ? colors.gold[300] : colors.gold[700],
                },
              ]}
            >
              {BRAND.establishedText}
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: isDarkBg ? colors.gold[500] : colors.gold[600] },
              ]}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs + 1,
    gap: spacing.xs,
  },
  dividerLine: {
    width: 24,
    height: 1,
    opacity: 0.8,
  },
  sinceText: {
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
