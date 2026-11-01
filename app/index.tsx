import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '../components/brand/BrandLogo';
import { colors } from '../constants/colors';
import { spacing, typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Animated values initialized via state
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.95));
  const [progressAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // 1. Entrance animation (fade & subtle scale)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Transition timer to Authentication or Customer Home
    const timer = setTimeout(() => {
      if (!isAuthLoading) {
        if (isAuthenticated) {
          router.replace('/(customer)');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, progressAnim, router, isAuthenticated, isAuthLoading]);

  // Width for the subtle gold progress line
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(width * 0.45, 180)],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.brandWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <BrandLogo size="lg" variant="onDark" showSubtitle />
        </Animated.View>

        {/* Subtle, elegant gold progress bar */}
        <Animated.View style={[styles.loadingSection, { opacity: fadeAnim }]}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <Animated.Text style={styles.loadingText}>Initializing...</Animated.Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy[800], // Deep Navy #001735
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  brandWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4xl'],
  },
  loadingSection: {
    position: 'absolute',
    bottom: spacing['4xl'] + spacing.lg,
    alignItems: 'center',
  },
  progressTrack: {
    width: 180,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.gold[500], // Metallic Gold accent
    borderRadius: 2,
  },
  loadingText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.gold[300],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
