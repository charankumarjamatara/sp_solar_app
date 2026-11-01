import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScreenWrapper } from '../../../../components/common/ScreenWrapper';
import { LoadingView } from '../../../../components/ui/LoadingState';
import { ErrorView } from '../../../../components/ui/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { StatusPill } from '../../../../components/ui/StatusPill';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppAvatar } from '../../../../components/ui/AppAvatar';
import { BeforeAfterViewer } from '../../../../components/tickets/BeforeAfterViewer';
import { TicketProgressTimeline } from '../../../../components/tickets/TicketProgressTimeline';
import { RatingStars } from '../../../../components/feedback/RatingStars';
import { useTicketDetails } from '../../../../hooks/useTicketDetails';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getTicketCategoryLabel,
} from '../../../../utils/formatters';
import { colors } from '../../../../constants/colors';
import { borderRadius, spacing, shadows } from '../../../../constants/theme';
import { env } from '../../../../config/env';

const getCategoryIcon = (category?: string, label?: string): keyof typeof Ionicons.glyphMap => {
  const text = `${category || ''} ${label || ''}`.toLowerCase();
  if (text.includes('inverter') || text.includes('fault')) return 'hardware-chip-outline';
  if (text.includes('generation') || text.includes('power') || text.includes('drop')) return 'flash-outline';
  if (text.includes('panel') || text.includes('cleaning') || text.includes('solar')) return 'sunny-outline';
  if (text.includes('wiring') || text.includes('cable') || text.includes('electrical')) return 'git-network-outline';
  if (text.includes('monitor') || text.includes('app') || text.includes('logger') || text.includes('wifi')) return 'wifi-outline';
  return 'construct-outline';
};

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ticket, isLoading, isRefreshing, error, refresh } = useTicketDetails(id);

  // Modal preview for customer attached photos
  const [selectedCustomerImage, setSelectedCustomerImage] = useState<string | null>(null);

  // Customer care support modal
  const [showSupportModal, setShowSupportModal] = useState(false);

  if (isLoading && !isRefreshing) {
    return <LoadingView message="Loading ticket details..." />;
  }

  if (error || !ticket) {
    return (
      <ScreenWrapper
        scrollable={false}
        headerProps={{
          title: 'Service Request Details',
          showBack: true,
          onBack: () => router.push('/(customer)/tickets'),
        }}
      >
        <View style={styles.errorContainer}>
          <ErrorView
            message={error || 'Unable to find this service request. The ticket may have been archived or the ID is invalid.'}
            onRetry={refresh}
          />
          <AppButton
            title="Return to My Tickets"
            variant="outline"
            onPress={() => router.push('/(customer)/tickets')}
            style={styles.backButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const isResolved = ticket.status === 'RESOLVED';
  const isClosed = ticket.status === 'CLOSED';
  const isResolvedOrClosed = isResolved || isClosed;
  const hasFeedback = Boolean(ticket.feedback);

  const customerImages = ticket.images.filter((img) => img.stage === 'CUSTOMER_ISSUE');
  const technicianImages = ticket.images.filter(
    (img) => img.stage === 'BEFORE_REPAIR' || img.stage === 'AFTER_REPAIR'
  );

  const categoryLabel = getTicketCategoryLabel(ticket.category) || ticket.categoryLabel || ticket.category;
  const categoryIcon = getCategoryIcon(ticket.category, categoryLabel);

  return (
    <ScreenWrapper
      scrollable
      onRefresh={refresh}
      isRefreshing={isRefreshing}
      disableContentPadding
      contentContainerStyle={styles.contentContainer}
    >
      {/* 2. Screen Header & Ticket Identification */}
      <View style={styles.headerBar}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backCircleBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back to tickets"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.navy[800]} />
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerPageTitle}>Service Request Details</Text>
            <View style={styles.ticketIdRow}>
              <Text style={styles.ticketIdPrefix}>#</Text>
              <Text style={styles.ticketIdText}>
                {ticket.ticketNumber || ticket.id.slice(0, 8)}
              </Text>
            </View>
          </View>

          <StatusPill status={ticket.status} />
        </View>
      </View>

      <View style={styles.innerBody}>
        {/* 3. Ticket Overview Card */}
        <AppCard variant="elevated" style={styles.sectionCard}>
          <View style={styles.overviewTopRow}>
            <View style={styles.categoryBadgeRow}>
              <View style={styles.categoryIconCircle}>
                <Ionicons name={categoryIcon} size={16} color={colors.navy[800]} />
              </View>
              <Text style={styles.categoryTitleText}>{categoryLabel}</Text>
            </View>

            <View style={styles.reportedTimeBadge}>
              <Ionicons name="calendar-outline" size={12} color={colors.text.muted} style={{ marginRight: 3 }} />
              <Text style={styles.reportedTimeText}>{formatDate(ticket.createdAt)}</Text>
            </View>
          </View>

          {/* Issue Title / Category headline */}
          <Text style={styles.issueHeadline}>
            {ticket.categoryLabel || categoryLabel}
          </Text>

          {/* Full description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Reported Issue Description</Text>
            <Text style={styles.descriptionBodyText}>{ticket.description}</Text>
          </View>

          {/* Metadata Grid */}
          <View style={styles.metaInfoGrid}>
            <View style={styles.metaInfoItem}>
              <Text style={styles.metaInfoLabel}>Reported</Text>
              <Text style={styles.metaInfoValue}>{formatDateTime(ticket.createdAt)}</Text>
            </View>

            <View style={styles.metaInfoDivider} />

            <View style={styles.metaInfoItem}>
              <Text style={styles.metaInfoLabel}>Last Updated</Text>
              <Text style={styles.metaInfoValue}>{formatRelativeTime(ticket.updatedAt)}</Text>
            </View>
          </View>

          {/* Customer Attached Photos (if present) */}
          {customerImages.length > 0 && (
            <View style={styles.customerPhotosSection}>
              <Text style={styles.customerPhotosTitle}>
                Attached Customer Photos ({customerImages.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.customerPhotosList}
              >
                {customerImages.map((img) => (
                  <TouchableOpacity
                    key={img.id}
                    style={styles.customerPhotoThumbCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedCustomerImage(img.url)}
                  >
                    <Image
                      source={{ uri: img.url }}
                      style={styles.customerPhotoThumb}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.photoZoomIcon}>
                      <Ionicons name="expand-outline" size={12} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </AppCard>

        {/* 4. Repair Progress Timeline */}
        <AppCard variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderIconCircle}>
              <Ionicons name="git-commit-outline" size={17} color={colors.navy[800]} />
            </View>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardHeaderTitle}>Service Lifecycle Timeline</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Real-time progress verified by SP Solar dispatch
              </Text>
            </View>
          </View>

          <TicketProgressTimeline
            currentStatus={ticket.status}
            dates={{
              raisedAt: ticket.createdAt,
              assignedAt: ticket.assignedAt || ticket.technician?.assignedAt,
              inProgressAt: ticket.inProgressAt,
              resolvedAt: ticket.resolvedAt || ticket.resolution?.resolvedAt,
              closedAt: ticket.closedAt,
              feedbackAt: ticket.feedback?.createdAt,
            }}
            hasTechnician={Boolean(ticket.technician)}
            technicianName={ticket.technician?.name}
            hasFeedback={hasFeedback}
          />
        </AppCard>

        {/* 5. Assigned Technician Information */}
        <AppCard variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderIconCircle}>
              <Ionicons name="person-outline" size={17} color={colors.navy[800]} />
            </View>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardHeaderTitle}>Assigned Technician</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Certified solar equipment engineer
              </Text>
            </View>
          </View>

          {ticket.technician ? (
            <View style={styles.techProfileBox}>
              <View style={styles.techAvatarWrapper}>
                <AppAvatar
                  name={ticket.technician.name}
                  url={ticket.technician.avatarUrl}
                  size={54}
                  variant="navy"
                />
              </View>

              <View style={styles.techDetailsColumn}>
                <Text style={styles.techNameText}>{ticket.technician.name}</Text>
                <Text style={styles.techSpecializationText}>
                  {ticket.technician.specialization || 'Solar PV Systems Specialist'}
                </Text>

                <View style={styles.techAssignmentRow}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.feedback.success} style={{ marginRight: 4 }} />
                  <Text style={styles.techAssignmentText}>
                    {ticket.assignedAt || ticket.technician.assignedAt
                      ? `Assigned on ${formatDate(ticket.assignedAt || ticket.technician.assignedAt)}`
                      : 'Assigned to your service request'}
                  </Text>
                </View>

                {ticket.technician.phoneNumber ? (
                  <TouchableOpacity
                    style={styles.techContactBtn}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(`tel:${ticket.technician!.phoneNumber}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Call technician ${ticket.technician.name}`}
                  >
                    <Ionicons name="call" size={14} color={colors.navy[900]} style={{ marginRight: 5 }} />
                    <Text style={styles.techContactBtnText}>
                      Call Specialist ({ticket.technician.phoneNumber})
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.techPendingBox}>
              <View style={styles.techPendingIconCircle}>
                <Ionicons name="time-outline" size={24} color={colors.navy[700]} />
              </View>
              <Text style={styles.techPendingTitle}>Technician Assignment Pending</Text>
              <Text style={styles.techPendingSubtitle}>
                Our dispatch coordination team is reviewing your request and will assign a certified solar technician.
              </Text>
            </View>
          )}
        </AppCard>

        {/* Chronological Repair Updates Log (if available) */}
        {ticket.updates && ticket.updates.length > 0 && (
          <AppCard variant="elevated" style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderIconCircle}>
                <Ionicons name="newspaper-outline" size={17} color={colors.navy[800]} />
              </View>
              <View style={styles.cardHeaderCol}>
                <Text style={styles.cardHeaderTitle}>Technician Activity Log</Text>
                <Text style={styles.cardHeaderSubtitle}>
                  Field inspection and repair progress updates
                </Text>
              </View>
            </View>

            <View style={styles.updatesContainer}>
              {ticket.updates.map((update, index) => (
                <View key={update.id} style={styles.updateRow}>
                  <View style={styles.updateIndicatorCol}>
                    <View style={styles.updateBulletDot} />
                    {index < ticket.updates!.length - 1 && (
                      <View style={styles.updateLine} />
                    )}
                  </View>

                  <View style={[styles.updateContentCol, index < ticket.updates!.length - 1 && styles.updateSpacing]}>
                    <View style={styles.updateMetaRow}>
                      <Text style={styles.updateTitleText}>{update.title}</Text>
                      <Text style={styles.updateTimestampText}>
                        {formatRelativeTime(update.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.updateMessageText}>{update.message}</Text>
                  </View>
                </View>
              ))}
            </View>
          </AppCard>
        )}

        {/* 6. Repair Images — Before and After Documentation */}
        <BeforeAfterViewer
          images={technicianImages}
          isPendingUpload={ticket.status === 'RAISED' || ticket.status === 'ASSIGNED'}
        />

        {/* Resolution Summary (If ticket is resolved or closed with resolution data) */}
        {isResolvedOrClosed && ticket.resolution && (
          <AppCard variant="elevated" style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardHeaderIconCircle, { backgroundColor: colors.feedback.successBg }]}>
                <Ionicons name="shield-checkmark" size={17} color={colors.feedback.success} />
              </View>
              <View style={styles.cardHeaderCol}>
                <Text style={styles.cardHeaderTitle}>Resolution Summary</Text>
                <Text style={styles.cardHeaderSubtitle}>
                  Verified by technician on {formatDate(ticket.resolution.resolvedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.resolutionNotesBox}>
              <Text style={styles.resolutionNotesLabel}>Technician Resolution Notes:</Text>
              <Text style={styles.resolutionNotesBody}>
                &ldquo;{ticket.resolution.technicianNotes}&rdquo;
              </Text>
            </View>

            <View style={styles.resolutionMetaGrid}>
              {ticket.resolution.rootCause ? (
                <View style={styles.resolutionMetaRow}>
                  <Text style={styles.resolutionMetaKey}>Root Cause:</Text>
                  <Text style={styles.resolutionMetaVal}>{ticket.resolution.rootCause}</Text>
                </View>
              ) : null}

              {ticket.resolution.partsReplaced && ticket.resolution.partsReplaced.length > 0 && (
                <View style={styles.resolutionMetaRow}>
                  <Text style={styles.resolutionMetaKey}>Parts Replaced:</Text>
                  <Text style={styles.resolutionMetaVal}>
                    {ticket.resolution.partsReplaced.join(', ')}
                  </Text>
                </View>
              )}

              <View style={styles.resolutionMetaRow}>
                <Text style={styles.resolutionMetaKey}>Resolved On:</Text>
                <Text style={styles.resolutionMetaVal}>
                  {formatDateTime(ticket.resolution.resolvedAt)}
                </Text>
              </View>
            </View>
          </AppCard>
        )}

        {/* 7. Customer Feedback Section */}
        {isResolvedOrClosed && (
          <AppCard variant="elevated" style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardHeaderIconCircle, { backgroundColor: colors.gold[100] }]}>
                <Ionicons name="star" size={17} color={colors.gold[700]} />
              </View>
              <View style={styles.cardHeaderCol}>
                <Text style={styles.cardHeaderTitle}>
                  {hasFeedback ? 'Service Review' : 'Rate Your Repair Experience'}
                </Text>
                <Text style={styles.cardHeaderSubtitle}>
                  Customer verification and technician rating
                </Text>
              </View>
            </View>

            {hasFeedback && ticket.feedback ? (
              <View style={styles.feedbackRecordedBox}>
                <View style={styles.feedbackRatingStrip}>
                  <RatingStars rating={ticket.feedback.rating} size={20} />
                  <Text style={styles.feedbackRatingScore}>
                    {ticket.feedback.rating}.0 / 5.0
                  </Text>
                </View>

                {ticket.feedback.comment ? (
                  <Text style={styles.feedbackCommentText}>
                    &ldquo;{ticket.feedback.comment}&rdquo;
                  </Text>
                ) : null}

                {ticket.feedback.createdAt && (
                  <Text style={styles.feedbackSubmittedDate}>
                    Submitted on {formatDate(ticket.feedback.createdAt)}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.feedbackPromptBox}>
                <Text style={styles.feedbackPromptText}>
                  Your solar system issue has been marked as resolved. Please take a moment to evaluate the technician&apos;s workmanship and punctuality.
                </Text>
                <TouchableOpacity
                  style={styles.feedbackSubmitCTA}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/(customer)/tickets/${ticket.id}/feedback` as any)}
                  accessibilityRole="button"
                  accessibilityLabel="Rate and review service"
                >
                  <Ionicons name="star" size={15} color={colors.navy[900]} style={{ marginRight: 6 }} />
                  <Text style={styles.feedbackSubmitCTAText}>Submit Service Review</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.navy[900]} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            )}
          </AppCard>
        )}

        {/* 8. Dedicated Contact Support Card */}
        <View style={styles.supportBannerCard}>
          <View style={styles.supportBannerLeft}>
            <View style={styles.supportIconBadge}>
              <Ionicons name="headset-outline" size={20} color={colors.gold[300]} />
            </View>
            <View style={styles.supportTextColumn}>
              <Text style={styles.supportBannerTitle}>Have Questions About This Ticket?</Text>
              <Text style={styles.supportBannerSubtitle}>
                Our customer support desk is available to assist you with inquiries.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.contactSupportBtn}
            activeOpacity={0.8}
            onPress={() => setShowSupportModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Contact SP Solar Support"
          >
            <Text style={styles.contactSupportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Image Full-screen Preview Modal */}
      <Modal
        visible={Boolean(selectedCustomerImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCustomerImage(null)}
      >
        <View style={styles.photoModalBackdrop}>
          <TouchableOpacity
            style={styles.photoModalCloseBtn}
            onPress={() => setSelectedCustomerImage(null)}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          {selectedCustomerImage && (
            <Image
              source={{ uri: selectedCustomerImage }}
              style={styles.photoModalImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>

      {/* Customer Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.supportModalOverlay}>
          <View style={styles.supportModalCard}>
            <View style={styles.supportModalHeaderCircle}>
              <Ionicons name="headset" size={26} color={colors.gold[500]} />
            </View>

            <Text style={styles.supportModalTitle}>SP Solar Support</Text>
            <Text style={styles.supportModalSubtitle}>
              Reference Ticket #{ticket.ticketNumber || ticket.id.slice(0, 8)}
            </Text>

            <View style={styles.supportModalContactBox}>
              <TouchableOpacity
                style={styles.supportModalRow}
                onPress={() => Linking.openURL(`tel:${env.supportPhone}`)}
                activeOpacity={0.7}
              >
                <View style={styles.supportModalRowIcon}>
                  <Ionicons name="call" size={17} color={colors.navy[800]} />
                </View>
                <View style={styles.supportModalRowDetails}>
                  <Text style={styles.supportModalRowLabel}>Toll-Free Helpline</Text>
                  <Text style={styles.supportModalRowValue}>{env.supportPhone}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
              </TouchableOpacity>

              <View style={styles.supportModalDivider} />

              <TouchableOpacity
                style={styles.supportModalRow}
                onPress={() =>
                  Linking.openURL(
                    `mailto:${env.supportEmail}?subject=Inquiry on Ticket #${ticket.ticketNumber || ticket.id}`
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.supportModalRowIcon}>
                  <Ionicons name="mail" size={17} color={colors.navy[800]} />
                </View>
                <View style={styles.supportModalRowDetails}>
                  <Text style={styles.supportModalRowLabel}>Email Care</Text>
                  <Text style={styles.supportModalRowValue}>{env.supportEmail}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <AppButton
              title="Close"
              variant="outline"
              size="md"
              onPress={() => setShowSupportModal(false)}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing['4xl'],
  },
  headerBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    marginRight: spacing.sm,
  },
  headerTitleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerPageTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 0.2,
  },
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  ticketIdPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gold[700],
  },
  ticketIdText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy[800],
    marginLeft: 2,
    letterSpacing: 0.3,
  },
  innerBody: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  /* Section Card standard styling */
  sectionCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },

  /* 3. Ticket Overview Card */
  overviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  categoryTitleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.navy[800],
  },
  reportedTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportedTimeText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  issueHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  descriptionContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  descriptionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.4,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  descriptionBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.primary,
  },
  metaInfoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  metaInfoItem: {
    flex: 1,
  },
  metaInfoLabel: {
    fontSize: 10.5,
    color: colors.text.secondary,
    marginBottom: 1,
  },
  metaInfoValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.navy[800],
  },
  metaInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.sm,
  },
  customerPhotosSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  customerPhotosTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: spacing.xs,
  },
  customerPhotosList: {
    gap: spacing.xs + 2,
  },
  customerPhotoThumbCard: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  customerPhotoThumb: {
    width: '100%',
    height: '100%',
  },
  photoZoomIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 23, 53, 0.7)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Card Header Row Standard */
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs + 2,
  },
  cardHeaderCol: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: -0.2,
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },

  /* 5. Technician Profile Box */
  techProfileBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  techAvatarWrapper: {
    marginRight: spacing.md,
  },
  techDetailsColumn: {
    flex: 1,
  },
  techNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 2,
  },
  techSpecializationText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  techAssignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  techAssignmentText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.feedback.success,
  },
  techContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold[300],
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  techContactBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.navy[900],
  },
  techPendingBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  techPendingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  techPendingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 3,
    textAlign: 'center',
  },
  techPendingSubtitle: {
    fontSize: 11.5,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 290,
  },

  /* Activity Updates Log */
  updatesContainer: {
    paddingLeft: spacing.xs,
  },
  updateRow: {
    flexDirection: 'row',
  },
  updateIndicatorCol: {
    alignItems: 'center',
    width: 20,
  },
  updateBulletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.navy[800],
    borderWidth: 2,
    borderColor: colors.navy[100],
    marginTop: 3,
  },
  updateLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border.default,
    marginVertical: 2,
  },
  updateContentCol: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  updateSpacing: {
    paddingBottom: spacing.md,
  },
  updateMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  updateTitleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.navy[800],
  },
  updateTimestampText: {
    fontSize: 10.5,
    color: colors.text.muted,
  },
  updateMessageText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16.5,
  },

  /* Resolution Section */
  resolutionNotesBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  resolutionNotesLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  resolutionNotesBody: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    color: colors.text.primary,
  },
  resolutionMetaGrid: {
    gap: 4,
    paddingTop: spacing.xs,
  },
  resolutionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resolutionMetaKey: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  resolutionMetaVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.navy[800],
  },

  /* Feedback Section */
  feedbackRecordedBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  feedbackRatingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  feedbackRatingScore: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy[800],
  },
  feedbackCommentText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: colors.text.secondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  feedbackSubmittedDate: {
    fontSize: 10.5,
    color: colors.text.muted,
  },
  feedbackPromptBox: {
    backgroundColor: colors.gold[50],
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold[200],
  },
  feedbackPromptText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.navy[900],
    marginBottom: spacing.md,
  },
  feedbackSubmitCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold[500],
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  feedbackSubmitCTAText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.navy[900],
  },

  /* 8. Dedicated Contact Support Card */
  supportBannerCard: {
    backgroundColor: colors.navy[800],
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.navy[700],
    ...shadows.sm,
  },
  supportBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  supportIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  supportBannerSubtitle: {
    fontSize: 11,
    color: colors.navy[200],
    lineHeight: 15,
  },
  contactSupportBtn: {
    backgroundColor: colors.gold[500],
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  contactSupportBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.navy[900],
  },

  /* Customer Photo Modal */
  photoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 17, 38, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoModalImage: {
    width: '90%',
    height: '75%',
  },

  /* Support Modal */
  supportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 17, 38, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  supportModalCard: {
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
  supportModalHeaderCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gold[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  supportModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 2,
    textAlign: 'center',
  },
  supportModalSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  supportModalContactBox: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  supportModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  supportModalRowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  supportModalRowDetails: {
    flex: 1,
  },
  supportModalRowLabel: {
    fontSize: 10.5,
    color: colors.text.secondary,
  },
  supportModalRowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy[800],
    marginTop: 1,
  },
  supportModalDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },

  /* Error State Container */
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  backButton: {
    marginTop: spacing.lg,
    width: '100%',
  },
});
