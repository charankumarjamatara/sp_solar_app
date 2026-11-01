import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/theme';

export interface RatingStarsProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  style?: ViewStyle;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 28,
  onRatingChange,
  interactive = false,
  style,
}) => {
  const stars = Array.from({ length: maxStars }, (_, index) => index + 1);

  return (
    <View style={[styles.container, style]}>
      {stars.map(starValue => {
        const isFilled = rating >= starValue;
        const isHalf = !isFilled && rating >= starValue - 0.5;

        const starIconName: keyof typeof Ionicons.glyphMap = isFilled
          ? 'star'
          : isHalf
            ? 'star-half'
            : 'star-outline';

        const starIcon = (
          <Ionicons
            name={starIconName}
            size={size}
            color={isFilled || isHalf ? colors.gold[500] : colors.text.muted}
          />
        );

        if (interactive && onRatingChange) {
          return (
            <TouchableOpacity
              key={starValue}
              onPress={() => onRatingChange(starValue)}
              activeOpacity={0.7}
              style={styles.starTouch}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              {starIcon}
            </TouchableOpacity>
          );
        }

        return (
          <View key={starValue} style={styles.starItem}>
            {starIcon}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  starTouch: {
    padding: spacing.xxs,
  },
  starItem: {
    padding: spacing.xxs,
  },
});
