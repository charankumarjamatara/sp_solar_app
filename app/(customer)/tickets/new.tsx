import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScreenWrapper } from '../../../components/common/ScreenWrapper';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { useImagePicker } from '../../../hooks/useImagePicker';
import { TicketCategory, Ticket } from '../../../types';
import { ticketService } from '../../../services/tickets/ticketService';
import { colors } from '../../../constants/colors';
import { borderRadius, spacing, shadows } from '../../../constants/theme';

interface IssueCategoryItem {
  id: string;
  category: TicketCategory;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_ITEMS: IssueCategoryItem[] = [
  {
    id: 'PANEL_DAMAGE',
    category: 'PANEL_DAMAGE',
    label: 'Solar Panel',
    hint: 'Physical cracks, glass damage, hot spots, or heavy shading',
    icon: 'sunny-outline',
  },
  {
    id: 'INVERTER_FAULT',
    category: 'INVERTER_FAULT',
    label: 'Inverter',
    hint: 'Red fault light, error codes, power trip, or no AC generation',
    icon: 'hardware-chip-outline',
  },
  {
    id: 'BATTERY',
    category: 'OTHER',
    label: 'Battery Storage',
    hint: 'Low charge capacity, discharge cut-off, or battery unit fault',
    icon: 'battery-charging-outline',
  },
  {
    id: 'MONITORING_SYSTEM',
    category: 'OTHER',
    label: 'Monitoring System',
    hint: 'Data logger offline, app de-sync, or transmission loss',
    icon: 'wifi-outline',
  },
  {
    id: 'WIRING_ELECTRICAL',
    category: 'WIRING_ELECTRICAL',
    label: 'Wiring & Electrical',
    hint: 'Conduit wear, MC4 loose connectors, or breaker tripping',
    icon: 'git-network-outline',
  },
  {
    id: 'OTHER',
    category: 'OTHER',
    label: 'General Inspection',
    hint: 'Routine checkup, structure integrity, or general query',
    icon: 'construct-outline',
  },
];

const MAX_TITLE_LENGTH = 80;
const MAX_DESC_LENGTH = 500;

export default function RaiseIssueScreen() {
  const router = useRouter();

  // Form State
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<IssueCategoryItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ category?: string; title?: string; description?: string }>({});

  // View State (FORM, SUCCESS, ERROR)
  const [viewState, setViewState] = useState<'FORM' | 'SUCCESS' | 'ERROR'>('FORM');
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [fallbackTicketId, setFallbackTicketId] = useState<string>('');

  const {
    images,
    error: imageError,
    pickFromGallery,
    takePhoto,
    removeImage,
    isLoading: isImageLoading,
  } = useImagePicker(5);

  const isFormValid =
    Boolean(selectedCategoryItem) &&
    title.trim().length >= 3 &&
    description.trim().length >= 10;

