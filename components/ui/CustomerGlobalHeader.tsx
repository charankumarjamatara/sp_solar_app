import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { BRAND } from '../../constants/brand';
import { spacing } from '../../constants/theme';

export interface CustomerGlobalHeaderProps {
  testID?: string;
}

/**
 * Shared sticky branded header for the SP Solar Solutions customer app.
 * Fixed at the top across all customer screens.
 * Displays the official circular logo, company name, and official tagline.
 * Compact footprint to preserve vertical mobile viewport space.
 */
export const CustomerGlobalHeader: React.FC<CustomerGlobalHeaderProps> = ({
  testID = 'customer-global-header',
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topPadding = Math.max(insets.top, Platform.OS === 'web' ? 8 : 4);

  const handleBrandPress = () => {
    router.push('/(customer)');
  };

  return (
    <View
      testID={testID}
      style={[
        styles.outerContainer,
        {
          paddingTop: topPadding,
        },
      ]}
    >
      <View style={styles.innerContainer}>
        <TouchableOpacity
          onPress={handleBrandPress}
          activeOpacity={0.7}
          style={styles.brandButton}
          accessibilityRole="button"
          accessibilityLabel="SP Solar Solutions Home"
          accessibilityHint="Navigates to the home dashboard"
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/brand/logo-circular.png')}
              style={styles.brandLogo}
              resizeMode="contain"
              accessible
              accessibilityLabel="SP Solar Solutions circular logo"
            />
          </View>

          <View style={styles.textColumn}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {BRAND.name}
            </Text>
            <Text style={styles.brandTagline} numberOfLines={1}>
              {BRAND.tagline}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: colors.navy[800],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 1px 3px rgba(0, 23, 53, 0.04)',
      },
    }),
  },
  innerContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  brandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.navy[900],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold[500],
  },
  brandLogo: {
    width: 34,
    height: 34,
  },
  textColumn: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    flex: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: -0.2,
  },
  brandTagline: {
    fontSize: 10.5,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 0.5,
    letterSpacing: 0.1,
  },
});
