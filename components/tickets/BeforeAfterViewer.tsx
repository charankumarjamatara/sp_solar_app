import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { TicketImage } from '../../types';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, shadows } from '../../constants/theme';
import { AppCard } from '../ui/AppCard';
import { formatDate } from '../../utils/formatters';

export interface BeforeAfterViewerProps {
  images: TicketImage[];
  isPendingUpload?: boolean;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  images,
  isPendingUpload = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<TicketImage | null>(null);

  const beforeImages = images.filter((img) => img.stage === 'BEFORE_REPAIR');
  const afterImages = images.filter((img) => img.stage === 'AFTER_REPAIR');
  const hasAnyImages = beforeImages.length > 0 || afterImages.length > 0;

  return (
    <AppCard style={styles.card} variant="elevated">
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="images-outline" size={17} color={colors.navy[800]} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Repair Photos & Evidence</Text>
          <Text style={styles.subtitle}>
            Visual inspection proof captured by certified SP Solar technicians
          </Text>
        </View>
      </View>

      {!hasAnyImages ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="camera-outline" size={24} color={colors.navy[700]} />
          </View>
          <Text style={styles.emptyTitle}>No Repair Photos Yet</Text>
          <Text style={styles.emptySubtitle}>
            {isPendingUpload
              ? 'Our technician will photograph the equipment before and after completing repairs.'
              : 'No pre-repair or post-repair photographs have been attached to this ticket.'}
          </Text>
        </View>
      ) : (
        <View style={styles.comparisonContainer}>
          {/* 1. BEFORE REPAIR COLUMN */}
          <View style={styles.stageColumn}>
            <View style={styles.stageBadgeRow}>
              <View style={[styles.stageBadge, { backgroundColor: colors.navy[800] }]}>
                <Text style={styles.stageBadgeText}>BEFORE REPAIR</Text>
              </View>
              <Text style={styles.stageCountText}>{beforeImages.length} photo</Text>
            </View>

            {beforeImages.length > 0 ? (
              <View style={styles.imagesGrid}>
                {beforeImages.map((img) => (
                  <TouchableOpacity
                    key={img.id}
                    style={styles.imageThumbnailCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedImage(img)}
                    accessibilityRole="button"
                    accessibilityLabel={`View before repair image: ${img.caption || 'thumbnail'}`}
                  >
                    <Image
                      source={{ uri: img.url }}
                      style={styles.thumbnail}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.zoomAffordance}>
                      <Ionicons name="expand-outline" size={12} color={colors.white} />
                    </View>
                    {img.caption ? (
                      <Text style={styles.imageCaption} numberOfLines={2}>
                        {img.caption}
                      </Text>
                    ) : null}
                    <Text style={styles.imageUploadDate}>
                      {formatDate(img.uploadedAt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.columnPendingBox}>
                <Ionicons name="time-outline" size={18} color={colors.text.muted} />
                <Text style={styles.columnPendingText}>Pre-repair photo pending</Text>
              </View>
            )}
          </View>

          {/* 2. AFTER REPAIR COLUMN */}
          <View style={styles.stageColumn}>
            <View style={styles.stageBadgeRow}>
              <View style={[styles.stageBadge, { backgroundColor: colors.gold[600] }]}>
                <Text style={[styles.stageBadgeText, { color: colors.white }]}>AFTER REPAIR</Text>
              </View>
              <Text style={styles.stageCountText}>{afterImages.length} photo</Text>
            </View>

            {afterImages.length > 0 ? (
              <View style={styles.imagesGrid}>
                {afterImages.map((img) => (
                  <TouchableOpacity
                    key={img.id}
                    style={styles.imageThumbnailCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedImage(img)}
                    accessibilityRole="button"
                    accessibilityLabel={`View after repair image: ${img.caption || 'thumbnail'}`}
                  >
                    <Image
                      source={{ uri: img.url }}
                      style={styles.thumbnail}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.zoomAffordance}>
                      <Ionicons name="expand-outline" size={12} color={colors.white} />
                    </View>
                    {img.caption ? (
                      <Text style={styles.imageCaption} numberOfLines={2}>
                        {img.caption}
                      </Text>
                    ) : null}
                    <Text style={styles.imageUploadDate}>
                      {formatDate(img.uploadedAt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.columnPendingBox}>
                <Ionicons name="hourglass-outline" size={18} color={colors.gold[600]} />
                <Text style={styles.columnPendingText}>
                  Work verification photos will appear upon resolution.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Full-screen Image Preview Modal */}
      <Modal
        visible={Boolean(selectedImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalBadge,
                {
                  backgroundColor:
                    selectedImage?.stage === 'BEFORE_REPAIR'
                      ? colors.navy[800]
                      : colors.gold[500],
                },
              ]}
            >
              <Text
                style={[
                  styles.modalBadgeText,
                  {
                    color:
                      selectedImage?.stage === 'BEFORE_REPAIR'
                        ? colors.white
                        : colors.navy[900],
                  },
                ]}
              >
                {selectedImage?.stage === 'BEFORE_REPAIR'
                  ? 'BEFORE REPAIR'
                  : 'AFTER REPAIR'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedImage(null)}
              accessibilityRole="button"
              accessibilityLabel="Close full screen photo"
            >
              <Ionicons name="close" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <View style={styles.modalBody}>
              <Image
                source={{ uri: selectedImage.url }}
                style={styles.modalMainImage}
                contentFit="contain"
              />
              <View style={styles.modalFooter}>
                {selectedImage.caption ? (
                  <Text style={styles.modalCaptionText}>{selectedImage.caption}</Text>
                ) : null}
                <Text style={styles.modalDateText}>
                  Captured on {formatDate(selectedImage.uploadedAt)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </AppCard>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs + 2,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
    lineHeight: 15,
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.navy[800],
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stageColumn: {
    flex: 1,
  },
  stageBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stageBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  stageCountText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  imagesGrid: {
    gap: spacing.xs + 2,
  },
  imageThumbnailCard: {
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    padding: 6,
  },
  thumbnail: {
    width: '100%',
    height: 110,
    borderRadius: borderRadius.small,
    backgroundColor: colors.surfaceDisabled,
  },
  zoomAffordance: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 23, 53, 0.7)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 4,
    lineHeight: 14,
  },
  imageUploadDate: {
    fontSize: 9.5,
    color: colors.text.muted,
    marginTop: 2,
  },
  columnPendingBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
    gap: 4,
  },
  columnPendingText: {
    fontSize: 10.5,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 17, 38, 0.95)',
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  modalBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.small,
  },
  modalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  modalMainImage: {
    width: windowWidth - 32,
    height: '75%',
    borderRadius: borderRadius.large,
  },
  modalFooter: {
    padding: spacing.md,
    backgroundColor: 'rgba(0, 23, 53, 0.8)',
    borderRadius: borderRadius.medium,
    marginTop: spacing.sm,
    width: windowWidth - 32,
    alignItems: 'center',
  },
  modalCaptionText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalDateText: {
    fontSize: 11,
    color: colors.gold[300],
  },
});

