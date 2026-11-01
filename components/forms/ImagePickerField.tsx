import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PickedImage } from '../../services/media/imageService';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, typography } from '../../constants/theme';

export interface ImagePickerFieldProps {
  label?: string;
  images: PickedImage[];
  onPickGallery: () => void;
  onTakePhoto: () => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
  error?: string | null;
  isLoading?: boolean;
  containerStyle?: ViewStyle;
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  label = 'Attach Photos',
  images,
  onPickGallery,
  onTakePhoto,
  onRemoveImage,
  maxImages = 5,
  error,
  isLoading = false,
  containerStyle,
}) => {
  const canAdd = images.length < maxImages && !isLoading;

  const handleAddPress = () => {
    Alert.alert('Attach Photo', 'Choose how you want to add photos of the issue:', [
      { text: 'Take Photo', onPress: onTakePhoto },
      { text: 'Choose from Gallery', onPress: onPickGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.counterText}>
          {images.length}/{maxImages}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {canAdd ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPress}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={26} color={colors.gold[500]} />
            <Text style={styles.addText}>Add Photo</Text>
          </TouchableOpacity>
        ) : null}

        {images.map((img, index) => (
          <View key={`${img.uri}_${index}`} style={styles.thumbnailWrapper}>
            <Image
              source={{ uri: img.uri }}
              style={styles.thumbnail}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveImage(index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={22} color={colors.feedback.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text.primary,
  },
  counterText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.muted,
  },
  scrollContent: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  addButton: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.medium,
    borderWidth: 1.5,
    borderColor: colors.gold[300],
    borderStyle: 'dashed',
    backgroundColor: colors.gold[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  addText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.gold[800],
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.surface,
    borderRadius: 11,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.feedback.error,
    marginTop: spacing.xxs,
  },
});
