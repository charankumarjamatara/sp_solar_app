import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { spacing, layout } from '../../constants/theme';

export type HeaderTheme = 'surface' | 'navy';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  theme?: HeaderTheme;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen-specific subheader component rendered beneath the global sticky branded header.
 * Displays screen title, subtitle, back button, and optional right actions (such as status pills or action buttons).
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBrand = false,
  showBack = false,
  onBack,
  rightAction,
  theme = 'surface',
  style,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(customer)');
    }
  };

  const isNavy = theme === 'navy';
  // Only display brand logo if explicitly requested AND there is no title or back button
  const displayBrand = showBrand && !title && !showBack;

  return (
    <View
      style={[
        styles.container,
        isNavy ? styles.navyContainer : styles.surfaceContainer,
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isNavy ? colors.white : colors.primary.navy}
            />
          </TouchableOpacity>
        ) : null}

        {displayBrand ? (
          <View style={styles.brandWrapper}>
            <Image
              source={require('../../assets/brand/logo-circular.png')}
              style={styles.brandLogo}
              resizeMode="contain"
              accessible
              accessibilityLabel="SP Solar Solutions Circular Logo"
            />
            <View style={styles.brandTextColumn}>
              <Text
                style={[
                  styles.brandTitle,
                  isNavy ? styles.navyBrandTitle : styles.surfaceBrandTitle,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                SP Solar Solutions
              </Text>
              <Text
                style={[
                  styles.brandTagline,
                  isNavy ? styles.navyBrandTagline : styles.surfaceBrandTagline,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Clean Energy. Brighter Tomorrows.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.titleWrapper}>
            {title ? (
              <Text
                style={[styles.title, isNavy ? styles.navyTitle : styles.surfaceTitle]}
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  isNavy ? styles.navySubtitle : styles.surfaceSubtitle,
                ]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : null}
    </View>
  );
};

// Also export alias `Header`
export const Header = AppHeader;

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  surfaceContainer: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border.default,
  },
  navyContainer: {
    backgroundColor: colors.navy[800],
    borderBottomColor: colors.navy[900],
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: '#001126',
  },
  brandTextColumn: {
    marginLeft: spacing.xs + 2,
    flexShrink: 1,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
  surfaceBrandTitle: {
    color: '#001735', // Primary brand navy
  },
  navyBrandTitle: {
    color: colors.white,
  },
  surfaceBrandTagline: {
    color: '#667085',
  },
  navyBrandTagline: {
    color: colors.gold[300],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs + 2,
    backgroundColor: colors.surfaceSubtle,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  surfaceTitle: {
    color: colors.primary.navy, // #001735
  },
  navyTitle: {
    color: colors.white,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  surfaceSubtitle: {
    color: colors.text.secondary, // #667085
  },
  navySubtitle: {
    color: colors.gold[300],
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
});
