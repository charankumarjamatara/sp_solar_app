import * as ImagePicker from 'expo-image-picker';
import { APP_CONFIG } from '../../config';
import { ApiError } from '../../utils/errors';
import { TicketImage, TicketImageStage } from '../../types';

export interface PickedImage {
  uri: string;
  name?: string;
  type?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
}

class ImageService {
  /**
   * Request permissions and pick images from the device gallery
   */
  async pickImagesFromGallery(options?: {
    allowsMultipleSelection?: boolean;
    maxSelection?: number;
  }): Promise<PickedImage[]> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new ApiError('Permission to access photo gallery was denied', 403);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: options?.allowsMultipleSelection ?? false,
      selectionLimit: options?.maxSelection ?? APP_CONFIG.uploadLimits.maxImagesPerTicket,
      quality: 0.8,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map(asset => ({
      uri: asset.uri,
      name: asset.fileName || `solar_issue_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      sizeBytes: asset.fileSize,
      width: asset.width,
      height: asset.height,
    }));
  }

  /**
   * Request camera permissions and capture a photo using the device camera
   */
  async takePhotoWithCamera(): Promise<PickedImage | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new ApiError('Permission to access camera was denied', 403);
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName || `solar_camera_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      sizeBytes: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  }

  /**
   * Validate image size and format constraints
   */
  validateImage(image: PickedImage): { isValid: boolean; error?: string } {
    if (image.sizeBytes) {
      const maxBytes = APP_CONFIG.uploadLimits.maxFileSizeMb * 1024 * 1024;
      if (image.sizeBytes > maxBytes) {
        return {
          isValid: false,
          error: `Image exceeds maximum allowed size of ${APP_CONFIG.uploadLimits.maxFileSizeMb}MB`,
        };
      }
    }
    return { isValid: true };
  }

  /**
   * Upload image for a ticket (placeholder architecture for future multipart backend upload)
   */
  async uploadTicketImage(
    ticketId: string,
    image: PickedImage,
    stage: TicketImageStage = 'CUSTOMER_ISSUE'
  ): Promise<TicketImage> {
    // Architecture placeholder for future multipart/form-data upload
    return {
      id: `img_${Date.now()}`,
      url: image.uri,
      stage,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'CUSTOMER',
    };
  }
}

export const imageService = new ImageService();
