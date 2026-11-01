import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/theme';

export interface AppAvatarProps {
  name?: string;
  url?: string;
  size?: number;
  variant?: 'navy' | 'gold' | 'surface';
  style?: StyleProp<ViewStyle>;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({
  name = 'User',
  url,
  size = 40,
  variant = 'navy',
  style,
}) => {
  const getInitials = (str: string): string => {
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return {
          bg: colors.gold[100],
          text: colors.gold[900],
          border: colors.gold[300],
        };
      case 'surface':
        return {
          bg: colors.surfaceSubtle,
          text: colors.text.primary,
          border: colors.border.default,
        };
      case 'navy':
      default:
        return {
          bg: colors.navy[800],
          text: colors.gold[300],
          border: colors.gold[500],
        };
    }
  };

  const vStyles = getVariantStyles();

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: vStyles.border,
          },
          style as StyleProp<ImageStyle>,
        ]}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: vStyles.bg,
          borderColor: vStyles.border,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.38,
            color: vStyles.text,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

// Also export alias `Avatar`
export const Avatar = AppAvatar;

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceSubtle,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: typography.heading.fontWeight,
  },
});
