import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { AppAvatar } from '../../components/ui/AppAvatar';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, shadows } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { customer, logout, isLoading: isAuthLoading } = useAuth();

  // Logout confirmation modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Perform sign out and navigate to login
  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      router.replace('/(auth)/login');
    } catch (err) {
      console.warn('Logout failed:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <ScreenWrapper
      scrollable
      disableContentPadding
      contentContainerStyle={styles.contentContainer}
    >
      {/* 1. SCREEN HEADER INTRODUCTION */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Text style={styles.screenSubtitle}>Your customer account information</Text>
      </View>

      <View style={styles.mainPadding}>
        {/* 2. CUSTOMER IDENTITY CARD */}
        <AppCard variant="elevated" style={styles.identityCard}>
          <View style={styles.identityRow}>
            <AppAvatar
              name={customer?.name || 'Customer'}
              url={customer?.avatarUrl}
              size={68}
              variant="navy"
            />
            <View style={styles.identityTextCol}>
              <Text style={styles.customerName} numberOfLines={1}>
                {customer?.name || 'Valued Customer'}
              </Text>
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.phoneNumber}>
                  {customer?.phoneNumber || '+91 98765 43210'}
                </Text>
              </View>
            </View>
          </View>
        </AppCard>

        {/* 3. BASIC ACCOUNT DETAILS CARD */}
        <AppCard variant="elevated" style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="person-outline" size={16} color={colors.navy[800]} />
            </View>
            <Text style={styles.detailsTitle}>Account Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer ID</Text>
            <Text style={styles.detailValuePill}>
              {customer?.id ? `#${customer.id}` : '#cus_mock_999'}
            </Text>
          </View>

          {customer?.email ? (
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {customer.email}
              </Text>
            </View>
          ) : null}
        </AppCard>

        {/* 4. LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutConfirm(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign out of customer account"
        >
          <Ionicons name="log-out-outline" size={18} color="#D92D20" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* BRANDED LOGOUT CONFIRMATION MODAL */}
      <Modal
        visible={showLogoutConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (!isLoggingOut) setShowLogoutConfirm(false);
        }}
      >
        <View style={styles.logoutModalBackdrop}>
          <AppCard variant="elevated" style={styles.logoutModalCard}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out" size={28} color="#D92D20" />
            </View>

            <Text style={styles.logoutModalTitle}>Sign Out</Text>
            <Text style={styles.logoutModalBody}>
              Are you sure you want to sign out of SP Solar Solutions? You will need to log in with
              your phone number and OTP again to access your solar service requests.
            </Text>

            <View style={styles.logoutModalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                style={styles.logoutCancelBtn}
              />
              <AppButton
                title={isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                variant="destructive"
                size="md"
                onPress={handleConfirmLogout}
                isLoading={isLoggingOut || isAuthLoading}
                disabled={isLoggingOut}
                style={styles.logoutDestructiveBtn}
              />
            </View>
          </AppCard>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing['4xl'],
    backgroundColor: colors.background,
  },
  screenHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy[800],
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  mainPadding: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  identityCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderColor: colors.border.default,
    borderWidth: 1,
    ...shadows.sm,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  identityTextCol: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy[800],
    letterSpacing: -0.3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneNumber: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  detailsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderColor: colors.border.default,
    borderWidth: 1,
    ...shadows.sm,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy[800],
    letterSpacing: -0.2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy[800],
    textAlign: 'right',
  },
  detailValuePill: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
    backgroundColor: '#EAF0F8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    marginTop: spacing.xs,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D92D20',
  },
  logoutModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 17, 38, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  logoutModalCard: {
    width: '100%',
    maxWidth: 380,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    textAlign: 'center',
  },
  logoutIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy[800],
    marginBottom: 8,
  },
  logoutModalBody: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
    borderColor: colors.border.default,
  },
  logoutDestructiveBtn: {
    flex: 1,
    backgroundColor: '#D92D20',
  },
});
