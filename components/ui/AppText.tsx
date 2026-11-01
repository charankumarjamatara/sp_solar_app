import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { typography, TypographyVariant } from '../../constants/theme';
import { colors } from '../../constants/colors';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'gold'
  | 'navy'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export interface AppTextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle | TextStyle[];
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'auto',
  style,
  children,
  ...rest
}) => {
  const getColorStyle = (): TextStyle => {
    switch (color) {
      case 'secondary':
        return { color: colors.text.secondary };
      case 'muted':
        return { color: colors.text.muted };
      case 'inverse':
        return { color: colors.text.inverse };
      case 'gold':
        return { color: colors.gold[500] };
      case 'navy':
        return { color: colors.navy[800] };
      case 'error':
        return { color: colors.feedback.error };
      case 'success':
        return { color: colors.feedback.success };
      case 'warning':
        return { color: colors.feedback.warning };
      case 'info':
        return { color: colors.feedback.info };
      case 'primary':
      default:
        return { color: colors.text.primary };
    }
  };

  const typographyStyle = typography[variant] || typography.body;

  return (
    <RNText
      style={[typographyStyle, getColorStyle(), { textAlign: align }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
