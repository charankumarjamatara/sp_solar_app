import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, typography } from '../../constants/theme';

export interface AppDividerProps {
  label?: string;
  vertical?: boolean;
  style?: ViewStyle;
}

export const AppDivider: React.FC<AppDividerProps> = ({
  label,
  vertical = false,
  style,
}) => {
  if (vertical) {
    return <View style={[styles.vertical, style]} />;
  }

  if (label) {
    return (
      <View style={[styles.labelContainer, style]}>
        <View style={styles.line} />
        <Text style={styles.labelText}>{label}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.horizontal, style]} />;
};

// Also export alias `Divider`
export const Divider = AppDivider;

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.border.default,
    width: '100%',
    marginVertical: spacing.md,
  },
  vertical: {
    width: 1,
    backgroundColor: colors.border.default,
    height: '100%',
    marginHorizontal: spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  labelText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.muted,
    fontWeight: typography.caption.fontWeight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
