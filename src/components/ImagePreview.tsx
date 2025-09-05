import React from 'react';
import { ImageData } from '../types/image';
import { CaptionedImageDisplay } from './CaptionedImageDisplay';
import './ImagePreview.css';

interface ImagePreviewProps {
  image: ImageData;
  onRemove?: () => void;
  showCroppedImage?: boolean;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onRemove,
  showCroppedImage = false,
  className = '',
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Determine which image to display and its details
  const displayUrl = showCroppedImage && image.croppedImage ? image.croppedImage.url : image.url;
  const displayDimensions = showCroppedImage && image.croppedImage ? image.croppedImage.dimensions : image.dimensions;

  return (
    <div className={`image-preview ${className}`}>
      <div className="image-preview__container">
        {image.captions && image.captions.length > 0 ? (
          <CaptionedImageDisplay
            image={image}
            className="image-preview__captioned-display"
          />
        ) : (
          <img
            src={displayUrl}
            alt={image.name}
            className="image-preview__image"
          />
        )}
        
        {onRemove && (
          <button
            onClick={onRemove}
            className="image-preview__remove-btn"
            aria-label="Remove image"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
