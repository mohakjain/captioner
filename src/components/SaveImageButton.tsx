import React, { useState, useCallback } from 'react';
import { ImageData, VintageMode } from '../types/image';
import { drawCaptionText } from './CaptionRenderer';
import { applyVintageEffect } from '../utils/vintageFilter';
import './SaveImageButton.css';

interface SaveImageButtonProps {
  image: ImageData;
  preferCropped?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  filename?: string;
  className?: string;
}

export const SaveImageButton: React.FC<SaveImageButtonProps> = ({
  image,
  preferCropped = false,
  variant = 'primary',
  size = 'medium',
  filename,
  className = '',
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const shouldUseCroppedImage = preferCropped && image.croppedImage;
  const hasCaption = image.captions && image.captions.length > 0;
  
  const buttonText = `💾 Save as PNG`;
  const ariaLabel = `Download image as PNG`;

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setShowSuccess(false);

    try {
      let blob: Blob;
      let downloadFilename: string;

      // Determine which image to use and whether it has captions
      const hasCaption = image.captions && image.captions.length > 0;
      const sourceImage = shouldUseCroppedImage && image.croppedImage ? image.croppedImage : image;
      
      if (hasCaption) {
        // If image has captions, we need to render them onto a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Use the cropped image if available and preferred, otherwise use original
        const imageUrl = shouldUseCroppedImage && image.croppedImage ? image.croppedImage.url : image.url;
        const imageDimensions = shouldUseCroppedImage && image.croppedImage 
          ? image.croppedImage.dimensions 
          : (image.dimensions || { width: 800, height: 600 });

        // Set canvas size to match image
        canvas.width = imageDimensions.width;
        canvas.height = imageDimensions.height;

        // Load and draw the base image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Draw the base image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Apply vintage effect if enabled (BELOW caption layer)
            if (image.vintageMode && image.vintageMode !== VintageMode.Off) {
              applyVintageEffect(ctx, canvas.width, canvas.height, image.vintageMode);
            }
            
            resolve();
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUrl;
        });

        // Draw each caption onto the image
        image.captions?.forEach((caption) => {
          if (caption.text.trim()) {
            drawCaptionText(ctx, caption, canvas.width, canvas.height);
          }
        });

        // Convert canvas to blob
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        });

        const cropPrefix = shouldUseCroppedImage && image.croppedImage ? 'cropped' : '';
        const captionPrefix = 'captioned';
        const vintagePrefix = getVintagePrefix(image.vintageMode);
        const suffixParts = [cropPrefix, captionPrefix, vintagePrefix].filter(Boolean);
        const suffix = suffixParts.join('_');
        downloadFilename = filename || `${image.name.replace(/\.[^/.]+$/, '')}_${suffix}.png`;
      } else if (shouldUseCroppedImage && image.croppedImage) {
        // Use the cropped image - but need to apply vintage effect if enabled
        if (image.vintageMode && image.vintageMode !== VintageMode.Off) {
          // Need to re-process cropped image to apply vintage effect
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              canvas.width = image.croppedImage!.dimensions.width;
              canvas.height = image.croppedImage!.dimensions.height;
              ctx.drawImage(img, 0, 0);
              
              // Apply vintage effect
              applyVintageEffect(ctx, canvas.width, canvas.height, image.vintageMode!);
              
              resolve();
            };
            img.onerror = () => reject(new Error('Failed to load cropped image'));
            img.src = image.croppedImage!.url;
          });

          blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((result) => {
              if (result) {
                resolve(result);
              } else {
                reject(new Error('Failed to create blob'));
              }
            }, 'image/png');
          });
        } else {
          // No vintage effect, use existing blob
          blob = image.croppedImage.blob;
        }
        
        const vintagePrefix = getVintagePrefix(image.vintageMode);
        const suffixParts = ['cropped', vintagePrefix].filter(Boolean);
        const suffix = suffixParts.join('_');
        downloadFilename = filename || `${image.name.replace(/\.[^/.]+$/, '')}_${suffix}.png`;
      } else {
        // Convert original image to blob (no captions, no cropping)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            
            // Apply vintage effect if enabled (even without captions)
            if (image.vintageMode && image.vintageMode !== VintageMode.Off) {
              applyVintageEffect(ctx, canvas.width, canvas.height, image.vintageMode);
            }
            
            resolve();
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = image.url;
        });

        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        });

        const vintagePrefix = getVintagePrefix(image.vintageMode);
        const suffix = vintagePrefix ? `_${vintagePrefix}` : '';
        downloadFilename = filename || `${image.name.replace(/\.[^/.]+$/, '')}${suffix}.png`;
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success state briefly
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to download image:', error);
      // Could show error state here in the future
    } finally {
      setIsDownloading(false);
    }
  }, [image, shouldUseCroppedImage, filename, isDownloading]);

  const buttonClasses = [
    'save-image-btn',
    `save-image-btn--${variant}`,
    `save-image-btn--${size}`,
    isDownloading && 'save-image-btn--loading',
    showSuccess && 'save-image-btn--success',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={handleDownload}
      className={buttonClasses}
      disabled={isDownloading}
      type="button"
      aria-label={ariaLabel}
    >
      <span className="save-image-btn__text">
        {showSuccess ? '✅ Saved!' : buttonText}
      </span>
      {isDownloading && <div className="save-image-btn__spinner" />}
    </button>
  );
};

// Helper function to get vintage mode prefix for filename
function getVintagePrefix(vintageMode?: VintageMode): string {
  if (!vintageMode || vintageMode === VintageMode.Off) {
    return '';
  }
  
  switch (vintageMode) {
    case VintageMode.Classic:
      return 'classic';
    case VintageMode.Faded:
      return 'faded';
    case VintageMode.Warm:
      return 'warm';
    case VintageMode.BlackWhite:
      return 'bw';
    default:
      return 'vintage';
  }
}
