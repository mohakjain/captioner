import { useState, useCallback } from 'react';
import { ImageData, ImageState, CroppedImageData, CropData, ImageDimensions } from '../types/image';
import { Caption } from '../types/caption';

export const useImageState = () => {
  const [state, setState] = useState<ImageState>({
    currentImage: null,
    isProcessing: false,
    isCropping: false,
    isCaptioning: false,
    error: null,
  });

  const setImage = useCallback(async (file: File): Promise<void> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      // Get image dimensions
      const dimensions = await getImageDimensions(url);
      
      const imageData: ImageData = {
        file,
        url,
        name: file.name,
        size: file.size,
        dimensions,
      };
      
      setState(prev => ({
        ...prev,
        currentImage: imageData,
        isProcessing: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to load image',
      }));
    }
  }, []);

  const clearImage = useCallback(() => {
    if (state.currentImage?.url) {
      URL.revokeObjectURL(state.currentImage.url);
    }
    setState({
      currentImage: null,
      isProcessing: false,
      isCropping: false,
      isCaptioning: false,
      error: null,
    });
  }, [state.currentImage?.url]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const startCropping = useCallback(() => {
    setState(prev => ({ ...prev, isCropping: true, error: null }));
  }, []);

  const cancelCropping = useCallback(() => {
    setState(prev => ({ ...prev, isCropping: false }));
  }, []);

  const startCaptioning = useCallback(() => {
    setState(prev => ({ ...prev, isCaptioning: true, error: null }));
  }, []);

  const cancelCaptioning = useCallback(() => {
    setState(prev => ({ ...prev, isCaptioning: false, isCropping: true }));
  }, []);

  const saveCaptionToImage = useCallback((caption: Caption) => {
    setState(prev => ({
      ...prev,
      currentImage: prev.currentImage ? {
        ...prev.currentImage,
        captions: [caption], // For now, support single caption (can extend to multiple later)
      } : null,
      isCaptioning: false, // Exit captioning mode after saving
    }));
  }, []);

  const removeCaptionsFromImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentImage: prev.currentImage ? {
        ...prev.currentImage,
        captions: undefined,
      } : null,
    }));
  }, []);

  const cropImage = useCallback(async (cropData: CropData): Promise<void> => {
    if (!state.currentImage) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const croppedImage = await createCroppedImage(state.currentImage.url, cropData);
      
      setState(prev => ({
        ...prev,
        currentImage: prev.currentImage ? {
          ...prev.currentImage,
          croppedImage,
        } : null,
        isProcessing: false,
        isCropping: false,
        isCaptioning: true,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to crop image',
      }));
    }
  }, [state.currentImage]);

  const removeCroppedImage = useCallback(() => {
    if (state.currentImage?.croppedImage?.url) {
      URL.revokeObjectURL(state.currentImage.croppedImage.url);
    }

    setState(prev => ({
      ...prev,
      currentImage: prev.currentImage ? {
        ...prev.currentImage,
        croppedImage: undefined,
      } : null,
    }));
  }, [state.currentImage]);

  return {
    ...state,
    setImage,
    clearImage,
    clearError,
    startCropping,
    cancelCropping,
    cropImage,
    removeCroppedImage,
    startCaptioning,
    cancelCaptioning,
    saveCaptionToImage,
    removeCaptionsFromImage,
  };
};

// Helper function to get image dimensions
const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image dimensions'));
    };
    img.src = url;
  });
};

// Helper function to create cropped image from canvas operations
const createCroppedImage = async (imageSrc: string, cropData: CropData): Promise<CroppedImageData> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        const rotation = cropData.rotation || 0;

        // If there's rotation, we need to apply it before cropping
        if (rotation !== 0) {
          // Calculate rotated canvas dimensions
          const rotatedCanvas = document.createElement('canvas');
          const rotatedCtx = rotatedCanvas.getContext('2d');
          
          if (!rotatedCtx) {
            throw new Error('Could not get rotated canvas context');
          }

          // Normalize rotation to 0-360 range
          const normalizedRotation = ((rotation % 360) + 360) % 360;
          
          // For 90 and 270 degree rotations, swap width and height
          const needsDimensionSwap = normalizedRotation === 90 || normalizedRotation === 270;
          rotatedCanvas.width = needsDimensionSwap ? image.naturalHeight : image.naturalWidth;
          rotatedCanvas.height = needsDimensionSwap ? image.naturalWidth : image.naturalHeight;

          // Apply rotation transformation
          rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
          rotatedCtx.rotate((normalizedRotation * Math.PI) / 180);
          rotatedCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

          // Now crop from the rotated image
          canvas.width = cropData.width;
          canvas.height = cropData.height;

          ctx.drawImage(
            rotatedCanvas,
            cropData.x, // source x
            cropData.y, // source y
            cropData.width, // source width
            cropData.height, // source height
            0, // destination x
            0, // destination y
            cropData.width, // destination width
            cropData.height // destination height
          );
        } else {
          // No rotation - standard crop
          canvas.width = cropData.width;
          canvas.height = cropData.height;

          ctx.drawImage(
            image,
            cropData.x, // source x
            cropData.y, // source y
            cropData.width, // source width
            cropData.height, // source height
            0, // destination x
            0, // destination y
            cropData.width, // destination width
            cropData.height // destination height
          );
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }

            const url = URL.createObjectURL(blob);
            const dimensions: ImageDimensions = {
              width: cropData.width,
              height: cropData.height,
            };

            resolve({
              canvas,
              blob,
              url,
              dimensions,
            });
          },
          'image/png', // Use PNG to maintain quality
          0.95 // High quality
        );
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(new Error('Failed to load image for cropping'));
    };

    image.src = imageSrc;
  });
};
