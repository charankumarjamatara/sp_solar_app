import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { StatusPill } from '../../components/ui/StatusPill';
import { LoadingView } from '../../components/ui/LoadingState';
import { ErrorView } from '../../components/ui/ErrorState';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, shadows } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { mockDashboardService, DashboardData } from '../../services/mockDashboardService';
import { ticketService } from '../../services/tickets/ticketService';
import { Ticket } from '../../types';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { env } from '../../config/env';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { customer } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Customer care support modal
  const [showSupportModal, setShowSupportModal] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }
    setError(false);

    try {
      const [dashResult, ticketsResult] = await Promise.all([
        mockDashboardService.getDashboardData(),
        ticketService.getTickets(),
      ]);

      setDashboardData(dashResult);
      setAllTickets(ticketsResult.items || []);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      mockDashboardService.getDashboardData(),
      ticketService.getTickets(),
    ])
      .then(([dashResult, ticketsResult]) => {
        if (active) {
          setDashboardData(dashResult);
          setAllTickets(ticketsResult.items || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Refresh ticket data whenever the home screen comes into active focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      ticketService
        .getTickets()
        .then((res) => {
          if (active && res.items) {
            setAllTickets(res.items);
          }
        })
        .catch(() => {
          // Keep previous tickets on background focus error
        });

      return () => {
        active = false;
      };
    }, [])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Derive dynamic ticket statistics from existing data source
  const totalCount = allTickets.length;
  const openCount = allTickets.filter(t =>
    ['RAISED', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
  ).length;
  const resolvedCount = allTickets.filter(t =>
    ['RESOLVED', 'CLOSED'].includes(t.status)
  ).length;

  // Active or latest ticket for the primary preview card
  const activeTicket =
    allTickets.find(t => ['IN_PROGRESS', 'ASSIGNED', 'RAISED'].includes(t.status)) ||
    allTickets[0] ||
    dashboardData?.activeTicket ||
    null;

  // Previous service history (tickets other than the main active ticket)
  const recentTickets = allTickets
    .filter(t => t.id !== activeTicket?.id)
    .slice(0, 2);

  if (isLoading && !dashboardData) {
    return <LoadingView message="Loading your solar dashboard..." />;
  }

  if (error && !dashboardData) {
    return (
      <ErrorView
        message="Unable to load your solar dashboard information."
        onRetry={() => loadData(false)}
      />
    );
  }

  const installation = dashboardData?.installation;
  const customerFirstName = customer?.name?.split(' ')[0] || 'Sunita';

  return (
    <ScreenWrapper
      scrollable
      onRefresh={() => loadData(true)}
      isRefreshing={isRefreshing}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 2.B Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomePill}>
          <View style={styles.systemActiveDot} />
          <Text style={styles.welcomePillText}>RESIDENTIAL SOLAR CARE</Text>
        </View>

        <Text style={styles.greetingTitle}>
          {getGreeting()}, {customerFirstName}
        </Text>
        <Text style={styles.greetingSubtitle}>
          Your rooftop solar system is active and operating normally.
        </Text>
      </View>

      {/* 2.C Solar Hero / Overview Card */}
      {installation && (
        <View style={styles.solarHeroCard}>
          <ImageBackground
            source={require('../../assets/solar-roof.jpg')}
            style={styles.heroBackground}
            imageStyle={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroDarkOverlay}>
              {/* Top Hero Row */}
              <View style={styles.heroTopRow}>
                <View style={styles.heroSystemBadge}>
                  <Ionicons name="sunny" size={13} color={colors.gold[300]} style={{ marginRight: 5 }} />
                  <Text style={styles.heroSystemName}>
                    {installation.systemName.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.heroStatusIndicator}>
                  <View style={styles.pulsingGreenDot} />
                  <Text style={styles.heroStatusText}>
                    {installation.status === 'ACTIVE' ? 'System Active' : 'Maintenance'}
                  </Text>
                </View>
              </View>

              {/* Bottom Hero Stats Strip */}
              <View style={styles.heroStatsContainer}>
                <View style={styles.heroStatColumn}>
                  <Text style={styles.heroStatValue}>{installation.capacityKw} kW</Text>
                  <Text style={styles.heroStatLabel}>Installed Capacity</Text>
                </View>

                <View style={styles.heroStatDivider} />

                <View style={styles.heroStatColumn}>
                  <Text style={styles.heroStatValue}>
                    {formatDate(installation.installationDate)}
                  </Text>
                  <Text style={styles.heroStatLabel}>Commissioned</Text>
                </View>

                <View style={styles.heroStatDivider} />

                <View style={styles.heroStatColumn}>
                  <View style={styles.inverterStatusRow}>
                    <Ionicons name="flash" size={12} color={colors.gold[400]} style={{ marginRight: 3 }} />
                    <Text style={styles.heroStatValueSmall}>
                      {installation.inverter?.status === 'ONLINE' ? 'Online' : 'Normal'}
                    </Text>
                  </View>
                  <Text style={styles.heroStatLabel}>Inverter Telemetry</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* 2.G Raise Issue Entry Point Strip */}
      <TouchableOpacity
        style={styles.raiseIssueStrip}
        activeOpacity={0.8}
        onPress={() => router.push('/(customer)/raise-issue')}
        accessibilityRole="button"
        accessibilityLabel="Raise a new service request"
      >
        <View style={styles.raiseStripLeft}>
          <View style={styles.raiseStripIconCircle}>
            <Ionicons name="construct-outline" size={18} color={colors.gold[600]} />
          </View>
          <View style={styles.raiseStripTextWrapper}>
            <Text style={styles.raiseStripTitle}>Have a solar issue or need inspection?</Text>
            <Text style={styles.raiseStripSubtitle}>Submit a service request for dedicated technician support</Text>
          </View>
        </View>

        <View style={styles.raiseStripButton}>
          <Text style={styles.raiseStripButtonText}>Raise Issue</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.navy[800]} />
        </View>
      </TouchableOpacity>

      {/* 2.D Ticket Overview Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>SERVICE REQUESTS OVERVIEW</Text>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/tickets')}
            style={styles.sectionActionLink}
            accessibilityRole="button"
            accessibilityLabel="View all service requests"
          >
            <Text style={styles.sectionActionText}>View All</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.gold[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsSummaryGrid}>
          {/* Card 1: Total Tickets */}
          <TouchableOpacity
            style={styles.statSummaryCard}
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/tickets')}
          >
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Total</Text>
              <View style={[styles.statIconBadge, { backgroundColor: colors.navy[50] }]}>
                <Ionicons name="receipt-outline" size={14} color={colors.navy[800]} />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: colors.navy[800] }]}>
              {totalCount}
            </Text>
            <Text style={styles.statCardFootnote}>Logged requests</Text>
          </TouchableOpacity>

          {/* Card 2: Open / In Progress */}
          <TouchableOpacity
            style={styles.statSummaryCard}
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/tickets')}
          >
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>In Progress</Text>
              <View style={[styles.statIconBadge, { backgroundColor: colors.gold[100] }]}>
                <Ionicons name="time-outline" size={14} color={colors.gold[700]} />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: colors.gold[700] }]}>
              {openCount}
            </Text>
            <Text style={styles.statCardFootnote}>Active / pending</Text>
          </TouchableOpacity>

          {/* Card 3: Resolved */}
          <TouchableOpacity
            style={styles.statSummaryCard}
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/tickets')}
          >
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Resolved</Text>
              <View style={[styles.statIconBadge, { backgroundColor: colors.feedback.successBg }]}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.feedback.success} />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: colors.feedback.success }]}>
              {resolvedCount}
            </Text>
            <Text style={styles.statCardFootnote}>Closed & solved</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2.E Recent / Active Ticket Preview */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {activeTicket && ['IN_PROGRESS', 'ASSIGNED', 'RAISED'].includes(activeTicket.status)
              ? 'ACTIVE SERVICE REQUEST'
              : 'LATEST SERVICE REQUEST'}
          </Text>
          {activeTicket ? (
            <TouchableOpacity
              onPress={() => router.push(`/(customer)/tickets/${activeTicket.id}`)}
              style={styles.sectionActionLink}
            >
              <Text style={styles.sectionActionText}>Details</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.gold[600]} />
            </TouchableOpacity>
          ) : null}
        </View>

        {activeTicket ? (
          <AppCard
            variant="elevated"
            style={styles.activeTicketCard}
            onPress={() => router.push(`/(customer)/tickets/${activeTicket.id}`)}
          >
            {/* Ticket Header: ID and Status Pill */}
            <View style={styles.ticketTopMetaRow}>
              <View style={styles.ticketIdBadge}>
                <Text style={styles.ticketIdPrefix}>#</Text>
                <Text style={styles.ticketIdNumber}>{activeTicket.ticketNumber}</Text>
              </View>

              <StatusPill status={activeTicket.status} />
            </View>

            {/* Ticket Category & Description */}
            <Text style={styles.ticketCategoryTitle}>
              {activeTicket.categoryLabel || activeTicket.category}
            </Text>
            <Text style={styles.ticketDescriptionText} numberOfLines={2}>
              {activeTicket.description}
            </Text>

            {/* Assigned Technician Chip if available */}
            {activeTicket.technician ? (
              <View style={styles.technicianChip}>
                <View style={styles.technicianAvatar}>
                  <Ionicons name="person" size={12} color={colors.navy[800]} />
                </View>
                <Text style={styles.technicianLabel}>
                  Assigned Specialist:{' '}
                  <Text style={styles.technicianName}>{activeTicket.technician.name}</Text>
                </Text>
              </View>
            ) : null}

            {/* Ticket Footer Row */}
            <View style={styles.ticketFooterRow}>
              <View style={styles.ticketUpdateTimestamp}>
                <Ionicons name="time-outline" size={13} color={colors.text.muted} style={{ marginRight: 4 }} />
                <Text style={styles.ticketUpdateText}>
                  Updated {formatRelativeTime(activeTicket.updatedAt)}
                </Text>
              </View>

              <View style={styles.ticketActionCTA}>
                <Text style={styles.ticketActionCTAText}>View Request Details</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.navy[800]} />
              </View>
            </View>
          </AppCard>
        ) : (
          <AppCard variant="elevated" style={styles.emptyTicketsCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={26} color={colors.feedback.success} />
            </View>
            <Text style={styles.emptyStateTitle}>All Systems Operating Smoothly</Text>
            <Text style={styles.emptyStateSubtitle}>
              You currently have no active service requests. Your solar generation and inverter telemetry are stable.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push('/(customer)/raise-issue')}
            >
              <Ionicons name="add" size={15} color={colors.navy[800]} style={{ marginRight: 4 }} />
              <Text style={styles.emptyActionBtnText}>Raise an Issue</Text>
            </TouchableOpacity>
          </AppCard>
        )}

        {/* Previous Service History List */}
        {recentTickets.length > 0 && (
          <View style={styles.recentHistoryContainer}>
            <Text style={styles.subSectionTitle}>PREVIOUS SERVICE HISTORY</Text>
            <AppCard variant="elevated" style={styles.recentHistoryCard}>
              {recentTickets.map((ticket, index) => (
                <View key={ticket.id}>
                  <TouchableOpacity
                    style={styles.recentHistoryRow}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(customer)/tickets/${ticket.id}`)}
                  >
                    <View style={styles.recentHistoryIconWrapper}>
                      <Ionicons
                        name={ticket.status === 'RESOLVED' ? 'checkmark-circle' : 'receipt'}
                        size={18}
                        color={ticket.status === 'RESOLVED' ? colors.feedback.success : colors.text.secondary}
                      />
                    </View>

                    <View style={styles.recentHistoryInfo}>
                      <View style={styles.recentHistoryIdRow}>
                        <Text style={styles.recentHistoryId}>#{ticket.ticketNumber}</Text>
                        <Text style={styles.recentHistoryDate}>
                          {formatDate(ticket.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.recentHistoryTitle} numberOfLines={1}>
                        {ticket.categoryLabel || ticket.category}
                      </Text>
                    </View>

                    <StatusPill status={ticket.status} showDot={false} />
                    <Ionicons name="chevron-forward" size={16} color={colors.text.muted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>

                  {index < recentTickets.length - 1 && (
                    <View style={styles.recentHistoryDivider} />
                  )}
                </View>
              ))}
            </AppCard>
          </View>
        )}
      </View>

      {/* 2.F Customer Support Section */}
      <View style={styles.supportBannerCard}>
        <View style={styles.supportBannerContent}>
          <View style={styles.supportIconBadge}>
            <Ionicons name="headset-outline" size={22} color={colors.gold[300]} />
          </View>

          <View style={styles.supportTextColumn}>
            <Text style={styles.supportBannerTitle}>Need Assistance?</Text>
            <Text style={styles.supportBannerSubtitle}>
              Dedicated customer care and technical advisory for your solar setup.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.contactSupportButton}
          activeOpacity={0.8}
          onPress={() => setShowSupportModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Contact SP Solar Support"
        >
          <Text style={styles.contactSupportButtonText}>Contact Support</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.navy[900]} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Dedicated Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderCircle}>
              <Ionicons name="headset" size={28} color={colors.gold[500]} />
            </View>

            <Text style={styles.modalTitle}>SP Solar Support</Text>
            <Text style={styles.modalSubtitle}>
              Residential solar care, inverter diagnostics, and maintenance advisory.
            </Text>

            <View style={styles.contactBox}>
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${env.supportPhone}`)}
                activeOpacity={0.7}
              >
                <View style={styles.contactRowIcon}>
                  <Ionicons name="call" size={18} color={colors.navy[800]} />
                </View>
                <View style={styles.contactRowDetails}>
                  <Text style={styles.contactRowLabel}>Helpline (Toll-Free)</Text>
                  <Text style={styles.contactRowValue}>{env.supportPhone}</Text>
                </View>
                <Ionicons name="arrow-forward" size={15} color={colors.text.muted} />
              </TouchableOpacity>

              <View style={styles.contactDivider} />

              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL(`mailto:${env.supportEmail}`)}
                activeOpacity={0.7}
              >
                <View style={styles.contactRowIcon}>
                  <Ionicons name="mail" size={18} color={colors.navy[800]} />
                </View>
                <View style={styles.contactRowDetails}>
                  <Text style={styles.contactRowLabel}>Email Assistance</Text>
                  <Text style={styles.contactRowValue}>{env.supportEmail}</Text>
                </View>
                <Ionicons name="arrow-forward" size={15} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <AppButton
              title="Close"
              variant="outline"
              size="md"
              onPress={() => setShowSupportModal(false)}
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing['2xl'],
  },

  /* 2.B Welcome Section */
  welcomeSection: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.navy[50],
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.xs,
  },
  systemActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.feedback.success,
    marginRight: 6,
  },
  welcomePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.navy[700],
    letterSpacing: 0.8,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.secondary,
    lineHeight: 18,
  },

  /* 2.C Solar Hero Card */
  solarHeroCard: {
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    backgroundColor: colors.navy[900],
    marginBottom: spacing.md,
    ...shadows.md,
  },
  heroBackground: {
    width: '100%',
    height: 154,
  },
  heroImage: {
    borderRadius: borderRadius.large,
  },
  heroDarkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 17, 38, 0.46)',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSystemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 23, 53, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(221, 167, 70, 0.35)',
  },
  heroSystemName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  heroStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.feedback.success,
    marginRight: 5,
  },
  heroStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  heroStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 17, 38, 0.65)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroStatColumn: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 1,
  },
  heroStatValueSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  inverterStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },

  /* 2.G Raise Issue Entry Point Strip */
  raiseIssueStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  raiseStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  raiseStripIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold[50],
    borderWidth: 1,
    borderColor: colors.gold[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  raiseStripTextWrapper: {
    flex: 1,
  },
  raiseStripTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 1,
  },
  raiseStripSubtitle: {
    fontSize: 10.5,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  raiseStripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold[300],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 3,
  },
  raiseStripButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy[800],
  },

  /* Section Containers */
  sectionContainer: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.6,
  },
  sectionActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold[700],
  },

  /* 2.D Ticket Overview Grid */
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statSummaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 2,
  },
  statCardFootnote: {
    fontSize: 9.5,
    fontWeight: '500',
    color: colors.text.muted,
  },

  /* 2.E Recent / Active Ticket Card */
  activeTicketCard: {
    padding: spacing.md,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  ticketTopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ticketIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketIdPrefix: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gold[700],
  },
  ticketIdNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy[800],
    marginLeft: 2,
  },
  ticketCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 4,
  },
  ticketDescriptionText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  technicianChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  technicianAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.navy[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  technicianLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  technicianName: {
    fontWeight: '700',
    color: colors.navy[800],
  },
  ticketFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  ticketUpdateTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketUpdateText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  ticketActionCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ticketActionCTAText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },

  /* Empty State */
  emptyTicketsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.feedback.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: 300,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[50],
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.navy[200],
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },

  /* Previous Service History List */
  recentHistoryContainer: {
    marginTop: spacing.xs,
  },
  subSectionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  recentHistoryCard: {
    padding: 0,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  recentHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  recentHistoryIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  recentHistoryInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recentHistoryIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 1,
  },
  recentHistoryId: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy[800],
  },
  recentHistoryDate: {
    fontSize: 10.5,
    color: colors.text.muted,
  },
  recentHistoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recentHistoryDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginLeft: 56,
  },

  /* 2.F Customer Support Section */
  supportBannerCard: {
    backgroundColor: colors.navy[800],
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.navy[700],
    ...shadows.sm,
  },
  supportBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  supportIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.navy[900],
    borderWidth: 1,
    borderColor: colors.gold[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  supportTextColumn: {
    flex: 1,
  },
  supportBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  supportBannerSubtitle: {
    fontSize: 11.5,
    color: colors.navy[200],
    lineHeight: 16,
  },
  contactSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold[500],
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  contactSupportButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[900],
  },

  /* Customer Support Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 17, 38, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.extraLarge,
    padding: spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.navy[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 8px 24px rgba(0, 17, 38, 0.25)',
      },
    }),
  },
  modalHeaderCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.gold[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactBox: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  contactRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  contactRowDetails: {
    flex: 1,
  },
  contactRowLabel: {
    fontSize: 10.5,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  contactRowValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.navy[800],
    marginTop: 1,
  },
  contactDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  modalCloseButton: {
    width: '100%',
  },
});
