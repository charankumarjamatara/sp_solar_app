import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, typography, layout } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  ...rest
}) => {
  const getVariantStyles = (): {
    button: ViewStyle;
    text: TextStyle;
    spinnerColor: string;
  } => {
    switch (variant) {
      case 'secondary':
        // Navy background with white text
        return {
          button: {
            backgroundColor: colors.navy[800],
            borderColor: colors.navy[800],
          },
          text: { color: colors.white },
          spinnerColor: colors.white,
        };
      case 'outline':
        // Transparent with Navy border
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: colors.navy[800],
            borderWidth: 1.5,
          },
          text: { color: colors.navy[800] },
          spinnerColor: colors.navy[800],
        };
      case 'ghost':
        // Transparent minimal
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          text: { color: colors.navy[800] },
          spinnerColor: colors.navy[800],
        };
      case 'destructive':
        // Error styling
        return {
          button: {
            backgroundColor: colors.feedback.error,
            borderColor: colors.feedback.error,
          },
          text: { color: colors.white },
          spinnerColor: colors.white,
        };
      case 'primary':
      default:
        // Gold background with deep navy text (Strong brand CTA)
        return {
          button: {
            backgroundColor: colors.gold[500],
            borderColor: colors.gold[500],
          },
          text: { color: colors.navy[900] },
          spinnerColor: colors.navy[900],
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: {
            paddingVertical: spacing.xxs + 2,
            paddingHorizontal: spacing.sm + 2,
            minHeight: 36,
          },
          text: {
            fontSize: 13,
            lineHeight: 18,
          },
        };
      case 'lg':
        return {
          button: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            minHeight: 52,
          },
          text: {
            fontSize: 16,
            lineHeight: 22,
          },
        };
      case 'md':
      default:
        return {
          button: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md + 2,
            minHeight: layout.minTouchTarget,
          },
          text: {
            fontSize: 15,
            lineHeight: 20,
          },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      disabled={isDisabled}
      style={[
        styles.baseButton,
        vStyles.button,
        sStyles.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabledButton,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={vStyles.spinnerColor} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.baseText,
              vStyles.text,
              sStyles.text,
              leftIcon ? { marginLeft: spacing.xs } : undefined,
              rightIcon ? { marginRight: spacing.xs } : undefined,
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

// Also export alias `Button` for backward compatibility
export const Button = AppButton;

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.medium,
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  baseText: {
    fontWeight: typography.button.fontWeight,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.85,
  },
});
