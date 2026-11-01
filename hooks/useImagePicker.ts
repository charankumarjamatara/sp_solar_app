import { useState } from 'react';
import { imageService, PickedImage } from '../services/media/imageService';
import { APP_CONFIG } from '../config';

export const useImagePicker = (
  maxImages: number = APP_CONFIG.uploadLimits.maxImagesPerTicket
) => {
  const [images, setImages] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addImages = (newImages: PickedImage[]) => {
    setError(null);
    setImages(prev => {
      const combined = [...prev, ...newImages];
      if (combined.length > maxImages) {
        setError(`You can only attach up to ${maxImages} images.`);
        return combined.slice(0, maxImages);
      }
      return combined;
    });
  };

  const pickFromGallery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        setError(`Maximum of ${maxImages} images reached.`);
        return;
      }

      const picked = await imageService.pickImagesFromGallery({
        allowsMultipleSelection: true,
        maxSelection: remainingSlots,
      });

      const validImages: PickedImage[] = [];
      for (const img of picked) {
        const validation = imageService.validateImage(img);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid image');
        } else {
          validImages.push(img);
        }
      }

      if (validImages.length > 0) {
        addImages(validImages);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (images.length >= maxImages) {
        setError(`Maximum of ${maxImages} images reached.`);
        return;
      }

      const photo = await imageService.takePhotoWithCamera();
      if (photo) {
        const validation = imageService.validateImage(photo);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid photo');
        } else {
          addImages([photo]);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to capture photo');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearImages = () => {
    setImages([]);
    setError(null);
  };

  return {
    images,
    error,
    isLoading,
    pickFromGallery,
    takePhoto,
    removeImage,
    clearImages,
    canAddMore: images.length < maxImages,
    remainingSlots: maxImages - images.length,
  };
};
