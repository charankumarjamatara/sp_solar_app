import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../../components/common/ScreenWrapper';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { RatingStars } from '../../../../components/feedback/RatingStars';
import { StatusPill } from '../../../../components/ui/StatusPill';
import { LoadingView } from '../../../../components/ui/LoadingState';
import { ErrorView } from '../../../../components/ui/ErrorState';
import { useTicketDetails } from '../../../../hooks/useTicketDetails';
import { feedbackService } from '../../../../services/feedback/feedbackService';
import { formatDate, getTicketCategoryLabel } from '../../../../utils/formatters';
import { TicketFeedback } from '../../../../types';
import { colors } from '../../../../constants/colors';
import { borderRadius, spacing, shadows } from '../../../../constants/theme';

export const FEEDBACK_CATEGORIES = [
  'Technician Professionalism',
  'Service Quality',
  'Response Time',
  'Communication',
  'Overall Experience',
];

const RATING_DESCRIPTIONS: Record<number, { label: string; description: string }> = {
  1: { label: 'Poor', description: 'Service fell far below acceptable standards' },
  2: { label: 'Below Expectations', description: 'Some issues with service or resolution' },
  3: { label: 'Satisfactory', description: 'Service met general expectations' },
  4: { label: 'Very Good', description: 'Prompt and competent service execution' },
  5: { label: 'Excellent', description: 'Outstanding service and technical support' },
};

