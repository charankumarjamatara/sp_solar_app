import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { TicketStatus } from '../../types';
import { getTicketStatusLabel, getTicketStatusTheme } from '../../utils/formatters';
import { borderRadius, spacing, typography } from '../../constants/theme';

export interface StatusPillProps {
  status: TicketStatus | string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  showDot?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  style,
  showDot = true,
}) => {
  const theme = getTicketStatusTheme(status);
  const label = getTicketStatusLabel(status);
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        isSm ? styles.containerSm : styles.containerMd,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            isSm && styles.dotSm,
            { backgroundColor: theme.dot },
          ]}
        />
      )}
      <Text
        style={[
          styles.label,
          isSm && styles.labelSm,
          { color: theme.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  containerMd: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xxs - 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xxs + 1,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 11,
    lineHeight: 14,
  },
});
