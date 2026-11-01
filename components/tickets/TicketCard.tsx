import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../ui/AppCard';
import { StatusPill } from '../ui/StatusPill';
import { Ticket } from '../../types';
import { formatDate, formatRelativeTime, getTicketCategoryLabel } from '../../utils/formatters';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, shadows } from '../../constants/theme';

export interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
}

const getCategoryIcon = (category?: string, label?: string): keyof typeof Ionicons.glyphMap => {
  const text = `${category || ''} ${label || ''}`.toLowerCase();
  if (text.includes('inverter') || text.includes('fault')) return 'hardware-chip-outline';
  if (text.includes('generation') || text.includes('power') || text.includes('drop')) return 'flash-outline';
  if (text.includes('panel') || text.includes('cleaning') || text.includes('solar')) return 'sunny-outline';
  if (text.includes('wiring') || text.includes('cable') || text.includes('electrical')) return 'git-network-outline';
  if (text.includes('monitor') || text.includes('app') || text.includes('logger') || text.includes('wifi')) return 'wifi-outline';
  return 'construct-outline';
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress }) => {
  const categoryLabel = getTicketCategoryLabel(ticket.category) || ticket.categoryLabel || ticket.category;
  const categoryIcon = getCategoryIcon(ticket.category, categoryLabel);

  return (
    <AppCard onPress={onPress} style={styles.card} variant="elevated">
      {/* 1. Top Meta Row: Ticket ID & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.ticketIdBadge}>
          <Text style={styles.idPrefix}>#</Text>
          <Text style={styles.idNumber}>{ticket.ticketNumber || ticket.id.slice(0, 8)}</Text>
        </View>

        <StatusPill status={ticket.status} />
      </View>

      {/* 2. Category Row with Icon & Title */}
      <View style={styles.categoryRow}>
        <View style={styles.iconCircle}>
          <Ionicons name={categoryIcon} size={15} color={colors.navy[800]} />
        </View>
        <Text style={styles.categoryTitle} numberOfLines={1}>
          {categoryLabel}
        </Text>
      </View>

      {/* 3. Description preview (max 2 lines) */}
      {ticket.description ? (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {ticket.description}
        </Text>
      ) : null}

      {/* 4. Assigned Technician Chip if available */}
      {ticket.technician ? (
        <View style={styles.technicianChip}>
          <View style={styles.technicianAvatar}>
            <Ionicons name="person" size={11} color={colors.navy[800]} />
          </View>
          <Text style={styles.technicianLabel}>
            Specialist: <Text style={styles.technicianName}>{ticket.technician.name}</Text>
          </Text>
        </View>
      ) : null}

      {/* 5. Footer Row: Timestamp & View Details Affordance */}
      <View style={styles.footerRow}>
        <View style={styles.timestampContainer}>
          <Ionicons name="time-outline" size={13} color={colors.text.muted} style={{ marginRight: 4 }} />
          <Text style={styles.timestampText}>
            {ticket.updatedAt
              ? `Updated ${formatRelativeTime(ticket.updatedAt)}`
              : `Raised ${formatDate(ticket.createdAt)}`}
          </Text>
        </View>

        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.navy[800]} />
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm + 2,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  ticketIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idPrefix: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gold[700],
  },
  idNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy[800],
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  categoryTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.navy[800],
    flex: 1,
  },
  descriptionText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.text.secondary,
    marginBottom: spacing.xs + 2,
  },
  technicianChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: borderRadius.small,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs + 2,
  },
  technicianAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.navy[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  technicianLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  technicianName: {
    fontWeight: '700',
    color: colors.navy[800],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },
});