export default function TicketFeedbackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ticket, isLoading, error, refresh } = useTicketDetails(id);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<TicketFeedback | null>(null);

  if (isLoading) {
    return <LoadingView message="Loading ticket details..." />;
  }

  if (error || !ticket) {
    return (
      <ScreenWrapper
        headerProps={{
          title: 'Rate Your Experience',
          showBack: true,
          onBack: () => router.back(),
        }}
      >
        <View style={styles.stateWrapper}>
          <ErrorView
            title="Ticket not found"
            message={error || 'Unable to retrieve ticket information.'}
            onRetry={refresh}
          />
          <AppButton
            title="Back to My Tickets"
            variant="outline"
            onPress={() => router.push('/(customer)/tickets')}
            style={styles.stateButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // 1. INELIGIBLE STATE: Ticket must be RESOLVED or CLOSED
  const isEligible = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  if (!isEligible) {
    return (
      <ScreenWrapper
        headerProps={{
          title: 'Rate Your Experience',
          subtitle: `#${ticket.ticketNumber || ticket.id.slice(0, 8)}`,
          showBack: true,
          onBack: () => router.back(),
        }}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.stateWrapper}>
          <AppCard variant="elevated" style={styles.ineligibleCard}>
            <View style={styles.ineligibleIconCircle}>
              <Ionicons name="time-outline" size={36} color={colors.primary.gold} />
            </View>
            <Text style={styles.ineligibleTitle}>Feedback Not Available Yet</Text>
            <Text style={styles.ineligibleMessage}>
              Feedback can only be submitted after your solar service request has been resolved by our
              technician.
            </Text>

            <View style={styles.ticketSnippetBox}>
              <Text style={styles.ticketSnippetNumber}>
                #{ticket.ticketNumber || ticket.id.slice(0, 8)}
              </Text>
              <StatusPill status={ticket.status} size="sm" />
            </View>

            <AppButton
              title="Return to Ticket Details"
              variant="primary"
              onPress={() => router.back()}
              style={styles.stateButton}
            />
          </AppCard>
        </View>
      </ScreenWrapper>
    );
  }

  // 2. READ-ONLY REVIEW SUMMARY: If feedback already exists on this ticket
  const existingFeedback = ticket.feedback || submittedFeedback;

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError('Please select a star rating from 1 to 5.');
      return;
    }

    setRatingError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await feedbackService.submitFeedback({
        ticketId: ticket.id,
        rating,
        categories: selectedCategories,
        comment: comment.trim(),
      });
      setSubmittedFeedback(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to submit feedback. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Confirmation or Existing Feedback State
  if (existingFeedback) {
    return (
      <ScreenWrapper
        scrollable
        headerProps={{
          title: 'Service Feedback',
          subtitle: `#${ticket.ticketNumber || ticket.id.slice(0, 8)}`,
          showBack: true,
          onBack: () => router.back(),
        }}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.mainPadding}>
          <AppCard variant="elevated" style={styles.confirmationCard}>
            <View style={styles.confirmationIconCircle}>
              <Ionicons name="checkmark-circle" size={48} color={colors.feedback.success} />
            </View>

            <Text style={styles.confirmationTitle}>Thank You for Your Feedback</Text>
            <Text style={styles.confirmationSubtitle}>
              Your rating and service review have been recorded. They directly support our ongoing solar
              maintenance quality standards.
            </Text>

            {/* Review Summary Breakdown */}
            <View style={styles.feedbackSummaryBox}>
              <View style={styles.summaryMetaRow}>
                <Text style={styles.summaryMetaLabel}>Service Ticket</Text>
                <Text style={styles.summaryMetaValue}>
                  #{ticket.ticketNumber || ticket.id.slice(0, 8)}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRatingContainer}>
                <View style={styles.summaryStarsRow}>
                  <RatingStars rating={existingFeedback.rating} size={26} />
                  <Text style={styles.summaryRatingScore}>
                    {existingFeedback.rating}.0 / 5.0
                  </Text>
                </View>
                <Text style={styles.summaryRatingDescriptor}>
                  {RATING_DESCRIPTIONS[existingFeedback.rating]?.label || 'Rated'}
                </Text>
              </View>

              {existingFeedback.categories && existingFeedback.categories.length > 0 && (
                <View style={styles.summaryChipsSection}>
                  <Text style={styles.summarySectionLabel}>EXPERIENCE HIGHLIGHTS</Text>
                  <View style={styles.summaryChipsWrap}>
                    {existingFeedback.categories.map((cat) => (
                      <View key={cat} style={styles.summaryChip}>
                        <Ionicons name="checkmark" size={12} color={colors.navy[800]} />
                        <Text style={styles.summaryChipText}>{cat}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {existingFeedback.comment ? (
                <View style={styles.summaryCommentBox}>
                  <Text style={styles.summarySectionLabel}>WRITTEN REVIEW</Text>
                  <Text style={styles.summaryCommentText}>
                    &ldquo;{existingFeedback.comment}&rdquo;
                  </Text>
                </View>
              ) : null}

              {existingFeedback.createdAt && (
                <View style={styles.summaryDateRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.text.muted} />
                  <Text style={styles.summaryDateText}>
                    Submitted on {formatDate(existingFeedback.createdAt)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.confirmationActions}>
              <AppButton
                title="Return to Ticket Details"
                variant="primary"
                size="lg"
                onPress={() => router.replace(`/(customer)/tickets/${ticket.id}`)}
                style={styles.actionBtn}
              />
              <AppButton
                title="Back to Home Dashboard"
                variant="outline"
                size="lg"
                onPress={() => router.replace('/(customer)')}
                style={styles.actionBtn}
              />
            </View>
          </AppCard>
        </View>
      </ScreenWrapper>
    );
  }

  // 3. ACTIVE FEEDBACK SUBMISSION FORM
  return (
    <ScreenWrapper
      scrollable
      headerProps={{
        title: 'Rate Your Service Experience',
        subtitle: `#${ticket.ticketNumber || ticket.id.slice(0, 8)}`,
        showBack: true,
        onBack: () => router.back(),
      }}
      contentContainerStyle={styles.contentContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.screenIntro}>
          <Text style={styles.introTitle}>Rate Your Service Experience</Text>
          <Text style={styles.introSubtitle}>
            Your feedback helps us improve our solar equipment care, technician responsiveness and
            overall support quality.
          </Text>
        </View>

        <View style={styles.mainPadding}>
          {/* TICKET REFERENCE CARD */}
          <AppCard variant="elevated" style={styles.ticketReferenceCard}>
            <View style={styles.ticketRefHeaderRow}>
              <View style={styles.ticketRefLeft}>
                <View style={styles.ticketRefIconCircle}>
                  <Ionicons name="receipt-outline" size={16} color={colors.navy[800]} />
                </View>
                <Text style={styles.ticketRefNumber}>
                  #{ticket.ticketNumber || ticket.id.slice(0, 8)}
                </Text>
              </View>
              <StatusPill status={ticket.status} size="sm" />
            </View>

            <Text style={styles.ticketRefTitle}>
              {ticket.categoryLabel || getTicketCategoryLabel(ticket.category)}
            </Text>

            <View style={styles.ticketDetailsGrid}>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>Issue Category:</Text>
                <Text style={styles.ticketDetailValue}>
                  {getTicketCategoryLabel(ticket.category)}
                </Text>
              </View>

              {ticket.resolution?.resolvedAt && (
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailLabel}>Resolution Date:</Text>
                  <Text style={styles.ticketDetailValue}>
                    {formatDate(ticket.resolution.resolvedAt)}
                  </Text>
                </View>
              )}

              {ticket.technician?.name && (
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailLabel}>Assigned Technician:</Text>
                  <Text style={styles.ticketDetailValue}>{ticket.technician.name}</Text>
                </View>
              )}
            </View>
          </AppCard>

          {/* OVERALL SERVICE RATING CARD */}
          <AppCard variant="elevated" style={styles.formSectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name="star" size={16} color={colors.primary.gold} />
              </View>
              <View style={styles.sectionHeaderTextWrap}>
                <Text style={styles.sectionHeading}>
                  Overall Service Rating <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <Text style={styles.sectionSubtext}>
                  How satisfied are you with the resolution and service visit?
                </Text>
              </View>
            </View>

            <View style={styles.starsWrapper}>
              <RatingStars
                rating={rating}
                size={40}
                interactive
                onRatingChange={(newRating) => {
                  setRating(newRating);
                  setRatingError(null);
                }}
              />

              <View
                style={[
                  styles.ratingDescriptorPill,
                  rating > 0 && styles.ratingDescriptorPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.ratingDescriptorText,
                    rating > 0 && styles.ratingDescriptorTextActive,
                  ]}
                >
                  {rating > 0
                    ? `★ ${rating}.0 — ${RATING_DESCRIPTIONS[rating]?.label}`
                    : 'Tap stars to select rating'}
                </Text>
              </View>

              {rating > 0 && RATING_DESCRIPTIONS[rating]?.description && (
                <Text style={styles.ratingSubDescription}>
                  {RATING_DESCRIPTIONS[rating].description}
                </Text>
              )}
            </View>

            {ratingError && (
              <View style={styles.inlineErrorRow}>
                <Ionicons name="alert-circle" size={16} color={colors.feedback.error} />
                <Text style={styles.inlineErrorText}>{ratingError}</Text>
              </View>
            )}
          </AppCard>

          {/* CATEGORY SELECTION CHIPS */}
          <AppCard variant="elevated" style={styles.formSectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: '#EAF0F8' }]}>
                <Ionicons name="thumbs-up-outline" size={16} color={colors.navy[800]} />
              </View>
              <View style={styles.sectionHeaderTextWrap}>
                <Text style={styles.sectionHeading}>Experience Highlights</Text>
                <Text style={styles.sectionSubtext}>
                  Select areas that stood out during the repair (optional):
                </Text>
              </View>
            </View>

            <View style={styles.chipsContainer}>
              {FEEDBACK_CATEGORIES.map((categoryItem) => {
                const isSelected = selectedCategories.includes(categoryItem);
                return (
                  <TouchableOpacity
                    key={categoryItem}
                    onPress={() => toggleCategory(categoryItem)}
                    activeOpacity={0.7}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={categoryItem}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {categoryItem}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={colors.navy[800]}
                        style={styles.chipCheckIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </AppCard>

          {/* WRITTEN COMMENTS */}
          <AppCard variant="elevated" style={styles.formSectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: '#FDF6E2' }]}>
                <Ionicons name="chatbox-ellipses-outline" size={16} color={colors.primary.gold} />
              </View>
              <View style={styles.sectionHeaderTextWrap}>
                <Text style={styles.sectionHeading}>Detailed Comments</Text>
                <Text style={styles.sectionSubtext}>Share your thoughts or suggestions (optional):</Text>
              </View>
            </View>

            <AppInput
              placeholder="Tell us about your experience with our technician and the service provided..."
              value={comment}
              onChangeText={(text) => {
                if (text.length <= 500) {
                  setComment(text);
                }
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputStyle={styles.textArea}
            />

            <View style={styles.charCountRow}>
              <Text style={styles.charCountHint}>Constructive feedback helps our field team</Text>
              <Text
                style={[
                  styles.characterCount,
                  comment.length >= 480 && styles.characterCountLimit,
                ]}
              >
                {comment.length}/500
              </Text>
            </View>
          </AppCard>

          {/* SUBMISSION ERROR ALERT */}
          {submitError && (
            <View style={styles.submitErrorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.feedback.error} />
              <Text style={styles.submitErrorText}>{submitError}</Text>
            </View>
          )}

          {/* PRIMARY SUBMIT CTA */}
          <View style={styles.submitWrapper}>
            <AppButton
              title="Submit Feedback"
              variant="primary"
              size="lg"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting || rating === 0}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing['4xl'],
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  screenIntro: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy[800],
    letterSpacing: -0.3,
  },
  introSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  mainPadding: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  stateWrapper: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateButton: {
    marginTop: spacing.lg,
    width: '100%',
  },
  ineligibleCard: {
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  ineligibleIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDF6E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F2C66D',
  },
  ineligibleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy[800],
    marginBottom: 6,
    textAlign: 'center',
  },
  ineligibleMessage: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  ticketSnippetBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8F9FB',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  ticketSnippetNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy[800],
  },
  ticketSnippetStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  ticketReferenceCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderColor: colors.border.default,
    borderWidth: 1,
    ...shadows.sm,
  },
  ticketRefHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketRefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ticketRefIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketRefNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy[800],
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDFDF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#A6F4C5',
  },
  resolvedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#027A48',
  },
  ticketRefTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy[800],
    marginBottom: spacing.sm,
  },
  ticketDetailsGrid: {
    backgroundColor: '#F8F9FB',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDetailLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  ticketDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },
  formSectionCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderColor: colors.border.default,
    borderWidth: 1,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDF6E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  sectionHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy[800],
  },
  requiredAsterisk: {
    color: colors.feedback.error,
  },
  sectionSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  starsWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  ratingDescriptorPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: '#F2F4F7',
    borderWidth: 1,
    borderColor: colors.border.default,
    marginTop: 4,
  },
  ratingDescriptorPillActive: {
    backgroundColor: '#FDF6E2',
    borderColor: '#F2C66D',
  },
  ratingDescriptorText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  ratingDescriptorTextActive: {
    color: colors.navy[800],
  },
  ratingSubDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3F2',
    padding: 10,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  inlineErrorText: {
    fontSize: 12,
    color: colors.feedback.error,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  categoryChipSelected: {
    backgroundColor: '#FDF6E2',
    borderColor: '#F2C66D',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryChipTextSelected: {
    color: colors.navy[800],
    fontWeight: '700',
  },
  chipCheckIcon: {
    marginLeft: 2,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: 13,
    lineHeight: 20,
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  charCountHint: {
    fontSize: 11,
    color: colors.text.muted,
  },
  characterCount: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '600',
  },
  characterCountLimit: {
    color: colors.feedback.error,
  },
  submitErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3F2',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FECDCA',
  },
  submitErrorText: {
    fontSize: 13,
    color: colors.feedback.error,
    flex: 1,
  },
  submitWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  submitBtn: {
    backgroundColor: colors.navy[800],
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  confirmationCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    textAlign: 'center',
    ...shadows.sm,
  },
  confirmationIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EDFDF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#A6F4C5',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy[800],
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  feedbackSummaryBox: {
    width: '100%',
    backgroundColor: '#F8F9FB',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryMetaLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  summaryMetaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy[800],
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  summaryRatingContainer: {
    alignItems: 'center',
    gap: 4,
  },
  summaryStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryRatingScore: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy[800],
  },
  summaryRatingDescriptor: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.gold,
  },
  summaryChipsSection: {
    gap: 6,
  },
  summarySectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.muted,
    letterSpacing: 0.6,
  },
  summaryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF6E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#F2C66D',
  },
  summaryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy[800],
  },
  summaryCommentBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: 4,
  },
  summaryCommentText: {
    fontSize: 13,
    color: colors.navy[800],
    fontStyle: 'italic',
    lineHeight: 19,
  },
  summaryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
    paddingTop: 4,
  },
  summaryDateText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  confirmationActions: {
    width: '100%',
    gap: spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
