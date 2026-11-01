import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, typography } from '../../constants/theme';

export type BadgeVariant =
  'default' | 'primary' | 'navy' | 'success' | 'warning' | 'error' | 'info';

export interface AppBadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  showDot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'default',
  showDot = false,
  style,
  textStyle,
}) => {
  const getStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    dotColor?: string;
  } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.gold[100],
            borderColor: colors.gold[300],
          },
          text: { color: colors.gold[900] },
          dotColor: colors.gold[500],
        };
      case 'navy':
        return {
          container: {
            backgroundColor: colors.navy[50],
            borderColor: colors.navy[200],
          },
          text: { color: colors.navy[800] },
          dotColor: colors.navy[800],
        };
      case 'success':
        return {
          container: {
            backgroundColor: colors.feedback.successBg,
            borderColor: colors.feedback.successBorder,
          },
          text: { color: colors.feedback.success },
          dotColor: colors.feedback.success,
        };
      case 'warning':
        return {
          container: {
            backgroundColor: colors.feedback.warningBg,
            borderColor: colors.feedback.warningBorder,
          },
          text: { color: colors.feedback.warning },
          dotColor: colors.feedback.warning,
        };
      case 'error':
        return {
          container: {
            backgroundColor: colors.feedback.errorBg,
            borderColor: colors.feedback.errorBorder,
          },
          text: { color: colors.feedback.error },
          dotColor: colors.feedback.error,
        };
      case 'info':
        return {
          container: {
            backgroundColor: colors.feedback.infoBg,
            borderColor: colors.feedback.infoBorder,
          },
          text: { color: colors.feedback.info },
          dotColor: colors.feedback.info,
        };
      case 'default':
      default:
        return {
          container: {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border.default,
          },
          text: { color: colors.text.secondary },
          dotColor: colors.text.muted,
        };
    }
  };

  const vStyles = getStyles();

  return (
    <View style={[styles.badge, vStyles.container, style]}>
      {showDot && vStyles.dotColor ? (
        <View style={[styles.dot, { backgroundColor: vStyles.dotColor }]} />
      ) : null}
      <Text style={[styles.text, vStyles.text, textStyle]}>{label}</Text>
    </View>
  );
};

// Also export alias `Badge`
export const Badge = AppBadge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xxs - 1,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xxs + 1,
  },
  text: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.caption.lineHeight,
  },
});
