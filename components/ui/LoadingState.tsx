import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, typography } from '../../constants/theme';

export interface LoadingStateProps {
  message?: string;
  color?: 'gold' | 'navy';
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  color = 'gold',
  size = 'large',
  style,
}) => {
  const spinnerColor = color === 'gold' ? colors.gold[500] : colors.navy[800];

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

// Also export alias `LoadingView`
export const LoadingView = LoadingState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  text: {
    marginTop: spacing.md,
    fontSize: typography.label.fontSize,
    color: colors.text.secondary,
    fontWeight: typography.label.fontWeight,
    letterSpacing: 0.2,
  },
});
