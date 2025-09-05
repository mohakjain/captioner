import React, { useState, useCallback } from 'react';
import { ImageData } from '../types/image';
import { drawCaptionText } from './CaptionRenderer';
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
  
  // Determine button text based on image state
  let imageType = 'original';
  if (hasCaption && shouldUseCroppedImage) {
    imageType = 'captioned + cropped';
  } else if (hasCaption) {
    imageType = 'captioned';
  } else if (shouldUseCroppedImage) {
    imageType = 'cropped';
  }
  
  const buttonText = `💾 Save ${imageType} PNG`;
  const ariaLabel = `Download ${imageType} image as PNG`;

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
            resolve();
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUrl;
        });

        // Draw each caption onto the image
        image.captions.forEach((caption) => {
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

        const suffix = shouldUseCroppedImage && image.croppedImage ? 'cropped_captioned' : 'captioned';
        downloadFilename = filename || `${image.name.replace(/\.[^/.]+$/, '')}_${suffix}.png`;
      } else if (shouldUseCroppedImage && image.croppedImage) {
        // Use the cropped image blob if available (no captions)
        blob = image.croppedImage.blob;
        downloadFilename = filename || `${image.name.replace(/\.[^/.]+$/, '')}_cropped.png`;
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

        downloadFilename = filename || `${image.name.replace(/\.[^/.]+$/, '')}.png`;
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
