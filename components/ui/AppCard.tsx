import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, shadows, spacing } from '../../constants/theme';

export type CardVariant = 'elevated' | 'outlined' | 'flat' | 'navyHero';

export interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  style,
  variant = 'outlined',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border.default,
          ...shadows.sm,
        };
      case 'flat':
        return {
          backgroundColor: colors.surfaceSubtle,
          borderWidth: 0,
        };
      case 'navyHero':
        return {
          backgroundColor: colors.navy[800],
          borderWidth: 1,
          borderColor: colors.gold[500],
          ...shadows.md,
        };
      case 'outlined':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border.default,
        };
    }
  };

  const cardContent = (
    <View style={[styles.baseCard, getVariantStyle(), style]}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} accessibilityRole="button">
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

// Also export alias `Card`
export const Card = AppCard;

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: borderRadius.large,
    padding: spacing.md + 2,
  },
});
