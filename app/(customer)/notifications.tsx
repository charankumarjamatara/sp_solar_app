import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { LoadingView } from '../../components/ui/LoadingState';
import { ErrorView } from '../../components/ui/ErrorState';
import { AppCard } from '../../components/ui/AppCard';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, shadows } from '../../constants/theme';

type NotificationFilter = 'ALL' | 'UNREAD' | 'READ';

interface FilterTabOption {
  label: string;
  value: NotificationFilter;
}

const FILTER_TABS: FilterTabOption[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Read', value: 'READ' },
];

interface GroupedNotifications {
  title: 'Today' | 'Yesterday' | 'Earlier';
  data: Notification[];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications();

  // Reload notifications automatically whenever the screen comes into active focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Filter notifications based on read state
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'UNREAD':
        return notifications.filter((n) => !n.isRead);
      case 'READ':
        return notifications.filter((n) => n.isRead);
      case 'ALL':
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  // Group filtered notifications by date categories: Today, Yesterday, Earlier
  const groupedSections = useMemo((): GroupedNotifications[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<'Today' | 'Yesterday' | 'Earlier', Notification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    filteredNotifications.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const itemDay = new Date(itemDate);
      itemDay.setHours(0, 0, 0, 0);

      if (itemDay.getTime() === today.getTime()) {
        groups.Today.push(item);
      } else if (itemDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(item);
      } else {
        groups.Earlier.push(item);
      }
    });

