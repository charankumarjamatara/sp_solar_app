import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../constants/colors';
import { layout } from '../../constants/theme';

export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface AppIconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled = false,
  accessibilityLabel,
  style,
  ...rest
}) => {
  const getVariantStyles = (): { button: ViewStyle; spinnerColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          button: {
            backgroundColor: colors.gold[500],
            borderColor: colors.gold[500],
          },
          spinnerColor: colors.navy[900],
        };
      case 'secondary':
        return {
          button: {
            backgroundColor: colors.navy[800],
            borderColor: colors.navy[800],
          },
          spinnerColor: colors.white,
        };
      case 'gold':
        return {
          button: {
            backgroundColor: colors.gold[100],
            borderColor: colors.gold[300],
          },
          spinnerColor: colors.gold[700],
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: colors.border.default,
            borderWidth: 1,
          },
          spinnerColor: colors.navy[800],
        };
      case 'ghost':
      default:
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          spinnerColor: colors.navy[800],
        };
    }
  };

  const getDimension = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'lg':
        return 52;
      case 'md':
      default:
        return layout.minTouchTarget; // 44
    }
  };

  const dim = getDimension();
  const vStyles = getVariantStyles();
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
        },
        vStyles.button,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {isLoading ? <ActivityIndicator size="small" color={vStyles.spinnerColor} /> : icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
