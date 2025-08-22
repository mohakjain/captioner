import React, { useState, useCallback } from 'react';
import { ImageData } from '../types/image';
import { drawCaptionText } from './CaptionRenderer';
import './SaveImageButton.css';

interface SaveImageButtonProps {
  image: ImageData;
  preferCropped?: boolean;
  filename?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const SaveImageButton: React.FC<SaveImageButtonProps> = ({
  image,
  preferCropped = true,
  filename,
  className = '',
  variant = 'primary',
  size = 'medium',
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const generateFilename = useCallback((originalName: string, isCropped: boolean): string => {
    if (filename) return filename;
    
    const name = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
    const suffix = isCropped ? '_cropped' : '';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    
    return `${name}${suffix}_${timestamp}.png`;
  }, [filename]);

  const downloadImage = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      let imageUrl: string;
      let isCropped = false;
      
      // Determine which image to download - prioritize captioned if available
      if (image.captions && image.captions.length > 0) {
        // If image has captions, render the captioned version
        const sourceImage = image.croppedImage || image;
        imageUrl = await renderCaptionedImageForDownload(sourceImage, image.captions);
        isCropped = !!image.croppedImage;
      } else if (preferCropped && image.croppedImage) {
        imageUrl = image.croppedImage.url;
        isCropped = true;
      } else {
        imageUrl = image.url;
      }

      // Create a high-quality PNG from the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS if needed
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Set canvas size to image size
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          // Draw image to canvas with white background for PNG transparency handling
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          resolve();
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for download'));
        };
        
        img.src = imageUrl;
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/png',
          1.0 // Maximum quality
        );
      });

      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = generateFilename(image.name, isCropped);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(downloadUrl);
      
      // Show success state
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);

    } catch (error) {
      console.error('Download failed:', error);
      // You could add error state here if needed
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [image, preferCropped, generateFilename, isDownloading]);

  const buttonText = React.useMemo(() => {
    if (isDownloading) return 'Downloading...';
    if (downloadSuccess) return '✓ Downloaded!';
    
    let imageType = 'Original';
    if (image.captions && image.captions.length > 0) {
      imageType = 'Captioned';
    } else if (preferCropped && image.croppedImage) {
      imageType = 'Cropped';
    }
    
    return `💾 Save ${imageType} PNG`;
  }, [isDownloading, downloadSuccess, preferCropped, image.croppedImage, image.captions]);

  const buttonClasses = [
    'save-image-btn',
    `save-image-btn--${variant}`,
    `save-image-btn--${size}`,
    isDownloading ? 'save-image-btn--loading' : '',
    downloadSuccess ? 'save-image-btn--success' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={downloadImage}
      disabled={isDownloading}
      className={buttonClasses}
      type="button"
      aria-label={`Download ${
        image.captions && image.captions.length > 0 
          ? 'captioned'
          : preferCropped && image.croppedImage 
            ? 'cropped' 
            : 'original'
      } image as PNG`}
    >
      <span className="save-image-btn__text">
        {buttonText}
      </span>
      
      {isDownloading && (
        <div className="save-image-btn__spinner" aria-hidden="true" />
      )}
    </button>
  );
};

// Helper function to render captioned image for download
const renderCaptionedImageForDownload = async (
  sourceImage: ImageData | { url: string; dimensions?: { width: number; height: number } },
  captions: any[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    const imageDimensions = sourceImage.dimensions || { width: 800, height: 600 };
    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Draw the base image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw each caption
        captions.forEach((caption) => {
          if (caption.text.trim()) {
            drawCaptionText(ctx, caption, canvas.width, canvas.height);
          }
        });

        // Convert to blob URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', 1.0);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for captioning'));
    };

    img.src = sourceImage.url;
  });
};
