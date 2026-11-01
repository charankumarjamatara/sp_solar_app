import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TicketStatus } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { colors } from '../../constants/colors';
import { borderRadius, spacing } from '../../constants/theme';

export interface TimelineDates {
  raisedAt?: string;
  assignedAt?: string;
  inProgressAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  feedbackAt?: string;
}

export interface TicketProgressTimelineProps {
  currentStatus: TicketStatus;
  dates: TimelineDates;
  hasTechnician?: boolean;
  technicianName?: string;
  hasFeedback?: boolean;
}

interface StageConfig {
  key: string;
  title: string;
  defaultDescription: string;
}

const STAGES: StageConfig[] = [
  {
    key: 'RAISED',
    title: 'Issue Raised',
    defaultDescription: 'Service request registered and queued for technician dispatch.',
  },
  {
    key: 'ASSIGNED',
    title: 'Technician Assigned',
    defaultDescription: 'Solar service specialist assigned to inspect equipment.',
  },
  {
    key: 'IN_PROGRESS',
    title: 'Work In Progress',
    defaultDescription: 'Technician on site; voltage checks and repairs underway.',
  },
  {
    key: 'RESOLVED',
    title: 'Issue Resolved',
    defaultDescription: 'Repairs completed and normal solar operation confirmed.',
  },
  {
    key: 'FEEDBACK',
    title: 'Customer Feedback',
    defaultDescription: 'Service verification and customer satisfaction rating.',
  },
];

export const TicketProgressTimeline: React.FC<TicketProgressTimelineProps> = ({
  currentStatus,
  dates,
  hasTechnician = false,
  technicianName,
  hasFeedback = false,
}) => {
  // Determine completion and current state for each of the 5 stages
  const getStageState = (stageKey: string): 'COMPLETED' | 'CURRENT' | 'PENDING' => {
    switch (stageKey) {
      case 'RAISED':
        // If currentStatus is RAISED, this is current; otherwise completed
        return currentStatus === 'RAISED' ? 'CURRENT' : 'COMPLETED';

      case 'ASSIGNED':
        if (currentStatus === 'RAISED') return 'PENDING';
        if (currentStatus === 'ASSIGNED') return 'CURRENT';
        return 'COMPLETED';

      case 'IN_PROGRESS':
        if (currentStatus === 'RAISED' || currentStatus === 'ASSIGNED') return 'PENDING';
        if (currentStatus === 'IN_PROGRESS') return 'CURRENT';
        return 'COMPLETED';

      case 'RESOLVED':
        if (currentStatus === 'RAISED' || currentStatus === 'ASSIGNED' || currentStatus === 'IN_PROGRESS') {
          return 'PENDING';
        }
        if (currentStatus === 'RESOLVED' && !hasFeedback) return 'CURRENT';
        return 'COMPLETED';

      case 'FEEDBACK':
        if (hasFeedback) return 'COMPLETED';
        if (currentStatus === 'RESOLVED' || currentStatus === 'CLOSED') return 'CURRENT';
        return 'PENDING';

      default:
        return 'PENDING';
    }
  };

  const getStageTimestamp = (stageKey: string): string | undefined => {
    switch (stageKey) {
      case 'RAISED':
        return dates.raisedAt;
      case 'ASSIGNED':
        return dates.assignedAt;
      case 'IN_PROGRESS':
        return dates.inProgressAt;
      case 'RESOLVED':
        return dates.resolvedAt;
      case 'FEEDBACK':
        return dates.feedbackAt;
      default:
        return undefined;
    }
  };

  const getStageDescription = (stage: StageConfig, state: 'COMPLETED' | 'CURRENT' | 'PENDING') => {
    if (stage.key === 'ASSIGNED' && hasTechnician && technicianName) {
      return `Specialist ${technicianName} assigned to site inspection.`;
    }
    if (stage.key === 'FEEDBACK') {
      if (state === 'COMPLETED') return 'Customer review submitted and verified.';
      if (state === 'CURRENT') return 'Awaiting your feedback on technician performance.';
      return 'Available once repairs are confirmed resolved.';
    }
    return stage.defaultDescription;
  };

  return (
    <View style={styles.container}>
      {STAGES.map((stage, index) => {
        const state = getStageState(stage.key);
        const isCompleted = state === 'COMPLETED';
        const isCurrent = state === 'CURRENT';
        const isPending = state === 'PENDING';
        const isLast = index === STAGES.length - 1;
        const timestamp = getStageTimestamp(stage.key);
        const description = getStageDescription(stage, state);

        return (
          <View key={stage.key} style={styles.stageRow}>
            {/* Left Node & Connector Line */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.nodeCircle,
                  isCompleted && styles.nodeCompleted,
                  isCurrent && styles.nodeCurrent,
                  isPending && styles.nodePending,
                ]}
                accessibilityRole="image"
                accessibilityLabel={`${stage.title}: ${state}`}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={13} color={colors.white} />
                ) : isCurrent ? (
                  <View style={styles.nodeCurrentInner} />
                ) : (
                  <View style={styles.nodePendingDot} />
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    isCompleted ? styles.connectorCompleted : styles.connectorPending,
                  ]}
                />
              )}
            </View>

            {/* Right Information Block */}
            <View style={[styles.infoCol, !isLast && styles.infoColSpacing]}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.stageTitle,
                    isCurrent && styles.stageTitleCurrent,
                    isPending && styles.stageTitlePending,
                  ]}
                >
                  {stage.title}
                </Text>

                {isCurrent && (
                  <View style={styles.activePill}>
                    <View style={styles.activePillDot} />
                    <Text style={styles.activePillText}>Active Stage</Text>
                  </View>
                )}
                {isCompleted && (
                  <Text style={styles.completedTag}>Done</Text>
                )}
              </View>

              {timestamp ? (
                <View style={styles.timestampRow}>
                  <Ionicons name="time-outline" size={11} color={colors.text.muted} style={{ marginRight: 3 }} />
                  <Text style={styles.stageTimestamp}>{formatDateTime(timestamp)}</Text>
                </View>
              ) : null}

              <Text
                style={[
                  styles.stageDescription,
                  isPending && styles.stageDescriptionPending,
                ]}
              >
                {description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  stageRow: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: colors.feedback.success,
    borderColor: colors.feedback.success,
  },
  nodeCurrent: {
    backgroundColor: colors.white,
    borderColor: colors.gold[500],
  },
  nodeCurrentInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold[500],
  },
  nodePending: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border.default,
  },
  nodePendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border.strong,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  connectorCompleted: {
    backgroundColor: colors.feedback.success,
  },
  connectorPending: {
    backgroundColor: colors.border.default,
  },
  infoCol: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  infoColSpacing: {
    paddingBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  stageTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.navy[800],
  },
  stageTitleCurrent: {
    color: colors.navy[800],
    fontWeight: '700',
  },
  stageTitlePending: {
    color: colors.text.muted,
    fontWeight: '500',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold[100],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  activePillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.gold[700],
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold[700],
  },
  completedTag: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.feedback.success,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 2,
  },
  stageTimestamp: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  stageDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16.5,
  },
  stageDescriptionPending: {
    color: colors.text.muted,
  },
});