  const handleCategorySelect = (item: IssueCategoryItem) => {
    setSelectedCategoryItem(item);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: { category?: string; title?: string; description?: string } = {};

    if (!selectedCategoryItem) {
      newErrors.category = 'Please select the equipment experiencing an issue.';
    }
    if (title.trim().length < 3) {
      newErrors.title = 'Please enter a brief issue headline (at least 3 characters).';
    }
    if (description.trim().length < 10) {
      newErrors.description = 'Please provide details describing what is happening (at least 10 characters).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const fullDescription = `${title.trim()}\n\n${description.trim()}`;
      const ticket = await ticketService.createTicket({
        category: selectedCategoryItem!.category,
        description: fullDescription,
        imageUris: images.map((img) => img.uri),
      });

      // Preserve custom category label for display
      ticket.categoryLabel = selectedCategoryItem!.label;

      setCreatedTicket(ticket);
      setViewState('SUCCESS');
    } catch {
      setFallbackTicketId(`SP-${Math.floor(1000 + Math.random() * 9000)}`);
      setViewState('ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setViewState('FORM');
    handleSubmit();
  };

  // SUCCESS CONFIRMATION VIEW
  if (viewState === 'SUCCESS' && createdTicket) {
    return (
      <ScreenWrapper scrollable contentContainerStyle={styles.centerContainer}>
        <AppCard variant="elevated" style={styles.stateCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-sharp" size={32} color={colors.white} />
          </View>

          <Text style={styles.stateTitle}>Request Registered</Text>
          <Text style={styles.stateSubtitle}>
            Your service ticket has been submitted and queued for technician dispatch.
          </Text>

          <View style={styles.confirmationBox}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Ticket ID</Text>
              <Text style={styles.confirmTicketNumber}>
                #{createdTicket.ticketNumber || fallbackTicketId || 'SP-1026'}
              </Text>
            </View>

            <View style={styles.confirmDivider} />

            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Category</Text>
              <Text style={styles.confirmValue}>{selectedCategoryItem?.label || 'Solar Equipment'}</Text>
            </View>

            <View style={styles.confirmDivider} />

            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Status</Text>
              <View style={styles.statusPillSmall}>
                <View style={styles.statusPillDot} />
                <Text style={styles.statusPillText}>Raised</Text>
              </View>
            </View>
          </View>

          <View style={styles.advisoryNotice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.navy[800]} style={{ marginRight: 6 }} />
            <Text style={styles.advisoryText}>
              A certified technician will review your request within 24 business hours.
            </Text>
          </View>

          <View style={styles.stateActions}>
            <AppButton
              title="View Ticket Details"
              variant="primary"
              size="lg"
              onPress={() => router.replace(`/(customer)/tickets/${createdTicket.id}`)}
              style={styles.actionBtn}
            />
            <AppButton
              title="Return to Dashboard"
              variant="outline"
              size="md"
              onPress={() => router.push('/(customer)')}
              style={styles.actionBtn}
            />
          </View>
        </AppCard>
      </ScreenWrapper>
    );
  }

  // ERROR VIEW
  if (viewState === 'ERROR') {
    return (
      <ScreenWrapper scrollable contentContainerStyle={styles.centerContainer}>
        <AppCard variant="elevated" style={styles.stateCard}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="alert-outline" size={32} color={colors.feedback.error} />
          </View>

          <Text style={styles.stateTitle}>Submission Interrupted</Text>
          <Text style={styles.stateSubtitle}>
            We were unable to register your service request. Please check your network and try again.
          </Text>

          <View style={styles.stateActions}>
            <AppButton
              title="Try Again"
              variant="primary"
              size="lg"
              onPress={handleRetry}
              isLoading={isSubmitting}
              style={styles.actionBtn}
            />
            <AppButton
              title="Back to Form"
              variant="outline"
              size="md"
              onPress={() => setViewState('FORM')}
              disabled={isSubmitting}
              style={styles.actionBtn}
            />
          </View>
        </AppCard>
      </ScreenWrapper>
    );
  }

  // FORM VIEW
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.contentContainer}
    >
      {/* 2. Screen Introduction Header */}
      <View style={styles.introHeader}>
        <View style={styles.introTopRow}>
          <TouchableOpacity
            style={styles.backCircleBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.navy[800]} />
          </TouchableOpacity>

          <View style={styles.introIndicatorBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.introIndicatorText}>NEW SERVICE REQUEST</Text>
          </View>
        </View>

        <Text style={styles.screenTitle}>Raise a Service Request</Text>
        <Text style={styles.screenSubtitle}>
          Tell us what&apos;s happening with your solar system. Our team will help you resolve it.
        </Text>
      </View>

      {/* SECTION 1: Select Issue Category */}
      <View style={styles.formSection}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <Text style={styles.sectionHeading}>Select Equipment Category</Text>
          <Text style={styles.requiredAsterisk}>*</Text>
        </View>
        <Text style={styles.sectionSubtext}>
          Choose the component experiencing issues or requiring inspection.
        </Text>

        <View style={styles.categoryGrid}>
          {CATEGORY_ITEMS.map((item) => {
            const isSelected = selectedCategoryItem?.id === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                activeOpacity={0.75}
                onPress={() => handleCategorySelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: ${item.hint}`}
              >
                <View style={styles.categoryCardHeader}>
                  <View
                    style={[
                      styles.categoryIconCircle,
                      isSelected && styles.categoryIconCircleSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isSelected ? colors.navy[900] : colors.navy[800]}
                    />
                  </View>

                  <View
                    style={[
                      styles.selectionRadio,
                      isSelected && styles.selectionRadioActive,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                    )}
                  </View>
                </View>

                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.categoryHint} numberOfLines={2}>
                  {item.hint}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.category ? (
          <Text style={styles.fieldErrorText}>{errors.category}</Text>
        ) : null}
      </View>

      {/* SECTION 2: Issue Title and Description */}
      <View style={styles.formSection}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <Text style={styles.sectionHeading}>Describe The Problem</Text>
          <Text style={styles.requiredAsterisk}>*</Text>
        </View>
        <Text style={styles.sectionSubtext}>
          Provide a short summary and clear details about what you observed.
        </Text>

        {/* Issue Title Input */}
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Issue Headline</Text>
            <Text style={styles.charCounter}>
              {title.length}/{MAX_TITLE_LENGTH}
            </Text>
          </View>
          <TextInput
            style={[styles.singleLineInput, errors.title && styles.inputErrorBorder]}
            placeholder="e.g., Inverter red warning light after rain"
            placeholderTextColor={colors.text.muted}
            value={title}
            onChangeText={(text) => {
              if (text.length <= MAX_TITLE_LENGTH) {
                setTitle(text);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            maxLength={MAX_TITLE_LENGTH}
            returnKeyType="next"
          />
          {errors.title ? (
            <Text style={styles.fieldErrorText}>{errors.title}</Text>
          ) : null}
        </View>

        {/* Issue Description Input */}
        <View style={styles.inputGroup}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Detailed Description</Text>
            <Text style={styles.charCounter}>
              {description.length}/{MAX_DESC_LENGTH}
            </Text>
          </View>
          <TextInput
            style={[styles.multilineInput, errors.description && styles.inputErrorBorder]}
            placeholder="Explain what is happening, error codes shown on screen, sudden drops in power generation, or physical damage..."
            placeholderTextColor={colors.text.muted}
            value={description}
            onChangeText={(text) => {
              if (text.length <= MAX_DESC_LENGTH) {
                setDescription(text);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            maxLength={MAX_DESC_LENGTH}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description ? (
            <Text style={styles.fieldErrorText}>{errors.description}</Text>
          ) : null}
        </View>
      </View>

      {/* SECTION 3: Photo Attachments */}
      <View style={styles.formSection}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.sectionHeading}>Add Photos</Text>
          <Text style={styles.optionalBadge}>(Optional)</Text>
        </View>
        <Text style={styles.sectionSubtext}>
          Photos help our technician identify faulty parts and prepare equipment prior to visiting.
        </Text>

        {/* Upload Buttons Strip */}
        <View style={styles.uploadButtonsRow}>
          <TouchableOpacity
            style={styles.uploadActionBtn}
            onPress={takePhoto}
            activeOpacity={0.75}
            disabled={images.length >= 5 || isImageLoading}
          >
            <Ionicons name="camera" size={18} color={colors.navy[800]} style={{ marginRight: 6 }} />
            <Text style={styles.uploadActionBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadActionBtn}
            onPress={pickFromGallery}
            activeOpacity={0.75}
            disabled={images.length >= 5 || isImageLoading}
          >
            <Ionicons name="images" size={18} color={colors.navy[800]} style={{ marginRight: 6 }} />
            <Text style={styles.uploadActionBtnText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Image Thumbnails */}
        {images.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          >
            {images.map((img, index) => (
              <View key={`${img.uri}_${index}`} style={styles.thumbnailCard}>
                <Image source={{ uri: img.uri }} style={styles.thumbnailImage} contentFit="cover" />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                >
                  <Ionicons name="close" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.uploadEmptyCard}>
            <Ionicons name="camera-outline" size={24} color={colors.text.muted} />
            <Text style={styles.uploadEmptyText}>
              Up to 5 clear photos of the issue, error codes, or inverter light indicators.
            </Text>
          </View>
        )}

        {imageError ? (
          <Text style={styles.fieldErrorText}>{imageError}</Text>
        ) : null}
      </View>

      {/* SECTION 4: Submission CTA */}
      <View style={styles.submitSection}>
        <AppButton
          title={isSubmitting ? 'Registering Service Request...' : 'Submit Service Request'}
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          style={styles.submitButton}
        />

        <Text style={styles.submitFooterNote}>
          By submitting, your service ticket is logged into the SP Solar priority dispatch queue.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing['4xl'],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },

  /* Introduction Header */
  introHeader: {
    marginBottom: spacing.md,
  },
  introTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  introIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.navy[100],
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold[600],
    marginRight: 5,
  },
  introIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.navy[700],
    letterSpacing: 0.6,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  /* Form Sections Standard */
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.navy[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold[300],
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.navy[800],
  },
  requiredAsterisk: {
    color: colors.feedback.error,
    fontWeight: '700',
    marginLeft: 3,
  },
  optionalBadge: {
    fontSize: 11,
    color: colors.text.muted,
    marginLeft: 5,
  },
  sectionSubtext: {
    fontSize: 11.5,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },

  /* 1. Category Selection Grid */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  categoryCardSelected: {
    borderColor: colors.gold[500],
    backgroundColor: colors.gold[50],
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconCircleSelected: {
    backgroundColor: colors.gold[300],
  },
  selectionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionRadioActive: {
    borderColor: colors.gold[700],
    backgroundColor: colors.gold[700],
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 2,
  },
  categoryLabelSelected: {
    color: colors.navy[900],
  },
  categoryHint: {
    fontSize: 10.5,
    color: colors.text.secondary,
    lineHeight: 14,
  },

  /* 2. Text Inputs */
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },
  charCounter: {
    fontSize: 10.5,
    color: colors.text.muted,
  },
  singleLineInput: {
    height: 44,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.sm + 2,
    fontSize: 13,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  multilineInput: {
    minHeight: 110,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.sm + 2,
    fontSize: 13,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    lineHeight: 18,
  },
  inputErrorBorder: {
    borderColor: colors.feedback.error,
  },
  fieldErrorText: {
    fontSize: 11,
    color: colors.feedback.error,
    marginTop: 4,
  },

  /* 3. Photo Attachments */
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  uploadActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  uploadActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy[800],
  },
  thumbnailList: {
    gap: spacing.sm,
    paddingVertical: 4,
  },
  thumbnailCard: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 23, 53, 0.75)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadEmptyCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  uploadEmptyText: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 15,
  },

  /* 4. Submission CTA */
  submitSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  submitButton: {
    width: '100%',
    backgroundColor: colors.gold[500],
  },
  submitFooterNote: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 15,
  },

  /* State Confirmation Cards */
  stateCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.extraLarge,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.md,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.feedback.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.feedback.success,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: '0 3px 8px rgba(22, 163, 74, 0.3)',
      },
    }),
  },
  errorIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.feedback.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.feedback.errorBorder,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 4,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 290,
  },
  confirmationBox: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 11.5,
    color: colors.text.secondary,
  },
  confirmTicketNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy[800],
  },
  confirmValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.navy[800],
  },
  confirmDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.xs + 2,
  },
  statusPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[50],
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  statusPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.navy[700],
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.navy[700],
  },
  advisoryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy[50],
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    width: '100%',
    marginBottom: spacing.lg,
  },
  advisoryText: {
    fontSize: 11,
    color: colors.navy[800],
    flex: 1,
    lineHeight: 15,
  },
  stateActions: {
    width: '100%',
    gap: spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