    const result: GroupedNotifications[] = [];
    if (groups.Today.length > 0) result.push({ title: 'Today', data: groups.Today });
    if (groups.Yesterday.length > 0) result.push({ title: 'Yesterday', data: groups.Yesterday });
    if (groups.Earlier.length > 0) result.push({ title: 'Earlier', data: groups.Earlier });
    return result;
  }, [filteredNotifications]);

  // Filter count badges
  const filterCounts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = total - unread;
    return {
      ALL: total,
      UNREAD: unread,
      READ: read,
    };
  }, [notifications]);

  // Icon configuration based on notification type
  const getNotificationIcon = (
    type: NotificationType
  ): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    switch (type) {
      case 'TICKET_CREATED':
        return {
          name: 'document-text',
          color: colors.navy[800],
          bg: colors.navy[50],
        };
      case 'TECHNICIAN_ASSIGNED':
        return {
          name: 'person-add',
          color: colors.navy[800],
          bg: '#EAF0F8',
        };
      case 'REPAIR_STARTED':
        return {
          name: 'construct',
          color: colors.gold[700],
          bg: colors.gold[100],
        };
      case 'REPAIR_COMPLETED':
      case 'TICKET_RESOLVED':
        return {
          name: 'checkmark-circle',
          color: colors.feedback.success,
          bg: colors.feedback.successBg,
        };
      case 'FEEDBACK_REQUEST':
        return {
          name: 'star',
          color: colors.gold[700],
          bg: colors.gold[100],
        };
      case 'MAINTENANCE_REMINDER':
        return {
          name: 'calendar',
          color: colors.navy[700],
          bg: colors.navy[50],
        };
      case 'ANNOUNCEMENT':
      default:
        return {
          name: 'notifications',
          color: colors.navy[800],
          bg: colors.navy[50],
        };
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (!item.isRead) {
        await markAsRead(item.id);
      }
      if (item.ticketId) {
        router.push(`/(customer)/tickets/${item.ticketId}` as any);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      await markAllAsRead();
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && notifications.length === 0) {
    return <LoadingView message="Loading your notifications..." />;
  }

  if (error && notifications.length === 0) {
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.errorContainer}>
          <ErrorView message={error} onRetry={refresh} />
        </View>
      </ScreenWrapper>
    );
  }

  // Header component with Title, unread badge, Mark All as Read button, and Filter tabs
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      {/* 2. Screen Header & Actions */}
      <View style={styles.introRow}>
        <View style={styles.introTextCol}>
          <View style={styles.titleWithBadgeRow}>
            <Text style={styles.pageTitle}>Notifications</Text>
            <View
              style={[
                styles.unreadPillBadge,
                unreadCount > 0 ? styles.unreadPillActive : styles.unreadPillMuted,
              ]}
            >
              <View
                style={[
                  styles.pillDot,
                  { backgroundColor: unreadCount > 0 ? colors.gold[700] : colors.feedback.success },
                ]}
              />
              <Text
                style={[
                  styles.unreadPillText,
                  { color: unreadCount > 0 ? colors.gold[700] : colors.feedback.success },
                ]}
              >
                {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up'}
              </Text>
            </View>
          </View>
          <Text style={styles.pageSubtitle}>
            Stay updated on your solar equipment and service requests.
          </Text>
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllBtn}
            activeOpacity={0.8}
            onPress={handleMarkAllAsRead}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Ionicons name="checkmark-done" size={15} color={colors.navy[800]} style={{ marginRight: 4 }} />
            <Text style={styles.markAllBtnText}>Mark all read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 3. Notification Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipContainer}
        >
          {FILTER_TABS.map((filter) => {
            const isSelected = activeFilter === filter.value;
            const count = filterCounts[filter.value];

            return (
              <TouchableOpacity
                key={filter.value}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.75}
                onPress={() => setActiveFilter(filter.value)}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${filter.label}, ${count} items`}
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
    </View>
  );

  // Group Section Header (Today, Yesterday, Earlier)
  const renderSectionHeader = ({ section: { title, data } }: { section: GroupedNotifications }) => (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionHeaderTitle}>{title.toUpperCase()}</Text>
      <View style={styles.sectionCountPill}>
        <Text style={styles.sectionCountText}>{data.length}</Text>
      </View>
    </View>
  );

  // Notification Item Card
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconConfig = getNotificationIcon(item.type);
    const hasTicketRef = Boolean(item.ticketId);

    return (
      <AppCard
        style={[
          styles.itemCard,
          !item.isRead ? styles.itemCardUnread : styles.itemCardRead,
        ]}
        variant={item.isRead ? 'outlined' : 'elevated'}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.itemRow}>
          {/* Contextual Icon Container */}
          <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.name} size={18} color={iconConfig.color} />
          </View>

          {/* Main Content */}
          <View style={styles.itemContentCol}>
            <View style={styles.itemTitleRow}>
              <Text
                style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {!item.isRead && <View style={styles.unreadIndicatorDot} />}
            </View>

            <Text
              style={[styles.itemBodyText, item.isRead && styles.itemBodyTextRead]}
              numberOfLines={3}
            >
              {item.body}
            </Text>

            {/* Footer Metadata: Ticket reference chip and timestamp */}
            <View style={styles.itemFooterRow}>
              {hasTicketRef ? (
                <View style={styles.ticketBadge}>
                  <Text style={styles.ticketBadgePrefix}>#</Text>
                  <Text style={styles.ticketBadgeText}>
                    {item.ticketNumber || item.ticketId}
                  </Text>
                  <Ionicons name="chevron-forward" size={11} color={colors.navy[800]} style={{ marginLeft: 2 }} />
                </View>
              ) : (
                <View style={styles.generalBadge}>
                  <Text style={styles.generalBadgeText}>Advisory</Text>
                </View>
              )}

              <View style={styles.timestampRow}>
                <Ionicons name="time-outline" size={12} color={colors.text.muted} style={{ marginRight: 3 }} />
                <Text style={styles.timestampText}>
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </AppCard>
    );
  };

  // Contextual Empty States
  const renderEmptyState = () => {
    if (activeFilter === 'UNREAD') {
      return (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.feedback.successBg }]}>
            <Ionicons name="checkmark-done-circle" size={30} color={colors.feedback.success} />
          </View>
          <Text style={styles.emptyTitle}>No Unread Notifications</Text>
          <Text style={styles.emptySubtitle}>
            You&apos;re completely up to date. You will be notified as soon as technicians or dispatches update your requests.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={15} color={colors.navy[800]} style={{ marginRight: 5 }} />
            <Text style={styles.emptyActionBtnText}>Show All Notifications</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === 'READ') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="mail-unread-outline" size={30} color={colors.navy[700]} />
          </View>
          <Text style={styles.emptyTitle}>No Read Notifications</Text>
          <Text style={styles.emptySubtitle}>
            You haven&apos;t marked any alerts as read yet.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={15} color={colors.navy[800]} style={{ marginRight: 5 }} />
            <Text style={styles.emptyActionBtnText}>Show All Notifications</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="notifications-off-outline" size={30} color={colors.navy[700]} />
        </View>
        <Text style={styles.emptyTitle}>You&apos;re All Caught Up</Text>
        <Text style={styles.emptySubtitle}>
          There are no notifications right now. Service updates and technician notes will be delivered here in real time.
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper disableContentPadding style={styles.screen}>
      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContentContainer}
        stickySectionHeadersEnabled={false}
        refreshing={isRefreshing}
        onRefresh={refresh}
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
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  /* Header Section */
  headerContainer: {
    marginBottom: spacing.xs,
  },
  introRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  introTextCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: -0.3,
  },
  unreadPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  unreadPillActive: {
    backgroundColor: colors.gold[100],
    borderWidth: 1,
    borderColor: colors.gold[300],
  },
  unreadPillMuted: {
    backgroundColor: colors.feedback.successBg,
    borderWidth: 1,
    borderColor: colors.feedback.successBorder,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  unreadPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  markAllBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.navy[800],
  },

  /* 3. Notification Filter Chips */
  filterSection: {
    marginBottom: spacing.sm,
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
    fontSize: 12,
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

  /* Date Group Headers */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.8,
  },
  sectionCountPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  sectionCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.muted,
  },

  /* 4. Notification Item Card */
  itemCard: {
    marginBottom: spacing.xs + 2,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    borderWidth: 1,
  },
  itemCardUnread: {
    backgroundColor: colors.surface,
    borderColor: colors.gold[300],
    ...shadows.sm,
  },
  itemCardRead: {
    backgroundColor: colors.surface,
    borderColor: colors.border.default,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  itemContentCol: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.navy[800],
    flex: 1,
    paddingRight: 6,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: colors.navy[900],
  },
  unreadIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.gold[600],
    marginLeft: 4,
  },
  itemBodyText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  itemBodyTextRead: {
    color: colors.text.muted,
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[50],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  ticketBadgePrefix: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.gold[700],
  },
  ticketBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.navy[800],
    marginLeft: 2,
  },
  generalBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  generalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.muted,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 10.5,
    color: colors.text.muted,
  },

  /* 6. Contextual Empty States */
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[50],
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.navy[200],
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },
});
