import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/common/ScreenWrapper';
import { TicketCard } from '../../../components/tickets/TicketCard';
import { LoadingView } from '../../../components/ui/LoadingState';
import { ErrorView } from '../../../components/ui/ErrorState';
import { ticketService } from '../../../services/tickets/ticketService';
import { Ticket, TicketStatus } from '../../../types';
import { colors } from '../../../constants/colors';
import { borderRadius, spacing, shadows } from '../../../constants/theme';

interface FilterOption {
  label: string;
  value: TicketStatus | 'ALL';
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Raised', value: 'RAISED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

export default function MyTicketsScreen() {
  const router = useRouter();

  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Fetch all tickets from ticketService
  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }
    setError(false);

    try {
      const response = await ticketService.getTickets();
      setAllTickets(response.items || []);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    ticketService
      .getTickets()
      .then((res) => {
        if (active) {
          setAllTickets(res.items || []);
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

  // Reload tickets automatically whenever the screen comes into active focus
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

  // Compute summary statistics
  const totalCount = allTickets.length;
  const inProgressCount = useMemo(
    () =>
      allTickets.filter((t) =>
        ['RAISED', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
      ).length,
    [allTickets]
  );
  const resolvedCount = useMemo(
    () =>
      allTickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
    [allTickets]
  );

  // Status chip ticket counts
  const chipCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allTickets.length,
      RAISED: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };
    allTickets.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status] += 1;
      }
    });
    return counts;
  }, [allTickets]);

  // Combined Status and Search query filtering
  const filteredTickets = useMemo(() => {
    return allTickets.filter((ticket) => {
      // 1. Status Filter
      if (selectedStatus !== 'ALL' && ticket.status !== selectedStatus) {
        return false;
      }

      // 2. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const num = (ticket.ticketNumber || '').toLowerCase();
        const id = (ticket.id || '').toLowerCase();
        const cat = (ticket.category || '').toLowerCase();
        const label = (ticket.categoryLabel || '').toLowerCase();
        const desc = (ticket.description || '').toLowerCase();
        const tech = (ticket.technician?.name || '').toLowerCase();

        return (
          num.includes(query) ||
          id.includes(query) ||
          cat.includes(query) ||
          label.includes(query) ||
          desc.includes(query) ||
          tech.includes(query)
        );
      }

      return true;
    });
  }, [allTickets, selectedStatus, searchQuery]);

  // Handle summary card selection
  const handleSummaryCardPress = (targetStatus: TicketStatus | 'ALL') => {
    setSelectedStatus((prev) => (prev === targetStatus ? 'ALL' : targetStatus));
  };

  if (isLoading && allTickets.length === 0) {
    return <LoadingView message="Loading your service requests..." />;
  }

  if (error && allTickets.length === 0) {
    return (
      <ErrorView
        message="Unable to load your service requests."
        onRetry={() => fetchTickets(false)}
      />
    );
  }

  // Header Component containing Screen Intro, Summary Stats, Search Field, and Filter Chips
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      {/* 1. Screen Introduction */}
      <View style={styles.introRow}>
        <View style={styles.introTextWrapper}>
          <View style={styles.introTitleRow}>
            <Text style={styles.introTitle}>My Service Tickets</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>
                {totalCount} {totalCount === 1 ? 'Ticket' : 'Tickets'}
              </Text>
            </View>
          </View>
          <Text style={styles.introSubtitle}>
            Track and manage your residential solar requests.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.raiseHeaderButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/raise-issue')}
          accessibilityRole="button"
          accessibilityLabel="Raise new ticket"
        >
          <Ionicons name="add" size={16} color={colors.navy[900]} />
          <Text style={styles.raiseHeaderButtonText}>Raise Issue</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Ticket Statistics Summary Section */}
      <View style={styles.summaryGrid}>
        {/* Total Summary Card */}
        <TouchableOpacity
          style={[
            styles.summaryCard,
            selectedStatus === 'ALL' && styles.summaryCardActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleSummaryCardPress('ALL')}
        >
          <View style={styles.summaryCardTop}>
            <Text style={styles.summaryCardLabel}>Total</Text>
            <View style={[styles.summaryIconBadge, { backgroundColor: colors.navy[50] }]}>
              <Ionicons name="receipt-outline" size={13} color={colors.navy[800]} />
            </View>
          </View>
          <Text style={[styles.summaryCardValue, { color: colors.navy[800] }]}>
            {totalCount}
          </Text>
          <Text style={styles.summaryCardFootnote}>All requests</Text>
        </TouchableOpacity>

        {/* In Progress Summary Card */}
        <TouchableOpacity
          style={[
            styles.summaryCard,
            selectedStatus === 'IN_PROGRESS' && styles.summaryCardActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleSummaryCardPress('IN_PROGRESS')}
        >
          <View style={styles.summaryCardTop}>
            <Text style={styles.summaryCardLabel}>In Progress</Text>
            <View style={[styles.summaryIconBadge, { backgroundColor: colors.gold[100] }]}>
              <Ionicons name="time-outline" size={13} color={colors.gold[700]} />
            </View>
          </View>
          <Text style={[styles.summaryCardValue, { color: colors.gold[700] }]}>
            {inProgressCount}
          </Text>
          <Text style={styles.summaryCardFootnote}>Active / queued</Text>
        </TouchableOpacity>

        {/* Resolved Summary Card */}
        <TouchableOpacity
          style={[
            styles.summaryCard,
            selectedStatus === 'RESOLVED' && styles.summaryCardActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleSummaryCardPress('RESOLVED')}
        >
          <View style={styles.summaryCardTop}>
            <Text style={styles.summaryCardLabel}>Resolved</Text>
            <View style={[styles.summaryIconBadge, { backgroundColor: colors.feedback.successBg }]}>
              <Ionicons name="checkmark-circle-outline" size={13} color={colors.feedback.success} />
            </View>
          </View>
          <Text style={[styles.summaryCardValue, { color: colors.feedback.success }]}>
            {resolvedCount}
          </Text>
          <Text style={styles.summaryCardFootnote}>Closed & solved</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Search Field */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ticket ID, category, or keyword..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
            style={styles.clearSearchButton}
          >
            <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 4. Horizontally Scrollable Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipContainer}
        >
          {FILTER_OPTIONS.map((filter) => {
            const isSelected = selectedStatus === filter.value;
            const count = chipCounts[filter.value] ?? 0;

            return (
              <TouchableOpacity
                key={filter.value}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.7}
                onPress={() => setSelectedStatus(filter.value)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filter.label}, ${count} tickets`}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    isSelected && styles.filterChipLabelActive,
                  ]}
                >
                  {filter.label}
                </Text>
                <View
                  style={[
                    styles.filterChipCountBadge,
                    isSelected && styles.filterChipCountBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipCountText,
                      isSelected && styles.filterChipCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Filter & Search Status Pill Indicator */}
      {(selectedStatus !== 'ALL' || searchQuery.trim().length > 0) && (
        <View style={styles.activeFilterFeedbackRow}>
          <Text style={styles.activeFilterFeedbackText}>
            Showing {filteredTickets.length} of {allTickets.length} tickets
            {selectedStatus !== 'ALL' ? ` • ${selectedStatus.replace('_', ' ')}` : ''}
            {searchQuery.trim().length > 0 ? ` • "${searchQuery}"` : ''}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.resetFiltersText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Empty state renderer
  const renderEmptyState = () => {
    // Case 1: Search query has no results
    if (searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="search-outline" size={28} color={colors.navy[700]} />
          </View>
          <Text style={styles.emptyTitle}>No Matching Tickets Found</Text>
          <Text style={styles.emptySubtitle}>
            No service requests match &quot;{searchQuery}&quot;. Please check the ticket ID or try different keywords.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionButton}
            onPress={() => setSearchQuery('')}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={16} color={colors.navy[800]} style={{ marginRight: 5 }} />
            <Text style={styles.emptyActionButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Case 2: Selected status filter has no tickets
    if (selectedStatus !== 'ALL') {
      const statusLabel =
        FILTER_OPTIONS.find((f) => f.value === selectedStatus)?.label || selectedStatus;
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="funnel-outline" size={28} color={colors.navy[700]} />
          </View>
          <Text style={styles.emptyTitle}>No {statusLabel} Tickets</Text>
          <Text style={styles.emptySubtitle}>
            There are currently no service requests with status &quot;{statusLabel}&quot;.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionButton}
            onPress={() => setSelectedStatus('ALL')}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={16} color={colors.navy[800]} style={{ marginRight: 5 }} />
            <Text style={styles.emptyActionButtonText}>Show All Tickets</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Case 3: Customer has no tickets logged at all
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.feedback.success} />
        </View>
        <Text style={styles.emptyTitle}>No Service Requests Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your solar installation is operating normally. If you ever need equipment maintenance or inspection, raise a request anytime.
        </Text>
        <TouchableOpacity
          style={styles.emptyActionButtonPrimary}
          onPress={() => router.push('/(customer)/raise-issue')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.navy[900]} style={{ marginRight: 4 }} />
          <Text style={styles.emptyActionButtonPrimaryText}>Raise an Issue</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper disableContentPadding style={styles.screen}>
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TicketCard
            ticket={item}
            onPress={() => router.push(`/(customer)/tickets/${item.id}`)}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={isRefreshing}
        onRefresh={() => fetchTickets(true)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
  },

  /* 1. Header Section */
  headerContainer: {
    marginBottom: spacing.sm,
  },
  introRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  introTextWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  introTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 3,
  },
  introTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: -0.3,
  },
  totalBadge: {
    backgroundColor: colors.navy[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.navy[100],
  },
  totalBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.navy[700],
  },
  introSubtitle: {
    fontSize: 12.5,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  raiseHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold[500],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    gap: 3,
    ...Platform.select({
      ios: {
        shadowColor: colors.gold[700],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 1px 3px rgba(221, 167, 70, 0.2)',
      },
    }),
  },
  raiseHeaderButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[900],
  },

  /* 2. Ticket Statistics Summary Grid */
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  summaryCardActive: {
    borderColor: colors.gold[500],
    backgroundColor: colors.gold[50],
  },
  summaryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  summaryIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 2,
  },
  summaryCardFootnote: {
    fontSize: 9.5,
    fontWeight: '500',
    color: colors.text.muted,
  },

  /* 3. Search Field */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.sm + 2,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 4,
  },

  /* 4. Filter Chips Section */
  filterSection: {
    marginBottom: spacing.xs + 2,
    marginHorizontal: -spacing.md,
  },
  filterChipContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: colors.navy[800],
    borderColor: colors.navy[800],
  },
  filterChipLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterChipLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
  filterChipCountBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterChipCountBadgeActive: {
    backgroundColor: colors.navy[700],
  },
  filterChipCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  filterChipCountTextActive: {
    color: colors.gold[300],
  },

  /* Active Filter Feedback Row */
  activeFilterFeedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  activeFilterFeedbackText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  resetFiltersText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold[700],
  },

  /* 7. Empty State View */
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.navy[100],
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: 290,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[50],
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.navy[200],
  },
  emptyActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },
  emptyActionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold[500],
    paddingHorizontal: spacing.md + 4,
    paddingVertical: 9,
    borderRadius: borderRadius.pill,
  },
  emptyActionButtonPrimaryText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.navy[900],
  },
});
